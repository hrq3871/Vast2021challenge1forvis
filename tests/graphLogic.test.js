import { describe, expect, it } from 'vitest';
import { buildIndexes, validateBundle } from '../src/dataLoader.js';
import {
  filterRelationshipGraph,
  filterEvents,
  getEvidenceForSelection,
  getNeighborNodeIds,
} from '../src/utils/filters.js';
import { filterEmails } from '../src/views/emailNetwork.js';
import { buildCurvedTimelineLayout, sortTimelineEvents } from '../src/views/timelineView.js';
import { rankEvidenceItems, summarizeConfidence } from '../src/utils/evidenceScoring.js';

const sampleBundle = {
  nodes: [
    { id: 'person_sanjorge', label: 'Sten Sanjorge Jr.', type: 'person', group: 'GAStech' },
    { id: 'org_gastech', label: 'GAStech', type: 'organization', group: 'GAStech' },
    { id: 'org_government', label: 'Kronos Government', type: 'organization', group: 'Government' },
    { id: 'org_pok', label: 'POK', type: 'organization', group: 'POK' },
    { id: 'person_isia_vann', label: 'Isia Vann', type: 'person', group: 'GAStech' },
  ],
  edges: [
    {
      id: 'edge_sanjorge_government',
      source: 'person_sanjorge',
      target: 'org_government',
      relation: 'official_partnership',
      confidence: 'confirmed',
      evidenceIds: ['ev_reception'],
      topics: ['government_reception'],
      date: '2014-01-20',
    },
    {
      id: 'edge_pok_gastech_conflict',
      source: 'org_pok',
      target: 'org_gastech',
      relation: 'conflict',
      confidence: 'confirmed',
      evidenceIds: ['ev_pollution'],
      topics: ['pollution', 'pok_motive'],
      date: '1997-04-01',
    },
    {
      id: 'edge_isia_pok',
      source: 'person_isia_vann',
      target: 'org_pok',
      relation: 'family_or_personal_link',
      confidence: 'probable',
      evidenceIds: ['ev_isia'],
      topics: ['pok_motive', 'personal_bridge'],
      date: '2009-01-01',
    },
  ],
  events: [
    {
      id: 'event_kidnapping',
      label: 'GAStech leadership kidnapped',
      date: '2014-01-20',
      type: 'kidnapping',
      evidenceIds: ['ev_reception'],
    },
  ],
  evidence: [
    {
      id: 'ev_reception',
      title: 'Government reception and Sanjorge',
      source: 'Kronos Star/174.txt',
      sourceRole: 'primary-like',
      confidence: 'confirmed',
      biasWarning: 'low',
      date: '2014-01-20',
      snippet: 'Sanjorge was expected at a government reception.',
    },
    {
      id: 'ev_pollution',
      title: 'POK origin after water pollution',
      source: 'HistoricalDocuments/10 year historical document clean.docx',
      sourceRole: 'historical',
      confidence: 'confirmed',
      biasWarning: 'none',
      date: '1997-04-01',
      snippet: 'POK formed after water contamination.',
    },
    {
      id: 'ev_isia',
      title: 'Isia Vann family and POK tie',
      source: 'HistoricalDocuments/5 year report clean.docx',
      sourceRole: 'historical',
      confidence: 'probable',
      biasWarning: 'medium',
      date: '2009-01-01',
      snippet: 'Isia Vann was linked to Juliana and Mandor Vann.',
    },
  ],
  hypotheses: [
    {
      id: 'h_sanjorge_target',
      title: 'Sanjorge as target',
      nodeIds: ['person_sanjorge', 'org_gastech', 'org_government'],
      edgeIds: ['edge_sanjorge_government'],
      evidenceIds: ['ev_reception'],
    },
  ],
};

