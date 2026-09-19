"use strict";

const state={articles:[],projects:[],filter:"all",query:"",sort:"newest",activeTab:"projetos",clicks:JSON.parse(localStorage.getItem("ayorai_clicks")||"{}")};
const LANGS={pt:{label:"Português Brasil"},es:{label:"Español"},en:{label:"English"}};
const EMOJIS={"TechCrunch":"⚡","The Verge":"🔮","Wired":"🌐","Ars Technica":"🔬","MIT Tech Review":"🧪","Xataka":"🤖","Genbeta":"💡","Canaltech":"📡","Tecnoblog":"💻","Olhar Digital":"👁","36Kr":"🇨🇳","YourStory":"🇮🇳"};
const $=id=>document.getElementById(id),$list=$("newsList"),$search=$("searchInput"),$sort=$("sortSelect"),$filters=$("filterBtns"),$date=$("todayDate"),$layout=$("layout"),$sbList=$("sidebarList"),$toggle=$("sidebarToggle");
const currentLang=()=>window.AyoraiI18n?.lang?.()||"pt";
const T=k=>window.AyoraiI18n?.t?.(k)||k;
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;")}
function get(o,...keys){for(const k of keys){const v=o[k];if(v&&String(v).trim())return String(v).trim()}return ""}
function proxyImg(url){return "https://images.weserv.nl/?url="+encodeURIComponent(url)+"&w=480&output=webp&maxage=7d"}
function makeImg(url,alt,emoji,ph){if(!url)return '<div class="'+ph+'">'+emoji+'</div>';return '<img src="'+esc(url)+'" alt="'+esc(alt)+'" loading="lazy" onerror="if(!this._p){this._p=1;this.src=\''+proxyImg(url).replace(/'/g,"\\'")+'\'}">'}
function timeAgo(iso){const ms=new Date(iso).getTime();if(!Number.isFinite(ms))return "";const sec=Math.max(0,Math.floor((Date.now()-ms)/1000));if(sec<3600)return Math.floor(sec/60)+" "+T("minutes");if(sec<86400){const h=Math.floor(sec/3600);return h+" "+(h===1?T("hour"):T("hours"))+(currentLang()==="pt"?" atrás":" "+(currentLang()==="es"?"atrás":"ago"))}const d=Math.floor(sec/86400);return d+" "+(d===1?T("day"):T("days"))+(currentLang()==="pt"?" atrás":" "+(currentLang()==="es"?"atrás":" ago") )}
function debounce(fn,ms){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>fn.apply(null,a),ms)}}
function registerClick(link){if(!link)return;state.clicks[link]=(state.clicks[link]||0)+1;localStorage.setItem("ayorai_clicks",JSON.stringify(state.clicks))}window.registerClick=registerClick;

async function translateText(text,target){
  if(!text||target==="pt")return text;
  const cacheKey="ayorai_tr_"+target+"_"+btoa(unescape(encodeURIComponent(text))).slice(0,120);
  try{const cached=localStorage.getItem(cacheKey);if(cached)return cached}catch(e){}
  try{
    const url="https://api.mymemory.translated.net/get?q="+encodeURIComponent(text.slice(0,1200))+"&langpair=auto|"+target;
    const r=await fetch(url,{cache:"force-cache"});
    if(!r.ok)throw new Error("translation http "+r.status);
    const j=await r.json();const out=j?.responseData?.translatedText;
    if(out&&out.trim()&&out.toLowerCase()!==text.toLowerCase()){try{localStorage.setItem(cacheKey,out)}catch(e){}return out.trim()}
  }catch(e){console.warn("Ayorai translation fallback",e)}
  return text;
}
const translationCache=new Map();
async function localizedArticle(a){
  const l=currentLang();
  const title=get(a,"title_"+l,"title_pt","title_original","title");
  const desc=get(a,"description_"+l,"description_pt","description_original","description");
  if(a["title_"+l]||a["description_"+l]||l==="pt")return {title,desc};
  const key=(a.link||a.title_original||"")+"|"+l;
  if(translationCache.has(key))return translationCache.get(key);
  const p=Promise.all([translateText(get(a,"title_original","title_pt","title"),l),translateText(get(a,"description_original","description_pt","description"),l)]).then(([t,d])=>({title:t,desc:d}));
  translationCache.set(key,p);return p;
}

