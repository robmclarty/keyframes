import { describe, expect, test } from 'vitest';

import { memoryRepo, type Repo } from '../../repo/index.js';
import { check, exitCode, findPlan, type Report } from '../index.js';

/** A plan from its lines, each ending in a newline. */
const md = (...lines: string[]): string => lines.map((line) => `${line}\n`).join('');

/** The report on a plan, from its lines, against `files`. */
const report = (lines: readonly string[], files: Readonly<Record<string, string>> = {}): Report =>
  check({ name: 'keyframes.md', text: md(...lines) }, memoryRepo(files));

/** Each finding's line and code. */
const codes = (lines: readonly string[], files?: Readonly<Record<string, string>>): [number, string][] =>
  report(lines, files).findings.map(({ line, code }) => [line, code]);

/** `count` words, each `w`. */
const words = (count: number): string => Array.from({ length: count }, () => 'w').join(' ');

const INTENT = ['## Intent', 'Why it exists.'];

/** A decision's lines, superseded or not. */
const decision = (index: number, superseded: boolean): string[] => [
  `- **D${String(index)} (d${String(index)})**: A decision.`,
  '  - because: so.',
  ...(superseded ? ['  - superseded-by: D1'] : []),
];

describe('findPlan', () => {
  test('finds keyframes.md, and reads it as UTF-8 with its BOM', () => {
    expect(findPlan(memoryRepo({ 'keyframes.md': '﻿## Intent\n', 'README.md': '' }))).toEqual({
      plan: { name: 'keyframes.md', text: '## Intent\n' },
    });
  });

  test.each(['KEYFRAMES.md', 'Keyframes.MD'])('finds %s, in any case', (name) => {
    expect(findPlan(memoryRepo({ [name]: 'x' }))).toEqual({ plan: { name, text: 'x' } });
  });

  test.each<[string, Repo, string]>([
    ['no plan', memoryRepo({ 'README.md': '' }), `there's no keyframes.md to check; "keyframes init" writes one`],
    [
      'two names that differ only in case',
      memoryRepo({ 'keyframes.md': '', 'KEYFRAMES.md': '' }),
      'KEYFRAMES.md and keyframes.md differ only in case, so neither is read as the plan; keep one',
    ],
    ['a directory', memoryRepo({ 'keyframes.md/': '' }), "keyframes.md isn't a file"],
    ['bytes that are not UTF-8', memoryRepo({ 'keyframes.md': new Uint8Array([0x23, 0xff, 0x0a]) }), "keyframes.md isn't UTF-8 text"],
  ])('%s is a read problem', (_, repo, problem) => {
    expect(findPlan(repo)).toEqual({ problem });
  });

  test('a plan that cannot be read is a read problem, naming the error code', () => {
    const repo = memoryRepo({ 'keyframes.md': '' });
    const locked: Repo = {
      ...repo,
      read: () => {
        throw Object.assign(new Error('EACCES: permission denied, open /abs/keyframes.md'), { code: 'EACCES' });
      },
    };
    expect(findPlan(locked)).toEqual({ problem: "keyframes.md can't be read (EACCES)" });
  });
});

describe('the plan name', () => {
  test('another case reads fine, with a note on line 1', () => {
    const { plan, findings } = check({ name: 'KEYFRAMES.md', text: md(...INTENT) }, memoryRepo({}));
    expect(plan).toBe('KEYFRAMES.md');
    expect(findings).toEqual([
      {
        line: 1,
        severity: 'note',
        code: 'alternate-form',
        message: '"KEYFRAMES.md" reads fine; the usual form is "keyframes.md"',
      },
    ]);
  });
});

