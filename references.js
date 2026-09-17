/* AyoraiTech · validated technical references */
(function(){
  "use strict";
  var articles = [];

  function addLink(box, cls, url, icon, label){
    if(!url) return;
    var a=document.createElement("a");
    a.className="news-tech-link "+cls;
    a.href=url;
    a.target="_blank";
    a.rel="noopener noreferrer";
    a.innerHTML='<span class="news-tech-icon">'+icon+'</span> '+label;
    a.addEventListener("click",function(e){e.stopPropagation();});
    box.appendChild(a);
  }

  function titleOf(card){
    return ((card.querySelector(".news-item-title")||card.querySelector(".week-title")||{}).textContent||"").trim();
  }

  function findArticle(card){
    var title=titleOf(card).toLowerCase();
    for(var i=0;i<articles.length;i++){
      var a=articles[i]||{};
      var t=String(a.title_pt||a.title_original||a.title||"").trim().toLowerCase();
      if(t && t===title) return a;
    }
    return null;
  }

  function render(card){
    if(card.getAttribute("data-tech-ref")==="1") return;
    var article=findArticle(card);
    if(!article) return;
    card.setAttribute("data-tech-ref","1");

    var refs=article.technical_refs||{};
    var sourceUrl=card.getAttribute("href")||article.link||"";
    var hasTechnical=!!(refs.huggingface||refs.github);

    if(!hasTechnical) return;

    var box=document.createElement("div");
    box.className="news-tech-links";
    var label=document.createElement("span");
    label.className="news-tech-label";
    label.textContent="REFERÊNCIAS TÉCNICAS CONFIRMADAS";
    box.appendChild(label);

    if(refs.huggingface) addLink(box,"hf",refs.huggingface.url,"🤗","Hugging Face · Modelo");
    if(refs.github) addLink(box,"github",refs.github.url,"◉","GitHub · Repositório");
    if(sourceUrl) addLink(box,"source",sourceUrl,"↗","Fonte original");

    var body=card.querySelector(".news-body")||card.querySelector(".week-body");
    if(body) body.appendChild(box);
  }

  function enhance(){
    document.querySelectorAll(".news-item, .week-card").forEach(render);
  }

  function start(){
    fetch("data/news.json?v="+Math.floor(Date.now()/60000),{cache:"no-store"})
      .then(function(r){return r.ok?r.json():[];})
      .then(function(data){
        articles=Array.isArray(data)?data:[];
        enhance();
        var obs=new MutationObserver(enhance);
        obs.observe(document.body,{childList:true,subtree:true});
      })
      .catch(function(err){console.warn("Referências técnicas indisponíveis",err);});
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
