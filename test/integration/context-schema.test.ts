import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { check } from '../../src/check/index.js';
import { selectContext } from '../../src/context/index.js';
import { memoryRepo } from '../../src/repo/index.js';
import { renderContextJson } from '../../src/report/index.js';
import { validate, type Schema } from '../helpers/json-schema.js';

const REPO = new URL('../../', import.meta.url);
const SCHEMA = JSON.parse(readFileSync(new URL('schema/context.schema.json', REPO), 'utf8')) as Schema;
const REPORT = JSON.parse(readFileSync(new URL('schema/report.schema.json', REPO), 'utf8')) as Schema;
const GOLDEN = fileURLToPath(new URL('test/fixtures/golden/', REPO));

/** A plan's context JSON for `paths`, parsed, from its lines and a repo held in memory. */
const contextOf = (lines: readonly string[], paths: readonly string[], files: Readonly<Record<string, string>> = {}): unknown => {
  const context = selectContext(check({ name: 'keyframes.md', text: `${lines.join('\n')}\n` }, memoryRepo(files)), paths);
  if ('problem' in context) {
    throw new Error(context.problem);
  }
  return JSON.parse(renderContextJson(context));
};

// A plan with every section that prints, every sub-line they carry, each pointer result, and
// a Map part with each path result.
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
  '- **C3**: No slug.',
  '## Scenarios',
  '- **S1 (offline-edit)**: Edits on a plane.',
  '## Taste',
  '- **T1 (quiet)**: Quiet.',
];

const FILES = { 'src/api/handler.ts': '', 'test/writes.test.ts': "test('one writer')\n" };

describe('the context JSON validates against schema/context.schema.json', () => {
  test.each(['clean', 'findings'])('the %s golden context', (name) => {
    expect(validate(JSON.parse(readFileSync(`${GOLDEN}${name}.context.json`, 'utf8')), SCHEMA)).toEqual([]);
  });

  test('a context with every field, paths that meet a part and one that meets none', () => {
    expect(validate(contextOf(EVERY_FIELD, ['src/api/handler.ts', 'docs/'], FILES), SCHEMA)).toEqual([]);
  });

  test('a context on an empty plan, with no paths', () => {
    expect(validate(contextOf([], []), SCHEMA)).toEqual([]);
  });
});

describe('the validator fails what breaks the context schema', () => {
  // Each change to a valid context, and the error it must cause.
  test.each<[string, (context: Record<string, unknown>) => void, string]>([
    ['a missing field', (context) => delete context['parts'], '$ is missing parts'],
    ['a field the schema lacks', (context) => (context['findings'] = []), "$.findings isn't in the schema"],
    ['another version', (context) => (context['schema_version'] = 2), "$.schema_version isn't 1"],
    ['a negative count', (context) => (context['warnings'] = -1), '$.warnings is below 0'],
    [
      'a part that is not a Map ID',
      (context) => {
        context['paths'] = [{ path: 'src/', parts: ['C1'] }];
      },
      "$.paths[0].parts[0] doesn't match",
    ],
    [
      'an item in another form',
      (context) => {
        context['items'] = [{ id: 'C1', section: 'constraints', line: 0, text: 'x' }];
      },
      '$.items[0].line is below 1',
    ],
  ])('%s', (_, change, error) => {
    const context = contextOf(EVERY_FIELD, ['src/'], FILES) as Record<string, unknown>;
    change(context);
    expect(validate(context, SCHEMA).join('\n')).toContain(error);
  });
});

describe('the context schema', () => {
  test("declares schema_version 1, apart from the report's", () => {
    expect(SCHEMA.properties?.['schema_version']).toEqual({ const: 1 });
  });

  test.each(['item', 'result', 'line', 'count'])("describes %s exactly as the report's schema does", (name) => {
    expect(SCHEMA.$defs?.[name]).toEqual(REPORT.$defs?.[name]);
  });
});
