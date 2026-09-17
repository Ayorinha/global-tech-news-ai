"""Build the Ayorai AI Radar dataset from public news/search RSS feeds.
No API key is required. The output is a static JSON consumed by ai-radar.html.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote_plus

import feedparser
import requests

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT = DATA / "ai-radar.json"
NEWS = DATA / "news.json"

QUERIES = [
    '"new AI tool" OR "AI tool launches"',
    '"AI agent" launch OR "AI agents" release',
    '"new AI model" OR "AI model launches"',
    '"generative AI" launch OR release',
    '"AI coding" launch OR release',
    '"AI video" launch OR release',
    '"AI image" launch OR release',
    '"AI research" model OR agent OR tool',
]

CATEGORY_RULES = {
    "AI Agents": ["agent", "agents", "agentic", "autonomous"],
    "LLMs & Models": ["llm", "language model", "foundation model", "model launch", "model release", "reasoning model"],
    "Developer AI": ["coding", "developer", "code agent", "copilot", "dev tool", "programming"],
    "Image AI": ["image generator", "image generation", "text-to-image", "image model", "visual ai"],
    "Video AI": ["video generator", "video generation", "text-to-video", "video model"],
    "Audio & Voice": ["voice", "speech", "text-to-speech", "tts", "music generation", "audio ai"],
    "Data & Research": ["research", "data analysis", "analytics", "knowledge", "search"],
    "Enterprise AI": ["enterprise", "business", "finance", "crm", "workplace", "productivity"],
    "AI Safety": ["safety", "alignment", "eval", "evaluation", "red team", "security"],
}

HEADLINE_SIGNALS = [
    "launch", "launched", "launches", "introduces", "introduced", "unveils", "unveiled",
    "releases", "released", "debuts", "debut", "new", "preview", "beta", "available",
]


def google_rss(query: str) -> str:
    return "https://news.google.com/rss/search?q=" + quote_plus(query + " when:7d") + "&hl=en-US&gl=US&ceid=US:en"


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def category_for(title: str, description: str) -> str:
    text = (title + " " + description).lower()
    scores = {cat: sum(text.count(k) for k in keys) for cat, keys in CATEGORY_RULES.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] else "AI Ecosystem"


def parse_date(entry):
    tm = entry.get("published_parsed") or entry.get("updated_parsed")
    if tm:
        from calendar import timegm
        return datetime.fromtimestamp(timegm(tm), tz=timezone.utc)
    return datetime.now(timezone.utc)


def collect():
    items = {}
    for query in QUERIES:
        try:
            feed = feedparser.parse(google_rss(query))
            for e in feed.entries[:40]:
                title = clean(e.get("title", ""))
                link = e.get("link", "")
                if not title or not link:
                    continue
                key = re.sub(r"[^a-z0-9]+", " ", title.lower()).strip()
                if key in items:
                    continue
                source = clean((e.get("source") or {}).get("title", "Google News"))
                published = parse_date(e)
                desc = clean(re.sub(r"<[^>]+>", " ", e.get("summary", "")))[:420]
                items[key] = {
                    "title": title,
                    "description": desc,
                    "link": link,
                    "source": source,
                    "published": published.isoformat(),
                    "category": category_for(title, desc),
                }
        except Exception as exc:
            print("feed error:", query, exc)
    return list(items.values())


def add_existing_news(items):
    if not NEWS.exists():
        return items
    try:
        data = json.loads(NEWS.read_text(encoding="utf-8"))
    except Exception:
        return items
    seen = {x["link"] for x in items if x.get("link")}
    for a in data:
        title = clean(a.get("title_pt") or a.get("title_original") or a.get("title"))
        link = a.get("link") or a.get("url")
        if not title or not link or link in seen:
            continue
        text = clean(a.get("description_pt") or a.get("description_original") or a.get("description"))
        if not any(w in (title + " " + text).lower() for w in ["ai", "artificial intelligence", "modelo", "agent", "llm"]):
            continue
        items.append({
            "title": title,
            "description": text[:420],
            "link": link,
            "source": clean(a.get("source", "News")),
            "published": a.get("published") or datetime.now(timezone.utc).isoformat(),
            "category": category_for(title, text),
        })
        seen.add(link)
    return items


def score_items(items):
    now = datetime.now(timezone.utc)
    for x in items:
        try:
            age_h = max(0.1, (now - datetime.fromisoformat(x["published"].replace("Z", "+00:00"))).total_seconds() / 3600)
        except Exception:
            age_h = 72
        freshness = max(0.0, 72 - age_h) / 72 * 45
        launch = 25 if any(w in x["title"].lower() for w in HEADLINE_SIGNALS) else 8
        source_bonus = 10 if x["source"] not in {"Google News", "News"} else 0
        x["score"] = round(freshness + launch + source_bonus, 1)
    return sorted(items, key=lambda x: (x["score"], x["published"]), reverse=True)


def build_trends(items):
    now = datetime.now(timezone.utc)
    recent = [x for x in items if (now - datetime.fromisoformat(x["published"].replace("Z", "+00:00"))) <= timedelta(days=3)]
    cats = Counter(x["category"] for x in recent)
    words = Counter()
    stop = {"the", "and", "for", "with", "from", "this", "that", "new", "ai", "artificial", "intelligence", "a", "to", "of", "in", "on", "by", "is"}
    for x in recent:
        tokens = re.findall(r"[A-Za-z][A-Za-z0-9.-]{3,}", x["title"])
        words.update(t.lower() for t in tokens if t.lower() not in stop)
    trends = []
    for name, count in cats.most_common(8):
        trends.append({"name": name, "score": min(100, count * 9 + 20), "type": "category"})
    for name, count in words.most_common(12):
        if count < 2:
            continue
        trends.append({"name": name.title(), "score": min(100, count * 8 + 12), "type": "topic"})
    unique = {}
    for t in trends:
        unique[t["name"]] = max(unique.get(t["name"], 0), t["score"])
    return sorted(({"name": k, "score": v} for k, v in unique.items()), key=lambda x: x["score"], reverse=True)[:20]


def main():
    items = add_existing_news(collect())
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    items = [x for x in items if datetime.fromisoformat(x["published"].replace("Z", "+00:00")) >= cutoff]
    items = score_items(items)[:120]
    categories = sorted({x["category"] for x in items})
    now = datetime.now(timezone.utc)
    stats = {
        "signals": len(items),
        "new_24h": sum(1 for x in items if now - datetime.fromisoformat(x["published"].replace("Z", "+00:00")) <= timedelta(hours=24)),
        "categories": len(categories),
        "sources": len({x["source"] for x in items}),
    }
    payload = {
        "updated_at": now.isoformat(),
        "window": "7d",
        "stats": stats,
        "categories": categories,
        "signals": items,
        "trends": build_trends(items),
        "methodology": "Public RSS/news signals, deduplication, category classification and recency/momentum scoring. Updated automatically by GitHub Actions.",
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[ai-radar] {len(items)} signals | {stats['new_24h']} in 24h | {stats['sources']} sources")


if __name__ == "__main__":
    main()
