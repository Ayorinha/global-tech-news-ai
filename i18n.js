(function(){
  'use strict';
  const dict={
    pt:{name:'Português',html:'pt-BR',labels:{portfolio:'Portfólio','✦ AI Index':'✦ AI Index','⚡ AI Radar':'⚡ AI Radar',news:'Notícias',search:'Buscar notícias…',updated:'atualizado',projects:'Projetos',studies:'Estudos',viewSite:'Ver site',all:'Todos',bestWeek:'MELHORES DA SEMANA',weekSub:'Notícias de tecnologia com destaque nos últimos dias',recent:'NOTÍCIAS RECENTES',recentSub:'As melhores notícias de tecnologia das últimas 24 horas, resumidas e ordenadas.',engineering:'Como construo sistemas de IA',lead:'Do dado bruto ao sistema operacionalizável, com rastreabilidade, automação e foco em produção.',radar:'O que importa em IA',radarCopy:'Monitoramento contínuo do ecossistema global de tecnologia, com notícias coletadas automaticamente e organizadas para descoberta rápida.',weekTop:'TOP SEMANA',accesses:'acessos',minutes:'minutos atrás',hour:'hora',hours:'horas',day:'dia',days:'dias',noWeek:'Sem destaques esta semana.',noNews:'Nenhuma notícia encontrada.',loadingNews:'Carregando notícias...',updatedAuto:'atualizado continuamente',pipeline:'pipeline automatizado',sources:'Sources',data:'DATA',pipe:'PIPELINE',aiMl:'AI / ML',rag:'RAG / AGENTS',automation:'AUTOMATION',privacy:'Privacy by Design',repro:'Reproducibility',explain:'Explainability',prod:'Production Mindset'}},
    es:{name:'Español',html:'es-ES',labels:{portfolio:'Portafolio','✦ AI Index':'✦ AI Index','⚡ AI Radar':'⚡ AI Radar',news:'Noticias',search:'Buscar noticias…',updated:'actualizado',projects:'Proyectos',studies:'Estudios',viewSite:'Ver sitio',all:'Todos',bestWeek:'MEJORES DE LA SEMANA',weekSub:'Noticias de tecnología destacadas de los últimos días',recent:'NOTICIAS RECIENTES',recentSub:'Las mejores noticias de tecnología de las últimas 24 horas, resumidas y ordenadas.',engineering:'Cómo construyo sistemas de IA',lead:'Del dato bruto al sistema operativo, con trazabilidad, automatización y enfoque en producción.',radar:'Lo que importa en IA',radarCopy:'Monitoreo continuo del ecosistema tecnológico global, con noticias recopiladas automáticamente y organizadas para un descubrimiento rápido.',weekTop:'TOP SEMANA',accesses:'accesos',minutes:'minutos atrás',hour:'hora',hours:'horas',day:'día',days:'días',noWeek:'No hay destacados esta semana.',noNews:'No se encontraron noticias.',loadingNews:'Cargando noticias...',updatedAuto:'actualizado continuamente',pipeline:'pipeline automatizado',sources:'Fuentes',data:'DATOS',pipe:'PIPELINE',aiMl:'IA / ML',rag:'RAG / AGENTES',automation:'AUTOMATIZACIÓN',privacy:'Privacy by Design',repro:'Reproducibilidad',explain:'Explicabilidad',prod:'Mentalidad de Producción'}},
    en:{name:'English',html:'en-GB',labels:{portfolio:'Portfolio','✦ AI Index':'✦ AI Index','⚡ AI Radar':'⚡ AI Radar',news:'News',search:'Search news…',updated:'updated',projects:'Projects',studies:'Studies',viewSite:'View site',all:'All',bestWeek:'BEST OF THE WEEK',weekSub:'Technology news highlighted from the last few days',recent:'RECENT NEWS',recentSub:'The best technology news from the last 24 hours, summarized and sorted.',engineering:'How I Build AI Systems',lead:'From raw data to operational systems, with traceability, automation and a production mindset.',radar:'What matters in AI',radarCopy:'Continuous monitoring of the global technology ecosystem, with news collected automatically and organized for fast discovery.',weekTop:'WEEK TOP',accesses:'views',minutes:'minutes ago',hour:'hour',hours:'hours',day:'day',days:'days',noWeek:'No highlights this week.',noNews:'No news found.',loadingNews:'Loading news...',updatedAuto:'continuously updated',pipeline:'automated pipeline',sources:'Sources',data:'DATA',pipe:'PIPELINE',aiMl:'AI / ML',rag:'RAG / AGENTS',automation:'AUTOMATION',privacy:'Privacy by Design',repro:'Reproducibility',explain:'Explainability',prod:'Production Mindset'}}
  };
  function lang(){return localStorage.getItem('ayorai_lang')||'pt'}
  function t(k){return (dict[lang()]||dict.pt).labels[k]||k}
  function setLang(l){if(!dict[l])return;localStorage.setItem('ayorai_lang',l);document.documentElement.lang=dict[l].html;apply();if(window.AyoraiI18nApply)window.AyoraiI18nApply();}
  function addSwitcher(){
    if(document.querySelector('.language-switcher'))return;
    const host=document.querySelector('.topbar-right,.nav,.radar-topbar'); if(!host)return;
    const box=document.createElement('div'); box.className='language-switcher'; box.setAttribute('aria-label','Language');
    [['pt','🇧🇷','Português'],['es','🇪🇸','Español'],['en','🇬🇧','English']].forEach(x=>{const b=document.createElement('button');b.type='button';b.dataset.lang=x[0];b.title=x[2];b.textContent=x[1];b.onclick=()=>setLang(x[0]);box.appendChild(b)});
    host.appendChild(box); updateSwitcher();
  }
  function updateSwitcher(){document.querySelectorAll('.language-switcher button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang()))}
  function replaceText(el,key){if(el)el.textContent=t(key)}
  function apply(){
    updateSwitcher();
    if(document.body.classList.contains('radar-page')) return;
    const map={'.topbar-nav .tlink:nth-child(1)':'portfolio','.topbar-nav .tlink:nth-child(4)':'news','#searchInput':'search','.sidebar-tabs .stab:nth-child(1)':'projects','.sidebar-tabs .stab:nth-child(2)':'studies','.sec-title':'recent','.sec-sub':'recentSub'};
    Object.keys(map).forEach(s=>{const el=document.querySelector(s);if(el&&s==='.sec-title')el.textContent=t('recent');else if(el&&s==='.sec-sub')el.innerHTML='<strong>'+t('recentSub').split(',')[0]+'</strong>'+t('recentSub').slice(t('recentSub').split(',')[0].length);else if(el&&el.tagName==='INPUT')el.placeholder=t(map[s]);else if(el)el.textContent=t(map[s])});
    const hero=document.querySelector('.portfolio-hero h1'); if(hero)hero.textContent=t('lead').split(',')[0];
    const eng=document.querySelector('.engineering-section h2'); if(eng)eng.textContent=t('engineering');
    const engLead=document.querySelector('.engineering-section .v2-lead'); if(engLead)engLead.textContent=t('lead');
    const radarH=document.querySelector('.radar-section h2'); if(radarH)radarH.textContent=t('radar');
    const radarP=document.querySelector('.radar-copy p'); if(radarP)radarP.textContent=t('radarCopy');
    const date=document.getElementById('todayDate'); if(date&&window.state)date.textContent=new Date().toLocaleDateString(dict[lang()].html,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }
  window.AyoraiI18n={t,setLang,lang};
  document.addEventListener('DOMContentLoaded',()=>{addSwitcher();apply()});
  window.addEventListener('load',()=>{addSwitcher();apply()});
})();
