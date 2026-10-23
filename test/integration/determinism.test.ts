import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, describe, expect, test } from 'vitest';

import { check } from '../../src/check/index.js';
import { run } from '../../src/cli.js';
import { memoryRepo } from '../../src/repo/index.js';
import { renderJson, renderText } from '../../src/report/index.js';

// The golden plan with a finding of nearly every kind, so its report quotes paths, pointers and
// lines: anything that could pick up the working directory, the tree's absolute path or the
// machine's locale would show. A copy of the tree elsewhere catches an absolute path, which is the
// same for every working directory that checks one tree.
const TREE = fileURLToPath(new URL('../fixtures/golden/findings/', import.meta.url));
const ELSEWHERE = mkdtempSync(join(tmpdir(), 'keyframes-cwd-'));
const COPY = join(ELSEWHERE, 'copy');
const START = process.cwd();

cpSync(TREE, COPY, { recursive: true });

afterAll(() => {
  process.chdir(START);
  rmSync(ELSEWHERE, { recursive: true, force: true });
});

/** The bytes `keyframes check` writes to stdout, run from `cwd` with `args`. */
const checkFrom = (cwd: string, ...args: string[]): Buffer => {
  let stdout = '';
  process.chdir(cwd);
  try {
    run(['check', ...args], {
      stdout: (text) => {
        stdout += text;
      },
      stderr: () => {},
    });
  } finally {
    process.chdir(START);
  }
  return Buffer.from(stdout, 'utf8');
};

describe('the report, text and JSON, run from two working directories, is', () => {
  test('byte-identical', () => {
    for (const flags of [[], ['--json']]) {
      const inTree = checkFrom(TREE, ...flags);
      expect(inTree.length).toBeGreaterThan(0);
      expect(checkFrom(START, relative(START, TREE), ...flags).equals(inTree)).toBe(true);
      expect(checkFrom(ELSEWHERE, TREE, ...flags).equals(inTree)).toBe(true);
      expect(checkFrom(COPY, ...flags).equals(inTree)).toBe(true);
    }
  });
});

describe('the report, whatever the line endings, BOM or tabs, is the same', () => {
  // A plan's lines, then the same plan with CRLF, a BOM, and tabs for its leading spaces.
  const PLAN = [
    '## Intent',
    'Why it exists.',
    '## Constraints',
    '* **C1 (one-writer)**: Only the sync worker writes.',
    '    - held-by: file:test/writes.test.ts#"only the sync worker writes"',
    '- **C2 (gone)**: Points at nothing, per [C1 (one-writer)].',
    '    - held-by: file:test/gone.test.ts',
  ];
  const FILES = { 'test/writes.test.ts': "test('only the sync worker writes')\r\n" };
  const LF = `${PLAN.join('\n')}\n`;
  const OTHER = `﻿${PLAN.map((line) => line.replace(/^ {4}/, '\t')).join('\r\n')}\r\n`;

  test.each([
    ['text', renderText],
    ['JSON', renderJson],
  ])('as %s', (_, render) => {
    const report = (text: string): string => render(check({ name: 'keyframes.md', text }, memoryRepo(FILES)));
    expect(report(OTHER)).toBe(report(LF));
    expect(report(LF)).toContain('broken-pointer');
  });
});
