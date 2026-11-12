import type { Report } from '../check/index.js';
import { readPath } from '../repo/index.js';

/** An item as the report carries it. */
type ReportItem = Report['items'][number];

/** A path given to `context`, in its usual form, and the IDs of the Map parts it meets, in Map order. */
type PathParts = { readonly path: string; readonly parts: readonly string[] };

/** What `context` prints: the items that apply, each path's parts, the parts met, and the findings counted. */
export type Context = {
  /** The plan's name in the root, as the root spells it. */
  readonly plan: string;
  /** Principles, Constraints, Scenarios and Taste, in that order, each section in line order. */
  readonly items: readonly ReportItem[];
  /** One entry for each path, in the order given, a repeat listed once where it first appears. */
  readonly paths: readonly PathParts[];
  /** Every part some path meets, once, in Map order. */
  readonly parts: readonly ReportItem[];
  readonly errors: number;
  readonly warnings: number;
};

// The sections that print, in the format's order.
const PRINTED = ['principles', 'constraints', 'scenarios', 'taste'] as const;

/** A path in its usual form without a trailing `/`, or undefined when it can't be read. */
const bare = (written: string): string | undefined => {
  const read = readPath(written);
  return 'problem' in read ? undefined : read.path;
};

/** Whether two paths, compared without a trailing `/`, are the same or one is inside the other. */
const meets = (one: string, other: string): boolean =>
  one === other || one.startsWith(`${other}/`) || other.startsWith(`${one}/`);

/** Whether some path a Map part lists meets `path`. A part path that can't be read meets nothing. */
const partMeets = (part: ReportItem, path: string): boolean =>
  (part.paths ?? []).some((each) => {
    const claimed = bare(each.path);
    return claimed !== undefined && meets(claimed, path);
  });

/**
 * The paths as written, each in its usual form with its trailing `/` kept as given, a repeat
 * dropped, or the first one that can't be read and why: it's absolute, has a `..` segment, uses
 * `\`, or is empty.
 */
const readPaths = (
  written: readonly string[],
): { readonly paths: readonly { readonly shown: string; readonly path: string }[] } | { readonly problem: string } => {
  const paths: { readonly shown: string; readonly path: string }[] = [];
  for (const each of written) {
    const read = readPath(each);
    if ('problem' in read) {
      return { problem: `"${each}" ${read.problem}` };
    }
    const shown = `${read.path}${read.directory ? '/' : ''}`;
    if (!paths.some((path) => path.shown === shown)) {
      paths.push({ shown, path: read.path });
    }
  }
  return { paths };
};

/**
 * Selects from a report what applies to some paths: every Principle, Constraint, Scenario and Taste
 * item, in the format's order whatever order the plan writes them, and for each path the Map parts
 * it meets. A part meets a path when one of its `paths:` is the same path, or one is inside the
 * other, compared without a trailing `/`, as path-overlap compares them. A plan with findings
 * still yields its items. A path that can't be read is a problem, as a Map path's would be.
 */
export const selectContext = (report: Report, written: readonly string[]): Context | { readonly problem: string } => {
  const read = readPaths(written);
  if ('problem' in read) {
    return read;
  }
  const map = report.items.filter((item) => item.section === 'map');
  const meetings = read.paths.map(({ shown, path }) => ({
    path: shown,
    parts: map.filter((part) => partMeets(part, path)),
  }));
  const met = new Set(meetings.flatMap((each) => each.parts));
  return {
    plan: report.plan,
    items: PRINTED.flatMap((section) => report.items.filter((item) => item.section === section)),
    paths: meetings.map(({ path, parts }) => ({ path, parts: parts.map((part) => part.id) })),
    parts: map.filter((part) => met.has(part)),
    errors: report.errors,
    warnings: report.warnings,
  };
};
