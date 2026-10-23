import type { Item } from '../items/index.js';
import type { Finding, Line } from '../scan/index.js';
import { citations } from './citations.js';
import { lookup } from './lookup.js';
import { referenceLines, references } from './references.js';

/**
 * Resolves a plan's citations and references against its items. A citation, `[C3 (one-writer)]`,
 * counts anywhere outside code and comments and must name an item with its current slug; a bare ID
 * outside brackets is plain text. A reference, `superseded-by: D9` or `resolved-by: D9`, must name a
 * decision. Each variant resolves like its usual form, with an alternate-form note.
 */
export const resolveCitations = (lines: readonly Line[], items: readonly Item[]): Finding[] => {
  const byId = lookup(items);
  return [
    ...citations(lines, byId, referenceLines(items)),
    ...references(items, byId),
  ].toSorted((a, b) => a.line - b.line);
};
