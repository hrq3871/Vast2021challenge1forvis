import * as d3 from 'd3';
import { CalendarRange } from 'lucide';
import { filterEvents } from '../utils/filters.js';
import { colorForGroup } from '../utils/colors.js';
import { iconSvg } from '../utils/icons.js';

const EVENT_GROUP = {
  official_partnership: 'Government',
  government_reception: 'Government',
  pollution: 'POK',
  personal_bridge: 'POK',
  email_anomaly: 'APA',
  ipo: 'GAStech',
  kidnapping: 'Conflict',
};

function effectiveTimelineTopic(snapshot) {
  if (snapshot.topic !== 'all') return snapshot.topic;
  return 'all';
}

function timelineTypeLabel(type) {
  return String(type ?? 'event').replaceAll('_', ' ');
}

function clampLabelY(y, height) {
  return Math.max(10, Math.min(height - 76, y));
}

function curvedPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${Math.round(points[0].x)} ${Math.round(points[0].y)}`;

  const [first, ...rest] = points;
  return rest.reduce((path, point, index) => {
    const previous = points[index];
    const controlX = Math.round((previous.x + point.x) / 2);
    return `${path} C ${controlX} ${Math.round(previous.y)}, ${controlX} ${Math.round(point.y)}, ${Math.round(point.x)} ${Math.round(point.y)}`;
  }, `M ${Math.round(first.x)} ${Math.round(first.y)}`);
}

export function sortTimelineEvents(events) {
  return [...events].sort((a, b) => {
    const dateDelta = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateDelta !== 0) return dateDelta;
    return String(a.label ?? a.id).localeCompare(String(b.label ?? b.id));
  });
}

export function buildCurvedTimelineLayout(events) {
  const sortedEvents = sortTimelineEvents(events);
  const marginX = 70;
  const minStep = 118;
  const height = 280;
  const centerY = 160;
  const amplitude = 20;
  const width = Math.max(680, marginX * 2 + Math.max(0, sortedEvents.length - 1) * minStep);

  const layoutEvents = sortedEvents.map((event, index) => {
    const x = marginX + index * minStep;
    const wave = sortedEvents.length <= 1 ? 0 : Math.sin((index / (sortedEvents.length - 1)) * Math.PI * 2);
    const y = Math.round(centerY + wave * amplitude);
    const side = index % 2 === 0 ? -1 : 1;
    const labelY = side < 0 ? clampLabelY(y + side * 125, height) : clampLabelY(y + side * 65, height);

    return {
      ...event,
      x,
      y,
      side,
      labelX: x,
      labelY,
      connectorEndY: side < 0 ? labelY + 95 : labelY + 2,
      color: colorForGroup(EVENT_GROUP[event.type]),
    };
  });

  return {
    width,
    height,
    path: curvedPath(layoutEvents),
    events: layoutEvents,
  };
}

export function createTimelineView(container, state, bundle, indexes) {
  function render(snapshot) {
    const events = sortTimelineEvents(filterEvents(
      bundle.events,
      {
        ...snapshot,
        topic: effectiveTimelineTopic(snapshot),
      },
      indexes,
    ));

    container.innerHTML = `
      <div class="timeline-heading">
        <div>
          <p class="eyebrow">Temporal Reasoning</p>
          <h2>${iconSvg(CalendarRange, { width: 16, height: 16 })} 1993-2014 Evidence Timeline</h2>
        </div>
        <button class="text-button" id="clear-time" type="button">Clear Time Filter</button>
      </div>
      <div class="timeline-scroll-container" id="timeline-scroll"></div>
    `;

    const scrollContainer = document.querySelector('#timeline-scroll');

    const layout = buildCurvedTimelineLayout(events);
    scrollContainer.innerHTML = events.length
      ? `
        <div class="curved-timeline-stage" style="width: ${layout.width}px; height: ${layout.height}px;">
          <svg class="curved-timeline-svg" viewBox="0 0 ${layout.width} ${layout.height}" aria-hidden="true">
            <path class="timeline-curve-shadow" d="${layout.path}"></path>
            <path class="timeline-curve-path" d="${layout.path}"></path>
            ${layout.events.map((event) => {
              const isSelected = snapshot.selection?.id === event.id;
              return `
                <line class="timeline-event-connector ${isSelected ? 'is-selected' : ''}"
                      x1="${event.x}"
                      y1="${event.y}"
                      x2="${event.labelX}"
                      y2="${event.connectorEndY}"></line>
                <circle class="timeline-event-pulse ${isSelected ? 'is-selected' : ''}"
                        cx="${event.x}"
                        cy="${event.y}"
                        r="13"></circle>
                <circle class="timeline-event-dot ${isSelected ? 'is-selected' : ''}"
                        cx="${event.x}"
                        cy="${event.y}"
                        r="7"
                        fill="${event.color}"></circle>
                <circle class="timeline-event-hit"
                        data-event-id="${event.id}"
                        cx="${event.x}"
                        cy="${event.y}"
                        r="18"></circle>
              `;
            }).join('')}
          </svg>
          ${layout.events.map((event) => {
            const isSelected = snapshot.selection?.id === event.id;
            return `
              <button class="timeline-event-label-block ${event.side < 0 ? 'is-above' : 'is-below'} ${isSelected ? 'is-selected' : ''}"
                      type="button"
                      data-event-id="${event.id}"
                      style="left: ${event.labelX}px; top: ${event.labelY}px;"
                      aria-label="${event.label}">
                <span class="timeline-event-date">${event.date}</span>
                <span class="timeline-event-label">${event.label}</span>
                <span class="timeline-event-type">${timelineTypeLabel(event.type)}</span>
              </button>
            `;
          }).join('')}
        </div>
      `
      : '<div class="timeline-empty">No events</div>';

    // Add click handlers
    scrollContainer.querySelectorAll('.timeline-event-label-block, .timeline-event-hit').forEach((item) => {
      item.addEventListener('click', () => {
        state.setSelection({ type: 'event', id: item.dataset.eventId });
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          state.setSelection({ type: 'event', id: item.dataset.eventId });
        }
      });
    });

    // Clear time filter button
    container.querySelector('#clear-time')?.addEventListener('click', () => state.setTimeRange(null));
  }

  state.subscribe(render);
  render(state.get());
}
