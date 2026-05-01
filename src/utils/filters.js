import { rankEvidenceItems } from './evidenceScoring.js';

function edgeEndpointId(endpoint) {
  return typeof endpoint === 'object' ? endpoint.id : endpoint;
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function dateInRange(date, range) {
  if (!range?.[0] || !range?.[1] || !date) return true;
  const value = new Date(date).getTime();
  const start = new Date(range[0]).getTime();
  const end = new Date(range[1]).getTime();

  return Number.isFinite(value) && value >= start && value <= end;
}

function edgeMatchesSearch(edge, indexes, query) {
  const search = normalizeText(query);
  if (!search) return true;

  const source = indexes.nodeById.get(edgeEndpointId(edge.source));
  const target = indexes.nodeById.get(edgeEndpointId(edge.target));
  const evidenceText = (edge.evidenceIds ?? [])
    .map((id) => indexes.evidenceById.get(id))
    .filter(Boolean)
    .map((item) => `${item.title} ${item.source} ${item.snippet}`)
    .join(' ');

  const haystack = normalizeText(
    `${edge.id} ${edge.relation} ${edge.confidence} ${source?.label} ${target?.label} ${evidenceText}`,
  );

  return haystack.includes(search);
}

function edgeMatchesHypothesis(edge, activeHypothesis) {
  if (!activeHypothesis) return true;
  return activeHypothesis.edgeIds?.includes(edge.id);
}

function edgeMatchesTopic(edge, topic) {
  if (!topic || topic === 'all') return true;
  return edge.topics?.includes(topic);
}

function materializeNodes(edges, indexes, activeHypothesis) {
  const usedIds = new Set();

  for (const edge of edges) {
    usedIds.add(edgeEndpointId(edge.source));
    usedIds.add(edgeEndpointId(edge.target));
  }

  if (activeHypothesis && edges.length === 0) {
    for (const id of activeHypothesis.nodeIds ?? []) usedIds.add(id);
  }

  return [...usedIds].map((id) => indexes.nodeById.get(id)).filter(Boolean);
}

export function filterRelationshipGraph(bundle, indexes, filters = {}) {
  const activeHypothesis = filters.hypothesisId
    ? indexes.hypothesisById.get(filters.hypothesisId)
    : null;

  const edges = bundle.edges.filter((edge) => {
    return (
      edgeMatchesHypothesis(edge, activeHypothesis) &&
      edgeMatchesTopic(edge, filters.topic) &&
      dateInRange(edge.date, filters.timeRange) &&
      edgeMatchesSearch(edge, indexes, filters.search)
    );
  });

  return {
    nodes: materializeNodes(edges, indexes, activeHypothesis),
    edges,
  };
}

export function getNeighborNodeIds(nodeId, edges) {
  const neighbors = new Set();

  for (const edge of edges) {
    const source = edgeEndpointId(edge.source);
    const target = edgeEndpointId(edge.target);

    if (source === nodeId) neighbors.add(target);
    if (target === nodeId) neighbors.add(source);
  }

  return neighbors;
}

function evidenceForEdge(edge, indexes) {
  return (edge?.evidenceIds ?? []).map((id) => indexes.evidenceById.get(id)).filter(Boolean);
}

function evidenceForNode(nodeId, bundle, indexes) {
  const evidence = [];

  for (const edge of bundle.edges) {
    if (edgeEndpointId(edge.source) === nodeId || edgeEndpointId(edge.target) === nodeId) {
      evidence.push(...evidenceForEdge(edge, indexes));
    }
  }

  return evidence;
}

export function getEvidenceForSelection(selection, bundle, indexes) {
  if (!selection?.id) return [];

  let evidence = [];

  if (selection.type === 'edge') {
    evidence = evidenceForEdge(indexes.edgeById.get(selection.id), indexes);
  } else if (selection.type === 'event') {
    const event = indexes.eventById.get(selection.id);
    evidence = (event?.evidenceIds ?? []).map((id) => indexes.evidenceById.get(id)).filter(Boolean);
  } else if (selection.type === 'evidence') {
    const item = indexes.evidenceById.get(selection.id);
    evidence = item ? [item] : [];
  } else {
    evidence = evidenceForNode(selection.id, bundle, indexes);
  }

  const deduped = new Map();
  for (const item of evidence) deduped.set(item.id, item);

  return rankEvidenceItems([...deduped.values()]);
}

export function filterEvents(events, filters = {}) {
  return events.filter((event) => {
    const topicMatch = !filters.topic || filters.topic === 'all' || event.type === filters.topic;
    const timeMatch = dateInRange(event.date, filters.timeRange);
    const search = normalizeText(filters.search);
    const textMatch = !search || normalizeText(`${event.label} ${event.type}`).includes(search);

    return topicMatch && timeMatch && textMatch;
  });
}
