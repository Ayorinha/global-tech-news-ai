"use strict";

// ── Estado ───────────────────────────────────────────────────
const state = {
  articles:   [],
  projects:   [],
  filter:     "all",
  query:      "",
  sort:       "newest",
  activeTab:  "projetos",
  // Ranking de cliques salvo no localStorage
  clicks:     JSON.parse(localStorage.getItem("ayorai_clicks") || "{}"),
};

const LANGS = {
  en: { label: "Inglês",    flag: "🇺🇸" },
  es: { label: "Espanhol",  flag: "🇪🇸" },
  pt: { label: "Português", flag: "🇧🇷" },
  zh: { label: "Chinês",    flag: "🇨🇳" },
  hi: { label: "Índia",     flag: "🇮🇳" },
};

const EMOJIS = {
  "TechCrunch":"⚡","The Verge":"🔮","Wired":"🌐",
  "Ars Technica":"🔬","MIT Tech Review":"🧪",
  "Xataka":"🤖","Genbeta":"💡",
  "Canaltech":"📡","Tecnoblog":"💻","Olhar Digital":"👁",
  "36Kr":"🇨🇳","YourStory":"🇮🇳",
};

// ── DOM ──────────────────────────────────────────────────────
const $list     = document.getElementById("newsList");
const $week     = document.getElementById("weekGrid");
const $search   = document.getElementById("searchInput");
const $sort     = document.getElementById("sortSelect");
const $filters  = document.getElementById("filterBtns");
const $date     = document.getElementById("todayDate");
const $sidebar  = document.getElementById("sidebar");
const $layout   = document.getElementById("layout");
const $sbList   = document.getElementById("sidebarList");
const $toggle   = document.getElementById("sidebarToggle");

