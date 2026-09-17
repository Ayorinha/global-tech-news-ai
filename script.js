"use strict";

const state = {
  articles: [], projects: [],
  filter: "all", query: "", sort: "newest", activeTab: "projetos",
  clicks: JSON.parse(localStorage.getItem("ayorai_clicks") || "{}")
};

// Homepage news filters intentionally match the site's three supported languages.
const LANGS = {
  pt: {label: "Português", flag: "🇧🇷"},
  es: {label: "Espanhol", flag: "🇪🇸"},
  en: {label: "Inglês", flag: "🇬🇧"}
};

const EMOJIS = {
  "TechCrunch":"⚡", "The Verge":"🔮", "Wired":"🌐",
  "Ars Technica":"🔬", "MIT Tech Review":"🧪",
  "Xataka":"🤖", "Genbeta":"💡",
  "Canaltech":"📡", "Tecnoblog":"💻", "Olhar Digital":"👁",
  "36Kr":"🇨🇳", "YourStory":"🇮🇳"
};

const $list = document.getElementById("newsList");
const $search = document.getElementById("searchInput");
const $sort = document.getElementById("sortSelect");
const $filters = document.getElementById("filterBtns");
const $date = document.getElementById("todayDate");
const $layout = document.getElementById("layout");
const $sbList = document.getElementById("sidebarList");
const $toggle = document.getElementById("sidebarToggle");

// Keep the presentation layer stable across desktop, tablet and mobile.
function installHomeFixes() {
  if (document.getElementById("ayorai-home-fixes")) return;
  const style = document.createElement("style");
  style.id = "ayorai-home-fixes";
  style.textContent = `
    .main-content{width:100%;max-width:none;min-width:0}
    .portfolio-hero{width:100%}
    .hero-content{max-width:980px}
    .engineering-section{width:100%}
    .news-section{width:100%}
    .filter-bar{width:100%}
    .topbar-right{min-width:0}
    .search-box{max-width:220px}
    @media(max-width:1100px){.topbar{gap:.75rem}.topbar-nav{gap:.8rem}.search-box{max-width:180px}.search-box #searchInput{width:130px}}
    @media(max-width:820px){.topbar{padding:0 .75rem}.topbar-nav{display:none}.topbar-right{gap:.35rem}.search-box{max-width:150px}.search-box #searchInput{width:95px}.portfolio-hero{margin-bottom:1.5rem}.engineering-section{margin-bottom:1.75rem}}
    @media(max-width:560px){.search-box{max-width:42px;padding:.38rem .55rem}.search-box #searchInput{display:none}.portfolio-hero h1{font-size:2.05rem;line-height:1}.hero-actions{gap:.45rem}.hero-btn{font-size:.7rem;padding:.5rem .72rem}.hero-meta span{font-size:.58rem}.main-content{padding:1rem .9rem 2.5rem}}
  `;
  document.head.appendChild(style);
}

