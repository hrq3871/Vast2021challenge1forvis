import './styles.css';
import { loadTask3Bundle } from './dataLoader.js';
import { createAppState } from './state.js';
import { createEmailNetwork } from './views/emailNetwork.js';
import { createEvidencePanel } from './views/evidencePanel.js';
import { createHypothesisExplorer } from './views/hypothesisExplorer.js';
import { createRelationshipGraph } from './views/relationshipGraph.js';
import { renderTopBar } from './views/searchPanel.js';
import { createTimelineView } from './views/timelineView.js';

const app = document.querySelector('#app');

function renderShell() {
  app.innerHTML = `
    <header class="topbar" id="topbar"></header>
    <main id="main" class="page-workspace" tabindex="-1">
      <section class="workspace-shell" aria-label="Investigation workspace">
        <div class="main-workspace">
          <section class="analysis-panel graph-panel" id="graph-panel" aria-label="Relationship graph"></section>
          <section class="analysis-panel email-panel" id="email-panel" aria-label="Email network"></section>
          <section class="analysis-panel hypothesis-panel" id="hypothesis-panel" aria-label="Hypothesis explorer"></section>
        </div>
        <aside class="evidence-panel" id="evidence-panel" aria-label="Evidence panel"></aside>
      </section>
      <section class="timeline-panel" id="timeline-panel" aria-label="Evidence timeline"></section>
    </main>
  `;
}

function bindViewVisibility(state) {
  const graphPanel = document.querySelector('#graph-panel');
  const emailPanel = document.querySelector('#email-panel');
  const hypothesisPanel = document.querySelector('#hypothesis-panel');

  state.subscribe((snapshot) => {
    const showEmail = snapshot.activeView === 'email';
    const showHypothesis = snapshot.activeView === 'hypothesis';
    graphPanel.hidden = showEmail;
    emailPanel.hidden = !showEmail;
    hypothesisPanel.hidden = !showHypothesis;
    graphPanel.classList.toggle('with-hypothesis', showHypothesis);
  });
}

async function boot() {
  renderShell();
  app.classList.add('is-loading');
  document.querySelector('#main').innerHTML = `
    <section class="loading-state" aria-live="polite">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-chart"></div>
    </section>
  `;

  try {
    const { bundle, indexes } = await loadTask3Bundle('/data');
    const state = createAppState();

    renderShell();
    app.classList.remove('is-loading');

    renderTopBar(document.querySelector('#topbar'), state, bundle);
    bindViewVisibility(state);

    createRelationshipGraph(document.querySelector('#graph-panel'), state, bundle, indexes);
    createEmailNetwork(document.querySelector('#email-panel'), state, bundle, indexes);
    createHypothesisExplorer(document.querySelector('#hypothesis-panel'), state, bundle, indexes);
    createEvidencePanel(document.querySelector('#evidence-panel'), state, bundle, indexes);
    createTimelineView(document.querySelector('#timeline-panel'), state, bundle, indexes);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') state.clearSelection();
    });

    state.setActiveView('overview');
  } catch (error) {
    app.classList.remove('is-loading');
    app.innerHTML = `
      <main class="fatal-error" role="alert">
        <h1>Unable to load Task 3 workbench</h1>
        <p>${error instanceof Error ? error.message : String(error)}</p>
        <p>Run <code>npm run data</code> from <code>D:\\HKUST\\5005 Data visualization\\project-vast2021\\MC1\\code</code>, then refresh.</p>
      </main>
    `;
  }
}

boot();