describe('Task 3 graph data logic', () => {
  it('validates required bundle arrays and builds stable indexes', () => {
    expect(() => validateBundle(sampleBundle)).not.toThrow();

    const indexes = buildIndexes(sampleBundle);

    expect(indexes.nodeById.get('person_sanjorge').label).toBe('Sten Sanjorge Jr.');
    expect(indexes.edgeById.get('edge_isia_pok').relation).toBe('family_or_personal_link');
    expect(indexes.evidenceById.get('ev_pollution').source).toContain('HistoricalDocuments');
  });

  it('throws a readable error when a required bundle collection is missing', () => {
    expect(() => validateBundle({ nodes: [] })).toThrow(/edges/);
  });

  it('filters graph by hypothesis, topic, time range, and full-text search', () => {
    const indexes = buildIndexes(sampleBundle);

    const hypothesisGraph = filterRelationshipGraph(sampleBundle, indexes, {
      hypothesisId: 'h_sanjorge_target',
      topic: 'government_reception',
      timeRange: ['2014-01-01', '2014-01-31'],
      search: 'Sanjorge',
    });

    expect(hypothesisGraph.edges.map((edge) => edge.id)).toEqual(['edge_sanjorge_government']);
    expect(hypothesisGraph.nodes.map((node) => node.id).sort()).toEqual([
      'org_government',
      'person_sanjorge',
    ]);

    const pokGraph = filterRelationshipGraph(sampleBundle, indexes, {
      topic: 'pok_motive',
      timeRange: ['1990-01-01', '2010-12-31'],
      search: 'Vann',
    });

    expect(pokGraph.edges.map((edge) => edge.id)).toEqual(['edge_isia_pok']);
    expect(pokGraph.nodes.map((node) => node.id).sort()).toEqual(['org_pok', 'person_isia_vann']);
  });

  it('searches timeline events through linked nodes and evidence text', () => {
    const indexes = buildIndexes(sampleBundle);

    const sanjorgeEvents = filterEvents(
      sampleBundle.events,
      {
        topic: 'all',
        search: 'Sanjorge',
      },
      indexes,
    );
    const evidenceEvents = filterEvents(
      sampleBundle.events,
      {
        topic: 'all',
        search: 'government reception',
      },
      indexes,
    );

    expect(sanjorgeEvents.map((event) => event.id)).toEqual(['event_kidnapping']);
    expect(evidenceEvents.map((event) => event.id)).toEqual(['event_kidnapping']);
  });

  it('keeps keyword email search broader than the default email topic lens', () => {
    const emailEdges = [
      {
        id: 'email_arise',
        source: 'person_a',
        sourceLabel: 'Ada Campo',
        sourceEmail: 'Ada.Campo@gastech.com.kronos',
        target: 'person_b',
        targetLabel: 'Ingrid Barranco',
        targetEmail: 'Ingrid.Barranco@gastech.com.kronos',
        subject: 'ARISE planning',
        topic: 'arise',
      },
      {
        id: 'email_sanjorge',
        source: 'person_sanjorge',
        sourceLabel: 'Sten Sanjorge Jr.',
        sourceEmail: 'Sten.Sanjorge Jr.@gastech.com.tethys',
        target: 'person_c',
        targetLabel: 'Orhan Strum',
        targetEmail: 'Orhan.Strum@gastech.com.kronos',
        subject: 'IPO briefing',
        topic: 'ipo',
      },
    ];

    const emails = filterEmails(emailEdges, {
      activeView: 'email',
      topic: 'all',
      search: 'Sanjorge',
    });

    expect(emails.map((edge) => edge.id)).toEqual(['email_sanjorge']);
  });

  it('sorts timeline events globally by date instead of grouping by type first', () => {
    const events = [
      { id: 'event_late_official', date: '2014-01-20', type: 'official_partnership' },
      { id: 'event_early_pok', date: '1997-01-01', type: 'pollution' },
      { id: 'event_middle_email', date: '2014-01-13', type: 'email_anomaly' },
    ];

    expect(sortTimelineEvents(events).map((event) => event.id)).toEqual([
      'event_early_pok',
      'event_middle_email',
      'event_late_official',
    ]);
    expect(events.map((event) => event.id)).toEqual([
      'event_late_official',
      'event_early_pok',
      'event_middle_email',
    ]);
  });

  it('builds a horizontal curved timeline layout without mutating input events', () => {
    const events = [
      { id: 'event_late_official', label: 'Official reception', date: '2014-01-20', type: 'official_partnership' },
      { id: 'event_early_pok', label: 'POK founded', date: '1997-01-01', type: 'pollution' },
      { id: 'event_same_day_a', label: 'Alpha email', date: '2014-01-13', type: 'email_anomaly' },
      { id: 'event_same_day_b', label: 'Beta email', date: '2014-01-13', type: 'email_anomaly' },
    ];

    const layout = buildCurvedTimelineLayout(events);

    expect(layout.events.map((event) => event.id)).toEqual([
      'event_early_pok',
      'event_same_day_a',
      'event_same_day_b',
      'event_late_official',
    ]);
    expect(events.map((event) => event.id)).toEqual([
      'event_late_official',
      'event_early_pok',
      'event_same_day_a',
      'event_same_day_b',
    ]);
    expect(layout.events[0].x).toBeLessThan(layout.events[1].x);
    expect(layout.events[1].x).toBeLessThan(layout.events[2].x);
    expect(layout.events[1].date).toBe(layout.events[2].date);
    expect(layout.events[1].side).not.toBe(layout.events[2].side);
    expect(layout.events.every((event) => Number.isFinite(event.x) && Number.isFinite(event.y))).toBe(true);
    expect(layout.path).toMatch(/^M \d+ \d+ C /);
    expect(layout.width).toBeGreaterThan(900);
  });

  it('returns evidence and first-hop neighbors for selected nodes or edges', () => {
    const indexes = buildIndexes(sampleBundle);

    expect(getNeighborNodeIds('person_isia_vann', sampleBundle.edges)).toEqual(new Set(['org_pok']));

    const nodeEvidence = getEvidenceForSelection(
      { type: 'node', id: 'person_isia_vann' },
      sampleBundle,
      indexes,
    );
    const edgeEvidence = getEvidenceForSelection(
      { type: 'edge', id: 'edge_pok_gastech_conflict' },
      sampleBundle,
      indexes,
    );

    expect(nodeEvidence.map((item) => item.id)).toEqual(['ev_isia']);
    expect(edgeEvidence.map((item) => item.id)).toEqual(['ev_pollution']);
  });

  it('ranks confirmed multi-source evidence before weaker hypothesis material', () => {
    const ranked = rankEvidenceItems(sampleBundle.evidence);

    expect(ranked[0].id).toBe('ev_pollution');
    expect(ranked.at(-1).id).toBe('ev_isia');
    expect(summarizeConfidence(sampleBundle.edges)).toEqual({
      confirmed: 2,
      probable: 1,
      hypothesis: 0,
    });
  });
});
