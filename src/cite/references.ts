import { readId, readSlug, type Item } from '../items/index.js';
import { finding, type Finding } from '../scan/index.js';
import { slugMismatch, type Lookup } from './lookup.js';

/** A sub-line of an item, as `readItems` reads it. */
type SubLine = Item['subLines'][number];

// The two keys whose value is a reference to a decision.
const KEYS: ReadonlySet<string> = new Set(['superseded-by', 'resolved-by']);

// An ID, with an optional slug, bracketed or not: `D9`, `D9 (sqlite)` or `[D9 (sqlite)]`.
const REFERENCE = /^(\[?)[ \t]*([A-Za-z])(\d+)(?:[ \t]*\(([^()]*)\))?[ \t]*(\]?)$/;

/** A reference's value read into its parts, if it reads as an ID with an optional slug. */
type Reference = {
  readonly id: NonNullable<ReturnType<typeof readId>>;
  readonly slugText: string | undefined;
  readonly bracketed: boolean;
};

/** Reads a reference's value: `D9`, `D9 (sqlite)` or `[D9 (sqlite)]`, or undefined when it isn't one. */
const readReference = (value: string): Reference | undefined => {
  const match = REFERENCE.exec(value);
  const [, open = '', letter = '', digits = '', slugText, close = ''] = match ?? [];
  const id = readId(letter, digits);
  return match === null || id === undefined || open.length !== close.length
    ? undefined
    : { id, slugText, bracketed: open !== '' };
};

/** The ID a `superseded-by:` or `resolved-by:` value names, in its usual form, if it names one. */
export const referenceId = (value: string): string | undefined => readReference(value)?.id.id;

/** Whether a sub-line's value is a reference rather than prose. */
const isReference = (sub: SubLine): boolean => KEYS.has(sub.key);

/** The line numbers a reference's value covers, which aren't read again for citations. */
export const referenceLines = (items: readonly Item[]): ReadonlySet<number> =>
  new Set(
    items.flatMap((item) =>
      item.subLines
        .filter(isReference)
        .flatMap((sub) => [sub.line, ...sub.parts.map((part) => part.line)]),
    ),
  );

/** The error for a reference that doesn't name a decision, saying what it names instead. */
const bad = (sub: SubLine, what: string): Finding =>
  finding(
    'bad-reference',
    sub.line,
    `"${sub.key}: ${sub.value.replaceAll('\n', ' ')}" ${what}; the usual form is - ${sub.key}: D<n>`,
  );

/**
 * What one reference finds. It must name a decision that exists, and a slug written with it must be
 * the decision's own, while the slug and brackets read fine with a note.
 */
const reference = (sub: SubLine, items: Lookup): Finding[] => {
  const read = readReference(sub.value);
  if (read === undefined) {
    return [bad(sub, `isn't a decision's ID`)];
  }
  const { id, slugText, bracketed } = read;
  const item = items.get(id.id);
  if (item === undefined) {
    return [bad(sub, `names ${id.id}, but no item has that ID`)];
  }
  if (item.section !== 'decisions') {
    return [bad(sub, `names ${id.id}, which isn't a decision`)];
  }
  const slug = slugText === undefined ? undefined : readSlug(slugText);
  if (slugText !== undefined && item.slug !== undefined && slug?.slug !== item.slug) {
    return [slugMismatch(sub.value, item, sub.line)];
  }
  const varied =
    !bracketed && slugText === undefined
      ? []
      : [`"${sub.key}: ${sub.value}" reads fine; the usual form is the bare ID: - ${sub.key}: ${id.id}`];
  return [...id.notes, ...varied].map((note) => finding('alternate-form', sub.line, note));
};

/** Checks every `superseded-by:` and `resolved-by:`: each names a decision, by its bare ID. */
export const references = (items: readonly Item[], byId: Lookup): Finding[] =>
  items.flatMap((item) =>
    item.subLines.filter(isReference).flatMap((sub) => reference(sub, byId)),
  );
