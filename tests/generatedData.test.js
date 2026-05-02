import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildIndexes, validateBundle } from '../src/dataLoader.js';

function loadGeneratedBundle() {
  const filePath = resolve(process.cwd(), 'public/data/task3_bundle.json');
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function endpointId(endpoint) {
  return typeof endpoint === 'object' ? endpoint.id : endpoint;
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

  it('does not contain dangling graph, event, evidence, or hypothesis references', () => {
    const bundle = loadGeneratedBundle();
    const indexes = buildIndexes(bundle);

    for (const edge of bundle.edges) {
      expect(indexes.nodeById.has(endpointId(edge.source)), edge.id).toBe(true);
      expect(indexes.nodeById.has(endpointId(edge.target)), edge.id).toBe(true);
      for (const evidenceId of edge.evidenceIds ?? []) {
        expect(indexes.evidenceById.has(evidenceId), edge.id).toBe(true);
      }
    }

    for (const event of bundle.events) {
      for (const nodeId of event.nodeIds ?? []) {
        expect(indexes.nodeById.has(nodeId), event.id).toBe(true);
      }
      for (const evidenceId of event.evidenceIds ?? []) {
        expect(indexes.evidenceById.has(evidenceId), event.id).toBe(true);
      }
    }

    for (const hypothesis of bundle.hypotheses) {
      for (const nodeId of hypothesis.nodeIds ?? []) {
        expect(indexes.nodeById.has(nodeId), hypothesis.id).toBe(true);
      }
      for (const edgeId of hypothesis.edgeIds ?? []) {
        expect(indexes.edgeById.has(edgeId), hypothesis.id).toBe(true);
      }
      for (const eventId of hypothesis.eventIds ?? []) {
        expect(indexes.eventById.has(eventId), hypothesis.id).toBe(true);
      }
      for (const evidenceId of hypothesis.evidenceIds ?? []) {
        expect(indexes.evidenceById.has(evidenceId), hypothesis.id).toBe(true);
      }
    }
  });

  it('keeps APA/Arise material as hypothesis-strength rather than confirmed', () => {
    const bundle = loadGeneratedBundle();
    const apaEdges = bundle.edges.filter((edge) => edge.topics?.includes('arise'));

    expect(apaEdges.length).toBeGreaterThan(0);
    expect(apaEdges.every((edge) => edge.confidence === 'hypothesis')).toBe(true);
  });
});
