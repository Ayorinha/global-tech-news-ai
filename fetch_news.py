"""
fetch_news.py - Coleta noticias tech globais via RSS e traduz para portugues
"""

import json
import os
import time
import re
import sys
import logging
from datetime import datetime, timezone
from pathlib import Path

# ── Instalar dependencias se necessario ─────────────────────
try:
    import feedparser
except ImportError:
    os.system(f"{sys.executable} -m pip install feedparser -q")
    import feedparser

try:
    import requests
except ImportError:
    os.system(f"{sys.executable} -m pip install requests -q")
    import requests

try:
    from deep_translator import GoogleTranslator
    TRANSLATE_OK = True
except ImportError:
    os.system(f"{sys.executable} -m pip install deep-translator -q")
    try:
        from deep_translator import GoogleTranslator
        TRANSLATE_OK = True
    except:
        TRANSLATE_OK = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)

# ── Configuracoes ────────────────────────────────────────────
MAX_PER_SOURCE = 8
OUTPUT_DIR  = Path(__file__).parent.parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "news.json"

# Headers para nao ser bloqueado
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
}

# ── Fontes RSS ───────────────────────────────────────────────
RSS_SOURCES = {
    "en": [
        {"url": "https://feeds.feedburner.com/TechCrunch/",           "name": "TechCrunch"},
        {"url": "https://www.theverge.com/rss/index.xml",             "name": "The Verge"},
        {"url": "https://feeds.arstechnica.com/arstechnica/index",    "name": "Ars Technica"},
        {"url": "https://www.wired.com/feed/rss",                     "name": "Wired"},
        {"url": "https://technologyreview.com/feed/",                  "name": "MIT Tech Review"},
    ],
    "es": [
        {"url": "https://www.xataka.com/feed.xml",   "name": "Xataka"},
        {"url": "https://www.genbeta.com/feed.xml",  "name": "Genbeta"},
    ],
    "pt": [
        {"url": "https://canaltech.com.br/rss/",         "name": "Canaltech"},
        {"url": "https://tecnoblog.net/feed/",            "name": "Tecnoblog"},
        {"url": "https://olhardigital.com.br/feed/",      "name": "Olhar Digital"},
    ],
    "zh": [
        {"url": "https://36kr.com/feed",   "name": "36Kr"},
    ],
    "hi": [
        {"url": "https://yourstory.com/feed",  "name": "YourStory"},
    ],
}


def clean_text(text):
    if not text:
        return ""
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", str(text))
    # Remove caracteres especiais problematicos
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    # Normaliza espacos
    text = re.sub(r"\s+", " ", text).strip()
    return text[:2000]  # limite seguro


def translate(text, src):
    """Traduz texto para portugues. Retorna original se falhar."""
    if not text or src == "pt" or not TRANSLATE_OK:
        return text

    text = text[:1500]  # limite da API gratuita
    for attempt in range(2):
        try:
            result = GoogleTranslator(source=src, target="pt").translate(text)
            if result and len(result) > 3:
                return result
        except Exception as e:
            log.warning("  Traducao tentativa %d falhou: %s", attempt + 1, str(e)[:80])
            time.sleep(1.5)

    return text  # fallback: texto original


def parse_date(entry):
    for attr in ("published_parsed", "updated_parsed"):
        val = getattr(entry, attr, None)
        if val:
            try:
                return datetime(*val[:6], tzinfo=timezone.utc).isoformat()
            except Exception:
                pass
    return datetime.now(timezone.utc).isoformat()


def fetch_source(url, name, lang):
    """Busca e parseia um feed RSS. Retorna lista de artigos."""
    articles = []
    log.info("Buscando %-20s | %s", name, url[:60])

    try:
        resp = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        log.info("  Status HTTP: %d", resp.status_code)

        if resp.status_code != 200:
            log.warning("  Pulando: status %d", resp.status_code)
            return articles

        feed = feedparser.parse(resp.content)
        entries = feed.entries[:MAX_PER_SOURCE]
        log.info("  Encontrados: %d artigos", len(entries))

        for i, entry in enumerate(entries):
            title_orig = clean_text(getattr(entry, "title", ""))
            desc_orig  = clean_text(getattr(entry, "summary", getattr(entry, "description", "")))
            link       = getattr(entry, "link", "")
            published  = parse_date(entry)

            if not title_orig or not link:
                continue

            log.info("  [%d/%d] %s", i+1, len(entries), title_orig[:55])

            title_pt = translate(title_orig, lang)
            time.sleep(0.4)
            desc_pt = translate(desc_orig[:800], lang) if desc_orig else ""
            time.sleep(0.4)

            articles.append({
                "title_original":       title_orig,
                "title_pt":             title_pt or title_orig,
                "description_original": desc_orig[:400],
                "description_pt":       desc_pt[:400] if desc_pt else desc_orig[:400],
                "link":                 link,
                "published":            published,
                "source":               name,
                "language":             lang,
            })

    except requests.exceptions.Timeout:
        log.error("  TIMEOUT em %s", name)
    except requests.exceptions.ConnectionError:
        log.error("  CONEXAO FALHOU em %s", name)
    except Exception as e:
        log.error("  ERRO em %s: %s", name, str(e)[:120])

    return articles


def main():
    log.info("=" * 55)
    log.info("INICIANDO COLETA — %s", datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"))
    log.info("Python: %s", sys.version.split()[0])
    log.info("Translator disponivel: %s", TRANSLATE_OK)
    log.info("=" * 55)

    all_articles = []
    stats = {"total": 0, "ok": 0, "fail": 0}

    for lang, sources in RSS_SOURCES.items():
        log.info("\n--- Idioma: %s ---", lang.upper())
        for src in sources:
            stats["total"] += 1
            arts = fetch_source(src["url"], src["name"], lang)
            if arts:
                stats["ok"] += 1
                all_articles.extend(arts)
                log.info("  OK: %d artigos coletados de %s", len(arts), src["name"])
            else:
                stats["fail"] += 1
                log.warning("  FALHOU: %s", src["name"])

    log.info("\n" + "=" * 55)
    log.info("RESUMO: %d fontes OK | %d falharam | %d total",
             stats["ok"], stats["fail"], stats["total"])
    log.info("Total de artigos: %d", len(all_articles))

    if not all_articles:
        log.error("NENHUM ARTIGO COLETADO! Verifique os feeds RSS.")
        # Salva JSON vazio mas valido para nao quebrar o site
        all_articles = []

    # Ordenar por data
    all_articles.sort(key=lambda a: a.get("published", ""), reverse=True)

    # Garantir diretorio
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Salvar
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_articles, f, ensure_ascii=False, indent=2)

    log.info("SALVO: %s", OUTPUT_FILE)
    log.info("TAMANHO: %.1f KB", OUTPUT_FILE.stat().st_size / 1024)
    log.info("=" * 55)

    # Mostra primeiros titulos para confirmar
    for a in all_articles[:3]:
        log.info("  -> [%s] %s", a["source"], a["title_pt"][:60])


if __name__ == "__main__":
    main()
