import { finding, type Finding } from './finding.js';
import type { ReadLine } from './lines.js';

const NAMES = [
  'intent',
  'principles',
  'map',
  'constraints',
  'scenarios',
  'decisions',
  'taste',
  'questions',
  'ideas',
] as const;

/** One of the nine known sections, by its name in lowercase. */
export type SectionName = (typeof NAMES)[number];

// Heading text matches in any case. A singular heading is a variant of the plural name, never an
// alias, so it reads as its section with a note.
const KNOWN: ReadonlyMap<string, SectionName> = new Map<string, SectionName>([
  ...NAMES.map((name) => [name, name] as const),
  ['principle', 'principles'],
  ['constraint', 'constraints'],
  ['scenario', 'scenarios'],
  ['decision', 'decisions'],
  ['question', 'questions'],
  ['idea', 'ideas'],
]);

/** A `##` heading, and the section it starts. */
export type Section = {
  /** The known section the heading names, or undefined when it's free prose. */
  readonly name: SectionName | undefined;
  /** The heading's text as written, trimmed and without closing hashes. */
  readonly title: string;
  /** The heading's line number. */
  readonly line: number;
};

/** A line of the plan, and the section it's in. */
export type Line = ReadLine & {
  /** The `##` section the line is in, or undefined before the first one or after a `#` heading. */
  readonly section: Section | undefined;
};

/** A heading's level, and its text without the closing hashes it may end with. */
const heading = (text: string): { readonly level: number; readonly title: string } => {
  const rest = text.replace(/^#+/, '');
  const title = rest.trim();
  return {
    level: text.length - rest.length,
    title: /^#*$/.test(title) ? '' : title.replace(/[ \t]+#+$/, ''),
  };
};

/** A known section's usual heading, such as `## Constraints`. */
const usual = (name: SectionName): string => `## ${name.charAt(0).toUpperCase()}${name.slice(1)}`;

/** What a `##` heading earns: duplicate-section when its section came earlier, a note when singular. */
const headingFindings = (section: Section, earlier: readonly Section[]): Finding[] => {
  const { name, title, line } = section;
  if (name === undefined) {
    return [];
  }
  const first = earlier.find((other) => other.name === name);
  const findings: Finding[] = [];
  if (first !== undefined) {
    findings.push(
      finding(
        'duplicate-section',
        line,
        `"## ${title}" repeats the section from line ${String(first.line)}; merge them under one "${usual(name)}"`,
      ),
    );
  }
  if (title.toLowerCase() !== name) {
    findings.push(
      finding('alternate-form', line, `"## ${title}" reads fine; the usual form is "${usual(name)}"`),
    );
  }
  return findings;
};

/** no-intent, unless some Intent section has a line of text outside code and comments. */
const noIntent = (lines: readonly Line[], sections: readonly Section[]): Finding[] => {
  const intent = sections.find((section) => section.name === 'intent');
  if (intent === undefined) {
    return [
      finding(
        'no-intent',
        1,
        `there's no "## Intent"; add one that says why this project exists and who it's for`,
      ),
    ];
  }
  const written = lines.some((line) => line.section?.name === 'intent' && line.kind === 'text');
  return written
    ? []
    : [
        finding(
          'no-intent',
          intent.line,
          `"## ${intent.title}" is empty; say why this project exists and who it's for`,
        ),
      ];
};

/**
 * Places every line in its section. A `##` heading starts one, a `###` or deeper heading stays
 * inside it, and a `#` heading closes it. A known section that appears twice is
 * `duplicate-section`, a singular heading is a variant with a note, and a plan with no Intent text
 * is `no-intent`.
 */
export const readSections = (
  read: readonly ReadLine[],
): { lines: Line[]; sections: Section[]; findings: Finding[] } => {
  const lines: Line[] = [];
  const sections: Section[] = [];
  const findings: Finding[] = [];
  let section: Section | undefined;
  for (const line of read) {
    const { level, title } = line.kind === 'heading' ? heading(line.text) : { level: 0, title: '' };
    if (level === 1) {
      section = undefined;
    } else if (level === 2) {
      section = { name: KNOWN.get(title.toLowerCase()), title, line: line.number };
      findings.push(...headingFindings(section, sections));
      sections.push(section);
    }
    lines.push({ ...line, section });
  }
  return { lines, sections, findings: [...findings, ...noIntent(lines, sections)] };
};
