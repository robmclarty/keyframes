/** A list bullet: how far in it sits, its marker, the whitespace after it, and the rest of the line. */
export type Bullet = {
  readonly indent: number;
  /** `-`, `*`, `+`, or a number with `.` or `)`. */
  readonly marker: string;
  readonly space: string;
  /** What follows the bullet, without trailing whitespace. */
  readonly content: string;
};

// A bullet is a marker followed by whitespace or the end of the line, as in markdown: `-x` isn't one.
const BULLET = /^( *)([-*+]|\d{1,9}[.)])(?:([ \t]+)(.*))?$/;

// The longest a quoted line runs before it's cut at a word, in characters.
const QUOTE = 40;

/** The bullet a line opens with, if it opens with one. */
export const readBullet = (text: string): Bullet | undefined => {
  const match = BULLET.exec(text);
  if (match === null) {
    return undefined;
  }
  const [, indent = '', marker = '', space = '', content = ''] = match;
  return { indent: indent.length, marker, space, content: content.trimEnd() };
};

/** Whether a bullet is numbered, as in `1.` or `1)`. */
export const numbered = (bullet: Bullet): boolean => /^\d/.test(bullet.marker);

/** The alternate-form note a bullet earns for its marker, if it isn't `-`. */
export const markerNote = (bullet: Bullet): string | undefined => {
  if (numbered(bullet)) {
    return 'a numbered item reads fine; the usual form is a "-" bullet';
  }
  return bullet.marker === '-'
    ? undefined
    : `"${bullet.marker}" bullets read fine; the usual form is "-"`;
};

/**
 * `text` cut at a space once it runs past the quote's length, so a message stays one short line. It
 * cuts only at a space, so it never splits a character.
 */
const cut = (text: string): string => {
  if (text.length <= QUOTE) {
    return text;
  }
  const before = text.lastIndexOf(' ', QUOTE);
  const end = before > 0 ? before : text.indexOf(' ', QUOTE);
  return end === -1 ? text : `${text.slice(0, end)}…`;
};

/**
 * The start of a bullet as a message quotes it: up to the end of its bold when it opens with bold,
 * as in `- **C4 one-writer**`, or else its first few words.
 */
export const quote = (bullet: Bullet): string => {
  const { content } = bullet;
  const bold = /^(\*\*|__)/.exec(content)?.[0];
  const close = bold === undefined ? -1 : content.indexOf(bold, 2);
  const head = close === -1 ? cut(content) : content.slice(0, close + 2);
  return `${bullet.marker} ${head}`.trimEnd();
};
