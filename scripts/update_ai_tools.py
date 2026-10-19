#!/usr/bin/env python3
"""Rebuild the AyorAI Tools catalog from scratch on every run.

Why rebuild instead of append: the old updater only ever *added* entries, so
every run accumulated repeats (same tool under a different URL or category)
and junk links scraped from README files (badges, "Contributors", category
pages). Now each run:

  1. starts from the editorial seed (data/ai-tools.json),
  2. adds candidates from public directories, but only real tools that pass
     strict filters (not badges, not repo links, not category pages),
  3. scores everything by worldwide usage (traffic ranking) + how many
     directories mention the tool,
  4. removes duplicates by normalized name AND by site (domain),
  5. keeps only the best per category and overall,
  6. writes the full, ordered result to data/ai-tools-ranked-2026.json.

The output is deterministic: running it twice gives the same file, so the
bot only commits when the ranking really changes.
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "data" / "ai-tools.json"
OUTPUT = ROOT / "data" / "ai-tools-ranked-2026.json"

MAX_TOTAL = 200          # máximo de ferramentas exibidas
MAX_PER_CATEGORY = 16    # máximo por categoria (as mais usadas ficam)
OFFLINE = "--offline" in sys.argv

SOURCES = [
    ("2026-curated", "https://raw.githubusercontent.com/ahdpe/awesome-ai-tools-2026/main/data/tools.json"),
    ("developer-directory", "https://raw.githubusercontent.com/open-ai-directory/best-ai-tools-for-developers/main/README.md"),
    ("awesome-ai", "https://raw.githubusercontent.com/doocs/awesome-ai/main/README.md"),
]

# Ranking mundial de uso (tráfego web, RankmyAI Top 100 by traffic, jun/2026),
# filtrado para ferramentas de IA de uso geral. Posição 1 = mais usada.
WORLD_RANK = [
    "ChatGPT", "Gemini", "Claude", "Canva AI", "DeepSeek", "Grok", "Notion AI", "Doubao",
    "Character.ai", "Google AI Studio", "DeepL", "Perplexity", "Figma AI", "Microsoft Copilot",
    "Suno", "Remove.bg", "Kimi", "Grammarly", "CapCut", "Qwen", "ElevenLabs", "ClickUp Brain",
    "Lovable", "Higgsfield AI", "QuillBot", "Hugging Face", "Meta AI", "Vercel v0", "LMArena",
    "Miro AI", "Adobe Express", "TurboScribe", "Manus", "Cursor", "OpenRouter", "Adobe Firefly",
    "Photoroom", "Gamma", "Picsart", "Base44", "Google Antigravity",
    # Muito usadas, logo abaixo do top de tráfego geral
    "GitHub Copilot", "Midjourney", "NotebookLM", "Claude Code", "OpenAI Codex", "Kling AI",
    "Runway", "Google Veo 3.1", "Google Translate", "Leonardo AI", "Ideogram", "HeyGen",
    "Otter.ai", "Zapier", "n8n", "Make", "Ollama", "Windsurf", "Replit", "Bolt.new",
    "Mistral", "Llama", "Stable Diffusion", "FLUX", "Pika", "Luma Dream Machine",
    "Fireflies.ai", "Synthesia", "Speechify", "Jasper", "Copy.ai", "Consensus", "Elicit",
]

# Nomes alternativos que significam a mesma ferramenta
ALIASES = {
    "googlegemini": "gemini", "geminiapp": "gemini", "perplexityai": "perplexity",
    "elevenlabs": "elevenlabs", "cursorai": "cursor", "openrouterai": "openrouter",
    "canva": "canvaai", "notion": "notionai", "figma": "figmaai", "v0": "vercelv0",
    "chatgptplus": "chatgpt", "continuedev": "continue", "mistralai": "mistral",
    "githubcopilotchat": "githubcopilot", "copilot": "microsoftcopilot",
    "characterai": "characterai", "removebg": "removebg", "arena": "lmarena",
    "chatbotarena": "lmarena", "llama3": "llama", "metallama": "llama",
}

# Sites com vários produtos diferentes: nesses, o caminho da URL também conta.
MULTI_PRODUCT_DOMAINS = {
    "google.com", "github.com", "github.io", "openai.com", "microsoft.com", "amazon.com",
    "adobe.com", "deepmind.google", "huggingface.co", "jetbrains.com", "langchain.com",
    "deepl.com", "perplexity.ai", "thomsonreuters.com", "snowflake.com", "wandb.ai",
    "anthropic.com", "azure.com", "nvidia.com",
}

# Hosts que nunca são ferramentas (selos, imagens, links de diretório)
BLOCKED_HOSTS = {
    "img.shields.io", "awesome.re", "ai.doocs.org", "badge.fury.io", "shields.io",
    "star-history.com", "api.star-history.com", "opensource.org", "creativecommons.org",
    "twitter.com", "x.com", "discord.gg", "discord.com", "t.me", "youtube.com",
    "linkedin.com", "reddit.com", "medium.com", "producthunt.com",
}
JUNK_NAME = re.compile(
    r"^(!|/|@|#|https?:)|contribut|license|sponsor|stars?\b|last commit|prs? welcome|"
    r"add it|become the|back to top|table of contents|readme|awesome|docs?$|pricing|"
    r"read more|learn more|click here|website|demo|paper|github|homepage|\bhere\b",
    re.I,
)

CATEGORY_MAP = {
    "assistants": "Assistentes & Chat", "chat": "Assistentes & Chat",
    "coding": "Desenvolvimento", "agents": "Agentes & Automação", "automation": "Agentes & Automação",
    "rag": "RAG & Vector Search", "evaluation": "Avaliação & Observabilidade",
    "image": "Imagem & Design", "design": "Imagem & Design", "video": "Vídeo",
    "audio": "Áudio, Voz & Música", "music": "Áudio, Voz & Música",
    "local": "Modelos & IA Local", "platforms": "Plataformas & APIs",
    "research": "Pesquisa", "data": "Dados & ML", "productivity": "Produtividade & Documentos",
    "writing": "Escrita & Marketing", "marketing": "Escrita & Marketing",
}
KEYWORDS = {
    "Desenvolvimento": "code coding developer ide software programming terminal",
    "Agentes & Automação": "agent agents automation workflow orchestration mcp",
    "RAG & Vector Search": "rag retrieval vector embedding",
    "Avaliação & Observabilidade": "evaluation eval observability tracing benchmark testing",
    "Assistentes & Chat": "assistant chat chatbot",
    "Pesquisa": "research search paper science academic",
    "Dados & ML": "data analytics sql database spreadsheet",
    "Modelos & IA Local": "local open-source open-weight ollama",
    "Plataformas & APIs": "api inference platform sdk",
    "Produtividade & Documentos": "productivity office meeting notes pdf document",
    "Escrita & Marketing": "writing copy marketing seo",
    "Imagem & Design": "image design photo visual",
    "Vídeo": "video avatar",
    "Áudio, Voz & Música": "audio voice speech music",
}


# ---------- normalização ----------
def name_key(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z0-9]", "", s)
    k = ALIASES.get(s, s)
    for suf in ("ai", "app", "dev", "io", "hq"):
        if k.endswith(suf) and len(k) > len(suf) + 2 and k not in ALIASES.values():
            k2 = k[: -len(suf)]
            k = ALIASES.get(k2, k2)
            break
    return ALIASES.get(k, k)


def clean_url(url: str) -> str:
    url = url.strip()
    if url.startswith("//"):
        url = "https:" + url
    if not url.startswith("http"):
        return ""
    p = urllib.parse.urlparse(url)
    path = re.sub(r"/(pricing|pricing\.html|docs|getting-started)(/.*)?$", "", p.path).rstrip("/")
    return urllib.parse.urlunparse(("https", p.netloc.lower(), path, "", "", ""))


def host(url: str) -> str:
    return urllib.parse.urlparse(url).netloc.lower().removeprefix("www.")


def registrable(h: str) -> str:
    parts = h.split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else h


def site_key(url: str) -> str:
    h = host(url)
    reg = registrable(h)
    if reg in MULTI_PRODUCT_DOMAINS:
        segs = [s for s in urllib.parse.urlparse(url).path.split("/") if s]
        depth = 2 if reg in ("github.com", "github.io") else 1
        return "/".join([h] + segs[:depth]).lower()
    return reg


def valid_candidate(name: str, url: str) -> bool:
    if not name or not url or len(name) > 40 or len(name) < 2:
        return False
    if JUNK_NAME.search(name) or not re.search(r"[A-Za-z]", name):
        return False
    if re.search(r"[\U0001F300-\U0001FAFF☀-➿]", name):
        return False
    h = host(url)
    if h in BLOCKED_HOSTS or registrable(h) in BLOCKED_HOSTS:
        return False
    if re.search(r"\.(svg|png|jpg|gif)$", url, re.I):
        return False
    if h == "github.com" and re.search(r"/(issues|graphs|sponsors|pulls|blob|tree)\b", url):
        return False
    return True


def classify(name: str, desc: str, raw_cat: str = "") -> str:
    if raw_cat.lower() in CATEGORY_MAP:
        return CATEGORY_MAP[raw_cat.lower()]
    hay = f" {name} {desc} ".lower()
    scores = {c: sum(f" {w}" in hay for w in words.split()) for c, words in KEYWORDS.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] else "Plataformas & APIs"


# ---------- coleta ----------
def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "AyorAI-Tools-Updater/2.0"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")


def discover():
    """Return (candidates, mentions). mentions counts how many directories cite a tool."""
    candidates: dict[str, dict] = {}
    mentions: dict[str, set] = {}

    def note(key: str, source: str):
        mentions.setdefault(key, set()).add(source)

    if OFFLINE:
        return candidates, mentions
    for source, url in SOURCES:
        try:
            raw = fetch(url)
        except Exception as e:  # rede indisponível: segue com as demais fontes
            print(f"[warn] {source}: {e}", file=sys.stderr)
            continue
        if url.endswith(".json"):
            try:
                items = json.loads(raw).get("tools", [])
            except Exception as e:
                print(f"[warn] {source}: {e}", file=sys.stderr)
                continue
            for x in items:
                n, u = str(x.get("name", "")).strip(), clean_url(str(x.get("url", "")))
                if not valid_candidate(n, u):
                    continue
                k = name_key(n)
                note(k, source)
                note(site_key(u), source)
                candidates.setdefault(k, {
                    "name": n, "url": u,
                    "description": str(x.get("description_en") or x.get("description") or "").strip(),
                    "raw_cat": str(x.get("category", "")),
                })
        else:
            for n, u in re.findall(r"\[([^\]]{2,60})\]\((https?://[^)\s]+)\)", raw):
                n = re.sub(r"[*_`]", "", n).strip()
                u = clean_url(u)
                if not valid_candidate(n, u):
                    continue
                k = name_key(n)
                note(k, source)
                note(site_key(u), source)
                candidates.setdefault(k, {"name": n, "url": u, "description": "", "raw_cat": ""})
    return candidates, mentions


# ---------- pontuação e montagem ----------
def build():
    seed = json.loads(SEED.read_text(encoding="utf-8"))
    rank = {name_key(n): i + 1 for i, n in enumerate(WORLD_RANK)}
    candidates, mentions = discover()
    today = date.today().isoformat()

    def score(key: str, url: str, editorial: bool) -> tuple[int, int | None]:
        srcs = mentions.get(key, set()) | mentions.get(site_key(url), set())
        r = rank.get(key)
        if r:
            base = 100 - (r - 1) * 0.6          # #1 → 100, #74 → ~56
        else:
            base = 52 if editorial else 40
        return min(100, round(base + 4 * len(srcs))), r

    pool = []
    for t in seed:
        if not t.get("name") or not t.get("url"):
            continue
        url = clean_url(t["url"]) or t["url"]
        k = name_key(t["name"])
        s, r = score(k, url, True)
        pool.append({**t, "url": url, "domain": host(url), "curation_score": s,
                     **({"world_rank": r} if r else {}), "_key": k, "_site": site_key(url),
                     "_srcs": len(mentions.get(k, ()))})

    for k, c in candidates.items():
        srcs = mentions.get(k, set())
        # Ferramenta nova só entra se confirmada: lista estruturada ou 2+ diretórios
        if "2026-curated" not in srcs and len(srcs) < 2:
            continue
        s, r = score(k, c["url"], False)
        cat = classify(c["name"], c["description"], c["raw_cat"])
        pool.append({
            "name": c["name"], "category": cat,
            "description": (c["description"] or f"Ferramenta de IA em {cat.lower()}, citada em diretórios públicos de IA.")[:240],
            "url": c["url"], "domain": host(c["url"]), "tags": [cat.split(" ")[0], "Auto-descoberta"],
            "curation_score": s, **({"world_rank": r} if r else {}),
            "discovery_sources": sorted(srcs), "_key": k, "_site": site_key(c["url"]), "_srcs": len(srcs),
        })

    # Melhor primeiro; editorial (seed) vence empate de dados descobertos
    pool.sort(key=lambda t: (t.get("world_rank") or 999, -t["curation_score"],
                             "discovery_sources" in t, t["name"].lower()))
    seen_names, seen_sites, unique = set(), set(), []
    for t in pool:
        if t["_key"] in seen_names or t["_site"] in seen_sites:
            continue
        seen_names.add(t["_key"])
        seen_sites.add(t["_site"])
        unique.append(t)

    per_cat: dict[str, int] = {}
    final = []
    for t in unique:
        c = t["category"]
        if per_cat.get(c, 0) >= MAX_PER_CATEGORY and not t.get("world_rank"):
            continue
        per_cat[c] = per_cat.get(c, 0) + 1
        final.append({k: v for k, v in t.items() if not k.startswith("_")} | {"last_verified": today})
        if len(final) >= MAX_TOTAL:
            break

    final.sort(key=lambda t: (t.get("world_rank") or 999, -t["curation_score"], t["name"].lower()))
    return final, len(candidates)


def main() -> int:
    final, discovered = build()
    names = [name_key(t["name"]) for t in final]
    assert len(names) == len(set(names)), "duplicated tool names in output"
    old = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
    # last_verified muda todo dia; compara sem ele para não gerar commit à toa
    strip = lambda items: [{k: v for k, v in t.items() if k != "last_verified"} for t in items]
    try:
        unchanged = strip(json.loads(old)) == strip(final)
    except Exception:
        unchanged = False
    if not unchanged:
        OUTPUT.write_text(json.dumps(final, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"date": date.today().isoformat(), "discovered": discovered,
                      "catalog_size": len(final), "changed": not unchanged}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
