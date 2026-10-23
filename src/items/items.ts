import { finding, type Finding, type Line, type SectionName } from '../scan/index.js';
import { readBullet } from './bullet.js';
import { notAnItem, readItemLine, type ItemLine } from './item-line.js';
import { headingOf, letterOf, wrongPlace, type Key, type Letter } from './kinds.js';
import { readSubLine, type SubLineRead } from './sub-line.js';

/** One line of a sub-line's value, trimmed, with its line number. */
export type Part = { readonly line: number; readonly text: string };

/** A sub-line under an item, with its key in its usual form. */
export type SubLine = {
  readonly key: Key;
  readonly line: number;
  /** The value's lines, trimmed and joined with `\n`. */
  readonly value: string;
  /** Each line of the value that has text, so a finding can name the line it's about. */
  readonly parts: readonly Part[];
};

/** An item, with its ID, slug and keys in their usual form. */
export type Item = {
  /** The ID in its usual form, such as `C3`. */
  readonly id: string;
  readonly slug: string | undefined;
  /** The section the ID's letter belongs to, which is where the item sits unless it's misplaced. */
  readonly section: SectionName;
  readonly line: number;
  /** The item's prose without its ID or its sub-lines: its lines trimmed and joined with `\n`. */
  readonly text: string;
  /** The sub-lines it has, in line order, with no key twice. */
  readonly subLines: readonly SubLine[];
};

/** A sub-line being read, whose value may run on over the lines after it. */
type SubDraft = { readonly key: Key; readonly line: number; readonly parts: Part[] };

/** An item being read: what's in it so far, and what reading it found. */
type Draft = {
  readonly head: ItemLine;
  readonly line: number;
  readonly text: string[];
  readonly subLines: SubDraft[];
  readonly findings: Finding[];
  /** What an indented line that isn't a bullet continues: the item's text, a sub-line, or nothing. */
  target: 'text' | 'skip' | SubDraft;
};

/** An itemized section a line sits in, and the letter its items take. */
type Home = { readonly section: SectionName; readonly letter: Letter; readonly title: string };

/** Whether a line ends the item before it: anything visible at column 0. Code never does. */
const endsItem = (line: Line): boolean =>
  line.kind !== 'blank' && line.kind !== 'code' && !line.text.startsWith(' ');

/** The itemized section a line sits in, or undefined in Intent, in free prose, or in no section. */
const homeOf = (line: Line): Home | undefined => {
  const section = line.section?.name;
  const letter = section === undefined ? undefined : letterOf(section);
  return section === undefined || letter === undefined
    ? undefined
    : { section, letter, title: line.section?.title ?? '' };
};

/** The warning for an item outside the itemized sections. */
const outside = (item: ItemLine, line: Line): Finding => {
  const where =
    line.section === undefined
      ? `isn't under a "##" section`
      : `is under "## ${line.section.title}", which holds no items`;
  return finding(
    'item-outside-section',
    line.number,
    `${item.id} ${where}; move it under "${headingOf(item.section)}"`,
  );
};

/** The error for an item whose letter belongs to another section. */
const wrongLetter = (item: ItemLine, line: Line, home: Home): Finding =>
  finding(
    'wrong-letter',
    line.number,
    `${item.id} is under "## ${home.title}", but ${item.letter} items go under "${headingOf(item.section)}"; move it there, or give it a ${home.letter} number`,
  );

/** A draft for an item line, with the findings the line earns on its own. */
const open = (item: ItemLine, line: Line, placed: readonly Finding[]): Draft => {
  const slugless =
    item.slug === undefined
      ? [
          finding(
            'missing-slug',
            line.number,
            `${item.id} has no slug, so citations to it can't notice a rename; add one: - **${item.id} (<slug>)**: …`,
          ),
        ]
      : [];
  return {
    head: item,
    line: line.number,
    text: [item.text],
    subLines: [],
    findings: [
      ...placed,
      ...slugless,
      ...item.notes.map((note) => finding('alternate-form', line.number, note)),
    ],
    target: 'text',
  };
};

/**
 * Reads a bullet at column 0. In an itemized section it's an item, malformed-item when it starts
 * like one but can't be read, or not-an-item. Anywhere else only a bold item counts, with
 * item-outside-section, and other bullets are prose.
 */
const topLevel = (line: Line, findings: Finding[]): Draft | undefined => {
  const bullet = readBullet(line.text);
  if (bullet === undefined) {
    return undefined;
  }
  const read = readItemLine(bullet);
  const home = homeOf(line);
  if (home === undefined) {
    return read.kind === 'item' && read.item.bold
      ? open(read.item, line, [outside(read.item, line)])
      : undefined;
  }
  if (read.kind === 'malformed') {
    findings.push(finding('malformed-item', line.number, read.message));
    return undefined;
  }
  // With no bold, a letter from another section makes the line read two ways, so it isn't an item.
  if (read.kind === 'item' && (read.item.bold || read.item.section === home.section)) {
    const placed = read.item.section === home.section ? [] : [wrongLetter(read.item, line, home)];
    return open(read.item, line, placed);
  }
  findings.push(finding('not-an-item', line.number, notAnItem(bullet, home.letter)));
  return undefined;
};

