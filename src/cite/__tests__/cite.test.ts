import { describe, expect, test } from 'vitest';

import { readItems } from '../../items/index.js';
import { scan } from '../../scan/index.js';
import { resolveCitations } from '../index.js';

/** A plan from its lines, each ending in a newline. */
const md = (...lines: string[]): string => lines.map((line) => `${line}\n`).join('');

/** What resolving a plan's citations and references finds, given its lines. */
const cite = (...lines: string[]) => {
  const { lines: read } = scan(md(...lines));
  return resolveCitations(read, readItems(read).items);
};

/** Each finding's line and code. */
const codes = (...lines: string[]): [number, string][] =>
  cite(...lines).map(({ line, code }) => [line, code]);

/** The message of the only finding. */
const message = (...lines: string[]): string | undefined => {
  const findings = cite(...lines);
  expect(findings).toHaveLength(1);
  return findings[0]?.message;
};

// Lines 1 to 8: a constraint, a decision that replaced another, and a scenario.
const PLAN = [
  '## Constraints',
  '- **C3 (one-writer)**: Only the sync worker writes.',
  '## Decisions',
  '- **D4 (one-database)**: One SQLite file.',
  '  - because: boring.',
  '## Scenarios',
  '- **S1 (offline-edit)**: Someone edits on a plane.',
  '## Notes',
];

describe('citations', () => {
  test('a citation resolves in every section, in item text and in sub-line values', () => {
    expect(
      cite(
        '# keyframes',
        'Before any section: [C3 (one-writer)].',
        '## Intent',
        'Why it exists, per [D4 (one-database)].',
        '## Notes',
        'Free prose cites [S1 (offline-edit)].',
        '## Constraints',
        '- **C3 (one-writer)**: Only the sync worker writes, per [D4 (one-database)].',
        '  - because: [D4 (one-database)] says so,',
        '    and [S1 (offline-edit)] needs it.',
        '  - held-by: review',
        '### Why [S1 (offline-edit)] matters',
        '## Decisions',
        '- **D4 (one-database)**: One SQLite file.',
        '  - because: boring.',
        '## Scenarios',
        '- **S1 (offline-edit)**: Someone edits on a plane.',
      ),
    ).toEqual([]);
  });

  test('a citation to an ID no item has is broken-citation, wherever it is', () => {
    expect(
      codes(
        ...PLAN,
        'Free prose cites [C9 (gone)].',
        '## Intent',
        'Intent cites [P1 (calm)].',
        '## Taste',
        '- **T1 (calm)**: Calm, as [Q2 (open)] asks.',
        '  - because: [I7 (someday)] said so.',
      ),
    ).toEqual([
      [9, 'broken-citation'],
      [11, 'broken-citation'],
      [13, 'broken-citation'],
      [14, 'broken-citation'],
    ]);
    expect(message(...PLAN, 'See [C9 (gone)].')).toBe('[C9 (gone)] cites C9, but no item has that ID');
  });

  test('a citation inside code or a comment is never read', () => {
    expect(
      cite(
        ...PLAN,
        'Write `[C9 (gone)]` to cite C9.',
        'Before <!-- [C9 (gone)] --> after.',
        '```markdown',
        '[C9 (gone)]',
        '```',
        '<!--',
        '[C9 (gone)]',
        '-->',
        '- **C5 (fenced)**: An item whose example is code:',
        '  ```',
        '  [C9 (gone)]',
        '  ```',
      ),
    ).toEqual([]);
  });

  test("slug-mismatch names the item's current slug, on every citation still using the old one", () => {
    expect(message(...PLAN, 'See [D4 (sqlite-only)].')).toBe(
      '[D4 (sqlite-only)] cites D4, which is now (one-database)',
    );
    expect(
      codes(...PLAN, 'See [D4 (sqlite-only)].', 'And [D4 (sqlite-only)] again.', 'And [D4 (one.database)].'),
    ).toEqual([
      [9, 'slug-mismatch'],
      [10, 'slug-mismatch'],
      [11, 'slug-mismatch'],
    ]);
  });

  test('a bare S3 or D3.js in prose is plain text, even while S3 and D3 exist', () => {
    const prose = 'Files go to S3, charts use D3.js, the C4 model draws it, and C3 matters.';
    expect(cite(...PLAN, prose)).toEqual([]);
    expect(
      cite(
        '## Scenarios',
        '- **S3 (upload)**: Someone uploads a file.',
        '## Decisions',
        '- **D3 (charts)**: Charts.',
        '  - because: they read fast.',
        '## Intent',
        prose,
      ),
    ).toEqual([]);
  });

  test('brackets around something that is not an ID, or a bare ID nobody has, are plain text', () => {
    expect(
      cite(
        ...PLAN,
        'Files go to [S3], as [the docs] say.',
        '[S3]: https://aws.amazon.com/s3/',
        '- [x] a task, [H1 (expressible)], [C0 (zero)] and [C3a (one-writer)].',
      ),
    ).toEqual([]);
  });

  test('each citation on a line is read, and a citation can be a link', () => {
    expect(
      codes(...PLAN, 'See [C3 (one-writer)](#c3), [C9 (gone)] and [D4 (old)].'),
    ).toEqual([
      [9, 'broken-citation'],
      [9, 'slug-mismatch'],
    ]);
  });

  test('an item with no slug has nothing to check a citation against, so it reads fine', () => {
    expect(
      cite('## Constraints', '- **C5**: No slug yet.', 'See [C5] and [C5 (any-slug)].'),
    ).toEqual([]);
  });

  test('a citation reads in any case, with no note', () => {
    expect(cite(...PLAN, 'See [c3 (One-Writer)].')).toEqual([]);
  });

  test.each([
    ['no space before the slug', '[C3(one-writer)]'],
    ['spaces inside the brackets', '[ C3 (one-writer) ]'],
    ['two spaces before the slug', '[C3  (one-writer)]'],
    ['spaces inside the parentheses', '[C3 ( one-writer )]'],
    ['spaces for the hyphens in the slug', '[C3 (one writer)]'],
    ['underscores for the hyphens in the slug', '[C3 (one_writer)]'],
    ['a leading zero', '[C03 (one-writer)]'],
    ['no slug, while C3 exists', '[C3]'],
  ])('a citation with %s resolves like the usual form, with one note', (_, written) => {
    expect(codes(...PLAN, `See ${written}.`)).toEqual([[9, 'alternate-form']]);
  });

  test("a variant citation's note shows the usual form, with the item's slug", () => {
    expect(message(...PLAN, 'See [C3].')).toBe(
      `"[C3]" reads fine, though it can't notice a rename; the usual form is [C3 (one-writer)]`,
    );
    expect(message(...PLAN, 'See [C3(one-writer)].')).toBe(
      '"[C3(one-writer)]" reads fine; the usual form is [C3 (one-writer)]',
    );
  });
});

