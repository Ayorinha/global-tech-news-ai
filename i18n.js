(function(){
'use strict';

const DICT={
  pt:{html:'pt-BR',news:'Notícias',search:'Buscar notícias…',projects:'Projetos',studies:'Estudos',updated:'atualizado',all:'Todos',sortNew:'Mais recentes',sortOld:'Mais antigas',loading:'Carregando notícias…',empty:'Nenhuma notícia encontrada.',minutes:'minutos atrás',hour:'hora',hours:'horas',day:'dia',days:'dias'},
  es:{html:'es-ES',news:'Noticias',search:'Buscar noticias…',projects:'Proyectos',studies:'Estudios',updated:'actualizado',all:'Todos',sortNew:'Más recientes',sortOld:'Más antiguas',loading:'Cargando noticias…',empty:'No se encontraron noticias.',minutes:'minutos atrás',hour:'hora',hours:'horas',day:'día',days:'días'},
  en:{html:'en-GB',news:'News',search:'Search news…',projects:'Projects',studies:'Studies',updated:'updated',all:'All',sortNew:'Newest',sortOld:'Oldest',loading:'Loading news…',empty:'No news found.',minutes:'minutes ago',hour:'hour',hours:'hours',day:'day',days:'days'}
};

function detectLang(){
  const langs=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'pt-BR']);
  for(const value of langs){
    const code=String(value||'').toLowerCase();
    if(code.startsWith('pt'))return 'pt';
    if(code.startsWith('es'))return 'es';
    if(code.startsWith('en'))return 'en';
  }
  return 'pt';
}
function lang(){return detectLang()}
function L(){return DICT[lang()]||DICT.pt}
function t(k){return L()[k]||k}
function setText(sel,key){const e=document.querySelector(sel);if(e)e.textContent=t(key)}
function apply(){
  document.documentElement.lang=L().html;
  setText('.topbar-nav .tlink:nth-child(1)','news');
  const q=document.getElementById('searchInput');if(q)q.placeholder=t('search');
  setText('.sidebar-tabs .stab:nth-child(1)','projects');
  setText('.sidebar-tabs .stab:nth-child(2)','studies');
  const live=document.querySelector('.live-pill');if(live){const dot=live.querySelector('.live-dot');live.textContent='';if(dot)live.appendChild(dot);live.appendChild(document.createTextNode(' '+t('updated')))}
  const sort=document.getElementById('sortSelect');if(sort){sort.options[0].text=t('sortNew');sort.options[1].text=t('sortOld')}
}
window.AyoraiI18n={t,lang};
document.addEventListener('DOMContentLoaded',apply);window.addEventListener('load',apply);
})();
