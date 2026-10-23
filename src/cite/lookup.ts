import type { Item } from '../items/index.js';
import { finding, type Finding } from '../scan/index.js';

/** The items by ID. With two items on one ID, which is duplicate-id, the first is the one cited. */
export type Lookup = ReadonlyMap<string, Item>;

/** The items by ID, the first of each kept. */
export const lookup = (items: readonly Item[]): Lookup => {
  const byId = new Map<string, Item>();
  for (const item of items) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }
  return byId;
};

/** The error for a citation or reference whose slug isn't the item's current one. */
export const slugMismatch = (written: string, item: Item, line: number): Finding =>
  finding(
    'slug-mismatch',
    line,
    `${written} cites ${item.id}, which is now (${item.slug ?? ''})`,
  );
