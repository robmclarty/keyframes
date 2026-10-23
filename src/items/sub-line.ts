import { markerNote, numbered, type Bullet } from './bullet.js';
import { toKey, type Key } from './kinds.js';

/** What a bullet under an item is: a sub-line, a sub-line with a key nobody knows, or prose. */
export type SubLineRead =
  | {
      readonly kind: 'key';
      readonly key: Key;
      /** The value on the sub-line itself, trimmed. */
      readonly value: string;
      /** The alternate-form notes the sub-line earns, one for each kind of variant it uses. */
      readonly notes: readonly string[];
    }
  | { readonly kind: 'unknown'; readonly key: string }
  | { readonly kind: 'prose' };

// A key and its colon, in any case, with spaces or underscores allowed for its hyphens.
const PLAIN = /^([A-Za-z]+(?:[- _][A-Za-z]+)*)([ \t]*):([ \t]*)(.*)$/;
// A bold key, with its colon inside the bold or after it.
const BOLD = /^(\*\*|__)([A-Za-z]+(?:[- _][A-Za-z]+)*)([ \t]*)(:?)\1([ \t]*)(:?)([ \t]*)(.*)$/;
// The shape of a key in its usual form. Only a bullet in that shape can have an unknown key, so
// nested prose such as `- Pros: fast` or `- http://localhost` stays prose.
const UNKNOWN = /^[a-z]+(?:-[a-z]+)*$/;
const PROSE: SubLineRead = { kind: 'prose' };

/** Whether a bullet is indented as the usual form indents a sub-line: two to five spaces. */
const usualIndent = (bullet: Bullet): boolean => bullet.indent >= 2 && bullet.indent <= 5;

/** Every alternate-form note a sub-line earns, one for each kind of variant, in a fixed order. */
const notesOf = (
  bullet: Bullet,
  key: Key,
  written: string,
  { bold, spacing }: { readonly bold: boolean; readonly spacing: boolean },
): string[] => {
  const notes = [
    markerNote(bullet),
    usualIndent(bullet)
      ? undefined
      : `a sub-line indented outside two to five spaces reads fine; the usual form is two spaces in: "  - ${key}: …"`,
    bold ? `a bold key reads fine; the usual form is plain: - ${key}: …` : undefined,
    written.toLowerCase() === key ? undefined : `"${written}:" reads fine; the usual form is "${key}:"`,
    spacing || bullet.space !== ' '
      ? `other spacing in a sub-line reads fine; the usual form is - ${key}: …`
      : undefined,
  ];
  return notes.filter((note) => note !== undefined);
};

/** A bold sub-line, if exactly one colon follows its key, inside the bold or after it. */
const readBold = (bullet: Bullet, match: RegExpExecArray): SubLineRead => {
  const [, , written = '', beforeInner = '', inner = '', afterClose = '', outer = ''] = match;
  const [afterOuter = '', rest = ''] = match.slice(7);
  const key = toKey(written);
  if (key === undefined || (inner === '') === (outer === '')) {
    return PROSE;
  }
  const value = rest.trim();
  const spaced = value === '' ? '' : ' ';
  const spacing =
    beforeInner !== '' ||
    afterClose !== (inner === '' ? '' : spaced) ||
    afterOuter !== (outer === '' ? '' : spaced);
  return { kind: 'key', key, value, notes: notesOf(bullet, key, written, { bold: true, spacing }) };
};

/**
 * Reads a bullet under an item as a sub-line: the usual `- because: …`, two to five spaces in, or
 * one of its variants. A key nobody knows counts only in the usual form's shape, and anything else
 * is part of the item's prose.
 */
export const readSubLine = (bullet: Bullet): SubLineRead => {
  if (numbered(bullet)) {
    return PROSE;
  }
  const bold = BOLD.exec(bullet.content);
  if (bold !== null) {
    return readBold(bullet, bold);
  }
  const plain = PLAIN.exec(bullet.content);
  if (plain === null) {
    return PROSE;
  }
  const [, written = '', beforeColon = '', afterColon = '', rest = ''] = plain;
  const value = rest.trim();
  const key = toKey(written);
  if (key !== undefined) {
    const spacing = beforeColon !== '' || afterColon !== (value === '' ? '' : ' ');
    const notes = notesOf(bullet, key, written, { bold: false, spacing });
    return { kind: 'key', key, value, notes };
  }
  // A colon with no space after it is a URL, not a key: `http://localhost`.
  const keyed = beforeColon === '' && (afterColon !== '' || value === '');
  return bullet.marker === '-' && usualIndent(bullet) && keyed && UNKNOWN.test(written)
    ? { kind: 'unknown', key: written }
    : PROSE;
};