describe('counts', () => {
  test('a section is counted when it has a heading or an item, in the table order', () => {
    const { sections, intent } = report([
      '## Taste',
      '## Notes',
      '- **C1 (stray)**: A constraint outside its section.',
      '## Intent',
      'Why.',
    ]);
    expect(intent).toBe(true);
    expect(sections).toEqual([
      {
        name: 'constraints',
        items: 1,
        breakdown: [
          ['linked', 0],
          ['planned', 0],
          ['review', 0],
          ['unlinked', 1],
          ['broken', 0],
        ],
      },
      { name: 'taste', items: 0, breakdown: [] },
    ]);
  });

  test('Map parts count their paths and what they resolved to', () => {
    const { sections } = report(
      [
        '## Map',
        '- **M1 (api)**: The API.',
        '  - paths: src/api/, src/jobs/ (new), src/gone/',
        '- **M2 (idea)**: A concept, with no paths.',
      ],
      { 'src/api/x.ts': '' },
    );
    expect(sections).toEqual([
      {
        name: 'map',
        items: 2,
        breakdown: [
          ['paths', 3],
          ['planned', 1],
          ['broken', 1],
        ],
      },
    ]);
  });

  test('Constraints and Scenarios count their statuses', () => {
    const { sections } = report(
      [
        '## Constraints',
        '- **C1 (a)**: Linked.',
        '  - held-by: file:a.ts',
        '- **C2 (b)**: Planned.',
        '  - held-by: file:b.ts (new)',
        '- **C3 (c)**: Review.',
        '  - held-by: review',
        '- **C4 (d)**: Unlinked.',
        '- **C5 (e)**: Broken.',
        '  - held-by: file:e.ts',
        '## Scenarios',
        '- **S1 (f)**: Linked.',
        '  - held-by: file:a.ts, review',
      ],
      { 'a.ts': '' },
    );
    expect(sections.map(({ name, items, breakdown }) => [name, items, breakdown.map(([, count]) => count)])).toEqual([
      ['constraints', 5, [1, 1, 1, 1, 1]],
      ['scenarios', 1, [1, 0, 0, 0, 0]],
    ]);
  });

  test('Decisions count the active and the superseded, Questions and Ideas the open and the resolved', () => {
    const { sections } = report([
      '## Decisions',
      '- **D1 (old)**: Old.',
      '  - because: then.',
      '  - superseded-by: D2',
      '- **D2 (new)**: New.',
      '  - because: now.',
      '## Questions',
      '- **Q1 (open)**: Open?',
      '- **Q2 (settled)**: Settled?',
      '  - resolved-by: D2',
      '## Ideas',
      '- **I1 (someday)**: Someday.',
    ]);
    expect(sections.map(({ name, breakdown }) => [name, breakdown])).toEqual([
      ['decisions', [['active', 1], ['superseded', 1]]],
      ['questions', [['open', 1], ['resolved', 1]]],
      ['ideas', [['open', 1], ['resolved', 0]]],
    ]);
  });

  test('an Intent with nothing in it is no intent', () => {
    expect(report(['## Intent', '<!-- say why -->']).intent).toBe(false);
    expect(report([]).intent).toBe(false);
  });
});

describe('items', () => {
  test('every item carries its text, its sub-lines in their usual form, and what they resolved to', () => {
    const { items } = report(
      [
        '## Map',
        '- **M1 (api)**: The API,',
        '  across two lines.',
        '  - Path: src/api/, src/jobs/ (new)',
        '## Constraints',
        '* __C3 (One Writer):__ Only the sync worker writes.',
        '  - because: two writers',
        '    disagreed.',
        '  - held by: file:test/w.ts#"one writer", review',
        '- **C4**: No slug.',
        '## Decisions',
        '- **D1 (postgres)**: Postgres.',
        '  - because: we knew it.',
        '  - superseded-by: [D2 (sqlite)]',
        '- **D2 (sqlite)**: SQLite.',
        '  - because: one file.',
        '## Ideas',
        '- **I1 (viewer)**: A viewer.',
        '  - resolved-by: not a decision',
      ],
      { 'src/api/x.ts': '', 'test/w.ts': 'one writer' },
    );
    const none = { slug: undefined, because: undefined, paths: undefined, heldBy: undefined, status: undefined };
    const unsettled = { supersededBy: undefined, resolvedBy: undefined };
    expect(items).toEqual([
      {
        ...none,
        ...unsettled,
        id: 'M1',
        slug: 'api',
        section: 'map',
        line: 2,
        text: 'The API,\nacross two lines.',
        paths: [
          { path: 'src/api/', result: 'resolved' },
          { path: 'src/jobs/', result: 'planned' },
        ],
      },
      {
        ...none,
        ...unsettled,
        id: 'C3',
        slug: 'one-writer',
        section: 'constraints',
        line: 6,
        text: 'Only the sync worker writes.',
        because: 'two writers\ndisagreed.',
        heldBy: [
          { pointer: 'file:test/w.ts#"one writer"', result: 'resolved' },
          { pointer: 'review', result: 'review' },
        ],
        status: 'linked',
      },
      { ...none, ...unsettled, id: 'C4', section: 'constraints', line: 10, text: 'No slug.', status: 'unlinked' },
      {
        ...none,
        ...unsettled,
        id: 'D1',
        slug: 'postgres',
        section: 'decisions',
        line: 12,
        text: 'Postgres.',
        because: 'we knew it.',
        supersededBy: 'D2',
      },
      { ...none, ...unsettled, id: 'D2', slug: 'sqlite', section: 'decisions', line: 15, text: 'SQLite.', because: 'one file.' },
      {
        ...none,
        ...unsettled,
        id: 'I1',
        slug: 'viewer',
        section: 'ideas',
        line: 18,
        text: 'A viewer.',
        resolvedBy: 'not a decision',
      },
    ]);
  });
});

