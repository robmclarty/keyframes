import type { Item } from '../items/index.js';
import type { resolvePointers } from '../repo/index.js';
import type { Finding, SectionName } from '../scan/index.js';

/** What an item's pointers and paths resolved to, as `resolvePointers` links them. */
type Links = ReturnType<typeof resolvePointers>['links'][number];

/** An item, and what its pointers and paths resolved to. */
export type Entry = { readonly item: Item; readonly links: Links };

/** What a pointer or path resolved to: `resolved`, `planned`, `broken`, or `review`. */
export type Result = NonNullable<Links['heldBy']>[number]['result'];

/** What a Constraint's or Scenario's pointers add up to. */
export type Status = NonNullable<Links['status']>;

/**
 * One itemized section's count: its items, then what they break down into, in the report's order.
 * Map parts break down into their paths, Constraints and Scenarios into statuses, Decisions into
 * active and superseded, and Questions and Ideas into open and resolved.
 */
export type SectionCount = {
  readonly name: SectionName;
  readonly items: number;
  readonly breakdown: readonly (readonly [string, number])[];
};

/** An item as the report carries it: its ID, slug and keys in their usual form, and what it resolved to. */
export type ReportItem = {
  readonly id: string;
  readonly slug: string | undefined;
  readonly section: SectionName;
  readonly line: number;
  readonly text: string;
  readonly because: string | undefined;
  readonly paths: readonly { readonly path: string; readonly result: Result }[] | undefined;
  readonly heldBy: readonly { readonly pointer: string; readonly result: Result }[] | undefined;
  /** On Constraints and Scenarios only. */
  readonly status: Status | undefined;
  /** The ID it names in its usual form, or the value as written when it names none. */
  readonly supersededBy: string | undefined;
  readonly resolvedBy: string | undefined;
};

/** What `check` found in a plan: its counts, its items, and its findings in report order. */
export type Report = {
  /** The plan's name in the root, as the root spells it. */
  readonly plan: string;
  /** Whether the plan has an Intent section with something in it. */
  readonly intent: boolean;
  /** The itemized sections the plan has, in the order of the format's table. */
  readonly sections: readonly SectionCount[];
  readonly words: { readonly count: number; readonly budget: number };
  /** Every item, in line order. */
  readonly items: readonly ReportItem[];
  /** Sorted by line, then code, then message, with notes after errors and warnings. */
  readonly findings: readonly Finding[];
  readonly errors: number;
  readonly warnings: number;
  readonly notes: number;
};
