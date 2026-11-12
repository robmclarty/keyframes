import { describe, expect, test } from 'vitest';

import { check, type Report } from '../../check/index.js';
import { memoryRepo } from '../../repo/index.js';
import { selectContext, type Context } from '../index.js';

/** A plan from its lines, each ending in a newline. */
const md = (...lines: string[]): string => lines.map((line) => `${line}\n`).join('');

/** The report on a plan, from its lines, against `files`. */
const report = (lines: readonly string[], files: Readonly<Record<string, string>> = {}): Report =>
  check({ name: 'keyframes.md', text: md(...lines) }, memoryRepo(files));

/** The context for `paths`, failing the test when a path can't be read. */
const context = (from: Report, paths: readonly string[] = []): Context => {
  const selected = selectContext(from, paths);
  if ('problem' in selected) {
    throw new Error(selected.problem);
  }
  return selected;
};

// Every section, with Taste written above Constraints and Principles last.
const PLAN = [
  '# Plan',
  '## Intent',
  'Why it exists.',
  '## Map',
  '- **M1 (report)**: Renders the report.',
  '  - paths: src/report/, schema/report.schema.json',
  '- **M2 (sync)**: Syncs.',
  '  - paths: src/sync/ (new)',
  '- **M3 (cli)**: The command line.',
  '  - paths: src/cli.ts',
  '## Taste',
  '- **T1 (plain-errors)**: An error says what to do next.',
  '## Constraints',
  '- **C1 (one-writer)**: Only the worker writes.',
  '  - held-by: review',
  '- **C2 (no-deps)**: No dependencies.',
  '  - held-by: review',
  '## Decisions',
  '- **D1 (boring)**: Use Node.',
  '  - because: it works.',
  '## Scenarios',
  '- **S1 (offline-week)**: Edits offline survive.',
  '  - held-by: review',
  '## Questions',
  '- **Q1 (when)**: When?',
  '## Ideas',
  '- **I1 (later)**: Later.',
  '## Principles',
  '- **P1 (dull-tools)**: Pick the dull tool.',
];

const FILES = { 'src/report/text.ts': '', 'schema/report.schema.json': '{}', 'src/cli.ts': '' };

/** The ID of each item that prints. */
const ids = (selected: Context): string[] => selected.items.map((item) => item.id);

