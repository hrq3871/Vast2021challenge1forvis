import { GitBranch, MapPinned, ShieldAlert } from 'lucide';
import { iconSvg } from '../utils/icons.js';
import { confidenceLabel } from '../utils/evidenceScoring.js';

const ICON_BY_HYPOTHESIS = {
  h_sanjorge_target: MapPinned,
  h_isia_personal_bridge: GitBranch,
  h_apa_arise_weak_risk: ShieldAlert,
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function createHypothesisExplorer(container, state, bundle, indexes) {
  function render(snapshot) {
    container.innerHTML = `
      <div class="view-title-row">
        <div>
          <p class="eyebrow">Guided Paths</p>
          <h2>Hypotheses</h2>
        </div>
      </div>
      <div class="hypothesis-grid">
        ${bundle.hypotheses
          .map((hypothesis) => {
            const Icon = ICON_BY_HYPOTHESIS[hypothesis.id] ?? GitBranch;
            const selected = snapshot.hypothesisId === hypothesis.id;
            const evidenceCount = hypothesis.evidenceIds?.length ?? 0;
            const edgeCount = hypothesis.edgeIds?.length ?? 0;
            return `
              <button class="hypothesis-card ${selected ? 'is-active' : ''}" type="button" data-hypothesis="${hypothesis.id}" aria-pressed="${selected}">
                <span class="hypothesis-card__icon">${iconSvg(Icon, { width: 22, height: 22 })}</span>
                <span class="hypothesis-card__body">
                  <strong>${escapeHtml(hypothesis.title)}</strong>
                  <span>${escapeHtml(hypothesis.summary)}</span>
                  <span class="hypothesis-meta">
                    ${confidenceLabel(hypothesis.confidence)} - ${edgeCount} relations - ${evidenceCount} evidence items
                  </span>
                </span>
              </button>
            `;
          })
          .join('')}
      </div>
      <div class="walkthrough-panel compact-walkthrough"></div>
    `;

    container.querySelectorAll('[data-hypothesis]').forEach((button) => {
      button.addEventListener('click', () => {
        state.setHypothesis(button.dataset.hypothesis);
      });
    });

    const active = snapshot.hypothesisId
      ? indexes.hypothesisById.get(snapshot.hypothesisId)
      : indexes.hypothesisById.get('h_sanjorge_target');
    const panel = container.querySelector('.walkthrough-panel');
    panel.innerHTML = `
      <div>
        <p class="eyebrow">Recording Script</p>
        <h3>${escapeHtml(active.title)}</h3>
      </div>
      <ol>
        ${(active.walkthrough ?? []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
      <div class="adjacency-strip" aria-label="Highlighted path edges">
        ${(active.edgeIds ?? [])
          .map((edgeId) => indexes.edgeById.get(edgeId))
          .filter(Boolean)
          .map((edge) => {
            const source = indexes.nodeById.get(edge.source)?.label ?? edge.source;
            const target = indexes.nodeById.get(edge.target)?.label ?? edge.target;
            return `<button type="button" data-edge="${edge.id}">${escapeHtml(source)} -> ${escapeHtml(target)}</button>`;
          })
          .join('')}
      </div>
    `;

    panel.querySelectorAll('[data-edge]').forEach((button) => {
      button.addEventListener('click', () => state.setSelection({ type: 'edge', id: button.dataset.edge }));
    });
  }

  state.subscribe(render);
  render(state.get());
}
