import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

// Matches 【4:0†QRH_737 (1).pdf】
const BRACKET_LINK_REGEX = /【(\d+:\d+)†([^】]+?)】/g;

const remarkCustomBracketLinks: Plugin = () => (tree) => {
  visit(tree, 'text', (node, index, parent) => {
    const textNode = node as { value: string };
    if (typeof textNode.value !== 'string') return;

    const matches = [...textNode.value.matchAll(BRACKET_LINK_REGEX)];
    if (matches.length === 0) return;

    const newChildren = [];
    let lastIndex = 0;

    for (const match of matches) {
      const [full, page, filename] = match;
      const start = match.index!;
      const end = start + full.length;

      // Text before match
      if (start > lastIndex) {
        newChildren.push({
          type: 'text',
          value: textNode.value.slice(lastIndex, start),
        });
      }

      // Custom node for the bracket link
      newChildren.push({
        type: 'customBracketLink',
        data: {
          page,
          filename,
          value: full,
        },
      });

      lastIndex = end;
    }

    // Text after last match
    if (lastIndex < textNode.value.length) {
      newChildren.push({
        type: 'text',
        value: textNode.value.slice(lastIndex),
      });
    }

    // Replace the node in the parent
    const parentNode = parent as { children: any[] };
    if (parentNode && Array.isArray(parentNode.children)) {
      parentNode.children.splice(index!, 1, ...newChildren);
    }
  });
};

export default remarkCustomBracketLinks; 