import { Building2, LayoutGrid, Lightbulb, Mail, RotateCcw, Search, Users, X } from 'lucide';
import { iconSvg } from '../utils/icons.js';

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

  state.subscribe((snapshot) => {
    if (document.activeElement !== searchInput) searchInput.value = snapshot.search;
    topicFilter.value = snapshot.topic;
    hypothesisFilter.value = snapshot.hypothesisId ?? '';
  });
}

export function renderLeftRail(container, state, bundle) {
  const views = [
    ['overview', 'Overview', 'Network', LayoutGrid],
    ['official', 'Official', 'Government', Building2],
    ['pok', 'POK Motive', 'Activism', Users],
    ['email', 'Email Network', 'Messages', Mail],
    ['hypothesis', 'Hypotheses', 'Paths', Lightbulb],
  ];

  container.innerHTML = `
    <div class="rail-section">
      <div class="rail-section-title">Views</div>
      <div class="rail-nav">
        ${views
          .map(
            ([id, label, short, icon]) => `
              <button class="rail-button" type="button" data-view="${id}" aria-pressed="false">
                <span class="rail-icon">${iconSvg(icon, { width: 16, height: 16 })}</span>
                <span>
                  <strong>${label}</strong>
                  <small>${short}</small>
                </span>
              </button>
            `,
          )
          .join('')}
      </div>
    </div>
    <div class="rail-section">
      <div class="rail-section-title">Data Overview</div>
      <div class="rail-stats">
        <span><strong>${bundle.nodes.length}</strong>Nodes</span>
        <span><strong>${bundle.edges.length}</strong>Relations</span>
        <span><strong>${bundle.evidence.length}</strong>Evidence</span>
        <span><strong>${bundle.events.length}</strong>Events</span>
      </div>
    </div>
    <div class="rail-section rail-legend">
      <div class="rail-section-title">Legend</div>
      <div class="legend-list">
        <span><i class="legend-dot legend-gastech"></i>GAStech</span>
        <span><i class="legend-dot legend-government"></i>Government</span>
        <span><i class="legend-dot legend-pok"></i>POK</span>
        <span><i class="legend-dot legend-apa"></i>APA</span>
      </div>
      <div class="line-legend">
        <span><i class="line-solid"></i>Confirmed</span>
        <span><i class="line-dashed"></i>Probable</span>
        <span><i class="line-dotted"></i>Hypothesis</span>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => state.setActiveView(button.dataset.view));
  });

  state.subscribe((snapshot) => {
    container.querySelectorAll('[data-view]').forEach((button) => {
      const active = button.dataset.view === snapshot.activeView;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  });
}
