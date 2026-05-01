import { describe, expect, it } from 'vitest';
import { createAppState } from '../src/state.js';

describe('application state', () => {
  it('updates filters, notifies subscribers, and clears transient selections', () => {
    const state = createAppState();
    const snapshots = [];
    const unsubscribe = state.subscribe((snapshot) => snapshots.push(snapshot));

    state.setSearch('Sanjorge');
    state.setTopic('kidnapping');
    state.setHypothesis('h_sanjorge_target');
    state.setSelection({ type: 'node', id: 'person_sanjorge' });

    expect(state.get()).toMatchObject({
      search: 'Sanjorge',
      topic: 'kidnapping',
      hypothesisId: 'h_sanjorge_target',
      selection: { type: 'node', id: 'person_sanjorge' },
    });

    state.clearSelection();
    unsubscribe();
    state.setSearch('ignored-after-unsubscribe');

    expect(state.get().selection).toBeNull();
    expect(snapshots.length).toBe(5);
  });

  it('reset keeps the default broad investigation state', () => {
    const state = createAppState({ search: 'Vann', topic: 'arise' });

    state.setHypothesis('h_apa_arise_weak_risk');
    state.reset();

    expect(state.get()).toEqual({
      activeView: 'overview',
      search: '',
      topic: 'all',
      timeRange: null,
      hypothesisId: null,
      selection: null,
    });
  });
});
