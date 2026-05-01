import * as d3 from 'd3';
import { filterRelationshipGraph, getNeighborNodeIds } from '../utils/filters.js';
import { CONFIDENCE_STYLES, colorForGroup, relationLabel, shapeForNodeType } from '../utils/colors.js';

function endpointId(endpoint) {
  return typeof endpoint === 'object' ? endpoint.id : endpoint;
}

function effectiveTopic(snapshot) {
  if (snapshot.topic !== 'all') return snapshot.topic;
  if (snapshot.activeView === 'official') return 'official_partnership';
  if (snapshot.activeView === 'pok') return 'pok_motive';
  return 'all';
}

function nodeShape(selection, node) {
  const shape = shapeForNodeType(node.type);
  const fill = colorForGroup(node.group);

  if (shape === 'rounded-rect') {
    selection
      .append('rect')
      .attr('x', -46)
      .attr('y', -19)
      .attr('width', 92)
      .attr('height', 38)
      .attr('rx', 7)
      .attr('fill', fill);
  } else if (shape === 'diamond') {
    selection.append('path').attr('d', 'M0,-28 L38,0 L0,28 L-38,0 Z').attr('fill', fill);
  } else if (shape === 'hex') {
    selection.append('path').attr('d', 'M-32,-18 L0,-32 L32,-18 L32,18 L0,32 L-32,18 Z').attr('fill', fill);
  } else {
    selection.append('circle').attr('r', 23).attr('fill', fill);
  }
}

function drawLegend(svg) {
  const legend = svg.append('g').attr('class', 'graph-legend').attr('transform', 'translate(22, 22)');
  const rows = [
    ['circle', 'Person'],
    ['rounded-rect', 'Organization'],
    ['diamond', 'Event'],
    ['hex', 'Topic'],
  ];

  legend.append('text').attr('class', 'legend-title').attr('x', 0).attr('y', 0).text('Encoding');
  rows.forEach(([shape, label], index) => {
    const row = legend.append('g').attr('transform', `translate(0, ${24 + index * 24})`);
    if (shape === 'circle') row.append('circle').attr('r', 7).attr('cx', 8).attr('cy', 0);
    if (shape === 'rounded-rect') row.append('rect').attr('width', 16).attr('height', 12).attr('x', 0).attr('y', -6).attr('rx', 3);
    if (shape === 'diamond') row.append('path').attr('d', 'M8,-8 L16,0 L8,8 L0,0 Z');
    if (shape === 'hex') row.append('path').attr('d', 'M2,-6 L8,-10 L14,-6 L14,6 L8,10 L2,6 Z');
    row.append('text').attr('x', 28).attr('y', 4).text(label);
  });

  const lineRows = [
    ['confirmed', 'confirmed'],
    ['probable', 'probable'],
    ['hypothesis', 'hypothesis'],
  ];
  lineRows.forEach(([confidence, label], index) => {
    const y = 136 + index * 22;
    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 22)
      .attr('y1', y)
      .attr('y2', y)
      .attr('class', `legend-line ${CONFIDENCE_STYLES[confidence].className}`)
      .attr('stroke-dasharray', CONFIDENCE_STYLES[confidence].dasharray);
    legend.append('text').attr('x', 28).attr('y', y + 4).text(label);
  });
}

