(function(){
'use strict';
const D={
pt:{html:'pt-BR',portfolio:'Portfólio',news:'Notícias',search:'Buscar notícias…',projects:'Projetos',studies:'Estudos',updated:'atualizado',updatedAuto:'atualizado continuamente',view:'Ver site',all:'Todos',sortNew:'Mais recentes',sortOld:'Mais antigas',noNews:'Nenhuma notícia encontrada.',loading:'Carregando notícias...',heroTitle:'Applied AI · Data · Intelligent Automation',heroCopy:'Portfólio técnico, inteligência sobre o ecossistema de IA e ferramentas selecionadas para pesquisa, desenvolvimento e produtividade.',github:'View GitHub',index:'Explore AI Index',radar:'Open AI Radar',linkedin:'LinkedIn',engineering:'Como construo sistemas de IA',lead:'Do dado bruto ao sistema operacionalizável, com rastreabilidade, automação e foco em produção.'},
es:{html:'es-ES',portfolio:'Portafolio',news:'Noticias',search:'Buscar noticias…',projects:'Proyectos',studies:'Estudios',updated:'actualizado',updatedAuto:'actualizado continuamente',view:'Ver sitio',all:'Todos',sortNew:'Más recientes',sortOld:'Más antiguas',noNews:'No se encontraron noticias.',loading:'Cargando noticias...',heroTitle:'Applied AI · Data · Automatización Inteligente',heroCopy:'Portafolio técnico, inteligencia sobre el ecosistema de IA y herramientas seleccionadas para investigación, desarrollo y productividad.',github:'Ver GitHub',index:'Explorar AI Index',radar:'Abrir AI Radar',linkedin:'LinkedIn',engineering:'Cómo construyo sistemas de IA',lead:'Del dato bruto al sistema operativo, con trazabilidad, automatización y enfoque en producción.'},
en:{html:'en-GB',portfolio:'Portfolio',news:'News',search:'Search news…',projects:'Projects',studies:'Studies',updated:'updated',updatedAuto:'continuously updated',view:'View site',all:'All',sortNew:'Newest',sortOld:'Oldest',noNews:'No news found.',loading:'Loading news...',heroTitle:'Applied AI · Data · Intelligent Automation',heroCopy:'Technical portfolio, AI ecosystem intelligence, and selected tools for research, development and productivity.',github:'View GitHub',index:'Explore AI Index',radar:'Open AI Radar',linkedin:'LinkedIn',engineering:'How I Build AI Systems',lead:'From raw data to operational systems, with traceability, automation and a production mindset.'}
};
function L(){return D[localStorage.getItem('ayorai_lang')||'pt']||D.pt}
function t(k){return L()[k]||k}
function css(){if(document.getElementById('ayorai-lang-css'))return;const s=document.createElement('style');s.id='ayorai-lang-css';s.textContent='.language-switcher{display:flex;align-items:center;gap:2px;margin-left:10px;padding:3px;border:1px solid rgba(120,170,210,.25);background:rgba(8,21,34,.72);border-radius:9px}.language-switcher button{border:0;background:transparent;cursor:pointer;font-size:17px;line-height:1;padding:4px 5px;border-radius:6px;opacity:.55;transition:.18s}.language-switcher button:hover,.language-switcher button.active{opacity:1;background:rgba(0,212,255,.12)}@media(max-width:720px){.language-switcher button{font-size:15px;padding:3px}}';document.head.appendChild(s)}
function add(){if(document.querySelector('.language-switcher'))return;const host=document.querySelector('.topbar-right')||document.querySelector('.nav')||document.querySelector('.radar-topbar');if(!host)return;const box=document.createElement('div');box.className='language-switcher';box.setAttribute('aria-label','Language');[['pt','🇧🇷','Português'],['es','🇪🇸','Español'],['en','🇬🇧','English']].forEach(x=>{const b=document.createElement('button');b.type='button';b.dataset.lang=x[0];b.title=x[2];b.textContent=x[1];b.onclick=()=>{localStorage.setItem('ayorai_lang',x[0]);location.reload()};box.appendChild(b)});host.appendChild(box);mark()}
function mark(){document.querySelectorAll('.language-switcher button').forEach(b=>b.classList.toggle('active',b.dataset.lang===localStorage.getItem('ayorai_lang')||(!localStorage.getItem('ayorai_lang')&&b.dataset.lang==='pt')))}
function text(s,k){const e=document.querySelector(s);if(e)e.textContent=t(k)}
function apply(){
  css();add();document.documentElement.lang=L().html;
  if(document.querySelector('.topbar')){
    text('.topbar-nav .tlink:nth-child(1)','portfolio');
    text('.topbar-nav .tlink:nth-child(4)','news');
    const q=document.getElementById('searchInput');if(q)q.placeholder=t('search');
    text('.sidebar-tabs .stab:nth-child(1)','projects');text('.sidebar-tabs .stab:nth-child(2)','studies');
    text('.portfolio-hero h1','heroTitle');text('.portfolio-hero p','heroCopy');
    const heroBtns=document.querySelectorAll('.portfolio-hero .hero-btn');
    if(heroBtns[0])heroBtns[0].textContent=t('github');if(heroBtns[1])heroBtns[1].textContent=t('index');if(heroBtns[2])heroBtns[2].textContent=t('radar');if(heroBtns[3])heroBtns[3].textContent=t('linkedin');
    text('.engineering-section h2','engineering');text('.engineering-section .v2-lead','lead');
    const sort=document.getElementById('sortSelect');if(sort){sort.options[0].text=t('sortNew');sort.options[1].text=t('sortOld')}
  }
  mark();
}
window.AyoraiI18n={t,setLang:(x)=>{localStorage.setItem('ayorai_lang',x);location.reload()},lang:()=>localStorage.getItem('ayorai_lang')||'pt'};
document.addEventListener('DOMContentLoaded',apply);window.addEventListener('load',apply);
})();
