import { readId, readSlug, type Item } from '../items/index.js';
import { finding, type Finding, type Line } from '../scan/index.js';
import { slugMismatch, type Lookup } from './lookup.js';

// An ID in square brackets, with or without a slug in parentheses, at any spacing.
const CITATION = /\[([ \t]*)([A-Za-z])(\d+)(?:([ \t]*)\(([^()[\]]*)\))?([ \t]*)\]/g;

/** A citation's usual form, such as `[C3 (one-writer)]`. */
const usual = (item: Item): string => `[${item.id} (${item.slug ?? ''})]`;

/**
 * What a bracketed ID with no slug finds. It's a citation only while its item exists, so a link
 * such as `[S3]` stays plain text, and it reads fine with a note, since it can't notice a rename.
 */
const bare = (written: string, item: Item | undefined, notes: readonly string[]): string[] =>
  item?.slug === undefined
    ? []
    : [
        `"${written}" reads fine, though it can't notice a rename; the usual form is ${usual(item)}`,
        ...notes,
      ];

/** What one citation on line `line` finds: an error, a note for each variant it uses, or nothing. */
const citation = (match: RegExpExecArray, line: number, items: Lookup): Finding[] => {
  const [written, open = '', letter = '', digits = '', beforeSlug, slugText, close = ''] = match;
  const id = readId(letter, digits);
  if (id === undefined) {
    return [];
  }
  const item = items.get(id.id);
  const note = (message: string): Finding => finding('alternate-form', line, message);
  if (slugText === undefined) {
    return bare(written, item, id.notes).map(note);
  }
  if (item === undefined) {
    return [finding('broken-citation', line, `${written} cites ${id.id}, but no item has that ID`)];
  }
  // An item with no slug has nothing to check a citation's slug against: missing-slug says so.
  if (item.slug === undefined) {
    return [];
  }
  const slug = readSlug(slugText);
  if (slug?.slug !== item.slug) {
    return [slugMismatch(written, item, line)];
  }
  const spaced =
    open !== '' || beforeSlug !== ' ' || slugText !== slugText.trim() || close !== '';
  const spacing = spaced ? [`"${written}" reads fine; the usual form is ${usual(item)}`] : [];
  return [...id.notes, ...slug.notes, ...spacing].map(note);
};

/**
 * Resolves the citations on each line outside code and comments, in every section: `[C3 (slug)]`
 * must name an item with that slug. Lines in `skip` hold references, which are read on their own.
 */
export const citations = (
  lines: readonly Line[],
  items: Lookup,
  skip: ReadonlySet<number>,
): Finding[] =>
  lines
    .filter((line) => !skip.has(line.number))
    .flatMap((line) =>
      [...line.prose.matchAll(CITATION)].flatMap((match) => citation(match, line.number, items)),
    );