export function createRelationshipGraph(container, state, bundle, indexes) {
  let simulation = null;

  function render(snapshot) {
    if (simulation) simulation.stop();

    const width = Math.max(container.getBoundingClientRect().width || 760, 520);
    const height = Math.max(container.getBoundingClientRect().height || 560, 440);
    const graph = filterRelationshipGraph(bundle, indexes, {
      ...snapshot,
      topic: effectiveTopic(snapshot),
    });
    const activeHypothesis = snapshot.hypothesisId
      ? indexes.hypothesisById.get(snapshot.hypothesisId)
      : null;
    const activeEdgeIds = new Set(activeHypothesis?.edgeIds ?? []);
    const activeNodeIds = new Set(activeHypothesis?.nodeIds ?? []);
    const selectedNodeId = snapshot.selection?.type === 'node' ? snapshot.selection.id : null;
    const neighborIds = selectedNodeId ? getNeighborNodeIds(selectedNodeId, bundle.edges) : new Set();
    const selectedEdgeId = snapshot.selection?.type === 'edge' ? snapshot.selection.id : null;

    container.innerHTML = '';

    if (!graph.edges.length) {
      container.innerHTML = `
        <div class="empty-state graph-empty">
          <h3>No relationships match the current filters</h3>
          <p>Clear search, reset topic, or switch hypothesis path to broaden the investigation.</p>
        </div>
      `;
      return;
    }

    const svg = d3
      .select(container)
      .append('svg')
      .attr('class', 'relationship-svg')
      .attr('role', 'img')
      .attr('aria-label', 'Interactive relationship graph for GAStech, POK, APA, Government, and related people.')
      .attr('viewBox', [0, 0, width, height].join(' '));

    const zoomLayer = svg.append('g').attr('class', 'zoom-layer');
    const linkLayer = zoomLayer.append('g').attr('class', 'link-layer');
    const nodeLayer = zoomLayer.append('g').attr('class', 'node-layer');
    drawLegend(svg);

    svg.call(
      d3
        .zoom()
        .scaleExtent([0.45, 2.4])
        .on('zoom', (event) => zoomLayer.attr('transform', event.transform)),
    );

    const nodes = graph.nodes.map((node) => ({ ...node }));
    const links = graph.edges.map((edge) => ({ ...edge, source: endpointId(edge.source), target: endpointId(edge.target) }));

    simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((node) => node.id)
          .distance((link) => (link.confidence === 'hypothesis' ? 180 : 140))
          .strength(0.65),
      )
      .force('charge', d3.forceManyBody().strength(-540))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((node) => (node.type === 'organization' ? 76 : 52)));

    const link = linkLayer
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', (edge) => {
        const confidence = CONFIDENCE_STYLES[edge.confidence]?.className ?? '';
        const path = activeEdgeIds.has(edge.id) ? ' is-path' : '';
        const selected = selectedEdgeId === edge.id ? ' is-selected' : '';
        return `graph-link ${confidence}${path}${selected}`;
      })
      .attr('stroke-dasharray', (edge) => CONFIDENCE_STYLES[edge.confidence]?.dasharray ?? '')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (edge) => `${relationLabel(edge.relation)} relationship`)
      .on('click keydown', (event, edge) => {
        if (event.type === 'keydown' && event.key !== 'Enter') return;
        event.stopPropagation();
        state.setSelection({ type: 'edge', id: edge.id });
      });

    link.append('title').text((edge) => `${relationLabel(edge.relation)} - ${edge.confidence}`);

    const node = nodeLayer
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', (item) => {
        const focused =
          item.id === selectedNodeId || neighborIds.has(item.id) || activeNodeIds.has(item.id) || !selectedNodeId;
        return `graph-node node-${item.type}${focused ? '' : ' is-dim'}${activeNodeIds.has(item.id) ? ' is-path' : ''}${
          item.id === selectedNodeId ? ' is-selected' : ''
        }`;
      })
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (item) => `${item.label}, ${item.type}`)
      .call(
        d3
          .drag()
          .on('start', (event) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          })
          .on('drag', (event) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          })
          .on('end', (event) => {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          }),
      )
      .on('click keydown', (event, item) => {
        if (event.type === 'keydown' && event.key !== 'Enter') return;
        event.stopPropagation();
        state.setSelection({ type: 'node', id: item.id });
      });

    node.each(function draw(item) {
      const group = d3.select(this);
      nodeShape(group, item);
      group.append('title').text(`${item.label} - ${item.group}`);
      group
        .append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('y', item.type === 'organization' ? 5 : 43)
        .text(item.label);
      if (item.role) {
        group
          .append('text')
          .attr('class', 'node-role')
          .attr('text-anchor', 'middle')
          .attr('y', item.type === 'organization' ? 34 : 61)
          .text(item.role);
      }
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (edge) => edge.source.x)
        .attr('y1', (edge) => edge.source.y)
        .attr('x2', (edge) => edge.target.x)
        .attr('y2', (edge) => edge.target.y);

      node.attr('transform', (item) => `translate(${item.x},${item.y})`);
    });
  }

  const resizeObserver = new ResizeObserver(() => render(state.get()));
  resizeObserver.observe(container);
  state.subscribe(render);
  render(state.get());
}
