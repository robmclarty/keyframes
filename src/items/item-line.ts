import type { SectionName } from '../scan/index.js';
import { markerNote, quote, type Bullet } from './bullet.js';
import { toLetter, type Letter } from './kinds.js';

/** An item line read into its parts, each in its usual form. */
export type ItemLine = {
  /** The ID in its usual form, such as `C3`. */
  readonly id: string;
  readonly letter: Letter;
  /** The section the ID's letter belongs to. */
  readonly section: SectionName;
  readonly slug: string | undefined;
  /** The text on the item line itself, after its ID. */
  readonly text: string;
  /** Whether the ID is in bold, as an item needs to be anywhere its letter doesn't belong. */
  readonly bold: boolean;
  /** The alternate-form notes the line earns, one for each kind of variant it uses. */
  readonly notes: readonly string[];
  /** The start of the line, as a message quotes it. */
  readonly quote: string;
};

/** What a top-level bullet is: an item, one that starts like an item but can't be read, or neither. */
export type ItemRead =
  | { readonly kind: 'item'; readonly item: ItemLine }
  | { readonly kind: 'malformed'; readonly message: string }
  | { readonly kind: 'other' };

/** An item line split at its grammar, every part as written. */
type Pieces = {
  /** The bold that opens the line, `**` or `__`, or nothing. */
  readonly open: string;
  /** The bold that closes the ID, or nothing. */
  readonly close: string;
  readonly letter: string;
  readonly digits: string;
  /** What's between the parentheses, or undefined with no slug. */
  readonly slug: string | undefined;
  /** Whether the colon is inside the bold, as in `**C3 (one-writer):**`. */
  readonly inner: boolean;
  /** What follows the bold: a colon, a dash, or nothing. */
  readonly separator: string;
  readonly text: string;
  /** Each stretch of whitespace as written, beside what the usual form has there. */
  readonly gaps: readonly (readonly [string, string])[];
};

// The usual form, as notes show it.
const USUAL = '- **C3 (one-writer)**: …';

// A bold ID with an optional slug, then the colon inside or after the bold, a dash, or nothing.
const BOLD =
  /^(\*\*|__)([A-Za-z])(\d+)(?:([ \t]*)\(([^()]*)\))?([ \t]*)(:?)([ \t]*)(\*\*|__)([ \t]*)([:\-–—]?)([ \t]*)(.*)$/;
