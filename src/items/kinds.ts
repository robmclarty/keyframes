import type { SectionName } from '../scan/index.js';

// The letter each itemized section's IDs start with. Intent holds prose, so it has none.
const LETTERS = [
  ['P', 'principles'],
  ['M', 'map'],
  ['C', 'constraints'],
  ['S', 'scenarios'],
  ['D', 'decisions'],
  ['T', 'taste'],
  ['Q', 'questions'],
  ['I', 'ideas'],
] as const satisfies readonly (readonly [string, SectionName])[];

/** An item letter, in its usual uppercase form. */
export type Letter = (typeof LETTERS)[number][0];

const SECTIONS: ReadonlyMap<string, readonly [Letter, SectionName]> = new Map(
  LETTERS.map(([letter, section]) => [letter, [letter, section]] as const),
);

/** A sub-line key, in its usual form. */
export type Key = 'because' | 'held-by' | 'paths' | 'superseded-by' | 'resolved-by';

// Each key by its usual form, and `path` too, read as `paths`.
const KEYS: ReadonlyMap<string, Key> = new Map<string, Key>([
  ['because', 'because'],
  ['held-by', 'held-by'],
  ['paths', 'paths'],
  ['path', 'paths'],
  ['superseded-by', 'superseded-by'],
  ['resolved-by', 'resolved-by'],
]);

// The items each key goes on, and how a message names them. `because` goes on any item.
const ALLOWED: Readonly<Record<Key, readonly [readonly SectionName[], string] | undefined>> = {
  because: undefined,
  'held-by': [['constraints', 'scenarios'], 'Constraints and Scenarios'],
  paths: [['map'], 'Map parts'],
  'superseded-by': [['decisions'], 'Decisions'],
  'resolved-by': [['questions', 'ideas'], 'Questions and Ideas'],
};

/** The letter and its section, if `text` is an item letter in any case. */
export const toLetter = (text: string): readonly [Letter, SectionName] | undefined =>
  SECTIONS.get(text.toUpperCase());

/** The letter a section's items take, or undefined for Intent. */
export const letterOf = (section: SectionName): Letter | undefined =>
  LETTERS.find(([, name]) => name === section)?.[0];

/** A section's usual heading, such as `## Constraints`. */
export const headingOf = (section: SectionName): string =>
  `## ${section.charAt(0).toUpperCase()}${section.slice(1)}`;

/** The key in its usual form, if `key` is one in any case, with spaces or underscores for hyphens. */
export const toKey = (key: string): Key | undefined =>
  KEYS.get(key.toLowerCase().replaceAll(/[ _]/g, '-'));

/** How a message names the items `key` goes on, or undefined when it goes on `section`. */
export const wrongPlace = (key: Key, section: SectionName): string | undefined => {
  const allowed = ALLOWED[key];
  return allowed === undefined || allowed[0].includes(section) ? undefined : allowed[1];
};
