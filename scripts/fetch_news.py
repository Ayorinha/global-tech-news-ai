import feedparser
import json
import os

# Fontes de notícias (RSS)
FEEDS = [
    "https://g1.globo.com/rss/g1/tecnologia/",
    "https://cnnespanol.cnn.com/category/tecnologia/feed/",
    "https://www.technologyreview.com/feed/"
]

def buscar_noticias():
    lista_noticias = []
    for url in FEEDS:
        feed = feedparser.parse(url)
        for entrada in feed.entries[:5]:
            lista_noticias.append({
                "title": entrada.title,
                "link": entrada.link,
                "summary": entrada.get("summary", "Sem resumo."),
                "published": entrada.get("published", "")
            })
    
    os.makedirs('data', exist_ok=True)
    with open('data/news.json', 'w', encoding='utf-8') as f:
        json.dump(lista_noticias, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    buscar_noticias()
