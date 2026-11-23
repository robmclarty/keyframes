import type { Item } from '../items/index.js';
import { finding, type Finding, type Line, type SectionName } from '../scan/index.js';

/** A budgeted section: what a message calls its items, and the key that settles one. */
type Section = { readonly noun: string; readonly settledBy?: string };

// Each itemized section a budget counts. Decisions count only the active ones, and Questions and
// Ideas only the open ones, so a superseded decision or a settled question costs nothing.
const SECTIONS = {
  principles: { noun: 'principles' },
  map: { noun: 'parts' },
  constraints: { noun: 'constraints' },
  scenarios: { noun: 'scenarios' },
  decisions: { noun: 'active decisions', settledBy: 'superseded-by' },
  taste: { noun: 'taste items' },
  questions: { noun: 'open questions', settledBy: 'resolved-by' },
  ideas: { noun: 'open ideas', settledBy: 'resolved-by' },
} as const satisfies Readonly<Partial<Record<SectionName, Section>>>;

/** The sections a budget counts, in the order a message lists them. */
const SECTION_NAMES = [
  'principles',
  'map',
  'constraints',
  'scenarios',
  'decisions',
  'taste',
  'questions',
  'ideas',
] as const satisfies ReadonlyArray<keyof typeof SECTIONS>;

/** Every budget's name on the command line: the whole file's words, one item's, then each section. */
const NAMES = ['words', 'item', ...SECTION_NAMES] as const;

/** What a budget is named on the command line. */
type BudgetName = (typeof NAMES)[number];

/** Every budget, by name: words for the file and an item, a count of items for a section. */
export type Budgets = Readonly<Record<BudgetName, number>>;

/**
 * The budgets a plan gets unless `check` is told otherwise. They're starting values while people
 * learn what a plan needs, so `--budget` adjusts any of them for one run.
 */
export const BUDGETS: Budgets = {
  words: 2000,
  item: 60,
  principles: 7,
  map: 7,
  constraints: 12,
  scenarios: 10,
  decisions: 20,
  taste: 12,
  questions: 10,
  ideas: 10,
};

/** A budget that isn't its default, so a report can say what it checked against. */
export type AdjustedBudget = { readonly name: BudgetName; readonly budget: number; readonly default: number };

/** The budgets in `budgets` that differ from `BUDGETS`, in the order `--budget` names them. */
export const adjustedBudgets = (budgets: Budgets): AdjustedBudget[] =>
  NAMES.filter((name) => budgets[name] !== BUDGETS[name]).map((name) => ({
    name,
    budget: budgets[name],
    default: BUDGETS[name],
  }));

/** Whether `name` names a budget. */
const isBudgetName = (name: string): name is BudgetName => NAMES.some((each) => each === name);

/**
 * Reads a `--budget` value, `name:count` pairs joined by commas, over `base`, or says what's wrong
 * with it. A count is a whole number above zero.
 */
export const readBudgets = (
  text: string,
  base: Budgets = BUDGETS,
): { readonly budgets: Budgets } | { readonly problem: string } => {
  const budgets: Record<BudgetName, number> = { ...base };
  for (const pair of text.split(',')) {
    const [name = '', count = '', ...rest] = pair.trim().split(':');
    if (!isBudgetName(name)) {
      return { problem: `"${name}" isn't a budget; the budgets are ${NAMES.join(', ')}` };
    }
    if (rest.length > 0 || !/^[1-9]\d*$/.test(count)) {
      return { problem: `"${pair.trim()}" needs a whole number above zero, as in ${name}:${String(BUDGETS[name])}` };
    }
    budgets[name] = Number(count);
  }
  return { budgets };
};

/** How many words are in `text`: runs of characters that aren't whitespace. */
const wordsIn = (text: string): number => text.match(/\S+/g)?.length ?? 0;

/** How many words the plan has outside code and comments. */
export const countWords = (lines: readonly Line[]): number =>
  lines.reduce((sum, line) => sum + wordsIn(line.prose), 0);

/** over-budget for each item whose text runs past its budget, on the item's line. */
const itemBudgets = (items: readonly Item[], limit: number): Finding[] =>
  items.flatMap((item) => {
    const count = wordsIn(item.text);
    return count > limit
      ? [finding('over-budget', item.line, `${item.id}'s text has ${String(count)} words; the budget is ${String(limit)}`)]
      : [];
  });

/**
 * over-budget for each kind of item the plan has more of than its budget, counted by letter wherever
 * the items sit, on its section's heading, or on the first such item when the plan has no heading.
 */
const sectionBudgets = (lines: readonly Line[], items: readonly Item[], budgets: Budgets): Finding[] =>
  SECTION_NAMES.flatMap((name) => {
    const { noun, settledBy }: Section = SECTIONS[name];
    const limit = budgets[name];
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
 * Checks the plan against its budgets, `BUDGETS` unless the caller adjusts them: the whole file's
 * words, each item's text, and each itemized section's count. Every breach is an over-budget
 * warning, which fails a run only under --strict.
 */
export const overBudget = (
  lines: readonly Line[],
  items: readonly Item[],
  words: number,
  budgets: Budgets = BUDGETS,
): Finding[] => [
  ...(words > budgets.words
    ? [
        finding(
          'over-budget',
          1,
          `the plan has ${String(words)} words outside code and comments; the budget is ${String(budgets.words)}`,
        ),
      ]
    : []),
  ...itemBudgets(items, budgets.item),
  ...sectionBudgets(lines, items, budgets),
];