describe('selectContext', () => {
  test('prints Principles, Constraints, Scenarios and Taste in the format order, whatever order the plan writes them', () => {
    expect(ids(context(report(PLAN, FILES)))).toEqual(['P1', 'C1', 'C2', 'S1', 'T1']);
  });

  test('never prints Decisions, Questions, Ideas or the Map, even when a path meets a part', () => {
    const sections = context(report(PLAN, FILES), ['src/report/']).items.map((item) => item.section);
    expect(sections).not.toContain('decisions');
    expect(sections).not.toContain('questions');
    expect(sections).not.toContain('ideas');
    expect(sections).not.toContain('map');
  });

  test('keeps line order within a section', () => {
    const plan = ['## Constraints', '- **C2 (b)**: B.', '  - held-by: review', '- **C1 (a)**: A.', '  - held-by: review'];
    expect(ids(context(report(plan)))).toEqual(['C2', 'C1']);
  });

  test('carries the report items unchanged', () => {
    const from = report(PLAN, FILES);
    const c1 = from.items.find((item) => item.id === 'C1');
    expect(context(from).items[1]).toBe(c1);
  });

  test('every item prints whatever the paths', () => {
    const from = report(PLAN, FILES);
    expect(ids(context(from, ['docs/']))).toEqual(ids(context(from)));
    expect(ids(context(from, ['src/report/text.ts', 'src/cli.ts']))).toEqual(ids(context(from)));
  });

  test('with no paths, lists no paths and no parts', () => {
    const selected = context(report(PLAN, FILES));
    expect(selected.paths).toEqual([]);
    expect(selected.parts).toEqual([]);
  });

  test.each<[string, string, string[]]>([
    ['a file part equal to the path', 'src/cli.ts', ['M3']],
    ['a file part, from the directory above it', 'src/', ['M1', 'M2', 'M3']],
    ['a directory part equal to the path', 'src/report/', ['M1']],
    ['a directory part equal to the path written without its "/"', 'src/report', ['M1']],
    ['a path inside a directory part', 'src/report/text.ts', ['M1']],
    ['a path deep inside a directory part', 'src/report/deep/er.ts', ['M1']],
    ['a "(new)" part path', 'src/sync/worker.ts', ['M2']],
    ['a path that meets no part', 'docs/', []],
    ['a path that only shares a prefix with a part', 'src/reporting/', []],
    ['a file a file part only shares a prefix with', 'src/cli.tsx', []],
    ['a path inside a file part', 'src/cli.ts/x', ['M3']],
  ])('meets %s', (_, path, parts) => {
    expect(context(report(PLAN, FILES), [path]).paths).toEqual([{ path, parts }]);
  });

  test('lists the parts the paths meet once, in Map order, as the report carries them', () => {
    const from = report(PLAN, FILES);
    const selected = context(from, ['src/cli.ts', 'src/report/text.ts', 'src/report/']);
    expect(selected.paths).toEqual([
      { path: 'src/cli.ts', parts: ['M3'] },
      { path: 'src/report/text.ts', parts: ['M1'] },
      { path: 'src/report/', parts: ['M1'] },
    ]);
    expect(selected.parts.map((part) => part.id)).toEqual(['M1', 'M3']);
    expect(selected.parts[0]).toBe(from.items.find((item) => item.id === 'M1'));
  });

  test('shows each path in its usual form, keeping a trailing "/" as given', () => {
    const selected = context(report(PLAN, FILES), ['./src//report/', 'src/./cli.ts', '`docs`']);
    expect(selected.paths.map((each) => each.path)).toEqual(['src/report/', 'src/cli.ts', 'docs']);
  });

  test('lists a path given twice once, where it first appears, after folding it', () => {
    const selected = context(report(PLAN, FILES), ['src/cli.ts', 'docs/', './src/cli.ts']);
    expect(selected.paths.map((each) => each.path)).toEqual(['src/cli.ts', 'docs/']);
  });

  test('keeps "src/report" and "src/report/" apart, as each was given', () => {
    const selected = context(report(PLAN, FILES), ['src/report', 'src/report/']);
    expect(selected.paths.map((each) => each.path)).toEqual(['src/report', 'src/report/']);
  });

  test.each<[string, string]>([
    ['/etc/passwd', 'is absolute'],
    ['C:/x', 'is absolute'],
    ['../outside', 'has a ".." segment'],
    ['src/../../x', 'has a ".." segment'],
    ['src\\cli.ts', 'uses "\\"'],
    ['', 'names no path'],
    ['./', 'names no path'],
  ])('a path %j is a problem that names it', (path, why) => {
    const selected = selectContext(report(PLAN, FILES), ['src/', path]);
    expect(selected).toEqual({ problem: expect.stringContaining(`"${path}" ${why}`) as unknown });
  });

  test('a Map path that cannot be read meets nothing', () => {
    const plan = ['## Map', '- **M1 (bad)**: Bad.', '  - paths: ../up/, src/ok/'];
    const from = report(plan, { 'src/ok/a.ts': '' });
    expect(context(from, ['up/', 'src/ok/a.ts']).paths).toEqual([
      { path: 'up/', parts: [] },
      { path: 'src/ok/a.ts', parts: ['M1'] },
    ]);
  });

  test('a plan with errors still yields its items, and carries the counts check reports', () => {
    const plan = [
      '## Constraints',
      '- **C1 (one-writer)**: Only the worker writes, as [D9 (gone)] says.',
      '  - held-by: file:missing.ts',
      '## Taste',
      '- **T1 (plain)**: Plain.',
    ];
    const from = report(plan);
    expect(from.errors).toBeGreaterThan(0);
    const selected = context(from);
    expect(ids(selected)).toEqual(['C1', 'T1']);
    expect([selected.errors, selected.warnings]).toEqual([from.errors, from.warnings]);
  });

  test('names the plan as the report does', () => {
    expect(context(report(PLAN, FILES)).plan).toBe('keyframes.md');
  });

  test('is pure: the same report and paths give equal contexts, and the report is unchanged', () => {
    const from = report(PLAN, FILES);
    const before = JSON.stringify(from);
    expect(context(from, ['src/'])).toEqual(context(from, ['src/']));
    expect(JSON.stringify(from)).toBe(before);
  });
});
