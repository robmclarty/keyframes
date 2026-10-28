import { describe, expect, test } from 'vitest';

import { scan } from '../../scan/index.js';
import { readItems } from '../index.js';

/** A plan from its lines, each ending in a newline. */
const md = (...lines: string[]): string => lines.map((line) => `${line}\n`).join('');

/** The items and findings in a plan, given its lines. */
const read = (...lines: string[]) => readItems(scan(md(...lines)).lines);

/** Each finding's line and code: what reading the items found, at a glance. */
const codes = (...lines: string[]): [number, string][] =>
  read(...lines).findings.map(({ line, code }) => [line, code]);

/** The message of the only finding in a plan. */
const message = (...lines: string[]): string | undefined => {
  const { findings } = read(...lines);
  expect(findings).toHaveLength(1);
  return findings[0]?.message;
};

/** Each item's ID, then each of its sub-lines as key, line and value. */
const keys = (...lines: string[]) =>
  read(...lines).items.map(({ id, subLines }) => [
    id,
    subLines.map(({ key, line, value }) => [key, line, value]),
  ]);

describe('items', () => {
  test('the usual item line reads as its ID, slug, section, line and text', () => {
    expect(
      read('## Constraints', '- **C3 (one-writer)**: Only the sync worker writes to the database.'),
    ).toEqual({
      items: [
        {
          id: 'C3',
          slug: 'one-writer',
          section: 'constraints',
          line: 2,
          text: 'Only the sync worker writes to the database.',
          subLines: [],
        },
      ],
      findings: [],
    });
  });

  test.each([
    ['## Principles', '- **P1 (no-lost-work)**: Losing work is worse than being slow.', 'principles'],
    ['## Map', '- **M1 (api)**: The HTTP API.', 'map'],
    ['## Constraints', '- **C1 (one-writer)**: Only one writer.', 'constraints'],
    ['## Scenarios', '- **S1 (offline-edit)**: Someone edits on a plane.', 'scenarios'],
    ['## Taste', '- **T1 (calm-errors)**: Errors are calm.', 'taste'],
    ['## Questions', '- **Q1 (sharing)**: Should plans be shareable by link?', 'questions'],
    ['## Ideas', '- **I1 (dark-mode)**: A dark theme.', 'ideas'],
    ['## Decision', '- **D1 (sqlite)**: One SQLite file.\n  - because: boring.', 'decisions'],
  ])('%s reads its own letter', (heading, item, section) => {
    const { items, findings } = read(heading, item);
    expect(items.map((each) => each.section)).toEqual([section]);
    expect(findings).toEqual([]);
  });

  test('an ID, slug and key read in any case, in their usual form, with no note', () => {
    const { items, findings } = read(
      '## Constraints',
      '- **c3 (One-Writer)**: Only one writer.',
      '  - HELD-BY: review',
    );
    expect(items.map(({ id, slug, subLines }) => [id, slug, subLines[0]?.key])).toEqual([
      ['C3', 'one-writer', 'held-by'],
    ]);
    expect(findings).toEqual([]);
  });

  test('indented lines that are not bullets continue the text, with their indentation removed', () => {
    const { items } = read(
      '## Constraints',
      '- **C3 (one-writer)**: Only the sync worker',
      '  writes to the database,',
      '        even during a replay.',
    );
    expect(items[0]?.text).toBe(
      'Only the sync worker\nwrites to the database,\neven during a replay.',
    );
  });

  test('an item with no bullet runs on over its paragraph, and a line that reads as an item starts the next', () => {
    const { items, findings } = read(
      '## Constraints',
      '**C1 (one-writer)**: Only the sync worker',
      'writes to the database.',
      '**C2 (no-egress)**: Nothing calls out.',
      '  - held-by: review',
      'A paragraph after it, at column 0.',
    );
    expect(items.map(({ id, text, subLines }) => [id, text, subLines.length])).toEqual([
      ['C1', 'Only the sync worker\nwrites to the database.', 0],
      ['C2', 'Nothing calls out.', 1],
    ]);
    const note = 'an item without a bullet reads fine; the usual form starts with "-": - **C<n> (<slug>)**: …';
    expect(findings.map((each) => [each.line, each.message])).toEqual([
      [2, note],
      [4, note],
    ]);
  });

  test('a paragraph that opens with bold is prose, with no finding, unless a colon or a dash follows its ID', () => {
    expect(
      read('## Decisions', '**D3 (sqlite)** was replaced by a server.', '', '**Note:** nothing here is an item.'),
    ).toEqual({ items: [], findings: [] });
  });

  test('an item line one to three spaces in starts an item, even under another, while one four spaces in is prose', () => {
    const { items, findings } = read(
      '## Constraints',
      '- **C1 (one-writer)**: Only one writer.',
      '  - **C2 (no-egress)**: Nothing calls out.',
      '    - **C3 (offline)**: Works offline.',
    );
    expect(items.map(({ id, text }) => [id, text])).toEqual([
      ['C1', 'Only one writer.'],
      ['C2', 'Nothing calls out.\n- **C3 (offline)**: Works offline.'],
    ]);
    expect(findings.map((each) => [each.line, each.message])).toEqual([
      [3, 'an indented item reads fine; the usual form starts at column 0: - **C<n> (<slug>)**: …'],
    ]);
  });

  test('a slug can be in any script, and an accent typed as its own mark reads as one typed with its letter', () => {
    const { items, findings } = read(
      '## Constraints',
      '- **C1 (Caf\u00e9-Cr\u00e8me)**: Coffee.',
      '- **C2 (cafe\u0301)**: An accent typed as its own mark.',
      '- **C3 (\u65e5\u672c\u8a9e)**: Japanese.',
    );
    expect(items.map(({ slug }) => slug)).toEqual(['caf\u00e9-cr\u00e8me', 'caf\u00e9', '\u65e5\u672c\u8a9e']);
    expect(findings).toEqual([]);
  });

  test('the text can start on the line after the ID', () => {
    const { items, findings } = read(
      '## Constraints',
      '- **C3 (one-writer)**:',
      '  Only the sync worker writes.',
    );
    expect(items[0]?.text).toBe('Only the sync worker writes.');
    expect(findings).toEqual([]);
  });

  test('nested bullets that are not sub-lines are part of the text', () => {
    const { items, findings } = read(
      '## Decisions',
      '- **D1 (sqlite)**: One SQLite file holds all state:',
      '  - the plans, and',
      '  - Pros: no server to run.',
      '    1. backups are a file copy',
      '  - because: one boring database beats two clever ones.',
    );
    expect(items[0]?.text).toBe(
      'One SQLite file holds all state:\n- the plans, and\n- Pros: no server to run.\n1. backups are a file copy',
    );
    expect(items[0]?.subLines.map(({ key, value }) => [key, value])).toEqual([
      ['because', 'one boring database beats two clever ones.'],
    ]);
    expect(findings).toEqual([]);
  });

  test('an item runs past blank lines, code and comments, to the next line at column 0', () => {
    const { items, findings } = read(
      '## Constraints',
      '### Storage',
      '- **C1 (one-writer)**: Only one writer.',
      '',
      '  Even in tests.',
      '  ```yaml',
      '  - because: an example, not a sub-line',
      '  ```',
      '  <!-- a note for later -->',
      'A paragraph between items.',
      '  Not part of C1.',
      '- **C2 (no-egress)**: Nothing calls out.',
      '### Network',
      '  Not part of C2.',
      '- **C3 (no-pii)**: No personal data in logs.',
      '---',
      '  Not part of C3.',
      '- **C4 (utc)**: Times are UTC.',
      '```',
      '  Not part of C4.',
      '```',
      '  Not part of C4 either.',
    );
    expect(items.map(({ id, text }) => [id, text])).toEqual([
      ['C1', 'Only one writer.\nEven in tests.'],
      ['C2', 'Nothing calls out.'],
      ['C3', 'No personal data in logs.'],
      ['C4', 'Times are UTC.'],
    ]);
    expect(findings).toEqual([]);
  });
});