function getFiltered(){const q=state.query.toLowerCase();const list=state.articles.filter(a=>!q||["pt","es","en"].flatMap(l=>[get(a,"title_"+l),get(a,"description_"+l)]).concat([get(a,"title_pt","title_original","title"),get(a,"description_pt","description_original","description"),get(a,"source")]).join(" ").toLowerCase().includes(q));list.sort((a,b)=>{const da=new Date(a.published||0).getTime(),db=new Date(b.published||0).getTime();return state.sort==="newest"?db-da:da-db});return list}
async function newsItem(a,idx){const localized=await localizedArticle(a),title=esc(localized.title),desc=esc(localized.desc),link=esc(get(a,"link","url")),source=get(a,"source"),image=get(a,"image","image_url","img","thumbnail"),delay=Math.min(idx*35,700),emoji=EMOJIS[source]||"📰",lnk=link.replace(/'/g,"\\'");const thumb=image?'<div class="news-thumb">'+makeImg(image,localized.title,emoji,"news-thumb-ph")+'</div>':"";return '<a class="news-item'+(image?" has-img":"")+'" href="'+link+'" target="_blank" rel="noopener" style="animation-delay:'+delay+'ms" onclick="registerClick(\''+lnk+'\')">'+thumb+'<div class="news-body"><span class="news-badge">'+esc(source)+'</span><h2 class="news-item-title">'+title+'</h2>'+(desc?'<p class="news-desc">'+desc+'</p>':"")+'<div class="news-foot"><span class="news-tag">#'+esc(source.toLowerCase().replace(/\s+/g,""))+'</span><span class="news-time">'+timeAgo(a.published)+'</span></div></div></a>'}
async function renderNews(){if(!$list)return;const filtered=getFiltered();$list.innerHTML=filtered.length?'<div class="loader"><div class="spinner"></div><p>'+T("loading")+'</p></div>':'<div class="empty">'+T("empty")+'</div>';if(!filtered.length)return;const html=await Promise.all(filtered.map(newsItem));$list.innerHTML=html.join("")}
function buildFilters(){if(!$filters)return;const counts={};state.articles.forEach(a=>{const l=LANGS[a.language]?a.language:"en";counts[l]=(counts[l]||0)+1});$filters.innerHTML='';const all=document.createElement("button");all.className="filter-btn active";all.dataset.lang="all";all.innerHTML=T("all")+' <span class="cnt">('+state.articles.length+')</span>';$filters.appendChild(all);Object.keys(LANGS).forEach(code=>{if(!counts[code])return;const b=document.createElement("button");b.className="filter-btn";b.dataset.lang=code;b.innerHTML=LANGS[code].label+' <span class="cnt">('+counts[code]+')</span>';$filters.appendChild(b)})}
function setFilter(lang){state.filter=lang;if($filters)$filters.querySelectorAll(".filter-btn").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));renderNews()}
function renderPortfolio(){if(!$sbList)return;const items=state.projects.filter(p=>state.activeTab==="projetos"?p.category==="projeto":p.category==="estudo");if(!items.length){$sbList.innerHTML='<div class="add-hint">Nenhum item ainda.</div>';return}const html=items.map(p=>{const st={ativo:"ativo","em andamento":"andamento",pausado:"pausado"}[p.status]||"andamento";let links="";if(p.link)links+='<a class="proj-link" href="'+esc(p.link)+'" target="_blank" rel="noopener">Ver site</a>';if(p.repo)links+='<a class="proj-link" href="'+esc(p.repo)+'" target="_blank" rel="noopener">GitHub</a>';let meta="";if(p.created_at)meta+='<span class="proj-tag">📅 '+esc(p.created_at)+'</span>';if(p.version)meta+='<span class="proj-tag">v'+esc(p.version)+'</span>';return '<div class="proj-card"><div class="proj-card-top"><div class="proj-title">'+esc(p.title)+'</div><span class="proj-status '+st+'">'+esc(p.status)+'</span></div><p class="proj-desc">'+esc(p.description)+'</p>'+(meta?'<div class="proj-tags" style="margin-bottom:.4rem">'+meta+'</div>':"")+(p.tags?.length?'<div class="proj-tags">'+p.tags.map(t=>'<span class="proj-tag">'+esc(t)+'</span>').join("")+'</div>':"")+(links?'<div class="proj-links">'+links+'</div>':"")+'</div>'}).join("");$sbList.innerHTML=html}
async function loadNews(){if(!$list)return;$list.innerHTML='<div class="loader"><div class="spinner"></div><p>'+T("loading")+'</p></div>';try{const res=await fetch("data/news.json?v="+Math.floor(Date.now()/60000),{cache:"no-store"});if(!res.ok)throw new Error("HTTP "+res.status);const data=await res.json();if(!Array.isArray(data))throw new Error("Formato inválido de news.json");state.articles=data;if($date)$date.textContent=new Date().toLocaleDateString(window.AyoraiI18n?.lang?.()||"pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});buildFilters();renderNews()}catch(e){console.error("Erro news:",e);$list.innerHTML='<div class="empty">'+T("empty")+'</div>'}}
async function loadProjects(){if(!$sbList)return;try{const [local,gh]=await Promise.all([fetch("data/projects.json?v="+Date.now(),{cache:"no-store"}),fetch("https://api.github.com/users/Ayorinha/repos?per_page=100&sort=updated&direction=desc",{cache:"no-store",headers:{"Accept":"application/vnd.github+json"}})]);const base=local.ok?await local.json():[];const manual=Array.isArray(base)?base:[];const representedRepos=new Set(manual.map(p=>String(p.repo||"").trim()).filter(Boolean));let extras=[];if(gh.ok){const data=await gh.json();extras=Array.isArray(data)?data.filter(r=>!r.fork&&!r.archived&&!representedRepos.has(r.html_url)).map(r=>({id:"gh-"+r.id,category:"projeto",title:r.name,description:r.description||"Repositório GitHub de Anderson Leon Ayora.",link:r.homepage||"",repo:r.html_url,tags:[r.language||"GitHub"],status:"ativo",version:"",created_at:(r.updated_at||"").slice(0,10)})):[]}state.projects=[...manual,...extras];}catch(e){try{const r=await fetch("data/projects.json?v="+Date.now(),{cache:"no-store"});state.projects=r.ok?await r.json():[]}catch(_){state.projects=[]}}renderPortfolio()}
if($search)$search.addEventListener("input",debounce(e=>{state.query=e.target.value;renderNews()},250));if($sort)$sort.addEventListener("change",e=>{state.sort=e.target.value;renderNews()});if($filters)$filters.addEventListener("click",e=>{const b=e.target.closest(".filter-btn");if(b)setFilter(b.dataset.lang)});if($toggle&&$layout)$toggle.addEventListener("click",()=>{$layout.classList.toggle("sidebar-closed")});document.querySelectorAll(".stab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".stab").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.activeTab=b.dataset.tab;renderPortfolio()}));
document.addEventListener("DOMContentLoaded",()=>{if(window.innerWidth<=768&&$layout)$layout.classList.add("sidebar-closed");loadNews();loadProjects();setInterval(()=>loadNews(),120000);});
