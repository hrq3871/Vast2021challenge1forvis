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
  if (snapshot.activeView === 'official') return 'government_reception';
  if (snapshot.activeView === 'pok') return 'pollution';
  return 'all';
}

function timelineTypeLabel(type) {
  return String(type ?? 'event').replaceAll('_', ' ');
}

export function sortTimelineEvents(events) {
  return [...events].sort((a, b) => {
    const dateDelta = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateDelta !== 0) return dateDelta;
    return String(a.label ?? a.id).localeCompare(String(b.label ?? b.id));
  });
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

    const timelineHTML = events.length
      ? events
          .map((event) => {
        const isSelected = snapshot.selection?.id === event.id;
        const group = EVENT_GROUP[event.type];
        const dotColor = colorForGroup(group);

        return `
          <div class="timeline-event-item ${isSelected ? 'is-selected' : ''}"
               data-event-id="${event.id}"
               tabindex="0"
               role="button"
               aria-label="${event.label}">
            <div class="timeline-event-marker">
              <div class="timeline-event-dot" style="background-color: ${dotColor}"></div>
            </div>
            <div class="timeline-event-date">${event.date}</div>
            <div class="timeline-event-card">
              <div class="timeline-event-label">${event.label}</div>
              <div class="timeline-event-type">${timelineTypeLabel(event.type)}</div>
            </div>
          </div>
        `;
      })
          .join('')
      : '<div class="timeline-empty">No events</div>';

    scrollContainer.innerHTML = `<div class="timeline-list">${timelineHTML}</div>`;

    // Add click handlers
    scrollContainer.querySelectorAll('.timeline-event-item').forEach((item) => {
      item.addEventListener('click', () => {
        state.setSelection({ type: 'event', id: item.dataset.eventId });
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
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