describe('sub-lines', () => {
  test('each key reads on the items it goes on, with its line and value', () => {
    expect(
      keys(
        '## Map',
        '- **M1 (api)**: The HTTP API.',
        '  - paths: src/api/, src/routes.ts',
        '## Constraints',
        '- **C1 (one-writer)**: Only one writer.',
        '  - because: two writers disagreed.',
        '  - held-by: review',
        '## Decisions',
        '- **D1 (sqlite)**: One file.',
        '  - because: boring.',
        '  - superseded-by: D2',
        '- **D2 (wal)**: Write-ahead logging.',
        '  - because: speed.',
        '## Questions',
        '- **Q1 (sharing)**: Share by link?',
        '  - resolved-by: D2',
        '## Ideas',
        '- **I1 (dark-mode)**: A dark theme.',
        '  - resolved-by: D2',
      ),
    ).toEqual([
      ['M1', [['paths', 3, 'src/api/, src/routes.ts']]],
      [
        'C1',
        [
          ['because', 6, 'two writers disagreed.'],
          ['held-by', 7, 'review'],
        ],
      ],
      [
        'D1',
        [
          ['because', 10, 'boring.'],
          ['superseded-by', 11, 'D2'],
        ],
      ],
      ['D2', [['because', 13, 'speed.']]],
      ['Q1', [['resolved-by', 16, 'D2']]],
      ['I1', [['resolved-by', 19, 'D2']]],
    ]);
  });

  test("indented lines that are not bullets continue a sub-line's value, each part with its line", () => {
    const { items, findings } = read(
      '## Constraints',
      '- **C1 (read-only-check)**: `check` writes nothing, opens no network connection and starts no',
      '  process.',
      '  - held-by: file:rules/writes-only-in-init.yml#"id: writes-only-in-init",',
      '    file:rules/no-network.yml#"id: no-network",',
      '    file:rules/no-subprocess.yml#"id: no-subprocess"',
    );
    expect(items[0]?.text).toBe(
      '`check` writes nothing, opens no network connection and starts no\nprocess.',
    );
    expect(items[0]?.subLines).toEqual([
      {
        key: 'held-by',
        line: 4,
        value: [
          'file:rules/writes-only-in-init.yml#"id: writes-only-in-init",',
          'file:rules/no-network.yml#"id: no-network",',
          'file:rules/no-subprocess.yml#"id: no-subprocess"',
        ].join('\n'),
        parts: [
          { line: 4, text: 'file:rules/writes-only-in-init.yml#"id: writes-only-in-init",' },
          { line: 5, text: 'file:rules/no-network.yml#"id: no-network",' },
          { line: 6, text: 'file:rules/no-subprocess.yml#"id: no-subprocess"' },
        ],
      },
    ]);
    expect(findings).toEqual([]);
  });

  test('a value can start on the line after its key', () => {
    expect(
      keys('## Map', '- **M1 (api)**: The HTTP API.', '  - paths:', '    src/api/,', '    src/routes.ts'),
    ).toEqual([['M1', [['paths', 3, 'src/api/,\nsrc/routes.ts']]]]);
  });

  test("a blank line ends a sub-line's value, and the indented text after it is the item's", () => {
    const { items } = read(
      '## Constraints',
      '- **C1 (one-writer)**: Only one writer.',
      '  - held-by: review',
      '',
      '  A note on C1.',
    );
    expect(items[0]?.subLines.map(({ value }) => value)).toEqual(['review']);
    expect(items[0]?.text).toBe('Only one writer.\nA note on C1.');
  });

  test.each([2, 3, 4, 5])('a sub-line %i spaces in is the usual form', (indent) => {
    expect(
      read('## Decisions', '- **D1 (sqlite)**: One file.', `${' '.repeat(indent)}- because: boring.`),
    ).toMatchObject({ items: [{ subLines: [{ key: 'because', value: 'boring.' }] }], findings: [] });
  });

  test('nested bullets with a colon that are not keys stay prose, with no finding', () => {
    const { items, findings } = read(
      '## Decisions',
      '- **D1 (sqlite)**: One file.',
      '  - because: boring.',
      '  - Pros: no server.',
      '  - Note that: it is a file.',
      '  - http://localhost:8080',
      '  - see http://localhost:8080 first',
      '  - **Caveat**: backups.',
      '  - 1. a numbered note: fine',
    );
    expect(items[0]?.subLines.map(({ key }) => key)).toEqual(['because']);
    expect(items[0]?.text.split('\n')).toHaveLength(7);
    expect(findings).toEqual([]);
  });
});

