(function(){
'use strict';
const D={
  pt:{html:'pt-BR',news:'Notícias',search:'Buscar notícias…',projects:'Projetos',studies:'Estudos',updated:'atualizado',all:'Todos',sortNew:'Mais recentes',sortOld:'Mais antigas'},
  es:{html:'es-ES',news:'Noticias',search:'Buscar noticias…',projects:'Proyectos',studies:'Estudios',updated:'actualizado',all:'Todos',sortNew:'Más recientes',sortOld:'Más antiguas'},
  en:{html:'en-GB',news:'News',search:'Search news…',projects:'Projects',studies:'Studies',updated:'updated',all:'All',sortNew:'Newest',sortOld:'Oldest'}
};
function L(){return D[localStorage.getItem('ayorai_lang')||'pt']||D.pt}
function t(k){return L()[k]||k}
function add(){
  if(document.querySelector('.language-switcher'))return;
  const host=document.querySelector('.topbar-right')||document.querySelector('.nav')||document.querySelector('.radar-topbar');
  if(!host)return;
  const box=document.createElement('div');
  box.className='language-switcher';
  box.setAttribute('aria-label','Language');
  [['pt','🇧🇷','Português'],['es','🇪🇸','Español'],['en','🇬🇧','English']].forEach(x=>{
    const b=document.createElement('button');
    b.type='button'; b.dataset.lang=x[0]; b.title=x[2]; b.textContent=x[1];
    b.onclick=()=>{localStorage.setItem('ayorai_lang',x[0]);location.reload()};
    box.appendChild(b);
  });
  host.appendChild(box); mark();
}
function mark(){
  const current=localStorage.getItem('ayorai_lang')||'pt';
  document.querySelectorAll('.language-switcher button').forEach(b=>b.classList.toggle('active',b.dataset.lang===current));
}
function text(s,k){const e=document.querySelector(s);if(e)e.textContent=t(k)}
function apply(){
  add();
  document.documentElement.lang=L().html;
  text('.topbar-nav .tlink:nth-child(1)','news');
  const q=document.getElementById('searchInput'); if(q)q.placeholder=t('search');
  text('.sidebar-tabs .stab:nth-child(1)','projects');
  text('.sidebar-tabs .stab:nth-child(2)','studies');
  const live=document.querySelector('.live-pill'); if(live){const dot=live.querySelector('.live-dot'); live.textContent=''; if(dot)live.appendChild(dot); live.appendChild(document.createTextNode(' '+t('updated')))}
  const sort=document.getElementById('sortSelect');
  if(sort){sort.options[0].text=t('sortNew');sort.options[1].text=t('sortOld')}
  mark();
}
window.AyoraiI18n={t,setLang:(x)=>{localStorage.setItem('ayorai_lang',x);location.reload()},lang:()=>localStorage.getItem('ayorai_lang')||'pt'};
document.addEventListener('DOMContentLoaded',apply);
window.addEventListener('load',apply);
})();
