import { finding, type Finding } from './finding.js';

/**
 * What a line is, once fences and comments are accounted for. An underline is the line of `-` or
 * `=` under a setext heading, whose text is the line above it.
 */
export type LineKind = 'blank' | 'text' | 'heading' | 'underline' | 'break' | 'fence' | 'code';

/** A line on its own: what it is, and what's visible in it. */
export type ReadLine = {
  /** The line's number in the plan, counting from 1. */
  readonly number: number;
  readonly kind: LineKind;
  /** The line with its leading tabs expanded and its comments blanked to spaces. */
  readonly text: string;
  /** `text` with code blanked too, so columns still line up: the part where citations count. */
  readonly prose: string;
};

/** A code fence left open: where it opened, its run of backticks or tildes, and its indent. */
type Fence = {
  readonly line: number;
  readonly opener: string;
  readonly marker: string;
  readonly indent: number;
};

/** A code span or comment in a line. An open comment runs on past the end of the line. */
type Span = {
  readonly kind: 'code' | 'comment';
  readonly start: number;
  readonly end: number;
  readonly open: boolean;
};

/** A line with its comments blanked in `text` and its code spans too in `prose`. */
type Masked = { readonly text: string; readonly prose: string; readonly open: boolean };

// A fence opens with three or more backticks or tildes at any indent, so a fence nested under an
// item counts. It closes with a run of the same character, at least as long, with nothing after it.
const FENCE = /^( *)(`{3,}|~{3,})(.*)$/;
const CLOSE = /^( *)(`+|~+)[ \t]*$/;
// A heading starts at column 0, as an item does, so `#` lines indented under an item are its text.
const HEADING = /^#{1,6}(?:[ \t]|$)/;
// Three or more of one of `-`, `*` or `_`, spaced or not, such as `* * *`: not a bullet.
const BREAK = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
// A run of `=` or `-` alone on its line, which makes the line of text above it a setext heading.
const UNDERLINE = /^ {0,3}(?:=+|-+)[ \t]*$/;
// A list item's marker, which a setext heading's text can't start with.
const LIST = /^(?:[-*+]|\d{1,9}[.)])(?:[ \t]|$)/;

/** Expands each tab in a line's leading whitespace to four spaces. */
const expandTabs = (line: string): string =>
  line.replace(/^[ \t]+/, (lead) => lead.replaceAll('\t', '    '));

/** Splits a plan into lines the same way on every OS: no BOM, CRLF read as LF, tabs expanded. */
const normalize = (source: string): string[] => {
  const text = source.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n');
  if (text === '') {
    return [];
  }
  return (text.endsWith('\n') ? text.slice(0, -1) : text).split('\n').map(expandTabs);
};

/** The fence a line opens, if it opens one. */
const openFence = (line: string, number: number): Fence | undefined => {
  const match = FENCE.exec(line);
  if (match === null) {
    return undefined;
  }
  const [, indent = '', marker = '', info = ''] = match;
  // A backtick fence's info string can't hold a backtick: "```js```" is inline code.
  if (marker.startsWith('`') && info.includes('`')) {
    return undefined;
  }
  return { line: number, opener: line.trim(), marker, indent: indent.length };
};

/** Whether a line closes `fence`, indented no more than three spaces past the line that opened it. */
const closesFence = (line: string, fence: Fence): boolean => {
  const match = CLOSE.exec(line);
  if (match === null) {
    return false;
  }
  const [, indent = '', marker = ''] = match;
  return (
    marker.startsWith(fence.marker.charAt(0)) &&
    marker.length >= fence.marker.length &&
    indent.length <= fence.indent + 3
  );
};

/** How many backticks are in the run that starts at `at`. */
const backticks = (line: string, at: number): number => {
  let end = at;
  while (line[end] === '`') {
    end += 1;
  }
  return end - at;
};

/** The code span that opens at `at`: up to the next run of exactly as many backticks on the line. */
const codeSpan = (line: string, at: number): Span | undefined => {
  const length = backticks(line, at);
  let close = line.indexOf('`', at + length);
  while (close !== -1) {
    const run = backticks(line, close);
    if (run === length) {
      return { kind: 'code', start: at, end: close + run, open: false };
    }
    close = line.indexOf('`', close + run);
  }
  return undefined;
};

/**
 * The comment that opens at `at`, up to its `-->`. Left open, a comment that starts its line runs
 * until a later `-->`, as an HTML block does, while one that starts mid-line must close before the
 * next blank line, or its `<!--` is plain text.
 */
const comment = (line: string, at: number, closesLater: () => boolean): Span | undefined => {
  const close = line.indexOf('-->', at + 2);
  if (close !== -1) {
    return { kind: 'comment', start: at, end: close + 3, open: false };
  }
  if (line.slice(0, at).trim() === '' || closesLater()) {
    return { kind: 'comment', start: at, end: line.length, open: true };
  }
  return undefined;
};

/** The first code span or comment in a line at or after `from`, if there is one. */
const nextSpan = (line: string, from: number, closesLater: () => boolean): Span | undefined => {
  let at = from;
  while (at < line.length) {
    if (line[at] === '`') {
      const span = codeSpan(line, at);
      if (span !== undefined) {
        return span;
      }
      at += backticks(line, at);
    } else {
      const span = line.startsWith('<!--', at) ? comment(line, at, closesLater) : undefined;
      if (span !== undefined) {
        return span;
      }
      at += 1;
    }
  }
  return undefined;
};