describe('malformed-item against not-an-item', () => {
  test.each([
    ['a slug whose parenthesis never closes', '- **C4 (one-writer**: Only one writer.'],
    ['a slug that is not lowercase words', '- **C4 (one.writer)**: Only one writer.'],
    ['an empty slug', '- **C4 ()**: Only one writer.'],
    ['the number 0', '- **C0 (zero)**: Only one writer.'],
    ['bold that closes with the other marker', '- **C4 (one-writer)__: Only one writer.'],
    ['bold that never closes', '- **C4: Only one writer.'],
    ['no text at all', '- **C4 (one-writer)**:'],
  ])('%s is malformed-item, an error', (_, line) => {
    expect(codes('## Constraints', line)).toEqual([[2, 'malformed-item']]);
  });

  test.each([
    ['bold words that happen to start with an ID', '- **C4 model**: The C4 model draws the system.'],
    ['a slug with no parentheses', '- **C4 one-writer**: Only one writer.'],
    ['plain prose', '- Only the sync worker writes.'],
    ['an ID with no bold and no slug', '- C4: Only one writer.'],
    ['a bold ID with no colon and no slug', '- **S3** holds the uploads.'],
    ['a bold ID and a dash with no slug', '- **C4** - Only one writer.'],
    ['a letter no section uses', '- **H1 (expressible)**: An owner writes a plan.'],
    ['an ID with a letter after its number', '- **C4a (one-writer)**: Only one writer.'],
    ['italics, not bold', '- *C4 (one-writer)*: Only one writer.'],
    ['a space inside the bold', '- ** C4 (one-writer)**: Only one writer.'],
    ['a bad slug with no bold', '- C4 (one.writer): Only one writer.'],
    ['an empty bullet', '-'],
  ])('%s is not-an-item, a warning', (_, line) => {
    expect(codes('## Constraints', line)).toEqual([[2, 'not-an-item']]);
  });

  test('not-an-item tells a bold ID followed by words to put them in parentheses', () => {
    expect(message('## Constraints', '- **C4 one-writer**: Only one writer.')).toBe(
      '"- **C4 one-writer**" isn\'t read as an item; put its slug in parentheses: - **C4 (one-writer)**: …',
    );
  });

  test("not-an-item quotes a bullet's first words and shows the section's usual form", () => {
    expect(message('## Map', '- Only the sync worker writes to the database, always.')).toBe(
      '"- Only the sync worker writes to the…" isn\'t read as an item, so nothing can cite it; the usual form is - **M<n> (<slug>)**: …',
    );
  });

  test('malformed-item says why the line cannot be read', () => {
    expect(message('## Constraints', '- **C4 (one.writer)**: Only one writer.')).toBe(
      '"- **C4 (one.writer)**" starts like an item, but "one.writer" isn\'t a slug, which is lowercase words joined by hyphens; the usual form is - **C4 (<slug>)**: …',
    );
    expect(message('## Constraints', '- **C0 (zero)**: Only one writer.')).toBe(
      '"- **C0 (zero)**" starts like an item, but C0 isn\'t an ID, since numbers start at 1; the usual form is - **C1 (<slug>)**: …',
    );
    expect(message('## Constraints', '- **C4 (one-writer)**:')).toBe(
      '"- **C4 (one-writer)**" starts like an item, but it has no text; the usual form is - **C4 (one-writer)**: …',
    );
  });

  test('a bullet that is not read takes its indented lines with it', () => {
    const lines = ['## Constraints', '- **C4 (one-writer)**:', '  - held-by: review', '  - note: hidden'];
    expect(read(...lines).items).toEqual([]);
    expect(codes(...lines)).toEqual([[2, 'malformed-item']]);
    expect(codes('## Constraints', '- Prose.', '  - held-by: review', '  - note: hidden')).toEqual([
      [2, 'not-an-item'],
    ]);
  });
});