describe('budgets', () => {
  test('the whole file warns past 2000 words outside code and comments, on line 1', () => {
    const at = (body: readonly string[]) => report([...INTENT, ...body]);
    // The intent is 5 words: "##", "Intent", "Why", "it", "exists.".
    expect(at([words(1995)]).words).toEqual({ count: 2000, budget: 2000 });
    expect(at([words(1995)]).findings).toEqual([]);
    expect(at([words(1996)]).findings).toEqual([
      {
        line: 1,
        severity: 'warning',
        code: 'over-budget',
        message: 'the plan has 2001 words outside code and comments; the budget is 2000',
      },
    ]);
    const hidden = ['```', words(50), '```', `<!-- ${words(50)} -->`, `\`${words(50)}\` w`];
    expect(at(hidden).words.count).toBe(6);
  });

  test("an item's text warns past 60 words, on the item's line, whatever its sub-lines hold", () => {
    const item = (count: number) => [
      ...INTENT,
      '## Principles',
      `- **P1 (long)**: ${words(count - 5)}`,
      `  ${words(5)}`,
      `  - because: ${words(100)}`,
    ];
    expect(codes(item(60))).toEqual([]);
    expect(report(item(61)).findings).toEqual([
      { line: 4, severity: 'warning', code: 'over-budget', message: "P1's text has 61 words; the budget is 60" },
    ]);
  });

  test.each([
    ['principles', 'P', 7, 'principles'],
    ['map', 'M', 7, 'parts'],
    ['constraints', 'C', 12, 'constraints'],
    ['scenarios', 'S', 10, 'scenarios'],
    ['taste', 'T', 12, 'taste items'],
    ['questions', 'Q', 10, 'open questions'],
    ['ideas', 'I', 10, 'open ideas'],
  ])('%s warn past %s items, on the heading', (section, letter, limit, noun) => {
    const plan = (count: number) => [
      ...INTENT,
      `## ${section}`,
      ...Array.from({ length: count }, (_, index) => `- **${letter}${String(index + 1)} (x${String(index)})**: An item.`),
    ];
    expect(codes(plan(limit))).toEqual([]);
    expect(report(plan(limit + 1)).findings).toEqual([
      {
        line: 3,
        severity: 'warning',
        code: 'over-budget',
        message: `the plan has ${String(limit + 1)} ${noun}; the budget is ${String(limit)}`,
      },
    ]);
  });

  test('only active Decisions and open Questions count', () => {
    const decisions = (active: number) => [
      ...INTENT,
      '## Decisions',
      ...Array.from({ length: 25 }, (_, index) => decision(index + 1, index >= active)).flat(),
    ];
    expect(codes(decisions(20))).toEqual([]);
    expect(report(decisions(21)).findings.map(({ message }) => message)).toEqual([
      'the plan has 21 active decisions; the budget is 20',
    ]);
    const questions = [
      ...INTENT,
      '## Decisions',
      '- **D1 (d)**: Decided.',
      '  - because: so.',
      '## Questions',
      ...Array.from({ length: 12 }, (_, index) => [
        `- **Q${String(index + 1)} (q${String(index)})**: A question?`,
        ...(index < 2 ? ['  - resolved-by: D1'] : []),
      ]).flat(),
    ];
    expect(codes(questions)).toEqual([]);
  });

  test('items with no heading of their own warn on the first of them', () => {
    const plan = [
      ...INTENT,
      ...Array.from({ length: 8 }, (_, index) => `- **P${String(index + 1)} (p${String(index)})**: Loose.`),
    ];
    expect(codes(plan).filter(([, code]) => code === 'over-budget')).toEqual([[3, 'over-budget']]);
  });
});

describe('findings', () => {
  test('sort by line, then code, then message, with notes after errors and warnings', () => {
    expect(
      codes([
        '## Intent',
        '## Constraints',
        '* **C1 (a)**: [C9 (x)] and [C1 (b)], with [C8 (y)].',
        '- **C1 (dup)**: Again.',
        '* **C2**: No slug.',
      ]),
    ).toEqual([
      [1, 'no-intent'],
      [3, 'broken-citation'],
      [3, 'broken-citation'],
      [3, 'slug-mismatch'],
      [4, 'duplicate-id'],
      [5, 'missing-slug'],
      [3, 'alternate-form'],
      [5, 'alternate-form'],
    ]);
    const messages = report(['## Intent', 'x', '- [C9 (x)] and [C8 (y)]']).findings.map(({ message }) => message);
    expect(messages).toEqual([
      '[C8 (y)] cites C8, but no item has that ID',
      '[C9 (x)] cites C9, but no item has that ID',
    ]);
  });

  test('the counts of errors, warnings and notes match the findings', () => {
    const { errors, warnings, notes } = report(['## Constraints', '* **C1 (a)**: [C9 (x)].']);
    expect({ errors, warnings, notes }).toEqual({ errors: 1, warnings: 1, notes: 1 });
  });
});

describe('exitCode', () => {
  test.each([
    [{ errors: 0, warnings: 0, notes: 0 }, false, 0],
    [{ errors: 0, warnings: 0, notes: 3 }, true, 0],
    [{ errors: 0, warnings: 2, notes: 0 }, false, 0],
    [{ errors: 0, warnings: 2, notes: 0 }, true, 1],
    [{ errors: 1, warnings: 0, notes: 0 }, false, 1],
  ])('%j with --strict %s exits %i', (counts, strict, code) => {
    expect(exitCode({ ...report([]), ...counts }, strict)).toBe(code);
  });
});