// ── Utils ────────────────────────────────────────────────────
const esc = s => String(s||"")
  .replace(/&/g,"&amp;").replace(/</g,"&lt;")
  .replace(/>/g,"&gt;").replace(/"/g,"&quot;");

function get(o, ...keys) {
  for (const k of keys) { const v = o[k]; if (v && String(v).trim()) return String(v).trim(); }
  return "";
}

function timeAgo(iso) {
  try {
    const d = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (d < 3600)  return `${Math.floor(d/60)} minutos atrás`;
    if (d < 86400) return `${Math.floor(d/3600)} hora${d<7200?"":"s"} atrás`;
    const days = Math.floor(d/86400);
    return `${days} dia${days>1?"s":""} atrás`;
  } catch { return ""; }
}

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

// ── Registrar clique (para ranking) ──────────────────────────
function registerClick(link) {
  if (!link) return;
  state.clicks[link] = (state.clicks[link] || 0) + 1;
  localStorage.setItem("ayorai_clicks", JSON.stringify(state.clicks));
}

// ── Filtrar notícias ─────────────────────────────────────────
function getFiltered() {
  const q = state.query.toLowerCase();
  let list = state.articles.filter(a => {
    if (state.filter !== "all" && (a.language||"en") !== state.filter) return false;
    if (!q) return true;
    return [get(a,"title_pt","title_original","title"),
            get(a,"description_pt","description_original"),
            get(a,"source")].join(" ").toLowerCase().includes(q);
  });
  list.sort((a, b) => {
    const da = new Date(a.published||0).getTime();
    const db = new Date(b.published||0).getTime();
    return state.sort === "newest" ? db - da : da - db;
  });
  return list;
}

// ── Top da semana: por cliques + recência ────────────────────
function getWeekTop(all) {
  const cutoff = Date.now() - 7 * 86400000;
  return all
    .filter(a => new Date(a.published||0).getTime() > cutoff)
    .sort((a, b) => {
      const ca = state.clicks[a.link] || 0;
      const cb = state.clicks[b.link] || 0;
      // Mescla cliques + recência (cliques têm peso maior)
      if (cb !== ca) return cb - ca;
      return new Date(b.published||0) - new Date(a.published||0);
    })
    .slice(0, 6);
}

// ── RENDER: card da semana ────────────────────────────────────
function weekCard(a, idx) {
  const title  = esc(get(a,"title_pt","title_original","title"));
  const link   = esc(get(a,"link","url"));
  const image  = get(a,"image","image_url","img","thumbnail");
  const source = get(a,"source");
  const emoji  = EMOJIS[source] || "📰";
  const views  = state.clicks[a.link] || 0;
  const time   = timeAgo(a.published);
  const delay  = idx * 60;

  const imgHtml = image
    ? `<div class="week-img"><img src="${esc(image)}" alt="${title}" loading="lazy"
         onerror="this.parentElement.innerHTML='<div class=\\"week-img-ph\\">${emoji}</div>'"></div>`
    : `<div class="week-img"><div class="week-img-ph">${emoji}</div></div>`;

  return `
<a class="week-card" href="${link}" target="_blank" rel="noopener"
   style="animation-delay:${delay}ms" onclick="registerClick('${link.replace(/'/g,"\\'")}')">
  ${imgHtml}
  <div class="week-body">
    <div class="week-rank">#${idx+1} TOP SEMANA</div>
    <div class="week-title">${title}</div>
    <div class="week-meta">
      <span>${time}</span>
      ${views > 0 ? `<span class="week-views">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        ${views} acessos
      </span>` : ""}
    </div>
  </div>
</a>`;
}

// ── RENDER: item da lista ─────────────────────────────────────
function newsItem(a, idx) {
  const title  = esc(get(a,"title_pt","title_original","title"));
  const desc   = esc(get(a,"description_pt","description_original","description"));
  const link   = esc(get(a,"link","url"));
  const source = get(a,"source");
  const image  = get(a,"image","image_url","img","thumbnail");
  const time   = timeAgo(a.published);
  const delay  = Math.min(idx * 35, 700);

  const imgHtml = image
    ? `<div class="news-thumb">
         <img src="${esc(image)}" alt="${title}" loading="lazy"
              onerror="this.parentElement.remove()">
       </div>`
    : "";

  return `
<a class="news-item${image?" has-img":""}" href="${link}"
   target="_blank" rel="noopener"
   style="animation-delay:${delay}ms"
   onclick="registerClick('${link.replace(/'/g,"\\'")}')">
  ${imgHtml}
  <div class="news-body">
    <span class="news-badge">${esc(source)}</span>
    <h2 class="news-item-title">${title}</h2>
    ${desc ? `<p class="news-desc">${desc}</p>` : ""}
    <div class="news-foot">
      <span class="news-tag">#${esc(source.toLowerCase().replace(/\s+/g,""))}</span>
      <span class="news-time">${time}</span>
    </div>
  </div>
</a>`;
}

// ── RENDER: notícias ──────────────────────────────────────────
function renderNews() {
  const filtered = getFiltered();
  const top      = getWeekTop(filtered);

  $week.innerHTML = top.length
    ? top.map(weekCard).join("")
    : `<p class="empty">Nenhuma notícia desta semana.</p>`;

  $list.innerHTML = filtered.length
    ? filtered.map(newsItem).join("")
    : `<div class="empty">Nenhuma notícia encontrada.</div>`;
}

// ── RENDER: portfólio ─────────────────────────────────────────
function renderPortfolio() {
  const tab   = state.activeTab;
  const items = state.projects.filter(p =>
    tab === "projetos" ? p.category === "projeto" : p.category === "estudo"
  );

  if (!items.length) {
    $sbList.innerHTML = `
      <div class="add-hint">
        Nenhum ${tab === "projetos" ? "projeto" : "estudo"} ainda.<br>
        Adicione no arquivo <a href="https://github.com/Ayorinha/global-tech-news-ai/edit/main/data/projects.json"
        target="_blank">data/projects.json</a>
      </div>`;
    return;
  }

  const statusLabel = { "ativo":"ativo", "em andamento":"andamento", "pausado":"pausado" };

  $sbList.innerHTML = items.map(p => {
    const st = statusLabel[p.status] || "andamento";
    const links = [
      p.link ? `<a class="proj-link" href="${esc(p.link)}" target="_blank" rel="noopener">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Ver site
      </a>` : "",
      p.repo ? `<a class="proj-link" href="${esc(p.repo)}" target="_blank" rel="noopener">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub
      </a>` : "",
    ].filter(Boolean).join("");

    return `
<div class="proj-card">
  <div class="proj-card-top">
    <div class="proj-title">${esc(p.title)}</div>
    <span class="proj-status ${st}">${esc(p.status)}</span>
  </div>
  <p class="proj-desc">${esc(p.description)}</p>
  ${p.tags?.length ? `<div class="proj-tags">${p.tags.map(t=>`<span class="proj-tag">${esc(t)}</span>`).join("")}</div>` : ""}
  ${links ? `<div class="proj-links">${links}</div>` : ""}
</div>`;
  }).join("") + `
<div class="add-hint">
  Para adicionar projetos, edite o arquivo
  <a href="https://github.com/Ayorinha/global-tech-news-ai/edit/main/data/projects.json"
     target="_blank">data/projects.json</a>
</div>`;
}

// ── Filtros de idioma ─────────────────────────────────────────
function buildFilters() {
  const counts = {};
  state.articles.forEach(a => { const l = a.language||"en"; counts[l]=(counts[l]||0)+1; });
  $filters.innerHTML = "";

  const all = document.createElement("button");
  all.className = "filter-btn active"; all.dataset.lang = "all";
  all.innerHTML = `🌐 Todos <span class="cnt">(${state.articles.length})</span>`;
  $filters.appendChild(all);

  Object.entries(LANGS).forEach(([code, info]) => {
    const c = counts[code]||0; if (!c) return;
    const btn = document.createElement("button");
    btn.className = "filter-btn"; btn.dataset.lang = code;
    btn.innerHTML = `${info.flag} ${info.label} <span class="cnt">(${c})</span>`;
    $filters.appendChild(btn);
  });
}

function setFilter(lang) {
  state.filter = lang;
  $filters.querySelectorAll(".filter-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.lang === lang));
  renderNews();
}

// ── Carregar notícias ─────────────────────────────────────────
async function loadNews() {
  $list.innerHTML = `<div class="loader"><div class="spinner"></div><p>Carregando notícias...</p></div>`;
  $week.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;

  try {
    const ts  = Math.floor(Date.now() / 60000);
    const res = await fetch(`data/news.json?v=${ts}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.articles = await res.json();

    if ($date) $date.textContent = new Date().toLocaleDateString("pt-BR", {
      weekday:"long", day:"numeric", month:"long", year:"numeric"
    });

    buildFilters();
    renderNews();
  } catch (err) {
    $list.innerHTML = `<div class="empty">Erro: ${esc(err.message)}</div>`;
    $week.innerHTML = "";
  }
}

// ── Carregar portfólio ────────────────────────────────────────
async function loadProjects() {
  try {
    const res = await fetch(`data/projects.json?v=${Date.now()}`);
    if (!res.ok) throw new Error();
    state.projects = await res.json();
  } catch {
    state.projects = [];
  }
  renderPortfolio();
}

// ── Eventos ───────────────────────────────────────────────────
$search.addEventListener("input", debounce(e => { state.query = e.target.value; renderNews(); }, 300));
$sort.addEventListener("change", e => { state.sort = e.target.value; renderNews(); });
$filters.addEventListener("click", e => { const b = e.target.closest(".filter-btn"); if(b) setFilter(b.dataset.lang); });

// Sidebar toggle
$toggle.addEventListener("click", () => $layout.classList.toggle("sidebar-closed"));

// Tabs do portfólio
document.querySelectorAll(".stab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".stab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.activeTab = btn.dataset.tab;
    renderPortfolio();
  });
});

// Expor registerClick globalmente (usado nos onclick dos cards)
window.registerClick = registerClick;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadNews();
  loadProjects();
});
