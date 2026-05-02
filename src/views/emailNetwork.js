import * as d3 from 'd3';
import { Mail, RadioTower, X } from 'lucide';
import { iconSvg } from '../utils/icons.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function topicLabel(topic) {
  return topic === 'all' ? 'All Email' : topic.toUpperCase();
}

function effectiveEmailTopic(snapshot) {
  if (snapshot.topic === 'arise' || snapshot.topic === 'ipo' || snapshot.topic === 'security') return snapshot.topic;
  return 'all';
}

function employeeMatches(edge, selection) {
  if (selection?.type !== 'employee') return true;
  const needles = [selection.id, selection.nodeId, selection.label].filter(Boolean).map((item) => String(item).toLowerCase());
  const haystack = [edge.source, edge.target, edge.sourceEmail, edge.targetEmail, edge.sourceLabel, edge.targetLabel]
    .join(' ')
    .toLowerCase();
  return needles.some((needle) => haystack.includes(needle));
}

export function filterEmails(emailEdges, snapshot) {
  const topic = effectiveEmailTopic(snapshot);
  const query = snapshot.search.trim().toLowerCase();
  return emailEdges
    .filter((edge) => topic === 'all' || edge.topic === topic)
    .filter((edge) => employeeMatches(edge, snapshot.selection))
    .filter((edge) => {
      if (!query) return true;
      return [
        edge.id,
        edge.source,
        edge.sourceLabel,
        edge.sourceEmail,
        edge.target,
        edge.targetLabel,
        edge.targetEmail,
        edge.subject,
        edge.topic,
        edge.date,
        edge.datetime,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
}

function aggregateEdges(emails) {
  const groups = d3.rollups(
    emails,
    (rows) => rows,
    (edge) => `${edge.source}|${edge.target}|${edge.topic}`,
  );
  return groups
    .map(([key, rows]) => {
      const [source, target, topic] = key.split('|');
      const first = rows[0];
      return {
        id: key,
        source,
        target,
        topic,
        sourceLabel: first.sourceLabel,
        targetLabel: first.targetLabel,
        value: rows.length,
        emails: rows.sort((a, b) => a.datetime.localeCompare(b.datetime)),
      };
    })
    .sort((a, b) => b.value - a.value);
}

function buildSideNodes(aggregates, side) {
  const idKey = side === 'source' ? 'source' : 'target';
  const labelKey = side === 'source' ? 'sourceLabel' : 'targetLabel';
  return d3
    .rollups(
      aggregates,
      (rows) => d3.sum(rows, (item) => item.value),
      (item) => item[idKey],
    )
    .map(([id, value]) => {
      const row = aggregates.find((item) => item[idKey] === id);
      return { id, label: row[labelKey], value };
    })
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function renderEmailModal(container, aggregate) {
  container.insertAdjacentHTML(
    'beforeend',
    `
      <div class="modal-backdrop" id="email-modal" role="presentation">
        <article class="source-modal email-source-modal" role="dialog" aria-modal="true" aria-labelledby="email-modal-title">
          <div class="source-modal__header">
            <div>
              <p class="eyebrow">Email Evidence</p>
              <h2 id="email-modal-title">${escapeHtml(aggregate.sourceLabel)} to ${escapeHtml(aggregate.targetLabel)}</h2>
              <p>${aggregate.value} message path${aggregate.value === 1 ? '' : 's'} - ${escapeHtml(topicLabel(aggregate.topic))}</p>
            </div>
            <button class="icon-button" id="close-email-modal" type="button" aria-label="Close email evidence">${iconSvg(X)}</button>
          </div>
          <div class="email-evidence-list">
            ${aggregate.emails
              .map(
                (email) => `
                  <article class="email-evidence-card">
                    <div>
                      <strong>${escapeHtml(email.subject)}</strong>
                      <span>${escapeHtml(email.datetime)} - row ${escapeHtml(email.rowNumber)}</span>
                    </div>
                    <p><b>From</b> ${escapeHtml(email.sourceLabel)} &lt;${escapeHtml(email.sourceEmail)}&gt;</p>
                    <p><b>To</b> ${escapeHtml(email.targetLabel)} &lt;${escapeHtml(email.targetEmail)}&gt;</p>
                    <p><b>Entities</b> ${escapeHtml(email.sourceLabel)}, ${escapeHtml(email.targetLabel)}, GAStech - <b>Topic</b> ${escapeHtml(email.topic)}</p>
                  </article>
                `,
              )
              .join('')}
          </div>
        </article>
      </div>
    `,
  );
  const modal = container.querySelector('#email-modal');
  const close = container.querySelector('#close-email-modal');
  close?.focus();
  close?.addEventListener('click', () => modal?.remove());
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) modal.remove();
  });
}

export function createEmailNetwork(container, state, bundle) {
  function render(snapshot) {
    const emails = filterEmails(bundle.emailEdges, snapshot);
    const aggregates = aggregateEdges(emails);
    const width = Math.max(container.getBoundingClientRect().width || 980, 900);
    const height = Math.max(container.getBoundingClientRect().height || 280, 240) - 70;
    const sourceNodes = buildSideNodes(aggregates, 'source').slice(0, 6);
    const targetNodes = buildSideNodes(aggregates, 'target').slice(0, 6);
    const sourceIds = new Set(sourceNodes.map((item) => item.id));
    const targetIds = new Set(targetNodes.map((item) => item.id));
    const visibleAggregates = aggregates.filter((item) => sourceIds.has(item.source) && targetIds.has(item.target));
    const maxValue = d3.max(visibleAggregates, (item) => item.value) ?? 1;
    const selectedEmployee = snapshot.selection?.type === 'employee' ? snapshot.selection : null;

    container.innerHTML = `
      <div class="view-title-row">
        <div>
          <p class="eyebrow">Full Email Sankey</p>
          <h2>${iconSvg(Mail, { width: 18, height: 18 })} Message Flow by Sender and Recipient</h2>
          <p class="email-context">${selectedEmployee ? `Filtered by employee: ${escapeHtml(selectedEmployee.label)}` : `Showing full anomalous email flow before topic filtering.`}</p>
        </div>
        <div class="segmented" role="group" aria-label="Email topic">
          ${['all', 'arise', 'ipo', 'security']
            .map((topic) => `<button type="button" data-email-topic="${topic}">${topicLabel(topic)}</button>`)
            .join('')}
        </div>
      </div>
      <div class="email-canvas sankey-canvas"></div>
      <div class="email-summary">
        <div class="signal-chip" style="padding: 2px 8px; font-size: 11px;">
          ${iconSvg(RadioTower, { width: 14, height: 14 })}
          ${emails.length} msg - ${visibleAggregates.length} paths
        </div>
      </div>
    `;

    container.querySelectorAll('[data-email-topic]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.emailTopic === effectiveEmailTopic(snapshot));
      button.addEventListener('click', () => state.setTopic(button.dataset.emailTopic));
    });

    const canvas = container.querySelector('.email-canvas');
    if (!visibleAggregates.length) {
      canvas.innerHTML = `
        <div class="empty-state">
          <h3>No emails match current filters</h3>
          <p>Clear search, switch topic, or close the selected employee filter.</p>
        </div>
      `;
      return;
    }

    const top = 16;
    const bottom = Math.max(top + 1, height - 20);
    const ySource = d3.scalePoint().domain(sourceNodes.map((item) => item.id)).range([top, bottom]).padding(0.45);
    const yTarget = d3.scalePoint().domain(targetNodes.map((item) => item.id)).range([top, bottom]).padding(0.45);
    const stroke = d3.scaleSqrt().domain([1, maxValue]).range([2.5, 22]);
    const x1 = 190;
    const x2 = width - 210;

    const svg = d3
      .select(canvas)
      .append('svg')
      .attr('class', 'email-svg sankey-svg')
      .attr('viewBox', [0, 0, width, height].join(' '))
      .attr('role', 'img')
      .attr('aria-label', 'Sankey-style full email flow grouped by sender and recipient.');

    svg
      .append('g')
      .attr('class', 'sankey-links')
      .selectAll('path')
      .data(visibleAggregates)
      .join('path')
      .attr('class', (edge) => `sankey-link email-${edge.topic} ${selectedEmployee && (edge.source === selectedEmployee.nodeId || edge.target === selectedEmployee.nodeId) ? 'is-selected-employee' : ''}`)
      .attr('d', (edge) => {
        const sy = ySource(edge.source);
        const ty = yTarget(edge.target);
        const mid = width / 2;
        return `M${x1},${sy} C${mid - 120},${sy} ${mid + 120},${ty} ${x2},${ty}`;
      })
      .attr('stroke-width', (edge) => stroke(edge.value))
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (edge) => `${edge.value} emails from ${edge.sourceLabel} to ${edge.targetLabel}`)
      .on('click keydown', (event, edge) => {
        if (event.type === 'keydown' && event.key !== 'Enter') return;
        renderEmailModal(container, edge);
      })
      .append('title')
      .text((edge) => `${edge.value} emails - ${edge.sourceLabel} -> ${edge.targetLabel}`);

    const drawNode = (selection, x, side) => {
      selection
        .append('rect')
        .attr('x', side === 'source' ? -188 : 8)
        .attr('y', -12)
        .attr('width', 180)
        .attr('height', 24)
        .attr('rx', 4);
      selection
        .append('text')
        .attr('x', side === 'source' ? -98 : 98)
        .attr('y', 4)
        .attr('text-anchor', 'middle')
        .text((item) => `${item.label} (${item.value})`);
    };

    drawNode(
      svg
        .append('g')
        .attr('class', 'sankey-nodes sankey-sources')
        .selectAll('g')
        .data(sourceNodes)
        .join('g')
        .attr('class', (item) => (selectedEmployee?.nodeId === item.id ? 'is-selected-employee' : ''))
        .attr('transform', (item) => `translate(${x1},${ySource(item.id)})`),
      x1,
      'source',
    );
    drawNode(
      svg
        .append('g')
        .attr('class', 'sankey-nodes sankey-targets')
        .selectAll('g')
        .data(targetNodes)
        .join('g')
        .attr('class', (item) => (selectedEmployee?.nodeId === item.id ? 'is-selected-employee' : ''))
        .attr('transform', (item) => `translate(${x2},${yTarget(item.id)})`),
      x2,
      'target',
    );
  }

  state.subscribe(render);
  render(state.get());
}
