const state={tools:[],category:null,query:''};
const $=s=>document.querySelector(s);
const favicon=t=>`https://www.google.com/s2/favicons?domain=${encodeURIComponent(t.domain)}&sz=64`;
function initials(name){return name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function renderCategories(){const counts={};state.tools.forEach(t=>counts[t.category]=(counts[t.category]||0)+1);const cats=Object.entries(counts).sort((a,b)=>b[1]-a[1]);$('#categories').innerHTML=cats.map(([name,count])=>`<button class="cat ${state.category===name?'selected':''}" data-category="${name.replaceAll('"','&quot;')}"><strong>${name}</strong><small>${count} ferramentas</small></button>`).join('');document.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{state.category=state.category===b.dataset.category?null:b.dataset.category;render()})}
function renderTools(){const q=state.query.trim().toLowerCase();const filtered=state.tools.filter(t=>(!state.category||t.category===state.category)&&(!q||[t.name,t.category,t.description,...t.tags].join(' ').toLowerCase().includes(q)));$('#resultsTitle').textContent=state.category?`${state.category} · ${filtered.length}`:(q?`Resultados · ${filtered.length}`:'Ferramentas em destaque');$('#tools').innerHTML=filtered.map(t=>`<article class="tool"><div class="tool-top"><div class="icon"><img src="${favicon(t)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><b style="display:none">${initials(t.name)}</b></div><div><h3>${t.name}</h3><div class="cat-name">${t.category}</div></div></div><p>${t.description}</p><div class="tags">${t.tags.map(x=>`<span>${x}</span>`).join('')}</div><a class="open" href="${t.url}" target="_blank" rel="noopener noreferrer"><span>Site oficial</span><span>↗</span></a></article>`).join('')||`<div class="note"><strong>Nenhuma ferramenta encontrada.</strong><p>Tente outro termo ou limpe os filtros.</p></div>`}
function render(){renderCategories();renderTools();$('#toolCount').textContent=`${state.tools.length} ferramentas`;$('#catCount').textContent=`${new Set(state.tools.map(t=>t.category)).size} categorias`}
Promise.all([
  fetch('data/ai-tools.json?v=20260917',{cache:'no-store'}),
  fetch('data/ai-tools-ranked-2026.json?v=20260917',{cache:'no-store'})
]).then(async responses=>{
  responses.forEach(r=>{if(!r.ok)throw new Error('Falha ao carregar catálogo')});
  const [base,ranked]=await Promise.all(responses.map(r=>r.json()));
  const combined=[...base,...ranked];
  const seen=new Set();
  state.tools=combined.filter(t=>{const key=`${t.category}|${t.name}`.toLowerCase();if(seen.has(key))return false;seen.add(key);return true});
  render();
}).catch(()=>{$('#tools').innerHTML='<div class="note"><strong>Não foi possível carregar o catálogo.</strong><p>Verifique os arquivos data/ai-tools.json e data/ai-tools-ranked-2026.json.</p></div>'});
$('#search').addEventListener('input',e=>{state.query=e.target.value;renderTools()});$('#clear').onclick=()=>{state.category=null;state.query='';$('#search').value='';render()};document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==$('#search')){e.preventDefault();$('#search').focus()}});