/** Adds a sub-line to its item, unless its key goes on other items or the item has it already. */
const addSubLine = (draft: Draft, line: Line, read: Extract<SubLineRead, { kind: 'key' }>): void => {
  const { key, value, notes } = read;
  const { id, section } = draft.head;
  const place = wrongPlace(key, section);
  const first = draft.subLines.find((sub) => sub.key === key);
  if (place !== undefined) {
    draft.findings.push(
      finding('key-not-allowed', line.number, `"${key}:" goes only on ${place}, so it isn't read on ${id}`),
    );
    draft.target = 'skip';
  } else if (first !== undefined) {
    draft.findings.push(
      finding(
        'duplicate-key',
        line.number,
        `${id} already has "${key}:" on line ${String(first.line)}; keep one "- ${key}:" line`,
      ),
    );
    draft.target = 'skip';
  } else {
    const parts = value === '' ? [] : [{ line: line.number, text: value }];
    const sub = { key, line: line.number, parts };
    draft.subLines.push(sub);
    draft.findings.push(...notes.map((note) => finding('alternate-form', line.number, note)));
    draft.target = sub;
  }
};

/**
 * Reads an indented line under an item. A bullet is a sub-line or part of the item's prose, and any
 * other line continues whatever came before it, up to a blank line, which hands it back to the text.
 */
const inside = (draft: Draft, line: Line): void => {
  if (line.kind === 'blank') {
    draft.target = 'text';
    return;
  }
  if (line.kind !== 'text') {
    return;
  }
  const text = line.text.trim();
  const bullet = readBullet(line.text);
  const read = bullet === undefined ? undefined : readSubLine(bullet);
  if (read === undefined) {
    if (draft.target === 'text') {
      draft.text.push(text);
    } else if (draft.target !== 'skip') {
      draft.target.parts.push({ line: line.number, text });
    }
  } else if (read.kind === 'key') {
    addSubLine(draft, line, read);
  } else if (read.kind === 'unknown') {
    draft.findings.push(
      finding(
        'unknown-key',
        line.number,
        `"${read.key}:" isn't a sub-line key; the keys are because, held-by, paths, superseded-by and resolved-by`,
      ),
    );
    draft.target = 'skip';
  } else {
    draft.text.push(text);
    draft.target = 'text';
  }
};

/** An item from its draft, or malformed-item when it has no text at all. */
const finish = (draft: Draft): { item?: Item; findings: readonly Finding[] } => {
  const { head } = draft;
  const text = draft.text.filter((line) => line !== '').join('\n');
  if (text === '') {
    const usual = `${head.id} (${head.slug ?? '<slug>'})`;
    return {
      findings: [
        finding(
          'malformed-item',
          draft.line,
          `"${head.quote}" starts like an item, but it has no text; the usual form is - **${usual}**: …`,
        ),
      ],
    };
  }
  const why =
    head.section === 'decisions' && !draft.subLines.some((sub) => sub.key === 'because')
      ? [finding('missing-because', draft.line, `${head.id} doesn't say why; add a line under it: - because: …`)]
      : [];
  const subLines = draft.subLines.map(({ key, line, parts }) => ({
    key,
    line,
    value: parts.map((part) => part.text).join('\n'),
    parts,
  }));
  return {
    item: { id: head.id, slug: head.slug, section: head.section, line: draft.line, text, subLines },
    findings: [...draft.findings, ...why],
  };
};

/** duplicate-id for each item whose ID an earlier item already has. */
const duplicates = (items: readonly Item[]): Finding[] => {
  const first = new Map<string, number>();
  return items.flatMap((item) => {
    const line = first.get(item.id);
    if (line === undefined) {
      first.set(item.id, item.line);
      return [];
    }
    return [
      finding(
        'duplicate-id',
        item.line,
        `${item.id} is already the ID on line ${String(line)}; give this item a number no other item uses`,
      ),
    ];
  });
};

/**
 * Reads the items in a scanned plan: each top-level bullet in an itemized section, the lines that
 * continue it, and the sub-lines under it, up to the next line at column 0. Every ID, slug and key
 * comes out in its usual form, and each variant it was written in earns an alternate-form note.
 */
export const readItems = (
  lines: readonly Line[],
): { readonly items: readonly Item[]; readonly findings: readonly Finding[] } => {
  const drafts: Draft[] = [];
  const findings: Finding[] = [];
  let draft: Draft | undefined;
  for (const line of lines) {
    if (endsItem(line)) {
      draft = line.kind === 'text' ? topLevel(line, findings) : undefined;
      drafts.push(...(draft === undefined ? [] : [draft]));
    } else if (draft !== undefined) {
      inside(draft, line);
    }
  }
  const finished = drafts.map(finish);
  const items = finished.flatMap((done) => (done.item === undefined ? [] : [done.item]));
  return {
    items,
    findings: [...findings, ...finished.flatMap((done) => done.findings), ...duplicates(items)].toSorted(
      (a, b) => a.line - b.line,
    ),
  };
};
