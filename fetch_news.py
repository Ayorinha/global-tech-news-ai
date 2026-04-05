"""
fetch_news.py - Coleta e traduz notícias tecnológicas globais via RSS
Salva o resultado em data/news.json para uso no site estático.
"""

import json
import os
import time
import logging
from datetime import datetime, timezone
from pathlib import Path

import feedparser
import requests
from deep_translator import GoogleTranslator

# ──────────────────────────────────────────
# Configuração de logging
# ──────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ──────────────────────────────────────────
# Fontes RSS por idioma
# ──────────────────────────────────────────
RSS_SOURCES = {
    "en": [
        {"url": "https://techcrunch.com/feed/",               "name": "TechCrunch"},
        {"url": "https://www.theverge.com/rss/index.xml",     "name": "The Verge"},
        {"url": "https://www.wired.com/feed/rss",             "name": "Wired"},
        {"url": "https://feeds.arstechnica.com/arstechnica/index", "name": "Ars Technica"},
        {"url": "https://www.technologyreview.com/feed/",     "name": "MIT Technology Review"},
    ],
    "es": [
        {"url": "https://www.xataka.com/feed.xml",  "name": "Xataka"},
        {"url": "https://www.genbeta.com/feed.xml", "name": "Genbeta"},
    ],
    "pt": [
        {"url": "https://canaltech.com.br/rss/",         "name": "Canaltech"},
        {"url": "https://tecnoblog.net/feed/",            "name": "Tecnoblog"},
        {"url": "https://olhardigital.com.br/feed/",      "name": "Olhar Digital"},
    ],
    "zh": [
        {"url": "https://36kr.com/feed", "name": "36Kr"},
    ],
    "hi": [
        {"url": "https://yourstory.com/feed", "name": "YourStory"},
    ],
}

# Quantidade máxima de artigos por fonte
MAX_PER_SOURCE = 10

# Tamanho máximo do texto a traduzir (limite da API gratuita)
MAX_TRANSLATE_CHARS = 4500

# Diretório de saída
OUTPUT_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "news.json"

# ──────────────────────────────────────────
# Utilitários
# ──────────────────────────────────────────

def clean_html(text: str) -> str:
    """Remove tags HTML simples do texto."""
    import re
    clean = re.sub(r"<[^>]+>", "", text or "")
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def truncate(text: str, max_len: int = MAX_TRANSLATE_CHARS) -> str:
    """Trunca o texto para não exceder o limite da API de tradução."""
    return text[:max_len] if text else ""


def translate_to_pt(text: str, src_lang: str) -> str:
    """
    Traduz texto para português usando deep-translator (Google).
    Retorna o texto original se a tradução falhar ou o idioma já for pt.
    """
    text = truncate(clean_html(text))
    if not text:
        return ""

    # Português não precisa de tradução
    if src_lang == "pt":
        return text

    try:
        translated = GoogleTranslator(source=src_lang, target="pt").translate(text)
        return translated or text
    except Exception as exc:
        log.warning("Tradução falhou (%s → pt): %s", src_lang, exc)
        return text


def parse_date(entry) -> str:
    """Tenta extrair a data do entry em formato ISO 8601."""
    for attr in ("published_parsed", "updated_parsed"):
        value = getattr(entry, attr, None)
        if value:
            try:
                dt = datetime(*value[:6], tzinfo=timezone.utc)
                return dt.isoformat()
            except Exception:
                pass
    return datetime.now(timezone.utc).isoformat()


def fetch_feed(url: str, source_name: str, lang: str, max_items: int = MAX_PER_SOURCE) -> list[dict]:
    """
    Lê um RSS feed e retorna uma lista de artigos com tradução.
    """
    log.info("Buscando feed: %s (%s)", source_name, url)
    articles = []

    try:
        # feedparser lida com erros de rede internamente, mas adicionamos timeout via requests
        headers = {"User-Agent": "GlobalTechNews/1.0 (RSS Aggregator)"}
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
        feed = feedparser.parse(resp.content)
    except Exception as exc:
        log.error("Falha ao buscar %s: %s", url, exc)
        return articles

    entries = feed.entries[:max_items]
    total = len(entries)
    log.info("  → %d artigos encontrados em %s", total, source_name)

    for i, entry in enumerate(entries, 1):
        title_orig = clean_html(getattr(entry, "title", "Sem título"))
        desc_orig  = clean_html(getattr(entry, "summary", getattr(entry, "description", "")))
        link       = getattr(entry, "link", "")
        published  = parse_date(entry)

        log.info("  [%d/%d] Traduzindo: %s", i, total, title_orig[:60])

        title_pt = translate_to_pt(title_orig, lang)
        time.sleep(0.3)  # respeitar rate-limit da API gratuita
        desc_pt  = translate_to_pt(desc_orig, lang)
        time.sleep(0.3)

        articles.append({
            "title_original":       title_orig,
            "title_pt":             title_pt,
            "description_original": desc_orig,
            "description_pt":       desc_pt,
            "link":                 link,
            "published":            published,
            "source":               source_name,
            "language":             lang,
        })

    return articles


# ──────────────────────────────────────────
# Ponto de entrada
# ──────────────────────────────────────────

def main():
    log.info("═" * 60)
    log.info("Iniciando coleta de notícias — %s", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    log.info("═" * 60)

    all_articles: list[dict] = []

    for lang, sources in RSS_SOURCES.items():
        for source in sources:
            articles = fetch_feed(source["url"], source["name"], lang)
            all_articles.extend(articles)

    # Ordenar por data decrescente
    all_articles.sort(key=lambda a: a["published"], reverse=True)

    # Garantir que o diretório de saída existe
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Salvar JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_articles, f, ensure_ascii=False, indent=2)

    log.info("═" * 60)
    log.info("✔ %d artigos salvos em %s", len(all_articles), OUTPUT_FILE)
    log.info("═" * 60)


if __name__ == "__main__":
    main()