// An ID and slug with no bold, which need a colon after them to be read as an item.
const PLAIN = /^([A-Za-z])(\d+)([ \t]*)\(([^()]*)\)([ \t]*):([ \t]*)(.*)$/;
// A bold ID followed by `(` or a colon: meant as an item, so failing to read it is an error.
const STARTS = /^(?:\*\*|__)([A-Za-z])(\d+)(?:[ \t]*[(:]|(?:\*\*|__)[ \t]*:)/;
// A bold ID followed by words and no parentheses, as in `**C4 one-writer**`.
const UNBRACKETED = /^(\*\*|__)([A-Za-z])(\d+)[ \t]+([A-Za-z0-9][A-Za-z0-9 _-]*?)[ \t]*\1/;
// Lowercase letters and digits in words, joined by a hyphen, an underscore, or spaces, in any case.
const SLUG = /^[A-Za-z0-9]+(?:(?:-|_| +)[A-Za-z0-9]+)*$/;
const DASHES = new Set(['-', '–', '—']);

/** The leading and trailing whitespace inside a slug's parentheses, which the usual form has none of. */
const padding = (slug: string): (readonly [string, string])[] => [
  [/^[ \t]*/.exec(slug)?.[0] ?? '', ''],
  [/[ \t]*$/.exec(slug)?.[0] ?? '', ''],
];

/** The pieces of a bold item line. A separator after a colon inside the bold is the text's. */
const fromBold = (match: RegExpExecArray): Pieces => {
  const [, open = '', letter = '', digits = '', beforeSlug, slug, afterId = '', colon = ''] = match;
  const [afterColon = '', close = '', afterClose = '', written = '', afterSeparator = ''] =
    match.slice(8);
  const inner = colon === ':';
  const separator = inner ? '' : written;
  const text = (inner ? `${written}${afterSeparator}${match[13] ?? ''}` : (match[13] ?? '')).trim();
  const spaced = text === '' ? '' : ' ';
  const beforeText = separator === ':' ? '' : spaced;
  return {
    open,
    close,
    letter,
    digits,
    slug,
    inner,
    separator,
    text,
    gaps: [
      ...(slug === undefined ? [] : [[beforeSlug ?? '', ' '] as const, ...padding(slug)]),
      [afterId, ''],
      [inner ? afterColon : '', ''],
      [afterClose, DASHES.has(separator) ? ' ' : beforeText],
      [inner ? '' : afterSeparator, separator === '' ? '' : spaced],
    ],
  };
};

/** The pieces of an item line with no bold. */
const fromPlain = (match: RegExpExecArray): Pieces => {
  const [, letter = '', digits = '', beforeSlug = '', slug = '', afterSlug = '', afterColon = ''] =
    match;
  const text = (match[7] ?? '').trim();
  return {
    open: '',
    close: '',
    letter,
    digits,
    slug,
    inner: false,
    separator: ':',
    text,
    gaps: [
      [beforeSlug, ' '],
      ...padding(slug),
      [afterSlug, ''],
      [afterColon, text === '' ? '' : ' '],
    ],
  };
};

/** A slug in its usual form, with a note for each variant in it, if it reads as one. */
const readSlug = (written: string): { slug: string; notes: string[] } | undefined => {
  const slug = written.trim();
  if (!SLUG.test(slug)) {
    return undefined;
  }
  const joined = 'the usual form joins its words with hyphens: (one-writer)';
  const notes = [
    slug.includes(' ') ? `spaces in a slug read fine; ${joined}` : undefined,
    slug.includes('_') ? `underscores in a slug read fine; ${joined}` : undefined,
  ];
  return {
    slug: slug.toLowerCase().replaceAll(/_| +/g, '-'),
    notes: notes.filter((note) => note !== undefined),
  };
};

/** An ID's number without its leading zeros. */
const numberOf = (digits: string): string => digits.replace(/^0+(?=\d)/, '');

/** The note for what follows the bold, unless it's the usual colon after it. */
const separatorNote = (pieces: Pieces): string | undefined => {
  if (pieces.inner) {
    return `a colon inside the bold reads fine; the usual form puts it after the bold: ${USUAL}`;
  }
  if (DASHES.has(pieces.separator)) {
    return `"${pieces.separator}" after the bold reads fine; the usual form is a colon: ${USUAL}`;
  }
  return pieces.separator === '' && pieces.open !== ''
    ? `an item with no colon after the bold reads fine; the usual form has one: ${USUAL}`
    : undefined;
};

/** Every alternate-form note an item line earns, one for each kind of variant, in a fixed order. */
const notesOf = (bullet: Bullet, pieces: Pieces, slugNotes: readonly string[]): string[] => {
  const spacing =
    bullet.space !== ' ' || pieces.gaps.some(([written, usual]) => written !== usual);
  const notes = [
    markerNote(bullet),
    pieces.open === '__' ? '"__" bold reads fine; the usual form is "**"' : undefined,
    pieces.open === ''
      ? `an item without bold reads fine; the usual form puts its ID and slug in bold: ${USUAL}`
      : undefined,
    /^0\d/.test(pieces.digits)
      ? 'a leading zero in an ID reads fine; the usual form drops it: C3, not C03'
      : undefined,
    ...slugNotes,
    separatorNote(pieces),
    spacing ? `other spacing in an item line reads fine; the usual form is ${USUAL}` : undefined,
  ];
  return notes.filter((note) => note !== undefined);
};

/** The malformed-item read for a line that starts like an item, with why it can't be read. */
const malformed = (bullet: Bullet, reason: string, usual: string): ItemRead => ({
  kind: 'malformed',
  message: `"${quote(bullet)}" starts like an item, but ${reason}; the usual form is - **${usual}**: …`,
});

/** Why pieces whose letter is an item letter still can't be read as an item, if they can't. */
const problem = (pieces: Pieces, letter: Letter): readonly [string, string] | undefined => {
  const number = numberOf(pieces.digits);
  const usual = `${letter}${number} (<slug>)`;
  if (number === '0') {
    return [`${letter}0 isn't an ID, since numbers start at 1`, `${letter}1 (<slug>)`];
  }
  if (pieces.close !== pieces.open) {
    return [`its bold opens with "${pieces.open}" and closes with "${pieces.close}"`, usual];
  }
  return pieces.slug === undefined || readSlug(pieces.slug) !== undefined
    ? undefined
    : [`"${pieces.slug.trim()}" isn't a slug, which is lowercase words joined by hyphens`, usual];
};

/**
 * Reads pieces as an item. A bold line that fails is malformed-item, since it starts like an item,
 * while a line with no bold that fails is just not an item.
 */
const judge = (bullet: Bullet, pieces: Pieces): ItemRead => {
  const known = toLetter(pieces.letter);
  if (known === undefined) {
    return { kind: 'other' };
  }
  const [letter, section] = known;
  const trouble = problem(pieces, letter);
  if (trouble !== undefined) {
    return pieces.open === '' ? { kind: 'other' } : malformed(bullet, ...trouble);
  }
  const slug = pieces.slug === undefined ? undefined : readSlug(pieces.slug);
  return {
    kind: 'item',
    item: {
      id: `${letter}${numberOf(pieces.digits)}`,
      letter,
      section,
      slug: slug?.slug,
      text: pieces.text,
      bold: pieces.open !== '',
      notes: notesOf(bullet, pieces, slug?.notes ?? []),
      quote: quote(bullet),
    },
  };
};

/**
 * Reads a top-level bullet as an item line: the usual `- **C3 (one-writer)**: …`, or one of its
 * variants. A bold ID followed by `(` or a colon is meant as an item, so if it can't be read it's
 * malformed; anything else, `- **C4 model**: …` included, is not an item.
 */
export const readItemLine = (bullet: Bullet): ItemRead => {
  const bold = BOLD.exec(bullet.content);
  if (bold !== null) {
    const pieces = fromBold(bold);
    // With no slug, only a colon says the bold is an ID: `- **S3** holds uploads` is prose.
    if (pieces.slug !== undefined || pieces.inner || pieces.separator === ':') {
      return judge(bullet, pieces);
    }
  }
  const plain = PLAIN.exec(bullet.content);
  if (plain !== null) {
    return judge(bullet, fromPlain(plain));
  }
  const starts = STARTS.exec(bullet.content);
  const letter = starts === null ? undefined : toLetter(starts[1] ?? '')?.[0];
  return letter === undefined
    ? { kind: 'other' }
    : malformed(bullet, `it can't be read as one`, `${letter}${numberOf(starts?.[2] ?? '')} (<slug>)`);
};

/**
 * The not-an-item message for a bullet in a section whose items take `letter`. A bold ID followed by
 * words, as in `**C4 one-writer**`, is told to put them in parentheses.
 */
export const notAnItem = (bullet: Bullet, letter: Letter): string => {
  const words = UNBRACKETED.exec(bullet.content);
  const known = words === null ? undefined : toLetter(words[2] ?? '');
  const slug = words === null ? undefined : readSlug(words[4] ?? '');
  if (known !== undefined && slug !== undefined) {
    const id = `${known[0]}${numberOf(words?.[3] ?? '')}`;
    return `"${quote(bullet)}" isn't read as an item; put its slug in parentheses: - **${id} (${slug.slug})**: …`;
  }
  return `"${quote(bullet)}" isn't read as an item, so nothing can cite it; the usual form is - **${letter}<n> (<slug>)**: …`;
};
