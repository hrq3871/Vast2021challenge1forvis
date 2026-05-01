import { Building2, LayoutGrid, Lightbulb, Mail, RotateCcw, Search, Users, X } from 'lucide';
import { iconSvg } from '../utils/icons.js';

const VIEWS = [
  ['overview', 'Overview', LayoutGrid],
  ['official', 'Official', Building2],
  ['pok', 'POK Motive', Users],
  ['email', 'Email Network', Mail],
  ['hypothesis', 'Hypotheses', Lightbulb],
];

export function renderTopBar(container, state, bundle) {
  const topics = [
    ['all', 'All Topics'],
    ['government_reception', 'Government'],
    ['pok_motive', 'POK Motive'],
    ['personal_bridge', 'Vann Bridge'],
    ['arise', 'ARISE'],
    ['ipo', 'IPO'],
    ['kidnapping', 'Kidnapping'],
    ['security', 'Security'],
  ];

  const hypotheses = [['', 'No hypothesis'], ...bundle.hypotheses.map((item) => [item.id, item.title])];

  container.innerHTML = `
    <div class="topbar-title">
      <div class="brand-mark" aria-hidden="true">V</div>
      <div class="brand-block">
        <p class="eyebrow">VAST 2021 MC1 - Task 3</p>
        <h1>GAStech Investigation Workbench</h1>
        <p>Kronos incident relationship analysis</p>
      </div>
    </div>
    <div class="topbar-controls">
      <label class="search-field">
        <span class="sr-only">Search entities and evidence</span>
        ${iconSvg(Search)}
        <input id="global-search" type="search" placeholder="Search Sanjorge, kidnap, Vann, ARISE" autocomplete="off" />
        <button class="icon-button" id="clear-search" type="button" aria-label="Clear search">
          ${iconSvg(X)}
        </button>
      </label>
      <label class="compact-select">
        <span>Topic</span>
        <select id="topic-filter" aria-label="Filter topic">
          ${topics.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
        </select>
      </label>
      <label class="compact-select hypothesis-select">
        <span>Path</span>
        <select id="hypothesis-filter" aria-label="Select hypothesis path">
          ${hypotheses.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
        </select>
      </label>
      <button class="command-button" id="reset-workbench" type="button">
        ${iconSvg(RotateCcw)}
        Reset
      </button>
    </div>
    <nav class="view-tabs" aria-label="Analysis views">
      ${VIEWS.map(
        ([id, label, icon]) => `
          <button class="view-tab" type="button" data-view="${id}" aria-pressed="false">
            ${iconSvg(icon, { width: 16, height: 16 })}
            <span>${label}</span>
          </button>
        `,
      ).join('')}
    </nav>
  `;

  const searchInput = container.querySelector('#global-search');
  const clearSearch = container.querySelector('#clear-search');
  const topicFilter = container.querySelector('#topic-filter');
  const hypothesisFilter = container.querySelector('#hypothesis-filter');

  searchInput.addEventListener('input', (event) => state.setSearch(event.target.value));
  clearSearch.addEventListener('click', () => state.setSearch(''));
  topicFilter.addEventListener('change', (event) => state.setTopic(event.target.value));
  hypothesisFilter.addEventListener('change', (event) => state.setHypothesis(event.target.value || null));
  container.querySelector('#reset-workbench').addEventListener('click', () => state.reset());
  container.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => state.setActiveView(button.dataset.view));
  });

  state.subscribe((snapshot) => {
    if (document.activeElement !== searchInput) searchInput.value = snapshot.search;
    topicFilter.value = snapshot.topic;
    hypothesisFilter.value = snapshot.hypothesisId ?? '';
    container.querySelectorAll('[data-view]').forEach((button) => {
      const active = button.dataset.view === snapshot.activeView;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  });
}
