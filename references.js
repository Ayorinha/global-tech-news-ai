/* AyoraiTech · Technical references enhancement */
(function(){
  "use strict";
  function esc(s){return String(s||"").replace(/[&<>\"]/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"})[c];});}
  function enhance(){
    document.querySelectorAll(".news-item:not([data-tech-ref])").forEach(function(card){
      card.setAttribute("data-tech-ref","1");
      var title=(card.querySelector(".news-item-title")||{}).textContent||"";
      var source=(card.querySelector(".news-badge")||{}).textContent||"";
      var sourceUrl=card.getAttribute("href")||"#";
      var q=encodeURIComponent(title.trim());
      var box=document.createElement("div");
      box.className="news-tech-links";
      box.innerHTML='<span class="news-tech-label">Referências técnicas</span>'
        +'<a class="news-tech-link source" href="'+sourceUrl+'" target="_blank" rel="noopener" onclick="event.stopPropagation()"><span class="news-tech-icon">↗</span> Fonte original</a>'
        +'<a class="news-tech-link hf" href="https://huggingface.co/models?search='+q+'" target="_blank" rel="noopener" onclick="event.stopPropagation()"><span class="news-tech-icon">🤗</span> Hugging Face</a>'
        +'<a class="news-tech-link github" href="https://github.com/search?q='+q+'&type=repositories" target="_blank" rel="noopener" onclick="event.stopPropagation()"><span class="news-tech-icon">◉</span> GitHub</a>';
      var body=card.querySelector(".news-body");
      if(body) body.appendChild(box);
    });
    document.querySelectorAll(".week-card:not([data-tech-ref])").forEach(function(card){
      card.setAttribute("data-tech-ref","1");
      var title=(card.querySelector(".week-title")||{}).textContent||"";
      var q=encodeURIComponent(title.trim());
      var box=document.createElement("div");
      box.className="week-tech-links";
      box.innerHTML='<a class="week-tech-link" href="https://huggingface.co/models?search='+q+'" target="_blank" rel="noopener" onclick="event.stopPropagation()">🤗 Hugging Face</a>'
        +'<a class="week-tech-link" href="https://github.com/search?q='+q+'&type=repositories" target="_blank" rel="noopener" onclick="event.stopPropagation()">◉ GitHub</a>';
      var body=card.querySelector(".week-body");
      if(body) body.appendChild(box);
    });
  }
  var obs=new MutationObserver(enhance);
  function start(){enhance();obs.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