function esc(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function get(o) {
  const keys = Array.prototype.slice.call(arguments, 1);
  for (let i = 0; i < keys.length; i++) {
    const v = o[keys[i]];
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

function proxyImg(url) {
  return "https://images.weserv.nl/?url=" + encodeURIComponent(url) + "&w=480&output=webp&maxage=7d";
}

function makeImg(url, alt, emoji, ph) {
  if (!url) return '<div class="' + ph + '">' + emoji + '</div>';
  const p = proxyImg(url);
  return '<img src="' + esc(url) + '" alt="' + esc(alt) + '" loading="lazy" ' +
    'onerror="if(!this._p){this._p=1;this.src=\'' + p.replace(/\\/g,'\\\\').replace(/'/g,"\\'") + '\'}">';
}

function timeAgo(iso) {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (seconds < 3600) return Math.floor(seconds / 60) + " minutos atrás";
  if (seconds < 86400) return Math.floor(seconds / 3600) + (seconds < 7200 ? " hora" : " horas") + " atrás";
  const days = Math.floor(seconds / 86400);
  return days + (days > 1 ? " dias" : " dia") + " atrás";
}

function debounce(fn, ms) {
  let t;
  return function() {
    const args = arguments;
    clearTimeout(t);
    t = setTimeout(function(){ fn.apply(null, args); }, ms);
  };
}

function registerClick(link) {
  if (!link) return;
  state.clicks[link] = (state.clicks[link] || 0) + 1;
  localStorage.setItem("ayorai_clicks", JSON.stringify(state.clicks));
}
window.registerClick = registerClick;

function getFiltered() {
  const q = state.query.toLowerCase();
  const list = state.articles.filter(function(a) {
    if (state.filter !== "all" && (a.language || "en") !== state.filter) return false;
    if (!q) return true;
    const text = [
      get(a, "title_pt", "title_original", "title"),
      get(a, "description_pt", "description_original", "description"),
      get(a, "source")
    ].join(" ").toLowerCase();
    return text.indexOf(q) >= 0;
  });
  list.sort(function(a,b) {
    const da = new Date(a.published || 0).getTime();
    const db = new Date(b.published || 0).getTime();
    return state.sort === "newest" ? db - da : da - db;
  });
  return list;
}

function newsItem(a, idx) {
  const title = esc(get(a, "title_pt", "title_original", "title"));
  const desc = esc(get(a, "description_pt", "description_original", "description"));
  const link = esc(get(a, "link", "url"));
  const source = get(a, "source");
  const image = get(a, "image", "image_url", "img", "thumbnail");
  const time = timeAgo(a.published);
  const delay = Math.min(idx * 35, 700);
  const emoji = EMOJIS[source] || "📰";
  const lnk = link.replace(/'/g,"\\'");

  const thumb = image
    ? '<div class="news-thumb">' + makeImg(image, title, emoji, "news-thumb-ph") + '</div>'
    : "";

  return '<a class="news-item' + (image ? " has-img" : "") + '" href="' + link + '" target="_blank" rel="noopener" ' +
    'style="animation-delay:' + delay + 'ms" onclick="registerClick(\'' + lnk + '\')">' +
    thumb +
    '<div class="news-body">' +
    '<span class="news-badge">' + esc(source) + '</span>' +
    '<h2 class="news-item-title">' + title + '</h2>' +
    (desc ? '<p class="news-desc">' + desc + '</p>' : "") +
    '<div class="news-foot">' +
    '<span class="news-tag">#' + esc(source.toLowerCase().replace(/\s+/g,"")) + '</span>' +
    '<span class="news-time">' + time + '</span>' +
    '</div></div></a>';
}

function renderNews() {
  if (!$list) return;
  const filtered = getFiltered();
  $list.innerHTML = filtered.length
    ? filtered.map(newsItem).join("")
    : '<div class="empty">Nenhuma notícia encontrada.</div>';
}

function buildFilters() {
  if (!$filters) return;
  const counts = {};
  state.articles.forEach(function(a) {
    const lang = LANGS[a.language] ? a.language : "en";
    counts[lang] = (counts[lang] || 0) + 1;
  });
  $filters.innerHTML = "";

  const all = document.createElement("button");
  all.className = "filter-btn active";
  all.dataset.lang = "all";
  all.innerHTML = '🌐 Todos <span class="cnt">(' + state.articles.length + ')</span>';
  $filters.appendChild(all);

  Object.keys(LANGS).forEach(function(code) {
    const info = LANGS[code];
    const count = counts[code] || 0;
    if (!count) return;
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.lang = code;
    btn.innerHTML = info.flag + " " + info.label + ' <span class="cnt">(' + count + ')</span>';
    $filters.appendChild(btn);
  });
}

function setFilter(lang) {
  state.filter = lang;
  if ($filters) $filters.querySelectorAll(".filter-btn").forEach(function(b) {
    b.classList.toggle("active", b.dataset.lang === lang);
  });
  renderNews();
}

function renderPortfolio() {
  if (!$sbList) return;
  const items = state.projects.filter(function(p) {
    return state.activeTab === "projetos" ? p.category === "projeto" : p.category === "estudo";
  });

  if (!items.length) {
    $sbList.innerHTML = '<div class="add-hint">Nenhum item ainda.<br>' +
      'Edite <a href="https://github.com/Ayorinha/global-tech-news-ai/edit/main/data/projects.json" target="_blank">data/projects.json</a></div>';
    return;
  }

  const stMap = {"ativo":"ativo", "em andamento":"andamento", "pausado":"pausado"};
  const html = items.map(function(p) {
    const st = stMap[p.status] || "andamento";
    let links = "";
    if (p.link) links += '<a class="proj-link" href="' + esc(p.link) + '" target="_blank" rel="noopener">Ver site</a>';
    if (p.repo) links += '<a class="proj-link" href="' + esc(p.repo) + '" target="_blank" rel="noopener">GitHub</a>';

    let meta = "";
    if (p.created_at) meta += '<span class="proj-tag">📅 ' + esc(p.created_at) + '</span>';
    if (p.version) meta += '<span class="proj-tag">v' + esc(p.version) + '</span>';

    return '<div class="proj-card">' +
      '<div class="proj-card-top"><div class="proj-title">' + esc(p.title) + '</div>' +
      '<span class="proj-status ' + st + '">' + esc(p.status) + '</span></div>' +
      '<p class="proj-desc">' + esc(p.description) + '</p>' +
      (meta ? '<div class="proj-tags" style="margin-bottom:.4rem">' + meta + '</div>' : "") +
      (p.tags && p.tags.length ? '<div class="proj-tags">' + p.tags.map(function(t){return '<span class="proj-tag">' + esc(t) + '</span>';}).join("") + '</div>' : "") +
      (links ? '<div class="proj-links">' + links + '</div>' : "") +
      '</div>';
  }).join("");

  $sbList.innerHTML = html + '<div class="add-hint">Adicione projetos em ' +
    '<a href="https://github.com/Ayorinha/global-tech-news-ai/edit/main/data/projects.json" target="_blank">data/projects.json</a></div>';
}

async function loadNews() {
  if (!$list) return;
  $list.innerHTML = '<div class="loader"><div class="spinner"></div><p>Carregando notícias...</p></div>';
  try {
    const ts = Math.floor(Date.now() / 60000);
    const res = await fetch("data/news.json?v=" + ts, {cache:"no-store"});
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Formato inválido de news.json");
    state.articles = data;
    if ($date) $date.textContent = new Date().toLocaleDateString("pt-BR", {
      weekday:"long", day:"numeric", month:"long", year:"numeric"
    });
    buildFilters();
    renderNews();
  } catch (err) {
    console.error("Erro news:", err);
    $list.innerHTML = '<div class="empty">Erro ao carregar notícias: ' + esc(err.message) + '</div>';
  }
}

async function loadProjects() {
  if (!$sbList) return;
  try {
    const res = await fetch("data/projects.json?v=" + Date.now(), {cache:"no-store"});
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    state.projects = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Erro projects:", e);
    state.projects = [];
  }
  renderPortfolio();
}

if ($search) $search.addEventListener("input", debounce(function(e) {
  state.query = e.target.value;
  renderNews();
}, 300));

if ($sort) $sort.addEventListener("change", function(e) {
  state.sort = e.target.value;
  renderNews();
});

if ($filters) $filters.addEventListener("click", function(e) {
  const b = e.target.closest(".filter-btn");
  if (b) setFilter(b.dataset.lang);
});

if ($toggle && $layout) $toggle.addEventListener("click", function() {
  $layout.classList.toggle("sidebar-closed");
});

document.querySelectorAll(".stab").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".stab").forEach(function(b){ b.classList.remove("active"); });
    btn.classList.add("active");
    state.activeTab = btn.dataset.tab;
    renderPortfolio();
  });
});

document.addEventListener("DOMContentLoaded", function() {
  installHomeFixes();
  if (window.innerWidth <= 768 && $layout) $layout.classList.add("sidebar-closed");
  loadNews();
  loadProjects();
});
