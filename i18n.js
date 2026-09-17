(function(){
'use strict';

const DICT={
  pt:{html:'pt-BR',news:'Notícias',search:'Buscar notícias…',projects:'Projetos',studies:'Estudos',updated:'atualizado',all:'Todos',sortNew:'Mais recentes',sortOld:'Mais antigas',loading:'Carregando notícias…',empty:'Nenhuma notícia encontrada.',minutes:'minutos atrás',hour:'hora',hours:'horas',day:'dia',days:'dias'},
  es:{html:'es-ES',news:'Noticias',search:'Buscar noticias…',projects:'Proyectos',studies:'Estudios',updated:'actualizado',all:'Todos',sortNew:'Más recientes',sortOld:'Más antiguas',loading:'Cargando noticias…',empty:'No se encontraron noticias.',minutes:'minutos atrás',hour:'hora',hours:'horas',day:'día',days:'días'},
  en:{html:'en-GB',news:'News',search:'Search news…',projects:'Projects',studies:'Studies',updated:'updated',all:'All',sortNew:'Newest',sortOld:'Oldest',loading:'Loading news…',empty:'No news found.',minutes:'minutes ago',hour:'hour',hours:'hours',day:'day',days:'days'}
};

function lang(){return localStorage.getItem('ayorai_lang')||'pt'}
function L(){return DICT[lang()]||DICT.pt}
function t(k){return L()[k]||k}

const FLAGS={
  pt:'<svg viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" rx="2" fill="#009c3b"/><path d="M14 2.8 25 10 14 17.2 3 10Z" fill="#ffdf00"/><circle cx="14" cy="10" r="4.2" fill="#002776"/><path d="M10.3 9.2c2.3-.6 4.9-.2 7.3.8" fill="none" stroke="#fff" stroke-width=".8"/></svg>',
  es:'<svg viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" rx="2" fill="#c60b1e"/><rect y="5" width="28" height="10" fill="#ffc400"/></svg>',
  en:'<svg viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" rx="2" fill="#012169"/><path d="M0 0 28 20M28 0 0 20" stroke="#fff" stroke-width="4"/><path d="M0 0 28 20M28 0 0 20" stroke="#c8102e" stroke-width="2"/><path d="M14 0v20M0 10h28" stroke="#fff" stroke-width="6"/><path d="M14 0v20M0 10h28" stroke="#c8102e" stroke-width="3"/></svg>'
};

function add(){
  if(document.querySelector('.language-switcher'))return;
  const host=document.querySelector('.topbar-right')||document.querySelector('.nav')||document.querySelector('.radar-topbar');
  if(!host)return;
  const box=document.createElement('div');
  box.className='language-switcher';
  box.setAttribute('aria-label','Language');
  [['pt','Português Brasil'],['es','Español'],['en','English']].forEach(x=>{
    const b=document.createElement('button');
    b.type='button';b.dataset.lang=x[0];b.title=x[1];b.setAttribute('aria-label',x[1]);
    b.innerHTML=FLAGS[x[0]];
    b.onclick=()=>setLang(x[0]);
    box.appendChild(b);
  });
  host.appendChild(box);mark();
}
function mark(){const c=lang();document.querySelectorAll('.language-switcher button').forEach(b=>b.classList.toggle('active',b.dataset.lang===c))}
function setText(sel,key){const e=document.querySelector(sel);if(e)e.textContent=t(key)}
function apply(){
  add();
  document.documentElement.lang=L().html;
  setText('.topbar-nav .tlink:nth-child(1)','news');
  const q=document.getElementById('searchInput');if(q)q.placeholder=t('search');
  setText('.sidebar-tabs .stab:nth-child(1)','projects');
  setText('.sidebar-tabs .stab:nth-child(2)','studies');
  const live=document.querySelector('.live-pill');if(live){const dot=live.querySelector('.live-dot');live.textContent='';if(dot)live.appendChild(dot);live.appendChild(document.createTextNode(' '+t('updated')))}
  const sort=document.getElementById('sortSelect');if(sort){sort.options[0].text=t('sortNew');sort.options[1].text=t('sortOld')}
  mark();
}
window.AyoraiI18n={t,setLang,lang};
function setLang(x){if(!DICT[x])return;localStorage.setItem('ayorai_lang',x);location.reload()}
document.addEventListener('DOMContentLoaded',apply);window.addEventListener('load',apply);
})();
