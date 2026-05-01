import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildIndexes, validateBundle } from '../src/dataLoader.js';

function loadGeneratedBundle() {
  const filePath = resolve(process.cwd(), 'public/data/task3_bundle.json');
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

describe('generated Task 3 data bundle', () => {
  it('contains the three required analysis hypotheses and traceable evidence', () => {
    const bundle = loadGeneratedBundle();
    validateBundle(bundle);
    const indexes = buildIndexes(bundle);

    expect(indexes.hypothesisById.has('h_sanjorge_target')).toBe(true);
    expect(indexes.hypothesisById.has('h_isia_personal_bridge')).toBe(true);
    expect(indexes.hypothesisById.has('h_apa_arise_weak_risk')).toBe(true);

    expect(indexes.nodeById.has('person_sanjorge')).toBe(true);
    expect(indexes.nodeById.has('person_isia_vann')).toBe(true);
    expect(indexes.nodeById.has('org_apa')).toBe(true);

    const evidenceSources = bundle.evidence.map((item) => item.source);
    expect(evidenceSources).toContain('HistoricalDocuments/5 year report clean.docx');
    expect(evidenceSources).toContain('News Articles/International News/689.txt');
    expect(evidenceSources).toContain('email headers.csv');
  });

  it('keeps APA/Arise material as hypothesis-strength rather than confirmed', () => {
    const bundle = loadGeneratedBundle();
    const apaEdges = bundle.edges.filter((edge) => edge.topics?.includes('arise'));

    expect(apaEdges.length).toBeGreaterThan(0);
    expect(apaEdges.every((edge) => edge.confidence === 'hypothesis')).toBe(true);
  });
});
