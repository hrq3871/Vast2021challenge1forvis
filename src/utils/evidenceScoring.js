const CONFIDENCE_SCORE = {
  confirmed: 3,
  probable: 2,
  hypothesis: 1,
  weak: 1,
};

const BIAS_SCORE = {
  none: 3,
  low: 2,
  medium: 1,
  high: 0,
};

function confidenceScore(item) {
  return CONFIDENCE_SCORE[item?.confidence] ?? 0;
}

function biasScore(item) {
  return BIAS_SCORE[item?.biasWarning] ?? 1;
}

function sourceScore(item) {
  const role = String(item?.sourceRole ?? '').toLowerCase();

  if (role.includes('historical') || role.includes('primary')) return 2;
  if (role.includes('derivative')) return 0;
  return 1;
}

export function rankEvidenceItems(items) {
  return [...items].sort((a, b) => {
    const scoreA = confidenceScore(a) * 10 + sourceScore(a) * 3 + biasScore(a);
    const scoreB = confidenceScore(b) * 10 + sourceScore(b) * 3 + biasScore(b);

    if (scoreA !== scoreB) return scoreB - scoreA;
    return String(a.date ?? '').localeCompare(String(b.date ?? ''));
  });
}

export function summarizeConfidence(edges) {
  return edges.reduce(
    (summary, edge) => {
      if (edge.confidence === 'confirmed') summary.confirmed += 1;
      else if (edge.confidence === 'probable') summary.probable += 1;
      else if (edge.confidence === 'hypothesis') summary.hypothesis += 1;
      return summary;
    },
    { confirmed: 0, probable: 0, hypothesis: 0 },
  );
}

export function confidenceLabel(confidence) {
  if (confidence === 'confirmed') return 'Confirmed';
  if (confidence === 'probable') return 'Probable';
  if (confidence === 'hypothesis') return 'Hypothesis';
  return 'Unclassified';
}
