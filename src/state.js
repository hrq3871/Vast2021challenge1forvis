const DEFAULT_STATE = {
  activeView: 'overview',
  search: '',
  topic: 'all',
  timeRange: null,
  hypothesisId: null,
  selection: null,
};

function cloneState(state) {
  return {
    ...state,
    timeRange: state.timeRange ? [...state.timeRange] : null,
    selection: state.selection ? { ...state.selection } : null,
  };
}

export function createAppState(initialState = {}) {
  let state = { ...DEFAULT_STATE, ...initialState };
  const subscribers = new Set();

  function emit() {
    const snapshot = cloneState(state);
    for (const subscriber of subscribers) subscriber(snapshot);
  }

  function update(patch) {
    state = { ...state, ...patch };
    emit();
  }

  return {
    get() {
      return cloneState(state);
    },
    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    setActiveView(activeView) {
      update({ activeView, selection: null });
    },
    setSearch(search) {
      update({ search: search.trim() });
    },
    setTopic(topic) {
      update({ topic, selection: null });
    },
    setTimeRange(timeRange) {
      update({ timeRange: timeRange ? [...timeRange] : null, selection: null });
    },
    setHypothesis(hypothesisId) {
      update({ hypothesisId, selection: null });
    },
    setSelection(selection) {
      update({ selection: selection ? { ...selection } : null });
    },
    clearSelection() {
      update({ selection: null });
    },
    reset() {
      state = { ...DEFAULT_STATE };
      emit();
    },
  };
}
