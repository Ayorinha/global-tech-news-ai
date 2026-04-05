/**
 * script.js — Global Tech News AI
 * Lê data/news.json, renderiza cards e gerencia filtros/busca.
 */

"use strict";

// ── Estado global ────────────────────────────────────────────
const state = {
  articles: [],
  activeFilter: "all",
  searchQuery: "",
  sortOrder: "newest",
};

// ── Mapeamento de idiomas ────────────────────────────────────
const LANG_MAP = {
  en:  { label: "Inglês",    flag: "🇺🇸" },
  es:  { label: "Espanhol",  flag: "🇪🇸" },
  pt:  { label: "Português", flag: "🇧🇷" },
  zh:  { label: "Chinês",    flag: "🇨🇳" },
  hi:  { label: "Índia",     flag: "🇮🇳" },
};

// ── Refs DOM ─────────────────────────────────────────────────
const $grid      = document.getElementById("newsGrid");
const $search    = document.getElementById("searchInput");
const $sort      = document.getElementById("sortSelect");
const $filters   = document.getElementById("filterBtns");
const $total     = document.getElementById("statTotal");
const $filtered  = document.getElementById("statFiltered");
const $lastUp    = document.getElementById("lastUpdate");
const $updateTs  = document.getElementById("updateTimestamp");

// ── Utilitários ──────────────────────────────────────────────
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day:    "2-digit",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ── Lógica de filtro + busca ─────────────────────────────────
function getFiltered() {
  const { articles, activeFilter, searchQuery, sortOrder } = state;
  const q = searchQuery.toLowerCase().trim();

  let list = articles.filter(a => {
    const langOk = activeFilter === "all" || a.language === activeFilter;
    if (!langOk) return false;
    if (!q) return true;

    const haystack = [
      a.title_pt,
      a.title_original,
      a.description_pt,
      a.source,
    ].join(" ").toLowerCase();

    return haystack.includes(q);
  });

  list = list.slice().sort((a, b) => {
    const da = new Date(a.published).getTime();
    const db = new Date(b.published).getTime();
    return sortOrder === "newest" ? db - da : da - db;
  });

  return list;
}

// ── Render ───────────────────────────────────────────────────
function buildCard(article, idx) {
  const lang      = article.language || "en";
  const langInfo  = LANG_MAP[lang] || { label: lang.toUpperCase(), flag: "🌐" };
  const date      = formatDate(article.published);
  const titlePt   = escapeHtml(article.title_pt || article.title_original);
  const titleOrig = escapeHtml(article.title_original);
  const descPt    = escapeHtml(article.description_pt || article.description_original || "");
  const source    = escapeHtml(article.source);
  const link      = escapeHtml(article.link);

  const delay = Math.min(idx * 40, 600);

  return `
    <article class="card" data-lang="${lang}" style="animation-delay:${delay}ms">
      <div class="card-meta">
        <span class="card-source">${source}</span>
        <span class="card-lang">${langInfo.flag} ${langInfo.label}</span>
      </div>

      <h2 class="card-title">${titlePt}</h2>

      ${titleOrig !== titlePt ? `<p class="card-title-original">${titleOrig}</p>` : ""}

      ${descPt ? `<p class="card-desc">${descPt}</p>` : ""}

      <div class="card-meta" style="margin-top:.25rem">
        <span class="card-date">🕐 ${date}</span>
      </div>

      <div class="card-footer">
        <a class="card-link" href="${link}" target="_blank" rel="noopener noreferrer">
          Ler original
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </article>`;
}

function renderCards() {
  const filtered = getFiltered();
  $filtered && ($filtered.textContent = filtered.length);

  if (filtered.length === 0) {
    $grid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h3>Nenhuma notícia encontrada</h3>
        <p>Tente ajustar o filtro ou o termo de busca.</p>
      </div>`;
    return;
  }

  $grid.innerHTML = filtered.map(buildCard).join("");
}

// ── Filtros dinâmicos ────────────────────────────────────────
function buildFilterButtons() {
  const counts = {};
  state.articles.forEach(a => {
    counts[a.language] = (counts[a.language] || 0) + 1;
  });

  const total = state.articles.length;

  const allBtn = document.createElement("button");
  allBtn.className = "filter-btn active";
  allBtn.dataset.lang = "all";
  allBtn.innerHTML = `🌐 Todos <span class="count">(${total})</span>`;
  $filters.appendChild(allBtn);

  Object.entries(LANG_MAP).forEach(([code, info]) => {
    const c = counts[code] || 0;
    if (c === 0) return;
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.lang = code;
    btn.innerHTML = `${info.flag} ${info.label} <span class="count">(${c})</span>`;
    $filters.appendChild(btn);
  });
}

function setFilter(lang) {
  state.activeFilter = lang;
  $filters.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  renderCards();
}

// ── Carregamento de dados ────────────────────────────────────
async function loadNews() {
  $grid.innerHTML = `
    <div id="loader">
      <div class="spinner"></div>
      <p class="loader-text">Carregando notícias...</p>
    </div>`;

  try {
    // Cache-bust com timestamp truncado ao minuto
    const ts  = Math.floor(Date.now() / 60000);
    const res = await fetch(`data/news.json?v=${ts}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    state.articles = Array.isArray(data) ? data : [];

    $total    && ($total.textContent    = state.articles.length);
    $filtered && ($filtered.textContent = state.articles.length);

    // Timestamp de atualização
    if (state.articles.length > 0) {
      const latest = state.articles[0].published;
      const tsStr  = formatDate(latest);
      $lastUp   && ($lastUp.textContent   = tsStr);
      $updateTs && ($updateTs.textContent = tsStr);
    }

    buildFilterButtons();
    renderCards();
  } catch (err) {
    console.error("Erro ao carregar notícias:", err);
    $grid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>Erro ao carregar notícias</h3>
        <p>Verifique se o arquivo <code>data/news.json</code> existe e é válido.</p>
      </div>`;
  }
}

// ── Event Listeners ──────────────────────────────────────────
$search.addEventListener("input", debounce(e => {
  state.searchQuery = e.target.value;
  renderCards();
}, 280));

$sort.addEventListener("change", e => {
  state.sortOrder = e.target.value;
  renderCards();
});

$filters.addEventListener("click", e => {
  const btn = e.target.closest(".filter-btn");
  if (btn) setFilter(btn.dataset.lang);
});

// ── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", loadNews);
