/**
 * script.js — Global Tech News AI
 * Lê ./data/news.json, renderiza cards e gerencia filtros/busca.
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
const $updateTs  = document.getElementById("updateTimestamp");

// ── Utilitários ──────────────────────────────────────────────
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch { return iso; }
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ── Lógica de Renderização ───────────────────────────────────
function renderCards() {
  const q = state.searchQuery.toLowerCase().trim();
  
  let filtered = state.articles.filter(a => {
    const langOk = state.activeFilter === "all" || a.language === state.activeFilter;
    const textOk = a.title_pt.toLowerCase().includes(q) || a.description_pt.toLowerCase().includes(q);
    return langOk && textOk;
  });

  filtered.sort((a, b) => {
    const da = new Date(a.published).getTime();
    const db = new Date(b.published).getTime();
    return state.sortOrder === "newest" ? db - da : da - db;
  });

  if ($filtered) $filtered.textContent = filtered.length;

  if (filtered.length === 0) {
    $grid.innerHTML = `<div class="empty-state"><h3>Nenhuma notícia encontrada</h3><p>Tente outro filtro ou busca.</p></div>`;
    return;
  }

  $grid.innerHTML = filtered.map(a => {
    const info = LANG_MAP[a.language] || { label: a.language, flag: "🌐" };
    return `
      <article class="card" data-lang="${a.language}">
        <div class="card-meta">
          <span class="card-source">${escapeHtml(a.source)}</span>
          <span class="card-lang">${info.flag} ${info.label}</span>
        </div>
        <h2 class="card-title">${escapeHtml(a.title_pt)}</h2>
        <p class="card-desc">${escapeHtml(a.description_pt)}</p>
        <div class="card-footer">
          <time>🕐 ${formatDate(a.published)}</time>
          <a href="${a.link}" target="_blank" rel="noopener" class="card-link">Ler original ↗</a>
        </div>
      </article>`;
  }).join("");
}

function buildFilterButtons() {
  const langs = ["all", ...new Set(state.articles.map(a => a.language))];
  $filters.innerHTML = langs.map(l => {
    const info = LANG_MAP[l] || { label: "Todos", flag: "🌐" };
    return `<button class="filter-btn ${state.activeFilter === l ? 'active' : ''}" data-lang="${l}">${info.flag} ${info.label}</button>`;
  }).join("");

  $filters.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeFilter = btn.dataset.lang;
      $filters.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCards();
    });
  });
}

// ── Carregamento Inicial ─────────────────────────────────────
async function loadNews() {
  try {
    // AJUSTE REALIZADO AQUI PARA GITHUB PAGES:
    const res = await fetch("./data/news.json");
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

    const data = await res.json();
    state.articles = Array.isArray(data) ? data : [];

    if ($total) $total.textContent = state.articles.length;
    if ($updateTs && state.articles.length > 0) {
      $updateTs.textContent = formatDate(state.articles[0].published);
    }

    buildFilterButtons();
    renderCards();
  } catch (err) {
    console.error("Erro ao carregar notícias:", err);
    $grid.innerHTML = `<div class="empty-state"><h3>⚠️ Erro ao carregar notícias</h3><p>Verifique se o arquivo news.json foi gerado.</p></div>`;
  }
}

// ── Listeners ────────────────────────────────────────────────
$search.addEventListener("input", debounce(e => {
  state.searchQuery = e.target.value;
  renderCards();
}, 250));

$sort.addEventListener("change", e => {
  state.sortOrder = e.target.value;
  renderCards();
});

document.addEventListener("DOMContentLoaded", loadNews);