describe('item findings', () => {
  test('wrong-letter keeps the item, in the section its letter names', () => {
    const lines = ['## Constraints', '- **D1 (sqlite)**: One file.', '  - because: boring.'];
    expect(read(...lines).items.map(({ id, section }) => [id, section])).toEqual([['D1', 'decisions']]);
    expect(message(...lines)).toBe(
      'D1 is under "## Constraints", but D items go under "## Decisions"; move it there, or give it a C number',
    );
  });

  test('with no bold, a letter from another section is not an item, since it reads two ways', () => {
    expect(codes('## Map', '- S3 (uploads): holds the files.')).toEqual([[2, 'not-an-item']]);
  });

  test('duplicate-id names the line that has the ID first, however it is written', () => {
    const lines = [
      '## Constraints',
      '- **C3 (one-writer)**: Only one writer.',
      '## Taste',
      '- **T1 (calm)**: Calm errors.',
      '- **C003 (no-egress)**: Nothing calls out.',
    ];
    expect(codes(...lines)).toEqual([
      [5, 'wrong-letter'],
      [5, 'alternate-form'],
      [5, 'duplicate-id'],
    ]);
    expect(read(...lines).findings.find(({ code }) => code === 'duplicate-id')?.message).toBe(
      'C3 is already the ID on line 2; give this item a number no other item uses',
    );
  });

  test.each([
    ['in Intent', ['## Intent', 'Why.'], 'is under "## Intent", which holds no items'],
    ['under a heading nobody knows', ['## Notes'], 'is under "## Notes", which holds no items'],
    ['before any section', [], `isn't under a "##" section`],
    ['after a # heading', ['## Constraints', '# Appendix'], `isn't under a "##" section`],
  ])('item-outside-section %s keeps the item', (_, before, where) => {
    const lines = [...before, '- **C1 (one-writer)**: Only one writer.', '  - held-by: review'];
    expect(keys(...lines)).toEqual([['C1', [['held-by', before.length + 2, 'review']]]]);
    expect(message(...lines)).toBe(`C1 ${where}; move it under "## Constraints"`);
  });

  test('other bullets outside the itemized sections are prose, with no finding', () => {
    const { items, findings } = read(
      '## Intent',
      '- **For:** solo builders and small teams.',
      '- **C4 model**: the picture we draw.',
      '- **C4 (one.writer)**: not an item here.',
      '- S3 (uploads): where files go.',
      '- C4: plain.',
      '- Just prose.',
    );
    expect(items).toEqual([]);
    expect(findings).toEqual([]);
  });

  test('missing-slug keeps the item, with no slug', () => {
    const lines = ['## Constraints', '- **C3**: Only one writer.'];
    expect(read(...lines).items.map(({ id, slug }) => [id, slug])).toEqual([['C3', undefined]]);
    expect(message(...lines)).toBe(
      "C3 has no slug, so citations to it can't notice a rename; add one: - **C3 (<slug>)**: …",
    );
    expect(codes('## Constraints', '- **C3:** Only one writer.')).toEqual([
      [2, 'missing-slug'],
      [2, 'alternate-form'],
    ]);
  });

  test('missing-because falls on a Decision with no because:', () => {
    expect(message('## Decisions', '- **D1 (sqlite)**: One file.')).toBe(
      "D1 doesn't say why; add a line under it: - because: …",
    );
    expect(codes('## Decisions', '- **D1 (sqlite)**: One file.', '  - because: boring.')).toEqual([]);
  });
});

