import { ChevronRight, Copy, FileText, X } from 'lucide';
import { getEvidenceForSelection } from '../utils/filters.js';
import { confidenceLabel, rankEvidenceItems } from '../utils/evidenceScoring.js';
import { relationLabel } from '../utils/colors.js';
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

function selectionContext(snapshot, indexes) {
  if (snapshot.selection?.type === 'node') {
    const node = indexes.nodeById.get(snapshot.selection.id);
    return {
      eyebrow: 'Selected Entity',
      title: node?.label ?? 'Selected node',
      subtitle: node?.role ?? node?.group ?? 'Entity',
      badges: [node?.group, node?.type].filter(Boolean),
      canClose: true,
    };
  }

  if (snapshot.selection?.type === 'edge') {
    const edge = indexes.edgeById.get(snapshot.selection.id);
    return {
      eyebrow: 'Selected Relationship',
      title: relationLabel(edge?.relation ?? 'Selected relation'),
      subtitle: edge?.narrative ?? edge?.confidence ?? 'Relationship evidence',
      badges: [edge?.confidence, ...(edge?.topics ?? []).slice(0, 2)].filter(Boolean),
      canClose: true,
    };
  }

  if (snapshot.selection?.type === 'event') {
    const event = indexes.eventById.get(snapshot.selection.id);
    return {
      eyebrow: 'Selected Event',
      title: event?.label ?? 'Selected event',
      subtitle: event?.date ?? event?.type ?? 'Timeline event',
      badges: [event?.type].filter(Boolean),
      canClose: true,
    };
  }

  if (snapshot.hypothesisId) {
    const hypothesis = indexes.hypothesisById.get(snapshot.hypothesisId);
    return {
      eyebrow: 'Selected Path',
      title: hypothesis?.title ?? 'Selected path',
      subtitle: hypothesis?.summary ?? 'Hypothesis evidence',
      badges: [hypothesis?.confidence, 'hypothesis'].filter(Boolean),
      canClose: true,
    };
  }

  return {
    eyebrow: 'Traceable Evidence',
    title: 'Evidence Inbox',
    subtitle: 'Select a node, relationship, event, or path to inspect related source material.',
    badges: ['ranked evidence'],
    canClose: false,
  };
}

export function createEvidencePanel(container, state, bundle, indexes) {
  function render(snapshot) {
    const evidence = evidenceForCurrentState(snapshot, bundle, indexes);
    const context = selectionContext(snapshot, indexes);

    container.innerHTML = `
      <div class="panel-header">
        <div class="detail-title">
          <p class="eyebrow">${escapeHtml(context.eyebrow)}</p>
          <h2>${escapeHtml(context.title)}</h2>
          <p>${escapeHtml(context.subtitle)}</p>
          <div class="detail-tags">
            ${context.badges.map((badge) => `<span>${escapeHtml(String(badge).replaceAll('_', ' '))}</span>`).join('')}
          </div>
        </div>
        <div class="detail-actions">
          <button class="icon-button" id="copy-evidence" type="button" aria-label="Copy evidence summary">
            ${iconSvg(Copy)}
          </button>
          ${
            context.canClose
              ? `<button class="icon-button" id="close-detail" type="button" aria-label="Close detail panel">${iconSvg(X)}</button>`
              : ''
          }
        </div>
      </div>
      <div class="related-heading">Related Evidence (${evidence.length})</div>
      <div class="evidence-list" role="list">
        ${
          evidence.length
            ? evidence
                .map(
                  (item) => `
                    <article class="evidence-card confidence-${escapeHtml(item.confidence)}" role="listitem" tabindex="0">
                      <div class="evidence-icon">${iconSvg(FileText, { width: 17, height: 17 })}</div>
                      <div class="evidence-card__body">
                        <div class="evidence-card__topline">
                          <span>${escapeHtml(item.source)}</span>
                        </div>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.snippet)}</p>
                        <div class="evidence-meta">
                          <span class="status-pill status-${escapeHtml(item.confidence)}">${confidenceLabel(item.confidence)}</span>
                          <span>${escapeHtml(item.date)}</span>
                        </div>
                      </div>
                      ${iconSvg(ChevronRight, { width: 17, height: 17, class: 'card-chevron' })}
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
      <div class="detail-footer">
        <button class="text-button" id="copy-evidence-footer" type="button">Copy Evidence Summary</button>
      </div>
    `;

    const copyEvidence = async () => {
      const summary = evidence
        .map((item) => `${item.title} | ${item.source} | ${item.confidence}: ${item.snippet}`)
        .join('\n');
      await navigator.clipboard?.writeText(summary);
    };

    container.querySelector('#copy-evidence')?.addEventListener('click', copyEvidence);
    container.querySelector('#copy-evidence-footer')?.addEventListener('click', copyEvidence);
    container.querySelector('#close-detail')?.addEventListener('click', () => {
      state.clearSelection();
      if (snapshot.hypothesisId) state.setHypothesis(null);
    });
  }

  state.subscribe(render);
  render(state.get());
}
