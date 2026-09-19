"""
Ayorai Tech News — coletor editorial de tecnologia.
Gera noticias recentes em PT, ES e EN para o site estatico.
"""
import json, logging, os, re, sys, time
from datetime import datetime, timezone, timedelta
from pathlib import Path

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
except ImportError:
    pip("deep-translator"); from deep_translator import GoogleTranslator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log=logging.getLogger("ayorai-news")
ROOT=Path(__file__).resolve().parent.parent
OUTPUT=ROOT/"data"/"news.json"
MAX_PER_FEED=10
MAX_ARTICLES=60
MAX_AGE_DAYS=14

HEADERS={"User-Agent":"AyoraiTechNews/2.0 (+https://ayorinha.github.io/global-tech-news-ai/)","Accept":"application/rss+xml, application/xml, text/xml, */*"}

FEEDS={
 "en":[
  ("https://techcrunch.com/feed/","TechCrunch"),
  ("https://www.theverge.com/rss/index.xml","The Verge"),
  ("https://feeds.arstechnica.com/arstechnica/index","Ars Technica"),
  ("https://www.wired.com/feed/rss","Wired"),
  ("https://technologyreview.com/feed/","MIT Tech Review"),
  ("https://openai.com/news/rss.xml","OpenAI News"),
  ("https://www.anthropic.com/news/rss.xml","Anthropic News"),
  ("https://blog.google/technology/ai/rss/","Google AI"),
  ("https://huggingface.co/blog/feed.xml","Hugging Face"),
  ("https://github.blog/feed/","GitHub Blog"),
 ],
 "es":[("https://www.xataka.com/feed.xml","Xataka"),("https://www.genbeta.com/feed.xml","Genbeta")],
 "pt":[("https://canaltech.com.br/rss/","Canaltech"),("https://tecnoblog.net/feed/","Tecnoblog"),("https://olhardigital.com.br/feed/","Olhar Digital")],
}

TECH_TERMS=re.compile(r"""\b(
ai|ia|artificial intelligence|inteligencia artificial|inteligência artificial|machine learning|deep learning|
llm|large language model|generative ai|genai|foundation model|model release|agent|agente|agentic|rag|
retrieval augmented generation|embedding|vector database|chatbot|copilot|autonomous|robotics|robotica|robótica|
computer vision|visao computacional|visão computacional|nlp|natural language processing|ocr|document intelligence|
synthetic data|dataset|benchmark|inference|fine[- ]?tuning|training|weights|checkpoint|open source|open-source|
sdk|api|library|framework|software|cloud|aws|azure|google cloud|kubernetes|docker|python|javascript|
typescript|rust|java|database|data engineering|data platform|cybersecurity|security research|zero[- ]?day|
vulnerability|encryption|semiconductor|gpu|npu|tpu|chip|accelerator|datacenter|data center|compute|
research paper|paper|arxiv|repository|repo|github|hugging face|multimodal|speech|voice model|video model|
mcp|model context protocol|ai safety|segurança de ia|seguridad de ia
)\b""",re.I|re.X)
EXCLUDE_TERMS=re.compile(r"""\b(sports?|football|soccer|cricket|tennis|celebrity|entertainment|movie|film|music|fashion|lifestyle|recipe|travel|horoscope|lottery|coupon|discount|politics|election)\b""",re.I)

def clean(text,limit=1800):
    text=re.sub(r"<[^>]+>"," ",str(text or ""))
    text=re.sub(r"&(?:nbsp|amp|quot|#39|#x27);"," ",text)
    return re.sub(r"\s+"," ",text).strip()[:limit]

def parse_date(entry):
    for attr in ("published_parsed","updated_parsed"):
        value=getattr(entry,attr,None)
        if value:
            try:return datetime(*value[:6],tzinfo=timezone.utc)
            except Exception:pass
    return datetime.now(timezone.utc)

def image_from(entry):
    for item in (getattr(entry,"media_content",[]) or [])+(getattr(entry,"media_thumbnail",[]) or []):
        if item.get("url"):return item["url"]
    for item in getattr(entry,"enclosures",[]) or []:
        url=item.get("href") or item.get("url") or ""
        if url and ("image" in item.get("type","") or re.search(r"\.(jpg|jpeg|png|webp|gif)(\?|$)",url,re.I)):return url
    html=clean(getattr(entry,"summary",""))
    m=re.search(r'<img[^>]+src=["\']([^"\']+)',html,re.I)
    return m.group(1) if m else ""

def relevant(title,desc):
    value=f"{title} {desc}"
    return len(TECH_TERMS.findall(value))>=1 and len(EXCLUDE_TERMS.findall(value))==0

def collect(url,source,language):
    try:
        response=requests.get(url,headers=HEADERS,timeout=25,allow_redirects=True)
        response.raise_for_status()
        feed=feedparser.parse(response.content)
    except Exception as exc:
        log.warning("%s failed: %s",source,str(exc)[:120]); return []
    result=[]
    cutoff=datetime.now(timezone.utc)-timedelta(days=MAX_AGE_DAYS)
    for entry in feed.entries[:MAX_PER_FEED]:
        title=clean(getattr(entry,"title",""))
        desc=clean(getattr(entry,"summary",getattr(entry,"description","")),1200)
        link=getattr(entry,"link","")
        published=parse_date(entry)
        if not title or not link or published<cutoff or not relevant(title,desc):continue
        result.append({"title_original":title,"description_original":desc[:700],"link":link,"published":published.isoformat(),"source":source,"language":language,"image":image_from(entry),"editorial":{"is_technical":True,"category":"technology"}})
    return result

def translate_bundle(text,source,targets):
    out={}
    for target in targets:
        if not text: out[target]=""; continue
        if source==target: out[target]=text; continue
        src={"zh":"zh-CN"}.get(source,source)
        try:
            translated=GoogleTranslator(source=src,target=target).translate(text[:1500])
            out[target]=(translated or text).strip()
        except Exception as exc:
            log.warning("translation %s->%s failed: %s",source,target,str(exc)[:80])
            out[target]=text
        time.sleep(0.15)
    return out

def split_bundle(value,fallback_title,fallback_desc):
    parts=value.split("\n\n",1)
    return (parts[0].strip() or fallback_title,(parts[1].strip() if len(parts)>1 else fallback_desc))

def main():
    log.info("AYORAI TECH NEWS — coleta global iniciada")
    articles=[]
    for language,feeds in FEEDS.items():
        for url,source in feeds:
            batch=collect(url,source,language)
            log.info("%s [%s]: %d noticias",source,language,len(batch))
            articles.extend(batch)
    unique={}
    for article in articles: unique.setdefault(article["link"],article)
    articles=sorted(unique.values(),key=lambda x:x["published"],reverse=True)[:MAX_ARTICLES]

    for index,article in enumerate(articles,1):
        bundle=f'{article["title_original"]}\n\n{article["description_original"]}'.strip()
        translated=translate_bundle(bundle,article["language"],("pt","es","en"))
        for lang in ("pt","es","en"):
            title,desc=split_bundle(translated.get(lang,""),article["title_original"],article["description_original"])
            article[f"title_{lang}"]=title
            article[f"description_{lang}"]=desc
        log.info("[%d/%d] %s — %s",index,len(articles),article["source"],article["title_pt"][:70])

    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    OUTPUT.write_text(json.dumps(articles,ensure_ascii=False,indent=2),encoding="utf-8")
    log.info("Publicado %d noticias recentes em %s",len(articles),OUTPUT)

if __name__=="__main__":main()
