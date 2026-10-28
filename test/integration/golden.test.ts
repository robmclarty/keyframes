import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { run } from '../../src/cli.js';

// Each golden case is a real tree in test/fixtures/golden/<case>/, with the reports `check` must
// write for it beside the tree, as <case>.txt and <case>.json. "findings" holds every finding but
// two: file-too-large, which needs a file over 1 MiB, so src/repo's tests cover it in memory
// instead, and unclosed-comment, since a comment left open would hide the unclosed-fence the plan
// ends on, so src/scan's tests cover it.
const GOLDEN = fileURLToPath(new URL('../fixtures/golden/', import.meta.url));

/** Runs `keyframes check` on a golden case's tree, with any flags, capturing its exit code and streams. */
const check = (name: string, ...flags: string[]) => {
  let stdout = '';
  let stderr = '';
  const code = run(['check', `${GOLDEN}${name}`, ...flags], {
    stdout: (text) => {
      stdout += text;
    },
    stderr: (text) => {
      stderr += text;
    },
  });
  return { code, stdout, stderr };
};

/** A golden report, as committed. */
const golden = (file: string): string => readFileSync(`${GOLDEN}${file}`, 'utf8');

describe('golden reports', () => {
  test.each([
    ['clean', 0],
    ['findings', 1],
  ])('the %s plan gives its golden text and JSON, exiting %i', (name, code) => {
    expect(check(name)).toEqual({ code, stdout: golden(`${name}.txt`), stderr: '' });
    expect(check(name, '--json')).toEqual({ code, stdout: golden(`${name}.json`), stderr: '' });
  });

  test('--strict fails the clean plan only if it has a warning, and it has none', () => {
    expect(check('clean', '--strict').code).toBe(0);
  });

  test('the findings plan has every code but file-too-large and unclosed-comment, in report order', () => {
    const { findings } = JSON.parse(golden('findings.json')) as {
      findings: { line: number; severity: string; code: string }[];
    };
    const codes = new Set(findings.map(({ code }) => code));
    expect(codes.size).toBe(24);
    expect(codes.has('file-too-large')).toBe(false);
    expect(codes.has('unclosed-comment')).toBe(false);
    const notes = findings.findIndex(({ severity }) => severity === 'note');
    expect(findings.slice(notes).every(({ severity }) => severity === 'note')).toBe(true);
    const loud = findings.slice(0, notes).map(({ line }) => line);
    expect(loud).toEqual(loud.toSorted((a, b) => a - b));
  });
});
