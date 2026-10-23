import type { Item } from '../items/index.js';
import { finding, type Finding, type Line, type SectionName } from '../scan/index.js';

/** The whole file's budget, in words outside code and comments. */
export const WORDS = 2000;

// One item's text, in words.
const ITEM_WORDS = 60;

/** A section's budget: how many items, what a message calls them, and the key that settles one. */
type Budget = { readonly limit: number; readonly noun: string; readonly settledBy?: string };

// Each itemized section's budget. Decisions count only the active ones, and Questions and Ideas
// only the open ones, so a superseded decision or a settled question costs nothing.
const SECTIONS: Readonly<Partial<Record<SectionName, Budget>>> = {
  principles: { limit: 7, noun: 'principles' },
  map: { limit: 7, noun: 'parts' },
  constraints: { limit: 12, noun: 'constraints' },
  scenarios: { limit: 10, noun: 'scenarios' },
  decisions: { limit: 20, noun: 'active decisions', settledBy: 'superseded-by' },
  taste: { limit: 12, noun: 'taste items' },
  questions: { limit: 10, noun: 'open questions', settledBy: 'resolved-by' },
  ideas: { limit: 10, noun: 'open ideas', settledBy: 'resolved-by' },
};

/** How many words are in `text`: runs of characters that aren't whitespace. */
const wordsIn = (text: string): number => text.match(/\S+/g)?.length ?? 0;

/** How many words the plan has outside code and comments. */
export const countWords = (lines: readonly Line[]): number =>
  lines.reduce((sum, line) => sum + wordsIn(line.prose), 0);

/** over-budget for each item whose text runs past its budget, on the item's line. */
const itemBudgets = (items: readonly Item[]): Finding[] =>
  items.flatMap((item) => {
    const count = wordsIn(item.text);
    return count > ITEM_WORDS
      ? [finding('over-budget', item.line, `${item.id}'s text has ${String(count)} words; the budget is ${String(ITEM_WORDS)}`)]
      : [];
  });

/**
 * over-budget for each kind of item the plan has more of than its budget, counted by letter wherever
 * the items sit, on its section's heading, or on the first such item when the plan has no heading.
 */
const sectionBudgets = (lines: readonly Line[], items: readonly Item[]): Finding[] =>
  Object.entries(SECTIONS).flatMap(([name, { limit, noun, settledBy }]) => {
    const counted = items.filter(
      (item) => item.section === name && !item.subLines.some((sub) => sub.key === settledBy),
    );
    const [first] = counted;
    if (counted.length <= limit || first === undefined) {
      return [];
    }
    const heading = lines.find((line) => line.section?.name === name)?.section;
    return [
      finding(
        'over-budget',
        heading?.line ?? first.line,
        `the plan has ${String(counted.length)} ${noun}; the budget is ${String(limit)}`,
      ),
    ];
  });

/**
 * Checks the plan against its budgets: the whole file's words, each item's text, and each itemized
 * section's count. Every breach is an over-budget warning, which fails a run only under --strict.
 */
export const budgets = (lines: readonly Line[], items: readonly Item[], words: number): Finding[] => [
  ...(words > WORDS
    ? [
        finding(
          'over-budget',
          1,
          `the plan has ${String(words)} words outside code and comments; the budget is ${String(WORDS)}`,
        ),
      ]
    : []),
  ...itemBudgets(items),
  ...sectionBudgets(lines, items),
];
