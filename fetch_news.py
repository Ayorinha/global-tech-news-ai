"""
fetch_news.py - Coleta e traduz noticias tecnologicas globais via RSS
Salva o resultado em data/news.json para uso no site estatico.
"""

import json
import os
import time
import logging
import re
from datetime import datetime, timezone
from pathlib import Path

import feedparser
import requests

# Tenta importar deep-translator; se falhar, usa fallback sem traducao
try:
    from deep_translator import GoogleTranslator
    TRANSLATOR_AVAILABLE = True
except ImportError:
    TRANSLATOR_AVAILABLE = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Fontes RSS ───────────────────────────────────────────────
RSS_SOURCES = {
    "en": [
        {"url": "https://techcrunch.com/feed/",                    "name": "TechCrunch"},
        {"url": "https://www.theverge.com/rss/index.xml",          "name": "The Verge"},
        {"url": "https://www.wired.com/feed/rss",                  "name": "Wired"},
        {"url": "https://feeds.arstechnica.com/arstechnica/index", "name": "Ars Technica"},
        {"url": "https://www.technologyreview.com/feed/",          "name": "MIT Tech Review"},
    ],
    "es": [
        {"url": "https://www.xataka.com/feed.xml",  "name": "Xataka"},
        {"url": "https://www.genbeta.com/feed.xml", "name": "Genbeta"},
    ],
    "pt": [
        {"url": "https://canaltech.com.br/rss/",        "name": "Canaltech"},
        {"url": "https://tecnoblog.net/feed/",           "name": "Tecnoblog"},
        {"url": "https://olhardigital.com.br/feed/",     "name": "Olhar Digital"},
    ],
    "zh": [
        {"url": "https://36kr.com/feed", "name": "36Kr"},
    ],
    "hi": [
        {"url": "https://yourstory.com/feed", "name": "YourStory"},
    ],
}

MAX_PER_SOURCE     = 10
MAX_TRANSLATE_CHARS = 4000
OUTPUT_DIR  = Path(__file__).parent.parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "news.json"


def clean_html(text: str) -> str:
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", "", text)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def translate_to_pt(text: str, src_lang: str) -> str:
    if not text:
        return ""
    if src_lang == "pt":
        return text
    if not TRANSLATOR_AVAILABLE:
        return text

    text = text[:MAX_TRANSLATE_CHARS]
    for attempt in range(3):
        try:
            result = GoogleTranslator(source=src_lang, target="pt").translate(text)
            return result or text
        except Exception as e:
            log.warning("Tentativa %d falhou: %s", attempt + 1, e)
            time.sleep(2 * (attempt + 1))
    return text


def parse_date(entry) -> str:
    for attr in ("published_parsed", "updated_parsed"):
        val = getattr(entry, attr, None)
        if val:
            try:
                return datetime(*val[:6], tzinfo=timezone.utc).isoformat()
            except Exception:
                pass
    return datetime.now(timezone.utc).isoformat()


def fetch_feed(url: str, name: str, lang: str) -> list:
    log.info("Buscando: %s", name)
    articles = []
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; GlobalTechNewsBot/1.0)"}
        resp = requests.get(url, headers=headers, timeout=25)
        resp.raise_for_status()
        feed = feedparser.parse(resp.content)
    except Exception as e:
        log.error("Falha em %s: %s", name, e)
        return articles

    entries = feed.entries[:MAX_PER_SOURCE]
    log.info("  %d artigos em %s", len(entries), name)

    for i, entry in enumerate(entries, 1):
        title_orig = clean_html(getattr(entry, "title", "Sem titulo"))
        desc_orig  = clean_html(getattr(entry, "summary", getattr(entry, "description", "")))
        link       = getattr(entry, "link", "")
        published  = parse_date(entry)

        log.info("  [%d/%d] %s", i, len(entries), title_orig[:60])

        title_pt = translate_to_pt(title_orig, lang)
        time.sleep(0.5)
        desc_pt  = translate_to_pt(desc_orig[:1500], lang)  # limitar descricao
        time.sleep(0.5)

        articles.append({
            "title_original":       title_orig,
            "title_pt":             title_pt,
            "description_original": desc_orig[:500],
            "description_pt":       desc_pt[:500],
            "link":                 link,
            "published":            published,
            "source":               name,
            "language":             lang,
        })

    return articles


def main():
    log.info("=" * 50)
    log.info("Iniciando coleta — %s", datetime.now().strftime("%Y-%m-%d %H:%M"))
    log.info("=" * 50)

    all_articles = []

    for lang, sources in RSS_SOURCES.items():
        for source in sources:
            try:
                articles = fetch_feed(source["url"], source["name"], lang)
                all_articles.extend(articles)
            except Exception as e:
                log.error("Erro inesperado em %s: %s", source["name"], e)

    # Ordenar por data
    all_articles.sort(key=lambda a: a.get("published", ""), reverse=True)

    # Salvar
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_articles, f, ensure_ascii=False, indent=2)

    log.info("=" * 50)
    log.info("PRONTO: %d artigos salvos em %s", len(all_articles), OUTPUT_FILE)
    log.info("=" * 50)


if __name__ == "__main__":
    main()
