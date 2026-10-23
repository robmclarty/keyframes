import type { Item } from '../items/index.js';
import type { SectionName } from '../scan/index.js';
import type { Entry, Result, SectionCount, Status } from './report.js';

// The itemized sections, in the order of the format's table, which is the report's order too.
const ORDER: readonly SectionName[] = [
  'principles',
  'map',
  'constraints',
  'scenarios',
  'decisions',
  'taste',
  'questions',
  'ideas',
];

const STATUSES: readonly Status[] = ['linked', 'planned', 'review', 'unlinked', 'broken'];
const PATH_RESULTS: readonly Result[] = ['planned', 'broken'];

/** How many of `values` are `value`. */
const tally = <T>(values: readonly T[], value: T): number =>
  values.filter((each) => each === value).length;

/** Whether an item has a sub-line with `key`. */
const has = (item: Item, key: string): boolean => item.subLines.some((sub) => sub.key === key);

/** What a section's items break down into, from the items and what their pointers and paths resolved to. */
const breakdown = (name: SectionName, entries: readonly Entry[]): (readonly [string, number])[] => {
  const items = entries.map((entry) => entry.item);
  switch (name) {
    case 'map': {
      const results = entries.flatMap((entry) => entry.links.paths ?? []).map((path) => path.result);
      return [['paths', results.length], ...PATH_RESULTS.map((result) => [result, tally(results, result)] as const)];
    }
    case 'constraints':
    case 'scenarios': {
      const statuses = entries.map((entry) => entry.links.status);
      return STATUSES.map((status) => [status, tally(statuses, status)] as const);
    }
    case 'decisions': {
      const superseded = items.filter((item) => has(item, 'superseded-by')).length;
      return [
        ['active', items.length - superseded],
        ['superseded', superseded],
      ];
    }
    case 'questions':
    case 'ideas': {
      const resolved = items.filter((item) => has(item, 'resolved-by')).length;
      return [
        ['open', items.length - resolved],
        ['resolved', resolved],
      ];
    }
    default:
      return [];
  }
};

/**
 * Counts the itemized sections the plan has: each one with a heading, or with an item whose letter
 * is its own, wherever that item sits.
 */
export const countSections = (
  headings: readonly (SectionName | undefined)[],
  entries: readonly Entry[],
): SectionCount[] =>
  ORDER.flatMap((name) => {
    const mine = entries.filter((entry) => entry.item.section === name);
    return mine.length === 0 && !headings.includes(name)
      ? []
      : [{ name, items: mine.length, breakdown: breakdown(name, mine) }];
  });
