import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { check } from '../../src/check/index.js';
import { memoryRepo } from '../../src/repo/index.js';
import { renderJson } from '../../src/report/index.js';
import { validate, type Schema } from '../helpers/json-schema.js';

const REPO = new URL('../../', import.meta.url);
const SCHEMA = JSON.parse(readFileSync(new URL('schema/report.schema.json', REPO), 'utf8')) as Schema;
const GOLDEN = fileURLToPath(new URL('test/fixtures/golden/', REPO));

/** A plan's JSON report, parsed, from its lines and a repo held in memory. */
const reportOf = (lines: readonly string[], files: Readonly<Record<string, string>> = {}): unknown =>
  JSON.parse(renderJson(check({ name: 'keyframes.md', text: `${lines.join('\n')}\n` }, memoryRepo(files))));

// A plan with every kind of item and every sub-line, each pointer and path result, and a note.
const EVERY_FIELD = [
  '## Intent',
  'Why it exists.',
  '## Principles',
  '- **P1 (local-first)**: The device holds the truth.',
  '## Map',
  '- **M1 (api)**: The API.',
  '  - paths: src/api/, src/jobs/ (new), src/gone/',
  '## Constraints',
  '- **C1 (one-writer)**: One writer.',
  '  - because: two disagreed.',
  '  - held-by: file:test/writes.test.ts#"one writer", file:test/later.test.ts (new), review',
  '- **C2 (gone)**: Points at nothing.',
  '  - held-by: file:test/gone.test.ts',
  '- **C3**: No slug, so no citation can notice a rename.',
  '## Scenarios',
  '- **S1 (offline-edit)**: Edits on a plane.',
  '## Decisions',
  '- **D1 (postgres)**: Postgres.',
  '  - because: we knew it.',
  '  - superseded-by: [D2 (sqlite)]',
  '- **D2 (sqlite)**: SQLite.',
  '  - because: one file.',
  '## Taste',
  '* **T1 (quiet)**: Quiet.',
  '## Questions',
  '- **Q1 (merging)**: How do edits merge?',
  '  - resolved-by: D2',
  '## Ideas',
  '- **I1 (viewer)**: A web viewer.',
  '  - resolved-by: not a decision',
];

const FILES = { 'src/api/handler.ts': '', 'test/writes.test.ts': "test('one writer')\n" };

describe('the JSON report validates against schema/report.schema.json', () => {
  test.each(['clean', 'findings'])('the %s golden report', (name) => {
    expect(validate(JSON.parse(readFileSync(`${GOLDEN}${name}.json`, 'utf8')), SCHEMA)).toEqual([]);
  });

  test('a report with every kind of item, sub-line, result and finding', () => {
    expect(validate(reportOf(EVERY_FIELD, FILES), SCHEMA)).toEqual([]);
  });

  test('a report on an empty plan', () => {
    expect(validate(reportOf([]), SCHEMA)).toEqual([]);
  });
});

describe('the validator fails what breaks the schema', () => {
  // Each change to a valid report, and the error it must cause.
  test.each<[string, (report: Record<string, unknown>) => void, string]>([
    ['a missing field', (report) => delete report['words'], '$ is missing words'],
    ['a field the schema lacks', (report) => (report['extra'] = 1), "$.extra isn't in the schema"],
    ['a wrong type', (report) => (report['intent'] = 'yes'), "$.intent isn't boolean"],
    ['another version', (report) => (report['schema_version'] = 2), "$.schema_version isn't 1"],
    ['a negative count', (report) => (report['errors'] = -1), '$.errors is below 0'],
    [
      'an unknown code',
      (report) => {
        report['findings'] = [{ line: 1, severity: 'warning', code: 'nope', message: '' }];
      },
      '$.findings[0].code is "nope"',
    ],
    [
      'an ID in another form',
      (report) => {
        report['items'] = [{ id: 'C03', section: 'constraints', line: 1, text: 'x' }];
      },
      "$.items[0].id doesn't match",
    ],
  ])('%s', (_, change, error) => {
    const report = reportOf(EVERY_FIELD, FILES) as Record<string, unknown>;
    change(report);
    expect(validate(report, SCHEMA).join('\n')).toContain(error);
  });
});

describe('the schema', () => {
  test("lists every finding code in the spec's Findings table, and only those", () => {
    const spec = readFileSync(new URL('docs/prototype.md', REPO), 'utf8');
    const table = spec.slice(spec.indexOf('### Findings'), spec.indexOf('### The report'));
    const codes = [...table.matchAll(/^\| `([a-z-]+)` \| (?:error|warning|note) \|/gm)].map((match) => match[1]);
    expect(codes).toHaveLength(26);
    expect(SCHEMA.$defs?.['finding']?.properties?.['code']?.enum).toEqual(codes);
  });
});
