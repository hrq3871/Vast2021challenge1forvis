const REQUIRED_COLLECTIONS = ['nodes', 'edges', 'events', 'evidence', 'hypotheses'];

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

export async function loadTask3Bundle(basePath = '/data') {
  const response = await fetch(`${basePath}/task3_bundle.json`);

  if (!response.ok) {
    throw new Error(`Unable to load Task 3 data bundle: HTTP ${response.status}`);
  }

  const bundle = await response.json();
  const indexes = buildIndexes(bundle);

  return { bundle, indexes };
}
