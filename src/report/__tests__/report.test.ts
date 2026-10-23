import { describe, expect, test } from 'vitest';

import { check, type Report } from '../../check/index.js';
import { memoryRepo } from '../../repo/index.js';
import { renderJson, renderText } from '../index.js';

/** The report on a plan, from its lines, against `files`. */
const report = (lines: readonly string[], files: Readonly<Record<string, string>> = {}): Report =>
  check({ name: 'keyframes.md', text: lines.map((line) => `${line}\n`).join('') }, memoryRepo(files));

describe('the text report', () => {
  test('a clean run shows its counts and ends with no findings', () => {
    const text = renderText(
      report(
        [
          '## Intent',
          'Why it exists.',
          '## Map',
          '- **M1 (api)**: The API.',
          '  - paths: src/api/',
          '## Taste',
          '## Constraints',
          '- **C1 (one-writer)**: One writer.',
          '  - held-by: review',
        ],
        { 'src/api/x.ts': '' },
      ),
    );
    expect(text).toBe(
      [
        'keyframes.md',
        '',
        'intent        yes',
        'map           1 part · 1 path',
        'constraints   1 · 1 review',
        'taste         0',
        'words         27 of 2000',
        '',
        'no findings',
        '',
      ].join('\n'),
    );
  });

  test('a plan with nothing in it still says whether it has an intent, and its words', () => {
    expect(renderText(report([]))).toBe(
      [
        'keyframes.md',
        '',
        'intent        no',
        'words         0 of 2000',
        '',
        `keyframes.md:1  warning  no-intent  there's no "## Intent"; add one that says why this project exists and who it's for`,
        '',
        '1 warning',
        '',
      ].join('\n'),
    );
  });

  test('findings line up in columns as wide as their widest entry, and notes of one kind share a line', () => {
    const lines = [
      '## Intent',
      'Why.',
      '## Constraints',
      '* **C1 (a)**: One.',
      ...Array.from({ length: 8 }, (_, index) => `- **C${String(index + 2)} (c${String(index)})**: More.`),
      '* **C10 (b)**: [C99 (gone)].',
      '+ **C11 (c)**: Plus.',
      '* **C12 (d)**: Three.',
    ];
    const text = renderText(report(lines));
    expect(text.split('\n').slice(-6)).toEqual([
      'keyframes.md:13  error  broken-citation  [C99 (gone)] cites C99, but no item has that ID',
      'keyframes.md:4   note   alternate-form   "*" bullets read fine; the usual form is "-" (lines 4, 13, 15)',
      'keyframes.md:14  note   alternate-form   "+" bullets read fine; the usual form is "-"',
      '',
      '1 error · 4 notes',
      '',
    ]);
  });

  test('counts leave out a zero after the first, and name one of a thing in the singular', () => {
    const text = renderText(
      report([
        '## Intent',
        'Why.',
        '## Decisions',
        '- **D1 (a)**: A.',
        '  - because: so.',
        '## Questions',
        '- **Q1 (b)**: B?',
        '  - resolved-by: D1',
        '## Map',
        '- **M1 (c)**: A concept.',
      ]),
    );
    expect(text).toContain('\nmap           1 part\n');
    expect(text).toContain('\ndecisions     1 · 1 active\n');
    expect(text).toContain('\nquestions     1 · 1 resolved\n');
  });
});

describe('the JSON report', () => {
  test('writes its keys in a fixed order, sub-line keys with underscores, and leaves out what an item lacks', () => {
    const json = renderJson(
      report(['## Constraints', '* **C1 (one-writer)**: One writer.', '  - held-by: review', '- **C2**: Two.']),
    );
    expect(json.endsWith('}\n')).toBe(true);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(Object.keys(parsed)).toEqual([
      'schema_version',
      'plan',
      'intent',
      'sections',
      'words',
      'items',
      'findings',
      'errors',
      'warnings',
      'notes',
    ]);
    expect(parsed).toMatchObject({
      schema_version: 1,
      plan: 'keyframes.md',
      intent: false,
      sections: { constraints: { items: 2, linked: 0, planned: 0, review: 1, unlinked: 1, broken: 0 } },
      items: [
        {
          id: 'C1',
          slug: 'one-writer',
          section: 'constraints',
          line: 2,
          text: 'One writer.',
          held_by: [{ pointer: 'review', result: 'review' }],
          status: 'review',
        },
        { id: 'C2', section: 'constraints', line: 4, text: 'Two.', status: 'unlinked' },
      ],
      errors: 0,
      warnings: 2,
      notes: 1,
    });
    expect(Object.keys((parsed['items'] as object[])[1] ?? {})).toEqual(['id', 'section', 'line', 'text', 'status']);
  });

  test('lists every note on its own, each with its own line', () => {
    const { findings } = JSON.parse(
      renderJson(report(['## Intent', 'Why.', '## Taste', '* **T1 (a)**: A.', '* **T2 (b)**: B.'])),
    ) as { findings: { line: number; code: string }[] };
    expect(findings.map(({ line, code }) => [line, code])).toEqual([
      [4, 'alternate-form'],
      [5, 'alternate-form'],
    ]);
  });
});
