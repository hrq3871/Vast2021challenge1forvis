const REQUIRED_COLLECTIONS = ['employees', 'emailEdges', 'nodes', 'edges', 'events', 'evidence', 'hypotheses'];

export function validateBundle(bundle) {
  if (!bundle || typeof bundle !== 'object') {
    throw new Error('Task 3 data bundle must be an object.');
  }

  for (const key of REQUIRED_COLLECTIONS) {
    if (!Array.isArray(bundle[key])) {
      throw new Error(`Task 3 data bundle is missing required array: ${key}`);
    }
  }
}

function indexById(items, collectionName) {
  const index = new Map();

  for (const item of items) {
    if (!item?.id) {
      throw new Error(`${collectionName} contains an item without id.`);
    }

    if (index.has(item.id)) {
      throw new Error(`${collectionName} contains duplicate id: ${item.id}`);
    }

    index.set(item.id, item);
  }

  return index;
}

export function buildIndexes(bundle) {
  validateBundle(bundle);

  return {
    nodeById: indexById(bundle.nodes, 'nodes'),
    edgeById: indexById(bundle.edges, 'edges'),
    eventById: indexById(bundle.events, 'events'),
    evidenceById: indexById(bundle.evidence, 'evidence'),
    hypothesisById: indexById(bundle.hypotheses, 'hypotheses'),
  };
}

async function fetchJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load ${path}: HTTP ${response.status}`);
  }

  return response.json();
}

async function loadSplitBundle(basePath) {
  const [employees, emailEdges, nodes, edges, events, evidence, hypotheses] = await Promise.all([
    fetchJson(`${basePath}/employees.json`),
    fetchJson(`${basePath}/email_edges.json`),
    fetchJson(`${basePath}/relationship_nodes.json`),
    fetchJson(`${basePath}/relationship_edges.json`),
    fetchJson(`${basePath}/timeline_events.json`),
    fetchJson(`${basePath}/evidence_items.json`),
    fetchJson(`${basePath}/hypotheses.json`),
  ]);

  return {
    metadata: { source: 'split-json' },
    employees,
    emailEdges,
    nodes,
    edges,
    events,
    evidence,
    hypotheses,
  };
}

function normalizeBundle(bundle) {
  return {
    ...bundle,
    employees: bundle.employees ?? [],
    emailEdges: bundle.emailEdges ?? bundle.email_edges ?? [],
    nodes: bundle.nodes ?? [],
    edges: bundle.edges ?? [],
    events: bundle.events ?? [],
    evidence: bundle.evidence ?? [],
    hypotheses: bundle.hypotheses ?? [],
  };
}

export async function loadTask3Bundle(basePath = './data') {
  let bundle;

  try {
    bundle = await fetchJson(`${basePath}/task3_bundle.json`);
  } catch (error) {
    bundle = await loadSplitBundle(basePath);
  }

  bundle = normalizeBundle(bundle);
  const indexes = buildIndexes(bundle);

  return { bundle, indexes };
}
