function attrsToString(attrs) {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${String(value)}"`)
    .join(' ');
}

function nodeToSvg([tag, attrs = {}, children = []]) {
  const attrText = attrsToString(attrs);
  if (!children.length) return `<${tag} ${attrText}></${tag}>`;
  return `<${tag} ${attrText}>${children.map(nodeToSvg).join('')}</${tag}>`;
}

export function iconSvg(iconNode, attrs = {}) {
  const [, baseAttrs, children] = iconNode;
  return nodeToSvg([
    'svg',
    {
      ...baseAttrs,
      width: attrs.width ?? 18,
      height: attrs.height ?? 18,
      'aria-hidden': attrs['aria-hidden'] ?? 'true',
      class: attrs.class ?? 'lucide-icon',
    },
    children,
  ]);
}
