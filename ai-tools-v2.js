(() => {
  'use strict';
  const state = { tools: [], category: null, query: '' };
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  // Chave única por ferramenta: nome sem acentos/pontuação/sufixos ("Cursor AI" = "Cursor")
  const nameKey = (n) => String(n).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]/g, '').replace(/(ai|app|dev|io)$/, '');
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (_) { return ''; } };

  const normalize = (t) => {
    if (!t || !t.name || !t.category) return null;
    return {
      name: String(t.name), category: String(t.category),
      description: String(t.description || 'Ferramenta de inteligência artificial.'),
      url: String(t.url || '#'), domain: String(t.domain || host(t.url)),
      tags: Array.isArray(t.tags) ? t.tags.map(String) : [],
      score: Number(t.curation_score || 0),
      rank: Number(t.world_rank || 0)
    };
  };

  // Remove repetidos por nome e por endereço; mantém a versão mais bem ranqueada
  const dedupe = (list) => {
    const byName = new Map();
    const byUrl = new Map();
    for (const t of list.map(normalize).filter(Boolean)) {
      const k = nameKey(t.name);
      const u = t.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();
      const prev = byName.get(k) || byUrl.get(u);
      if (prev && order(prev, t) <= 0) continue;
      if (prev) { byName.delete(nameKey(prev.name)); byUrl.delete(prev.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase()); }
      byName.set(k, t); byUrl.set(u, t);
    }
    return [...byName.values()];
  };

  // Mais usadas no mundo primeiro, depois maior nota de curadoria
  const order = (a, b) => ((a.rank || 9999) - (b.rank || 9999)) || (b.score - a.score) || a.name.localeCompare(b.name);

  function render() {
    const counts = {};
    state.tools.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);
    const cats = Object.entries(counts).sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    $('#categories').innerHTML = cats.map(([name,count]) => `<button class="cat ${state.category===name?'selected':''}" data-category="${esc(name)}"><strong>${esc(name)}</strong><small>${count} ferramentas</small></button>`).join('');
    document.querySelectorAll('.cat').forEach(b => b.onclick = () => { state.category = state.category === b.dataset.category ? null : b.dataset.category; render(); });

    const q = state.query.trim().toLowerCase();
    const filtered = state.tools
      .filter(t => (!state.category || t.category === state.category) && (!q || [t.name,t.category,t.description,...t.tags].join(' ').toLowerCase().includes(q)))
      .sort(order);

    $('#resultsTitle').textContent = state.category ? `${state.category} · ${filtered.length}` : (q ? `Resultados · ${filtered.length}` : 'As mais usadas do mundo');
    $('#tools').innerHTML = filtered.map(t => {
      const badge = t.rank ? ` · <span class="top-badge">#${t.rank} no mundo</span>` : (t.score >= 70 ? ' · ★ recomendada' : '');
      return `<article class="tool"><div class="tool-top"><div class="icon"><img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(t.domain)}&sz=64" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><b style="display:none">${esc(t.name.slice(0,2).toUpperCase())}</b></div><div><h3>${esc(t.name)}</h3><div class="cat-name">${esc(t.category)}${badge}</div></div></div><p>${esc(t.description)}</p><div class="tags">${t.tags.map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="tool-meta">${t.score ? `<span>Curadoria AyorAI · ${t.score}/100</span>` : '<span>Curadoria editorial</span>'}</div><a class="open" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer"><span>Site oficial</span><span>↗</span></a></article>`;
    }).join('') || `<div class="note"><strong>Nenhuma ferramenta encontrada.</strong><p>Tente outro termo ou limpe os filtros.</p></div>`;
    $('#toolCount').textContent = `${state.tools.length} ferramentas`;
    $('#catCount').textContent = `${cats.length} categorias`;
  }

  const getJSON = (url) => fetch(url, {cache:'no-store'}).then(r => { if (!r.ok) throw new Error(url); return r.json(); });

  async function load() {
    // O ranking gerado já contém o catálogo completo e sem repetições.
    // O catálogo editorial só é usado se o ranking não carregar.
    try {
      state.tools = dedupe(await getJSON('data/ai-tools-ranked-2026.json?v=20261019'));
    } catch (_) {
      try { state.tools = dedupe(await getJSON('data/ai-tools.json?v=20261019')); }
      catch (__) {
        $('#categories').innerHTML = '<div class="note"><strong>Não foi possível carregar o catálogo.</strong><p>Tente recarregar a página em alguns segundos.</p></div>';
        $('#tools').innerHTML = '';
        return;
      }
    }
    render();
  }

  function init() {
    $('#search').addEventListener('input', e => { state.query = e.target.value; render(); });
    $('#clear').onclick = () => { state.category=null; state.query=''; $('#search').value=''; render(); };
    document.addEventListener('keydown', e => { if(e.key==='/' && document.activeElement !== $('#search')) { e.preventDefault(); $('#search').focus(); } });
    load();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