describe('sub-line findings', () => {
  test('duplicate-key keeps the first, however the second is written', () => {
    const lines = ['## Map', '- **M1 (api)**: The API.', '  - paths: src/api/', '  * Path: src/routes/'];
    expect(keys(...lines)).toEqual([['M1', [['paths', 3, 'src/api/']]]]);
    expect(message(...lines)).toBe(`M1 already has "paths:" on line 3; keep one "- paths:" line`);
  });

  test('unknown-key drops the sub-line and the lines that continue it', () => {
    const lines = [
      '## Constraints',
      '- **C1 (one-writer)**: Only one writer.',
      '  - why: two writers',
      '    disagreed.',
    ];
    expect(read(...lines).items.map(({ text, subLines }) => [text, subLines])).toEqual([
      ['Only one writer.', []],
    ]);
    expect(message(...lines)).toBe(
      `"why:" isn't a sub-line key; the keys are because, held-by, paths, superseded-by and resolved-by`,
    );
  });

  test.each([
    ['held-by', '## Principles', '- **P1 (calm)**: Calm.', 'Constraints and Scenarios'],
    ['paths', '## Constraints', '- **C1 (one-writer)**: One writer.', 'Map parts'],
    ['superseded-by', '## Questions', '- **Q1 (sharing)**: Share?', 'Decisions'],
    ['resolved-by', '## Taste', '- **T1 (calm)**: Calm.', 'Questions and Ideas'],
  ])('key-not-allowed drops %s on an item it does not go on', (key, heading, item, place) => {
    const lines = [heading, item, `  - ${key}: D1`, '    more'];
    expect(read(...lines).items.map(({ subLines }) => subLines)).toEqual([[]]);
    expect(message(...lines)).toBe(`"${key}:" goes only on ${place}, so it isn't read on ${item.slice(4, 6)}`);
  });

  test('because goes on any item', () => {
    expect(
      codes('## Taste', '- **T1 (calm)**: Calm.', '  - because: people read errors when stressed.'),
    ).toEqual([]);
  });
});

