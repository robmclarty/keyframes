import { referenceId, resolveCitations } from '../cite/index.js';
import { readItems, type Item } from '../items/index.js';
import { resolvePointers, type Repo } from '../repo/index.js';
import { finding, scan, type Finding } from '../scan/index.js';
import { budgets, countWords, WORDS } from './budgets.js';
import { countSections } from './counts.js';
import { PLAN, type Plan } from './plan.js';
import type { Entry, Report, ReportItem } from './report.js';

/** Orders two strings by their code units, the same way in every locale. */
const compare = (a: string, b: string): number => {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
};

/** Findings in report order: by line, then code, then message, with notes after errors and warnings. */
const order = (findings: readonly Finding[]): Finding[] =>
  findings.toSorted(
    (a, b) =>
      Number(a.severity === 'note') - Number(b.severity === 'note') ||
      a.line - b.line ||
      compare(a.code, b.code) ||
      compare(a.message, b.message),
  );

/** The note for a plan whose name is `keyframes.md` in another case, on the plan's first line. */
const nameNote = (name: string): Finding[] =>
  name === PLAN
    ? []
    : [finding('alternate-form', 1, `"${name}" reads fine; the usual form is "${PLAN}"`)];

/** The value of an item's sub-line with `key`, if it has one. */
const valueOf = (item: Item, key: string): string | undefined =>
  item.subLines.find((sub) => sub.key === key)?.value;

/** A reference's ID in its usual form, or its value as written when it names no ID. */
const referenceOf = (item: Item, key: string): string | undefined => {
  const value = valueOf(item, key);
  return value === undefined ? undefined : (referenceId(value) ?? value);
};

/** An item as the report carries it, with what its pointers and paths resolved to. */
const reportItem = ({ item, links }: Entry): ReportItem => ({
  id: item.id,
  slug: item.slug,
  section: item.section,
  line: item.line,
  text: item.text,
  because: valueOf(item, 'because'),
  paths: links.paths?.map(({ path, result }) => ({ path, result })),
  heldBy: links.heldBy?.map(({ pointer, result }) => ({ pointer, result })),
  status: links.status,
  supersededBy: referenceOf(item, 'superseded-by'),
  resolvedBy: referenceOf(item, 'resolved-by'),
});

/**
 * Checks a plan against itself and a read-only repo, and returns the report: the plan's counts, its
 * items, and every finding, in report order. It's a pure function of the plan and the tree: no
 * clock, no writes, and the repo is only read.
 */
export const check = (plan: Plan, repo: Repo): Report => {
  const scanned = scan(plan.text);
  const read = readItems(scanned.lines);
  const linked = resolvePointers(read.items, repo);
  const entries = read.items.flatMap((item, index) => {
    const links = linked.links[index];
    return links === undefined ? [] : [{ item, links }];
  });
  const words = countWords(scanned.lines);
  const findings = order([
    ...nameNote(plan.name),
    ...scanned.findings,
    ...read.findings,
    ...resolveCitations(scanned.lines, read.items),
    ...linked.findings,
    ...budgets(scanned.lines, read.items, words),
  ]);
  const count = (severity: Finding['severity']): number =>
    findings.filter((each) => each.severity === severity).length;
  return {
    plan: plan.name,
    intent: !scanned.findings.some((each) => each.code === 'no-intent'),
    sections: countSections(
      scanned.sections.map((section) => section.name),
      entries,
    ),
    words: { count: words, budget: WORDS },
    items: entries.map(reportItem),
    findings,
    errors: count('error'),
    warnings: count('warning'),
    notes: count('note'),
  };
};

/** The exit code a report earns: 1 for an error, or for a warning under --strict, else 0. Notes never count. */
export const exitCode = (report: Report, strict: boolean): number =>
  report.errors > 0 || (strict && report.warnings > 0) ? 1 : 0;
