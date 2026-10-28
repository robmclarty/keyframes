import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { check } from '../../src/check/index.js';
import { memoryRepo } from '../../src/repo/index.js';
import { renderJson } from '../../src/report/index.js';

/** The JSON Schema keywords the report's schema uses. */
type Schema = {
  readonly $schema?: string;
  readonly $defs?: Readonly<Record<string, Schema>>;
  readonly $ref?: string;
  readonly title?: string;
  readonly description?: string;
  readonly type?: string;
  readonly required?: readonly string[];
  readonly properties?: Readonly<Record<string, Schema>>;
  readonly items?: Schema;
  readonly const?: unknown;
  readonly enum?: readonly unknown[];
  readonly minimum?: number;
  readonly pattern?: string;
};

const REPO = new URL('../../', import.meta.url);
const SCHEMA = JSON.parse(readFileSync(new URL('schema/report.schema.json', REPO), 'utf8')) as Schema;
const GOLDEN = fileURLToPath(new URL('test/fixtures/golden/', REPO));

// The keywords the validator below reads. It refuses any other, so the schema can't lean on a
// keyword that would be silently skipped here.
const KEYWORDS = new Set([
  '$schema',
  '$defs',
  '$ref',
  'title',
  'description',
  'type',
  'required',
  'properties',
  'items',
  'const',
  'enum',
  'minimum',
  'pattern',
]);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const TYPES: Readonly<Record<string, (value: unknown) => boolean>> = {
  object: isObject,
  array: Array.isArray,
  string: (value) => typeof value === 'string',
  boolean: (value) => typeof value === 'boolean',
  integer: Number.isInteger,
};

/** The schema a local `$ref` such as `#/$defs/item` points at. */
const resolveRef = (ref: string): Schema => {
  const name = /^#\/\$defs\/(\w+)$/.exec(ref)?.[1];
  const target = name === undefined ? undefined : SCHEMA.$defs?.[name];
  if (target === undefined) {
    throw new Error(`the schema's ${ref} points at nothing`);
  }
  return target;
};

/** Errors from an object's keys: required ones missing, and any its schema doesn't declare. */
const objectErrors = (value: Record<string, unknown>, schema: Schema, at: string): string[] => [
  ...(schema.required ?? []).filter((key) => !Object.hasOwn(value, key)).map((key) => `${at} is missing ${key}`),
  ...Object.entries(value).flatMap(([key, each]) => {
    const property = schema.properties?.[key];
    // Stricter than JSON Schema on purpose: a key the schema doesn't declare fails, so a field the
    // report writes can't go undescribed. The shipped schema stays open for its readers.
    return property === undefined ? [`${at}.${key} isn't in the schema`] : validate(each, property, `${at}.${key}`);
  }),
];

/** Every way `value` breaks `schema`, as paths and reasons; empty when it validates. */
const validate = (value: unknown, schema: Schema, at = '$'): string[] => {
  const unknown = Object.keys(schema).filter((key) => !KEYWORDS.has(key));
  if (unknown.length > 0) {
    throw new Error(`the schema uses ${unknown.join(', ')} at ${at}, which this validator doesn't read`);
  }
  if (schema.$ref !== undefined) {
    return validate(value, resolveRef(schema.$ref), at);
  }
  const type = schema.type === undefined ? undefined : TYPES[schema.type];
  if (schema.type !== undefined && type === undefined) {
    throw new Error(`the schema's type ${schema.type} at ${at} isn't one this validator reads`);
  }
  if (type !== undefined && !type(value)) {
    return [`${at} isn't ${String(schema.type)}`];
  }
  const errors: string[] = [];
  if ('const' in schema && value !== schema.const) {
    errors.push(`${at} isn't ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum !== undefined && !schema.enum.includes(value)) {
    errors.push(`${at} is ${JSON.stringify(value)}, which isn't one of ${schema.enum.join(', ')}`);
  }
  if (schema.minimum !== undefined && typeof value === 'number' && value < schema.minimum) {
    errors.push(`${at} is below ${String(schema.minimum)}`);
  }
  if (schema.pattern !== undefined && typeof value === 'string' && !new RegExp(schema.pattern, 'u').test(value)) {
    errors.push(`${at} doesn't match ${schema.pattern}`);
  }
  if (isObject(value)) {
    errors.push(...objectErrors(value, schema, at));
  }
  const { items } = schema;
  if (Array.isArray(value) && items !== undefined) {
    errors.push(...value.flatMap((each, index) => validate(each, items, `${at}[${String(index)}]`)));
  }
  return errors;
};

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