/** Expects a variant plan to read exactly like the usual one, with one alternate-form note on `line`. */
const readsLike = (usual: readonly string[], variant: readonly string[], line: number): void => {
  const plain = read(...usual);
  const varied = read(...variant);
  expect(plain.findings).toEqual([]);
  expect(varied.items).toEqual(plain.items);
  expect(varied.findings.map((each) => [each.line, each.code])).toEqual([[line, 'alternate-form']]);
};

describe('variants', () => {
  const USUAL = ['## Constraints', '- **C3 (one-writer)**: Only one writer.', '  - held-by: review'];

  test.each([
    ['a "*" bullet', '* **C3 (one-writer)**: Only one writer.'],
    ['a "+" bullet', '+ **C3 (one-writer)**: Only one writer.'],
    ['a numbered bullet', '1. **C3 (one-writer)**: Only one writer.'],
    ['a numbered bullet with a parenthesis', '12) **C3 (one-writer)**: Only one writer.'],
    ['"__" for bold', '- __C3 (one-writer)__: Only one writer.'],
    ['no bold, with a colon after the slug', '- C3 (one-writer): Only one writer.'],
    ['the colon inside the bold', '- **C3 (one-writer):** Only one writer.'],
    ['a dash instead of the colon', '- **C3 (one-writer)** - Only one writer.'],
    ['an en dash instead of the colon', '- **C3 (one-writer)** – Only one writer.'],
    ['an em dash instead of the colon', '- **C3 (one-writer)** — Only one writer.'],
    ['nothing instead of the colon', '- **C3 (one-writer)** Only one writer.'],
    ['two spaces after the bullet', '-  **C3 (one-writer)**: Only one writer.'],
    ['a tab after the bullet', '-\t**C3 (one-writer)**: Only one writer.'],
    ['no space before the slug', '- **C3(one-writer)**: Only one writer.'],
    ['spaces inside the parentheses', '- **C3 ( one-writer )**: Only one writer.'],
    ['a space before the colon', '- **C3 (one-writer)** : Only one writer.'],
    ['no space after the colon', '- **C3 (one-writer)**:Only one writer.'],
    ['leading zeros in the number', '- **C003 (one-writer)**: Only one writer.'],
    ['spaces for the hyphens in the slug', '- **C3 (one writer)**: Only one writer.'],
    ['underscores for the hyphens in the slug', '- **C3 (one_writer)**: Only one writer.'],
    ['its bullet one space in', ' - **C3 (one-writer)**: Only one writer.'],
    ['its bullet three spaces in', '   - **C3 (one-writer)**: Only one writer.'],
    ['no bullet, as a paragraph', '**C3 (one-writer)**: Only one writer.'],
  ])('an item line with %s reads like the usual form, with one note', (_, line) => {
    readsLike(USUAL, ['## Constraints', line, '  - held-by: review'], 2);
  });

  test.each([
    ['a bold key', '  - **held-by**: review'],
    ['a bold key with its colon inside', '  - **held-by:** review'],
    ['a space for the hyphen', '  - held by: review'],
    ['an underscore for the hyphen', '  - held_by: review'],
    ['a "*" bullet', '  * held-by: review'],
    ['a "+" bullet', '  + held-by: review'],
    ['one space in', ' - held-by: review'],
    ['six spaces in', '      - held-by: review'],
    ['a space before the colon', '  - held-by : review'],
    ['two spaces after the bullet', '  -  held-by: review'],
  ])('a sub-line with %s reads like the usual form, with one note', (_, line) => {
    readsLike(USUAL, ['## Constraints', '- **C3 (one-writer)**: Only one writer.', line], 3);
  });

  test('"path:" reads like "paths:", with one note', () => {
    readsLike(
      ['## Map', '- **M1 (api)**: The HTTP API.', '  - paths: src/api/'],
      ['## Map', '- **M1 (api)**: The HTTP API.', '  - path: src/api/'],
      3,
    );
  });

  test('each kind of variant on a line earns its own note', () => {
    const { items, findings } = read(
      '## Constraints',
      '* __C03 (one writer):__ Only one writer.',
      '  - held-by: review',
    );
    expect(items).toEqual(read(...USUAL).items);
    expect(findings.map((each) => each.message)).toEqual([
      '"*" bullets read fine; the usual form is "-"',
      '"__" bold reads fine; the usual form is "**"',
      'a leading zero in an ID reads fine; the usual form drops it: C3, not C03',
      'spaces in a slug read fine; the usual form joins its words with hyphens: (one-writer)',
      'a colon inside the bold reads fine; the usual form puts it after the bold: - **C<n> (<slug>)**: …',
    ]);
  });

  test("an item line's notes show the usual form with its own letter, so a habit groups by section", () => {
    const { findings } = read(
      '## Decisions',
      '- **D1 (sqlite):** One file.',
      '  - because: boring.',
      '- **D2 (no-orm):** Plain SQL.',
      '  - because: fewer layers.',
    );
    expect(findings.map((each) => [each.line, each.message])).toEqual([
      [2, 'a colon inside the bold reads fine; the usual form puts it after the bold: - **D<n> (<slug>)**: …'],
      [4, 'a colon inside the bold reads fine; the usual form puts it after the bold: - **D<n> (<slug>)**: …'],
    ]);
  });

  test('a variant earns the same message on every line, so a habit can be read as one', () => {
    const { findings } = read(
      '## Constraints',
      '* **C1 (one-writer)**: Only one writer.',
      '  * held-by: review',
      '* **C2 (no-egress)**: Nothing calls out.',
    );
    expect(findings.map((each) => [each.line, each.message])).toEqual([
      [2, '"*" bullets read fine; the usual form is "-"'],
      [3, '"*" bullets read fine; the usual form is "-"'],
      [4, '"*" bullets read fine; the usual form is "-"'],
    ]);
  });

  test("a sub-line's notes show its own key in the usual form", () => {
    expect(
      message('## Constraints', '- **C1 (one-writer)**: Only one writer.', '  - Held By: review'),
    ).toBe('"Held By:" reads fine; the usual form is "held-by:"');
    expect(
      message('## Constraints', '- **C1 (one-writer)**: Only one writer.', '        - held-by: review'),
    ).toBe(
      'a sub-line indented outside two to five spaces reads fine; the usual form is two spaces in: "  - held-by: …"',
    );
  });
});
