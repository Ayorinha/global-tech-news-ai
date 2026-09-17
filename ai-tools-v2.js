(() => {
  'use strict';
  const state = { tools: [], category: null, query: '' };
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>\"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const normalize = (t) => {
    if (!t || !t.name || !t.category) return null;
    return {
      name: String(t.name), category: String(t.category),
      description: String(t.description || 'Ferramenta de inteligência artificial.'),
      url: String(t.url || '#'), domain: String(t.domain || ''),
      tags: Array.isArray(t.tags) ? t.tags.map(String) : []
    };
  };
  const merge = (a, b) => {
    const seen = new Set();
    return [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]
      .map(normalize).filter(Boolean).filter(t => {
        const k = `${t.category}|${t.name}`.toLowerCase();
        if (seen.has(k)) return false; seen.add(k); return true;
      });
  };
  function render() {
    const counts = {};
    state.tools.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);
    const cats = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    $('#categories').innerHTML = cats.map(([name,count]) => `<button class="cat ${state.category===name?'selected':''}" data-category="${esc(name)}"><strong>${esc(name)}</strong><small>${count} ferramentas</small></button>`).join('');
    document.querySelectorAll('.cat').forEach(b => b.onclick = () => { state.category = state.category === b.dataset.category ? null : b.dataset.category; render(); });
    const q = state.query.trim().toLowerCase();
    const filtered = state.tools.filter(t => (!state.category || t.category === state.category) && (!q || [t.name,t.category,t.description,...t.tags].join(' ').toLowerCase().includes(q)));
    $('#resultsTitle').textContent = state.category ? `${state.category} · ${filtered.length}` : (q ? `Resultados · ${filtered.length}` : 'Ferramentas em destaque');
    $('#tools').innerHTML = filtered.map(t => `<article class="tool"><div class="tool-top"><div class="icon"><img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(t.domain)}&sz=64" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><b style="display:none">${esc(t.name.slice(0,2).toUpperCase())}</b></div><div><h3>${esc(t.name)}</h3><div class="cat-name">${esc(t.category)}</div></div></div><p>${esc(t.description)}</p><div class="tags">${t.tags.map(x=>`<span>${esc(x)}</span>`).join('')}</div><a class="open" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer"><span>Site oficial</span><span>↗</span></a></article>`).join('') || `<div class="note"><strong>Nenhuma ferramenta encontrada.</strong><p>Tente outro termo ou limpe os filtros.</p></div>`;
    $('#toolCount').textContent = `${state.tools.length} ferramentas`;
    $('#catCount').textContent = `${cats.length} categorias`;
  }
  async function load() {
    try {
      const base = await fetch('data/ai-tools.json?v=20260917-2', {cache:'no-store'}).then(r => { if(!r.ok) throw new Error(); return r.json(); });
      state.tools = merge(base, []); render();
      try {
        const extra = await fetch('data/ai-tools-ranked-2026.json?v=20260917-2', {cache:'no-store'}).then(r => r.ok ? r.json() : []);
        state.tools = merge(state.tools, extra); render();
      } catch (_) { /* catálogo principal permanece funcional */ }
    } catch (_) {
      $('#categories').innerHTML = '<div class="note"><strong>Não foi possível carregar o catálogo principal.</strong><p>Tente recarregar a página em alguns segundos.</p></div>';
      $('#tools').innerHTML = '<div class="note"><strong>Catálogo temporariamente indisponível.</strong><p>Os arquivos de dados não puderam ser carregados.</p></div>';
    }
  }
  function init() {
    $('#search').addEventListener('input', e => { state.query = e.target.value; render(); });
    $('#clear').onclick = () => { state.category=null; state.query=''; $('#search').value=''; render(); };
    document.addEventListener('keydown', e => { if(e.key==='/' && document.activeElement !== $('#search')) { e.preventDefault(); $('#search').focus(); } });
    load();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