/** The part of a line still inside a comment that an earlier line opened. */
const carried = (line: string): Span => {
  const close = line.indexOf('-->');
  return close === -1
    ? { kind: 'comment', start: 0, end: line.length, open: true }
    : { kind: 'comment', start: 0, end: close + 3, open: false };
};

/**
 * A line's code spans and comments, in order, read left to right so whichever opens first wins: a
 * `<!--` inside a code span is code, and a backtick inside a comment is comment.
 */
const spansOf = (line: string, inComment: boolean, closesLater: () => boolean): Span[] => {
  const spans: Span[] = [];
  let span = inComment ? carried(line) : nextSpan(line, 0, closesLater);
  while (span !== undefined) {
    spans.push(span);
    span = span.open ? undefined : nextSpan(line, span.end, closesLater);
  }
  return spans;
};

/** A line with each span replaced by spaces, so columns still line up. */
const blank = (line: string, spans: readonly Span[]): string =>
  spans.reduce(
    (text, { start, end }) => text.slice(0, start) + ' '.repeat(end - start) + text.slice(end),
    line,
  );

/** Blanks a line's comments in `text`, and its code spans too in `prose`. */
const mask = (line: string, inComment: boolean, closesLater: () => boolean): Masked => {
  const spans = spansOf(line, inComment, closesLater);
  return {
    text: blank(
      line,
      spans.filter((span) => span.kind === 'comment'),
    ),
    prose: blank(line, spans),
    open: spans.at(-1)?.open === true,
  };
};

/** Whether a comment left open on line `index` meets its `-->` before the next blank line. */
const closesBeforeBlank = (lines: readonly string[], index: number): boolean => {
  for (const line of lines.slice(index + 1)) {
    if (line.trim() === '') {
      return false;
    }
    if (line.includes('-->')) {
      return true;
    }
  }
  return false;
};

/** What a line outside code is, once its comments are blanked. */
const classify = (text: string): LineKind => {
  if (text.trim() === '') {
    return 'blank';
  }
  if (HEADING.test(text)) {
    return 'heading';
  }
  return BREAK.test(text) ? 'break' : 'text';
};

/**
 * Whether a line underlines the one above it, making it a setext heading: the line above is one line
 * of text at column 0 that isn't a list item, and the line before that isn't text, so it's neither
 * part of a longer paragraph nor carried on from an item.
 */
const underlines = (text: string, above: ReadLine | undefined, before: ReadLine | undefined): boolean =>
  UNDERLINE.test(text) &&
  above?.kind === 'text' &&
  /^\S/.test(above.text) &&
  !LIST.test(above.text) &&
  before?.kind !== 'text';

/** A fence or code line: its text kept, and none of it prose. */
const hidden = (number: number, kind: LineKind, line: string): ReadLine => ({
  number,
  kind,
  text: line,
  prose: ' '.repeat(line.length),
});

/** The warning for a fence that never closes. */
const unclosed = (fence: Fence): Finding =>
  finding(
    'unclosed-fence',
    fence.line,
    `"${fence.opener}" opens a fence that never closes, so the rest of the file reads as code; end it with a line of ${fence.marker}`,
  );

/** The warning for a comment that starts a line and never closes, on the line it opens. */
const unclosedComment = (line: number): Finding =>
  finding(
    'unclosed-comment',
    line,
    `"<!--" opens a comment that never closes, so the rest of the file is hidden; end it with "-->"`,
  );

/**
 * Reads a plan's lines: which are fences and code, and what's visible in the rest once comments
 * and code spans are blanked. A line of text with a line of `-` or `=` under it is a setext heading.
 * A fence left open runs to the end of the file, with `unclosed-fence`, and a comment left open
 * hides the rest of it, with `unclosed-comment`.
 */
export const readLines = (source: string): { lines: ReadLine[]; findings: Finding[] } => {
  const raw = normalize(source);
  const lines: ReadLine[] = [];
  let fence: Fence | undefined;
  let inComment = false;
  // The line an open comment started on.
  let opened = 0;
  for (const [index, line] of raw.entries()) {
    const number = index + 1;
    if (fence !== undefined) {
      const closed = closesFence(line, fence);
      lines.push(hidden(number, closed ? 'fence' : 'code', line));
      fence = closed ? undefined : fence;
      continue;
    }
    fence = inComment ? undefined : openFence(line, number);
    if (fence !== undefined) {
      lines.push(hidden(number, 'fence', line));
      continue;
    }
    const masked = mask(line, inComment, () => closesBeforeBlank(raw, index));
    // A comment carried in from an earlier line closes at the line's first `-->`, so one still
    // open after that opened on this line.
    if (masked.open && (!inComment || line.includes('-->'))) {
      opened = number;
    }
    inComment = masked.open;
    const above = lines.at(-1);
    if (above !== undefined && underlines(masked.text, above, lines.at(-2))) {
      lines[lines.length - 1] = { ...above, kind: 'heading' };
      lines.push({ number, kind: 'underline', text: masked.text, prose: masked.prose });
    } else {
      lines.push({ number, kind: classify(masked.text), text: masked.text, prose: masked.prose });
    }
  }
  const findings = [
    ...(fence === undefined ? [] : [unclosed(fence)]),
    ...(inComment ? [unclosedComment(opened)] : []),
  ];
  return { lines, findings };
};