// Lines 1 to 9: a decision that replaced another, and a question it settled.
const DECIDED = [
  '## Decisions',
  '- **D1 (sqlite)**: One SQLite file.',
  '  - because: boring.',
  '- **D2 (postgres)**: Postgres.',
  '  - because: it scales.',
  '## Questions',
  '- **Q1 (database)**: Which database?',
  '## Ideas',
  '- **I1 (cache)**: A cache in front of it.',
];

describe('references', () => {
  test('superseded-by and resolved-by resolve to a decision, in any case', () => {
    expect(
      cite(
        '## Decisions',
        '- **D1 (sqlite)**: One SQLite file.',
        '  - because: boring.',
        '  - superseded-by: D2',
        '- **D2 (postgres)**: Postgres.',
        '  - because: it scales.',
        '## Questions',
        '- **Q1 (database)**: Which database?',
        '  - resolved-by: D2',
        '## Ideas',
        '- **I1 (cache)**: A cache in front of it.',
        '  - resolved-by: d2',
      ),
    ).toEqual([]);
  });

  test.each([
    ['an ID no item has', 'D9', `"resolved-by: D9" names D9, but no item has that ID`],
    ['an item that is not a decision', 'Q1', `"resolved-by: Q1" names Q1, which isn't a decision`],
    ['words', 'the postgres one', `"resolved-by: the postgres one" isn't a decision's ID`],
    ['two IDs', 'D1, D2', `"resolved-by: D1, D2" isn't a decision's ID`],
    ['nothing', '', `"resolved-by: " isn't a decision's ID`],
    ['an unclosed bracket', '[D2', `"resolved-by: [D2" isn't a decision's ID`],
    ['a citation of something else', '[C3 (one-writer)]', `"resolved-by: [C3 (one-writer)]" names C3, but no item has that ID`],
  ])('a reference to %s is bad-reference', (_, value, found) => {
    expect(message(...DECIDED, `  - resolved-by: ${value}`.trimEnd())).toBe(
      `${found}; the usual form is - resolved-by: D<n>`,
    );
  });

  test("a reference whose slug is not the decision's is slug-mismatch", () => {
    expect(message(...DECIDED, '  - resolved-by: D2 (mysql)')).toBe(
      'D2 (mysql) cites D2, which is now (postgres)',
    );
  });

  test.each([
    ['its slug', 'D2 (postgres)'],
    ['its slug, bracketed', '[D2 (postgres)]'],
    ['brackets', '[D2]'],
    ['its slug in another case and spacing', '[ D2 (Postgres) ]'],
    ['a leading zero', 'D02'],
  ])('a reference with %s resolves like the bare ID, with one note', (_, value) => {
    expect(codes(...DECIDED, `  - resolved-by: ${value}`)).toEqual([[10, 'alternate-form']]);
  });

  test("a reference variant's note shows the bare ID", () => {
    expect(message(...DECIDED, '  - resolved-by: [D2 (postgres)]')).toBe(
      '"resolved-by: [D2 (postgres)]" reads fine; the usual form is the bare ID: - resolved-by: D2',
    );
  });

  test('a reference is read once, not again as a citation', () => {
    expect(codes(...DECIDED, '  - resolved-by: [D9 (gone)],', '    [D8 (gone)]')).toEqual([
      [10, 'bad-reference'],
    ]);
  });
});
