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

const LANE_COLORS = {
  Official: '#22c55e',
  'POK Motive': '#ef4444',
  Email: '#a78bfa',
  Kidnapping: '#f59e0b',
};

function effectiveTimelineTopic(snapshot) {
  if (snapshot.topic !== 'all') return snapshot.topic;
  if (snapshot.activeView === 'official') return 'government_reception';
  if (snapshot.activeView === 'pok') return 'pollution';
  return 'all';
}

export function createTimelineView(container, state, bundle, indexes) {
  function render(snapshot) {
    const events = filterEvents(bundle.events, {
      ...snapshot,
      topic: effectiveTimelineTopic(snapshot),
    });

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

    // Group events by lane
    const laneNames = ['Official', 'POK Motive', 'Email', 'Kidnapping'];
    const laneForType = (type) => {
      if (type === 'official_partnership' || type === 'government_reception' || type === 'ipo') return 'Official';
      if (type === 'email_anomaly') return 'Email';
      if (type === 'kidnapping') return 'Kidnapping';
      return 'POK Motive';
    };

    const eventsByLane = new Map();
    laneNames.forEach((lane) => eventsByLane.set(lane, []));
    events.forEach((event) => {
      const lane = laneForType(event.type);
      eventsByLane.get(lane).push(event);
    });

    // Sort events by date in each lane
    laneNames.forEach((lane) => {
      eventsByLane.get(lane).sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // Build vertical timeline HTML
    const timelineHTML = laneNames.map((lane) => {
      const laneEvents = eventsByLane.get(lane);
      const laneColor = LANE_COLORS[lane];

      const eventsHTML = laneEvents.map((event) => {
        const isSelected = snapshot.selection?.id === event.id;
        const group = EVENT_GROUP[event.type];
        const dotColor = colorForGroup(group);

        return `
          <div class="timeline-event-item ${isSelected ? 'is-selected' : ''}"
               data-event-id="${event.id}"
               tabindex="0"
               role="button"
               aria-label="${event.label}">
            <div class="timeline-event-dot" style="background-color: ${dotColor}"></div>
            <div class="timeline-event-card">
              <div class="timeline-event-date">${event.date}</div>
              <div class="timeline-event-label">${event.label}</div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="timeline-lane" data-lane="${lane}">
          <div class="timeline-lane-header" style="border-color: ${laneColor}">
            <span class="timeline-lane-title" style="color: ${laneColor}">${lane}</span>
          </div>
          <div class="timeline-lane-events">
            ${eventsHTML || '<div class="timeline-empty">No events</div>'}
          </div>
        </div>
      `;
    }).join('');

    scrollContainer.innerHTML = `<div class="timeline-lanes-grid">${timelineHTML}</div>`;

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