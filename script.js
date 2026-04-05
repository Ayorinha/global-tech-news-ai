/**
 * script.js — Global Tech News AI
 */

"use strict";

const state = {
  articles: [],
  activeFilter: "all",
  searchQuery: "",
  sortOrder: "newest",
};

const LANG_MAP = {
  en: { label: "Inglês", flag: "🇺🇸" },
  es: { label: "Espanhol", flag: "🇪🇸" },
  pt: { label: "Português", flag: "🇧🇷" },
  zh: { label: "Chinês", flag: "🇨🇳" },
  hi: { label: "Índia", flag: "🇮🇳" },
};

const $grid = document.getElementById("newsGrid");
const $search = document.getElementById("searchInput");
const $sort = document.getElementById("sortSelect");
const $filters = document.getElementById("filterBtns");
const $total = document.getElementById("statTotal");
const $filtered = document.getElementById("statFiltered");
const $updateTs = document.getElementById("updateTimestamp");

function escapeHtml(str = "") {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

async function loadNews() {
  try {
    // O SEGREDO ESTÁ AQUI: O ponto antes da barra ajuda o GitHub Pages
    const res = await fetch("./data/news.json");
    if (!res.ok) throw new Error(`Erro: ${res.status}`);

    const data = await res.json();
    state.articles = Array.isArray(data) ? data : [];

    if ($total) $total.textContent = state.articles.length;
    if ($updateTs && state.articles.length > 0) {
        $updateTs.textContent = formatDate(state.articles[0].published);
    }

    buildFilterButtons();
    renderCards();
  } catch (err) {
    console.error("Erro:", err);
    $grid.innerHTML = `<div class="empty-state"><h3>⚠️ Erro ao carregar dados</h3><p>Verifique o arquivo data/news.json</p></div>`;
  }
}

function renderCards() {
  const q = state.searchQuery.toLowerCase();
  let filtered = state.articles.filter(a => {
    const langOk = state.activeFilter === "all" || a.language === state.activeFilter;
    const searchOk = a.title_pt.toLowerCase().includes(q) || a.description_pt.toLowerCase().includes(q);
    return langOk && searchOk;
  });

  if (state.sortOrder === "newest") {
    filtered.sort((a, b) => new Date(b.published) - new Date(a.published));
  } else {
    filtered.sort((a, b) => new Date(a.published) - new Date(b.published));
  }

  if ($filtered) $filtered.textContent = filtered.length;

  $grid.innerHTML = filtered.map(a => `
    <article class="card">
      <div class="card-meta">
        <span>${escapeHtml(a.source)}</span>
        <span>${LANG_MAP[a.language]?.flag || ""} ${a.language.toUpperCase()}</span>
      </div>
      <h2 class="card-title">${escapeHtml(a.title_pt)}</h2>
      <p class="card-desc">${escapeHtml(a.description_pt)}</p>
      <div class="card-footer">
        <time>${formatDate(a.published)}</time>
        <a href="${a.link}" target="_blank" class="card-link">Ler original ↗</a>
      </div>
    </article>
  `).join("");
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

$search.addEventListener("input", (e) => {
  state.searchQuery = e.target.value;
  renderCards();
});

$sort.addEventListener("change", (e) => {
  state.sortOrder = e.target.value;
  renderCards();
});

loadNews();
