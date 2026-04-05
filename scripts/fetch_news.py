"""
fetch_news.py — Ayorai Tech News
Coleta noticias globais, extrai imagens e traduz tudo para portugues.
"""

import json, os, re, sys, time, logging
from datetime import datetime, timezone
from pathlib import Path

# ── Instalar dependencias automaticamente ────────────────────
def pip(pkg):
    os.system(f"{sys.executable} -m pip install {pkg} -q --break-system-packages")

try:
    import feedparser
except ImportError:
    pip("feedparser"); import feedparser

try:
    import requests
except ImportError:
    pip("requests"); import requests

try:
    from deep_translator import GoogleTranslator
    TRANSLATE = True
except ImportError:
    pip("deep-translator")
    try:
        from deep_translator import GoogleTranslator; TRANSLATE = True
    except:
        TRANSLATE = False

logging.basicConfig(level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# ── Configuracao ─────────────────────────────────────────────
MAX_PER_FEED   = 10
OUTPUT_DIR     = Path(__file__).parent.parent / "data"
OUTPUT_FILE    = OUTPUT_DIR / "news.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── Feeds RSS ────────────────────────────────────────────────
FEEDS = {
    "en": [
        {"url": "https://feeds.feedburner.com/TechCrunch/",         "name": "TechCrunch"},
        {"url": "https://www.theverge.com/rss/index.xml",           "name": "The Verge"},
        {"url": "https://feeds.arstechnica.com/arstechnica/index",  "name": "Ars Technica"},
        {"url": "https://www.wired.com/feed/rss",                   "name": "Wired"},
        {"url": "https://technologyreview.com/feed/",               "name": "MIT Tech Review"},
    ],
    "es": [
        {"url": "https://www.xataka.com/feed.xml",   "name": "Xataka"},
        {"url": "https://www.genbeta.com/feed.xml",  "name": "Genbeta"},
    ],
    "pt": [
        {"url": "https://canaltech.com.br/rss/",      "name": "Canaltech"},
        {"url": "https://tecnoblog.net/feed/",         "name": "Tecnoblog"},
        {"url": "https://olhardigital.com.br/feed/",   "name": "Olhar Digital"},
    ],
    "zh": [{"url": "https://36kr.com/feed",       "name": "36Kr"}],
    "hi": [{"url": "https://yourstory.com/feed",  "name": "YourStory"}],
}

# ── Extrair imagem do entry RSS ───────────────────────────────
def extract_image(entry) -> str:
    """Tenta todos os metodos possiveis para extrair a imagem."""

    # 1) media:content
    for mc in getattr(entry, "media_content", []):
        url = mc.get("url","")
        if url and is_img(url): return url

    # 2) media:thumbnail
    for mt in getattr(entry, "media_thumbnail", []):
        url = mt.get("url","")
        if url and is_img(url): return url

    # 3) enclosures
    for enc in getattr(entry, "enclosures", []):
        url = enc.get("href", enc.get("url",""))
        typ = enc.get("type","")
        if url and ("image" in typ or is_img(url)): return url

    # 4) links rel=enclosure
    for lnk in getattr(entry, "links", []):
        if "image" in lnk.get("type",""):
            return lnk.get("href","")

    # 5) <img> dentro do summary / content
    for field in ("summary", "content"):
        html = ""
        val  = getattr(entry, field, None)
        if isinstance(val, list):
            html = " ".join(v.get("value","") for v in val)
        elif isinstance(val, str):
            html = val
        if html:
            img = img_from_html(html)
            if img: return img

    return ""


def is_img(url: str) -> bool:
    u = url.lower().split("?")[0]
    return any(u.endswith(e) for e in (".jpg",".jpeg",".png",".webp",".gif",".avif"))


def img_from_html(html: str) -> str:
    # src de <img>
    for pat in [
        r'<img[^>]+src=["\']([^"\']+)["\']',
        r'<img[^>]+src=([^\s>]+)',
    ]:
        m = re.search(pat, html, re.I)
        if m:
            u = m.group(1).strip("\"'")
            if u.startswith("http"): return u

    # url() no style
    m2 = re.search(r'url\(["\']?(https?://[^"\')\s]+)["\']?\)', html, re.I)
    if m2: return m2.group(1)

    return ""


# ── Limpeza de texto ──────────────────────────────────────────
def clean(text: str, maxlen=3000) -> str:
    if not text: return ""
    text = re.sub(r"<[^>]+>", " ", str(text))
    text = re.sub(r"&[a-z]+;", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:maxlen]


# ── Traducao ──────────────────────────────────────────────────
def translate(text: str, src: str) -> str:
    """Traduz texto para portugues. Tenta 3 vezes antes de desistir."""
    if not text or not TRANSLATE: return text
    if src == "pt": return text              # ja e portugues

    text = text[:1500]                       # limite seguro da API gratuita
    for attempt in range(3):
        try:
            result = GoogleTranslator(source=src, target="pt").translate(text)
            if result and len(result.strip()) > 3:
                log.info("    ✓ Traduzido (%s→pt)", src)
                return result.strip()
        except Exception as e:
            wait = (attempt + 1) * 2
            log.warning("    Traducao tentativa %d falhou: %s — aguardando %ds",
                        attempt+1, str(e)[:60], wait)
            time.sleep(wait)

    log.warning("    ✗ Traducao falhou apos 3 tentativas, mantendo original")
    return text


# ── Data ──────────────────────────────────────────────────────
def parse_date(entry) -> str:
    for attr in ("published_parsed", "updated_parsed"):
        val = getattr(entry, attr, None)
        if val:
            try:
                return datetime(*val[:6], tzinfo=timezone.utc).isoformat()
            except Exception:
                pass
    return datetime.now(timezone.utc).isoformat()


# ── Coletar um feed ───────────────────────────────────────────
def collect(url: str, name: str, lang: str) -> list:
    articles = []
    log.info("▶ %s [%s]", name, lang.upper())

    try:
        resp = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        log.info("  HTTP %d", resp.status_code)
        if resp.status_code not in (200, 301, 302):
            return articles
        feed = feedparser.parse(resp.content)
    except Exception as e:
        log.error("  ERRO ao buscar %s: %s", name, str(e)[:80])
        return articles

    entries = feed.entries[:MAX_PER_FEED]
    log.info("  %d artigos encontrados", len(entries))

    for i, entry in enumerate(entries):
        # Dados brutos
        title_orig = clean(getattr(entry, "title", ""))
        desc_orig  = clean(getattr(entry, "summary",
                           getattr(entry, "description", "")))
        link       = getattr(entry, "link", "")
        published  = parse_date(entry)
        image      = extract_image(entry)

        if not title_orig or not link:
            continue

        log.info("  [%d/%d] %s | img:%s",
                 i+1, len(entries), title_orig[:55], "✓" if image else "✗")

        # Traduzir
        title_pt = translate(title_orig, lang)
        time.sleep(0.5)
        desc_pt  = translate(desc_orig[:800], lang) if desc_orig else ""
        time.sleep(0.5)

        articles.append({
            "title_original":       title_orig,
            "title_pt":             title_pt or title_orig,
            "description_original": desc_orig[:600],
            "description_pt":       (desc_pt or desc_orig)[:600],
            "link":                 link,
            "published":            published,
            "source":               name,
            "language":             lang,
            "image":                image,
        })

    return articles


# ── Main ──────────────────────────────────────────────────────
def main():
    log.info("=" * 60)
    log.info("AYORAI TECH NEWS — Coleta iniciada")
    log.info("Data: %s", datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"))
    log.info("Traducao disponivel: %s", TRANSLATE)
    log.info("=" * 60)

    all_articles = []
    ok = fail = 0

    for lang, feeds in FEEDS.items():
        log.info("\n━━ %s ━━", lang.upper())
        for feed in feeds:
            arts = collect(feed["url"], feed["name"], lang)
            if arts:
                ok  += 1
                all_articles.extend(arts)
            else:
                fail += 1

    # Ordenar por data
    all_articles.sort(key=lambda a: a.get("published",""), reverse=True)

    # Estatisticas
    with_img = sum(1 for a in all_articles if a.get("image"))
    in_pt    = sum(1 for a in all_articles if a.get("title_pt") and a.get("language") != "pt")

    log.info("\n" + "=" * 60)
    log.info("RESULTADO:")
    log.info("  Total de artigos : %d", len(all_articles))
    log.info("  Com imagem       : %d", with_img)
    log.info("  Traduzidos       : %d", in_pt)
    log.info("  Feeds OK         : %d", ok)
    log.info("  Feeds com falha  : %d", fail)

    # Salvar
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_articles, f, ensure_ascii=False, indent=2)

    size_kb = OUTPUT_FILE.stat().st_size / 1024
    log.info("  Arquivo salvo    : %s (%.1f KB)", OUTPUT_FILE, size_kb)
    log.info("=" * 60)

    # Preview dos primeiros 3
    log.info("\nPRIMEIRAS NOTICIAS:")
    for a in all_articles[:3]:
        log.info("  [%s] %s", a["source"], a["title_pt"][:65])
        log.info("       img: %s", a["image"][:70] if a["image"] else "SEM IMAGEM")


if __name__ == "__main__":
    main()
