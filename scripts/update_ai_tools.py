#!/usr/bin/env python3
from __future__ import annotations
import json, re, sys, urllib.parse, urllib.request
from datetime import date
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/"data"/"ai-tools-ranked-2026.json"
SOURCES=[
("2026-curated","https://raw.githubusercontent.com/ahdpe/awesome-ai-tools-2026/main/data/tools.json"),
("developer-directory","https://raw.githubusercontent.com/open-ai-directory/best-ai-tools-for-developers/main/README.md"),
("awesome-ai","https://raw.githubusercontent.com/doocs/awesome-ai/main/README.md"),
("auto-updated","https://raw.githubusercontent.com/0xvibly/awesome-ai-tools-2026/main/README.md"),
]
CATEGORY_MAP={"assistants":"Assistentes & Pesquisa","coding":"Desenvolvimento","agents":"Agentes & Automação","rag":"RAG & Conhecimento","evaluation":"Avaliação & Observabilidade","image":"Imagem","video":"Vídeo","audio":"Áudio & Voz","local":"IA Local & Inferência","platforms":"Plataformas IA","research":"Pesquisa & Ciência","data":"Dados & Analytics","productivity":"Produtividade","automation":"Agentes & Automação","security":"AI Safety & Segurança"}
KEYWORDS={
"Desenvolvimento":"code coding developer IDE software programming terminal",
"Agentes & Automação":"agent agents automation workflow orchestration MCP",
"RAG & Conhecimento":"RAG retrieval search knowledge vector database",
"Avaliação & Observabilidade":"evaluation eval observability tracing red team benchmark testing",
"Assistentes & Pesquisa":"assistant research search reasoning chat",
"Dados & Analytics":"data analytics SQL database BI spreadsheet",
"IA Local & Inferência":"local inference open source open-weight Ollama LM Studio",
"Plataformas IA":"API inference models platform SDK",
"Pesquisa & Ciência":"research paper science academic",
"Produtividade":"productivity office writing meeting notes",
"Imagem":"image design visual","Vídeo":"video avatar","Áudio & Voz":"audio voice speech music",
"AI Safety & Segurança":"security safety guardrail governance privacy"}

def fetch(url):
    req=urllib.request.Request(url,headers={"User-Agent":"AyorAI-Tools-Updater/1.0"})
    with urllib.request.urlopen(req,timeout=25) as r:return r.read().decode("utf-8","replace")
def norm(url):
    url=url.strip()
    if url.startswith("//"):url="https:"+url
    return url.split("#",1)[0].rstrip("/") if url.startswith("http") else ""
def host(url):return urllib.parse.urlparse(url).netloc.lower().removeprefix("www.")
def classify(name,desc,source=""):
    if source in CATEGORY_MAP:return CATEGORY_MAP[source]
    hay=f"{name} {desc}".lower()
    scores={c:sum(k.lower() in hay for k in words.split()) for c,words in KEYWORDS.items()}
    return max(scores,key=scores.get) if max(scores.values(),default=0) else "Plataformas IA"
def md_links(text):
    return [{"name":re.sub(r"[*_]","",a).strip(),"url":norm(b)} for a,b in re.findall(r"\[([^\]]{2,100})\]\((https?://[^)\s]+)\)",text)]
def discover():
    out={}
    for source,url in SOURCES:
        try:raw=fetch(url)
        except Exception as e:print(f"[warn] {source}: {e}",file=sys.stderr);continue
        if url.endswith("tools.json"):
            try:
                items=json.loads(raw).get("tools",[])
                for x in items:
                    u,n=norm(str(x.get("url",""))),str(x.get("name","")).strip()
                    if not u or not n:continue
                    e=out.setdefault(u.lower(),{"name":n,"url":u,"description":str(x.get("description_en") or x.get("description_ru") or ""),"cats":set(),"sources":set()})
                    e["cats"].add(str(x.get("category","")));e["sources"].add(source)
            except Exception as e:print(f"[warn] {source}: {e}",file=sys.stderr)
        else:
            for x in md_links(raw):
                if not x["url"]:continue
                e=out.setdefault(x["url"].lower(),{"name":x["name"],"url":x["url"],"description":"","cats":set(),"sources":set()})
                e["sources"].add(source)
    return out
def alive(url):
    for method in ("HEAD","GET"):
        try:
            req=urllib.request.Request(url,method=method,headers={"User-Agent":"AyorAI-Tools-Updater/1.0"})
            with urllib.request.urlopen(req,timeout=12) as r:return 200<=r.status<400
        except Exception:pass
    return False
def main():
    if not CATALOG.exists():return 1
    catalog=json.loads(CATALOG.read_text(encoding="utf-8"))
    existing={norm(str(x.get("url",""))).lower() for x in catalog if x.get("url")}
    found=discover();today=date.today().isoformat();added=[]
    for key,x in found.items():
        if key in existing or not host(x["url"]) or not alive(x["url"]):continue
        cat=classify(x["name"],x["description"],next(iter(x["cats"]), ""))
        score=min(100,40+15*len(x["sources"])+(10 if "api" in x["description"].lower() else 0))
        added.append({"name":x["name"],"category":cat,"description":(x["description"] or f"Ferramenta de IA para {cat.lower()}, descoberta por sinais de relevância em diretórios públicos.")[:280],"url":x["url"],"domain":host(x["url"]),"tags":["AI",cat,"Curated","Auto-discovered"],"curation_score":score,"discovery_sources":sorted(x["sources"]),"last_verified":today})
    if added:
        catalog.extend(sorted(added,key=lambda z:(-z["curation_score"],z["name"].lower())))
        CATALOG.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"date":today,"discovered":len(found),"added":len(added),"catalog_size":len(catalog)},ensure_ascii=False,indent=2))
    return 0
if __name__=="__main__":raise SystemExit(main())
