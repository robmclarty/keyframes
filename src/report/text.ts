import type { Report, SectionCount } from '../check/index.js';

/** A finding as the text report prints it, once notes of one kind are grouped onto one line. */
type Shown = {
  readonly line: number;
  readonly severity: string;
  readonly code: string;
  readonly message: string;
};

// The width of the label column in the counts, as in "constraints   6".
const LABEL = 14;

/** `count` with its noun, singular for one. */
const plural = (count: number, one: string, many: string): string =>
  `${String(count)} ${count === 1 ? one : many}`;

/** A row of the counts: its label, padded to the column, then its value. */
const row = (label: string, value: string): string => `${label.padEnd(LABEL)}${value}`;

/**
 * A section's row: its count, then each part of its breakdown that isn't zero. A Map counts parts
 * and paths, so they're named; every other count is its section's items.
 */
const sectionRow = ({ name, items, breakdown }: SectionCount): string => {
  const lead = name === 'map' ? plural(items, 'part', 'parts') : String(items);
  const rest = breakdown
    .filter(([, count]) => count > 0)
    .map(([label, count]) => (label === 'paths' ? plural(count, 'path', 'paths') : `${String(count)} ${label}`));
  return row(name, [lead, ...rest].join(' · '));
};

/**
 * The findings as printed: errors and warnings one to a line, then one line for each kind of note,
 * on the first line that uses it, naming every line that does, so a habit shows up once.
 */
const shown = (findings: Report['findings']): Shown[] => {
  const notes = new Map<string, { readonly first: Shown; readonly lines: Set<number> }>();
  const loud: Shown[] = [];
  for (const each of findings) {
    if (each.severity !== 'note') {
      loud.push(each);
      continue;
    }
    const key = `${each.code} ${each.message}`;
    const group = notes.get(key);
    if (group === undefined) {
      notes.set(key, { first: each, lines: new Set([each.line]) });
    } else {
      group.lines.add(each.line);
    }
  }
  const grouped = [...notes.values()].map(({ first, lines }) =>
    lines.size === 1 ? first : { ...first, message: `${first.message} (lines ${[...lines].join(', ')})` },
  );
  return [...loud, ...grouped];
};

/** The findings' lines, with the location, severity and code each padded to its column's widest. */
const findingLines = (plan: string, findings: readonly Shown[]): string[] => {
  const where = (each: Shown): string => `${plan}:${String(each.line)}`;
  const width = (of: (each: Shown) => string): number =>
    Math.max(...findings.map((each) => of(each).length));
  const widths = [width(where), width((each) => each.severity), width((each) => each.code)] as const;
  return findings.map(
    (each) =>
      `${where(each).padEnd(widths[0])}  ${each.severity.padEnd(widths[1])}  ${each.code.padEnd(widths[2])}  ${each.message}`,
  );
};

/** The last line: how many errors, warnings and notes, leaving out any that's zero, or `no findings`. */
const summary = ({ errors, warnings, notes }: Report): string => {
  const parts = [
    errors > 0 ? plural(errors, 'error', 'errors') : undefined,
    warnings > 0 ? plural(warnings, 'warning', 'warnings') : undefined,
    notes > 0 ? plural(notes, 'note', 'notes') : undefined,
  ].filter((part) => part !== undefined);
  return parts.length === 0 ? 'no findings' : parts.join(' · ');
};

/**
 * Renders a report as text: the plan's name, its counts, its findings, and a summary. Sections the
 * plan doesn't have are left out, and so is any count that's zero, after the first.
 */
export const renderText = (report: Report): string => {
  const counts = [
    row('intent', report.intent ? 'yes' : 'no'),
    ...report.sections.map(sectionRow),
    row('words', `${String(report.words.count)} of ${String(report.words.budget)}`),
  ];
  const findings = findingLines(report.plan, shown(report.findings));
  const body = findings.length === 0 ? [] : [...findings, ''];
  return `${[report.plan, '', ...counts, '', ...body, summary(report)].join('\n')}\n`;
};
