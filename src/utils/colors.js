export const GROUP_COLORS = {
  GAStech: '#3b82f6',
  Government: '#22a06b',
  POK: '#ef4444',
  APA: '#8b5cf6',
  Conflict: '#f59e0b',
};

export const CONFIDENCE_STYLES = {
  confirmed: {
    label: 'confirmed',
    dasharray: '',
    className: 'confidence-confirmed',
  },
  probable: {
    label: 'probable',
    dasharray: '8 6',
    className: 'confidence-probable',
  },
  hypothesis: {
    label: 'hypothesis',
    dasharray: '2 6',
    className: 'confidence-hypothesis',
  },
};

export function colorForGroup(group) {
  return GROUP_COLORS[group] ?? '#94a3b8';
}

export function shapeForNodeType(type) {
  if (type === 'organization') return 'rounded-rect';
  if (type === 'event') return 'diamond';
  if (type === 'place') return 'pin';
  if (type === 'topic') return 'hex';
  return 'circle';
}

export function relationLabel(relation) {
  return String(relation ?? '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
