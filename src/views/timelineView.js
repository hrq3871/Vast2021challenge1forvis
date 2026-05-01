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

export function createTimelineView(container, state, bundle, indexes) {
  function render(snapshot) {
    const width = Math.max(container.getBoundingClientRect().width || 900, 640);
    const height = 164;
    const margin = { top: 26, right: 24, bottom: 34, left: 26 };
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
    `;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('class', 'timeline-svg')
      .attr('viewBox', [0, 0, width, height].join(' '))
      .attr('role', 'img')
      .attr('aria-label', 'Timeline of official deals, POK motive, email anomalies, and kidnapping events.');

    const x = d3
      .scaleTime()
      .domain([new Date('1993-01-01'), new Date('2014-01-31')])
      .range([margin.left, width - margin.right]);

    const laneNames = ['Official', 'POK Motive', 'Email', 'Kidnapping'];
    const y = d3
      .scalePoint()
      .domain(laneNames)
      .range([margin.top + 16, height - margin.bottom - 18]);

    const laneForType = (type) => {
      if (type === 'official_partnership' || type === 'government_reception' || type === 'ipo') return 'Official';
      if (type === 'email_anomaly') return 'Email';
      if (type === 'kidnapping') return 'Kidnapping';
      return 'POK Motive';
    };

    svg
      .append('g')
      .attr('class', 'timeline-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(7).tickSizeOuter(0));

    const lanes = svg.append('g').attr('class', 'timeline-lanes');
    laneNames.forEach((lane) => {
      lanes
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', y(lane))
        .attr('y2', y(lane));
      lanes.append('text').attr('x', margin.left).attr('y', y(lane) - 9).text(lane);
    });

    const brush = d3
      .brushX()
      .extent([
        [margin.left, height - margin.bottom + 10],
        [width - margin.right, height - 4],
      ])
      .on('end', (event) => {
        if (!event.selection) return;
        const [start, end] = event.selection.map(x.invert);
        state.setTimeRange([start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]);
      });

    svg.append('g').attr('class', 'timeline-brush').call(brush);

    const eventGroup = svg.append('g').attr('class', 'timeline-events');
    const points = eventGroup
      .selectAll('g')
      .data(events)
      .join('g')
      .attr('class', (event) => `timeline-event ${snapshot.selection?.id === event.id ? 'is-selected' : ''}`)
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (event) => event.label)
      .attr('transform', (event) => `translate(${x(new Date(event.date))}, ${y(laneForType(event.type))})`)
      .on('click keydown', (event, item) => {
        if (event.type === 'keydown' && event.key !== 'Enter') return;
        event.stopPropagation();
        state.setSelection({ type: 'event', id: item.id });
      });

    points
      .append('circle')
      .attr('r', (event) => (event.type === 'kidnapping' ? 9 : 7))
      .attr('fill', (event) => colorForGroup(EVENT_GROUP[event.type]));

    points
      .append('text')
      .attr('x', 11)
      .attr('y', 4)
      .text((event) => event.label);

    points.append('title').text((event) => `${event.date} - ${event.label}`);

    container.querySelector('#clear-time')?.addEventListener('click', () => state.setTimeRange(null));
  }

  state.subscribe(render);
  render(state.get());
}
