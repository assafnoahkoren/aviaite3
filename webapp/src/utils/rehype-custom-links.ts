import { visit } from 'unist-util-visit';
import type { Element, Root, Text } from 'hast';
import type { Visitor, VisitorResult } from 'unist-util-visit';

const pattern = /【([^†]*)†([^】]*)】/g;

export default function rehypeCustomLinks() {
  return (tree: Root) => {
    const visitor: Visitor<Text> = (node, index, parent): VisitorResult => {
      if (!parent || typeof index !== 'number') {
        return;
      }

      pattern.lastIndex = 0;
      if (!pattern.test(node.value)) {
        return;
      }
      
      const newChildren: (Text | Element)[] = [];
      let lastIndex = 0;
      let match;

      pattern.lastIndex = 0;

      while ((match = pattern.exec(node.value)) !== null) {
        const [fullMatch, reference, fileName] = match;
        const matchIndex = match.index;

        if (matchIndex > lastIndex) {
          newChildren.push({ type: 'text', value: node.value.slice(lastIndex, matchIndex) });
        }

        newChildren.push({
          type: 'element',
          tagName: 'a',
          properties: {
            href: '#',
            'data-reference': reference,
            className: ['custom-link'],
          },
          children: [{ type: 'text', value: fileName }],
        });

        lastIndex = matchIndex + fullMatch.length;
      }

      if (lastIndex < node.value.length) {
        newChildren.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      if (newChildren.length > 0) {
        parent.children.splice(index, 1, ...newChildren);
        return ['skip', index + newChildren.length];
      }
    };

    visit(tree, 'text', visitor);
  };
} 