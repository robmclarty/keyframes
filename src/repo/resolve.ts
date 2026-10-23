import type { Item } from '../items/index.js';
import type { Finding } from '../scan/index.js';
import { resolvePaths, type PathLink } from './map.js';
import { resolveHeldBy, type PointerLink, type Status } from './pointers.js';
import type { Repo } from './repo.js';

/** What an item's pointers and paths resolved to: held-by and status on C and S, paths on M. */
export type Links = {
  readonly id: string;
  readonly line: number;
  readonly heldBy: readonly PointerLink[] | undefined;
  readonly status: Status | undefined;
  readonly paths: readonly PathLink[] | undefined;
};

// The sections whose items are held by pointers, and carry a status.
const HELD: ReadonlySet<string> = new Set(['constraints', 'scenarios']);

/**
 * Resolves every item's pointers and Map paths against a read-only repo: each `held-by:` pointer on
 * a Constraint or Scenario, with the item's status, and each `paths:` path on a Map part. Existence
 * is checked in exact case, and a `(new)` target is planned until it exists.
 */
export const resolvePointers = (
  items: readonly Item[],
  repo: Repo,
): { readonly links: readonly Links[]; readonly findings: readonly Finding[] } => {
  const map = resolvePaths(items, repo);
  const held = items.map((item) =>
    HELD.has(item.section)
      ? resolveHeldBy(
          item.subLines.find((sub) => sub.key === 'held-by'),
          repo,
        )
      : undefined,
  );
  return {
    links: items.map((item, index) => ({
      id: item.id,
      line: item.line,
      heldBy: held[index]?.links,
      status: held[index]?.status,
      paths: map.links.get(item),
    })),
    findings: [...held.flatMap((each) => each?.findings ?? []), ...map.findings].toSorted(
      (a, b) => a.line - b.line,
    ),
  };
};
