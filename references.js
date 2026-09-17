/* AyoraiTech · Technical references enhancement */
(function(){
  "use strict";
  function addLink(box,cls,url,icon,label){
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
  function enhance(){
    document.querySelectorAll(".news-item:not([data-tech-ref])").forEach(function(card){
      card.setAttribute("data-tech-ref","1");
      var title=(card.querySelector(".news-item-title")||{}).textContent||"";
      var sourceUrl=card.getAttribute("href")||"";
      var q=encodeURIComponent(title.trim());
      var box=document.createElement("div");
      box.className="news-tech-links";
      var label=document.createElement("span");
      label.className="news-tech-label";
      label.textContent="REFERÊNCIAS TÉCNICAS";
      box.appendChild(label);
      addLink(box,"source",sourceUrl,"↗","Fonte original");
      addLink(box,"hf","https://huggingface.co/models?search="+q,"🤗","Hugging Face · Modelos");
      addLink(box,"github","https://github.com/search?q="+q+"&type=repositories","◉","GitHub · Código");
      var body=card.querySelector(".news-body");
      if(body) body.appendChild(box);
    });
    document.querySelectorAll(".week-card:not([data-tech-ref])").forEach(function(card){
      card.setAttribute("data-tech-ref","1");
      var title=(card.querySelector(".week-title")||{}).textContent||"";
      var q=encodeURIComponent(title.trim());
      var box=document.createElement("div");
      box.className="week-tech-links";
      var hf=document.createElement("a");
      hf.className="week-tech-link"; hf.href="https://huggingface.co/models?search="+q; hf.target="_blank"; hf.rel="noopener noreferrer"; hf.textContent="🤗 Hugging Face · Modelos";
      hf.addEventListener("click",function(e){e.stopPropagation();});
      var gh=document.createElement("a");
      gh.className="week-tech-link"; gh.href="https://github.com/search?q="+q+"&type=repositories"; gh.target="_blank"; gh.rel="noopener noreferrer"; gh.textContent="◉ GitHub · Código";
      gh.addEventListener("click",function(e){e.stopPropagation();});
      box.appendChild(hf); box.appendChild(gh);
      var body=card.querySelector(".week-body");
      if(body) body.appendChild(box);
    });
  }
  var obs=new MutationObserver(enhance);
  function start(){enhance();obs.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
