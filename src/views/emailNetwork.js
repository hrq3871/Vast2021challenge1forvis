import * as d3 from 'd3';
import { Mail, RadioTower } from 'lucide';
import { iconSvg } from '../utils/icons.js';

function effectiveEmailTopic(snapshot) {
  if (snapshot.hypothesisId === 'h_apa_arise_weak_risk') return 'arise';
  if (snapshot.topic === 'arise' || snapshot.topic === 'ipo' || snapshot.topic === 'security') return snapshot.topic;
  if (snapshot.search?.trim()) return 'all';
  if (snapshot.activeView === 'email') return 'arise';
  return 'all';
}

export function filterEmails(emailEdges, snapshot) {
  const topic = effectiveEmailTopic(snapshot);
  const query = snapshot.search.trim().toLowerCase();
  return emailEdges
    .filter((edge) => topic === 'all' || edge.topic === topic)
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
    })
    .slice(0, 90);
}

export function createEmailNetwork(container, state, bundle) {
  function render(snapshot) {
    const emails = filterEmails(bundle.emailEdges, snapshot);
    const width = Math.max(container.getBoundingClientRect().width || 860, 560);
    const height = 330;
    const participants = Array.from(
      new Map(
        emails
          .flatMap((edge) => [
            [edge.source, edge.sourceLabel],
            [edge.target, edge.targetLabel],
          ])
          .map(([id, label]) => [id, { id, label }]),
      ).values(),
    ).sort((a, b) => a.label.localeCompare(b.label));

    container.innerHTML = `
      <div class="view-title-row">
        <div>
          <p class="eyebrow">Internal Email Header Network</p>
          <h2>${iconSvg(Mail, { width: 18, height: 18 })} Anomalous Message Propagation</h2>
        </div>
        <div class="segmented" role="group" aria-label="Email topic">
          <button type="button" data-email-topic="arise">ARISE</button>
          <button type="button" data-email-topic="ipo">IPO</button>
          <button type="button" data-email-topic="security">Security</button>
        </div>
      </div>
      <div class="email-canvas"></div>
      <div class="email-summary" aria-live="polite"></div>
    `;

    container.querySelectorAll('[data-email-topic]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.emailTopic === effectiveEmailTopic(snapshot));
      button.addEventListener('click', () => state.setTopic(button.dataset.emailTopic));
    });

    const canvas = container.querySelector('.email-canvas');

    if (!emails.length) {
      canvas.innerHTML = `
        <div class="empty-state">
          <h3>No anomalous emails match current filters</h3>
          <p>Clear search or switch to ARISE, IPO, or Security topic.</p>
        </div>
      `;
      return;
    }

    const x = d3
      .scalePoint()
      .domain(participants.map((item) => item.id))
      .range([48, width - 48])
      .padding(0.6);
    const y = height - 78;
    const maxDistance = Math.max(1, participants.length - 1);

    const svg = d3
      .select(canvas)
      .append('svg')
      .attr('class', 'email-svg')
      .attr('viewBox', [0, 0, width, height].join(' '))
      .attr('role', 'img')
      .attr('aria-label', 'Arc diagram of anomalous GAStech email headers.');

    svg
      .append('g')
      .attr('class', 'email-arcs')
      .selectAll('path')
      .data(emails)
      .join('path')
      .attr('class', (edge) => `email-arc email-${edge.topic}`)
      .attr('d', (edge) => {
        const x1 = x(edge.source);
        const x2 = x(edge.target);
        const distance = Math.abs(participants.findIndex((item) => item.id === edge.source) - participants.findIndex((item) => item.id === edge.target));
        const lift = 28 + (distance / maxDistance) * 140;
        return `M${x1},${y} C${x1},${y - lift} ${x2},${y - lift} ${x2},${y}`;
      })
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (edge) => `${edge.subject}: ${edge.sourceLabel} to ${edge.targetLabel}`)
      .on('click keydown', (event, edge) => {
        if (event.type === 'keydown' && event.key !== 'Enter') return;
        state.setSelection({
          type: 'evidence',
          id: edge.topic === 'arise' ? 'ev_arise_email_forward' : edge.topic === 'ipo' ? 'ev_ipo_email_perception' : 'ev_employee_isia_security',
        });
      })
      .append('title')
      .text((edge) => `${edge.datetime} - ${edge.sourceLabel} -> ${edge.targetLabel} - ${edge.subject}`);

    const node = svg
      .append('g')
      .attr('class', 'email-participants')
      .selectAll('g')
      .data(participants)
      .join('g')
      .attr('transform', (item) => `translate(${x(item.id)}, ${y})`);

    node.append('circle').attr('r', 8);
    node
      .append('text')
      .attr('transform', 'rotate(-40)')
      .attr('x', 13)
      .attr('y', 5)
      .text((item) => item.label);

    container.querySelector('.email-summary').innerHTML = `
      <div class="signal-chip">
        ${iconSvg(RadioTower, { width: 16, height: 16 })}
        Showing ${emails.length} anomalous edges across ${participants.length} participants.
      </div>
      <div class="mini-table" role="table" aria-label="Email evidence rows">
        ${emails
          .slice(0, 8)
          .map(
            (edge) => `
              <button type="button" class="mini-row" data-topic="${edge.topic}">
                <span>${edge.date}</span>
                <strong>${edge.sourceLabel}</strong>
                <span>${edge.targetLabel}</span>
                <span>${edge.subject}</span>
              </button>
            `,
          )
          .join('')}
      </div>
    `;

    container.querySelectorAll('.mini-row').forEach((row) => {
      row.addEventListener('click', () => {
        const topic = row.dataset.topic;
        state.setSelection({
          type: 'evidence',
          id: topic === 'arise' ? 'ev_arise_email_forward' : topic === 'ipo' ? 'ev_ipo_email_perception' : 'ev_employee_isia_security',
        });
      });
    });
  }

  state.subscribe(render);
  render(state.get());
}
