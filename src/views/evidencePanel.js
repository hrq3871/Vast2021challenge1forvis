import { Copy, FileText } from 'lucide';
import { getEvidenceForSelection } from '../utils/filters.js';
import { confidenceLabel, rankEvidenceItems } from '../utils/evidenceScoring.js';
import { iconSvg } from '../utils/icons.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function evidenceForCurrentState(snapshot, bundle, indexes) {
  if (snapshot.selection) {
    return getEvidenceForSelection(snapshot.selection, bundle, indexes);
  }

  if (snapshot.hypothesisId) {
    const hypothesis = indexes.hypothesisById.get(snapshot.hypothesisId);
    return rankEvidenceItems(
      (hypothesis?.evidenceIds ?? []).map((id) => indexes.evidenceById.get(id)).filter(Boolean),
    );
  }

  return rankEvidenceItems(bundle.evidence).slice(0, 8);
}

function selectionTitle(snapshot, bundle, indexes) {
  if (snapshot.selection?.type === 'node') {
    return indexes.nodeById.get(snapshot.selection.id)?.label ?? 'Selected node';
  }
  if (snapshot.selection?.type === 'edge') {
    return indexes.edgeById.get(snapshot.selection.id)?.relation ?? 'Selected relation';
  }
  if (snapshot.selection?.type === 'event') {
    return indexes.eventById.get(snapshot.selection.id)?.label ?? 'Selected event';
  }
  if (snapshot.hypothesisId) {
    return indexes.hypothesisById.get(snapshot.hypothesisId)?.title ?? 'Selected path';
  }
  return 'Evidence Inbox';
}

export function createEvidencePanel(container, state, bundle, indexes) {
  function render(snapshot) {
    const evidence = evidenceForCurrentState(snapshot, bundle, indexes);
    const title = selectionTitle(snapshot, bundle, indexes);

    container.innerHTML = `
      <div class="panel-header">
        <div>
          <p class="eyebrow">Traceable Evidence</p>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <button class="icon-button" id="copy-evidence" type="button" aria-label="Copy evidence summary">
          ${iconSvg(Copy)}
        </button>
      </div>
      <div class="evidence-list" role="list">
        ${
          evidence.length
            ? evidence
                .map(
                  (item) => `
                    <article class="evidence-card confidence-${escapeHtml(item.confidence)}" role="listitem" tabindex="0">
                      <div class="evidence-card__topline">
                        ${iconSvg(FileText, { width: 16, height: 16 })}
                        <span>${escapeHtml(item.source)}</span>
                      </div>
                      <h3>${escapeHtml(item.title)}</h3>
                      <p>${escapeHtml(item.snippet)}</p>
                      <div class="evidence-meta">
                        <span>${escapeHtml(item.date)}</span>
                        <span>${confidenceLabel(item.confidence)}</span>
                        <span>Bias: ${escapeHtml(item.biasWarning)}</span>
                      </div>
                    </article>
                  `,
                )
                .join('')
            : `
              <div class="empty-state">
                <h3>No evidence for the current selection</h3>
                <p>Reset filters or select another relationship to inspect source snippets.</p>
              </div>
            `
        }
      </div>
    `;

    container.querySelector('#copy-evidence')?.addEventListener('click', async () => {
      const summary = evidence
        .map((item) => `${item.title} | ${item.source} | ${item.confidence}: ${item.snippet}`)
        .join('\n');
      await navigator.clipboard?.writeText(summary);
    });
  }

  state.subscribe(render);
  render(state.get());
}
