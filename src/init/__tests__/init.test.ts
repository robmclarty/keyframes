import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

import { afterEach, describe, expect, test } from 'vitest';

import { check, exitCode, findPlan } from '../../check/index.js';
import { diskRepo, memoryRepo } from '../../repo/index.js';
import { init, template } from '../index.js';

let scratches: string[] = [];

/** A new, empty directory for one test, removed after it. */
const scratch = (): string => {
  const dir = mkdtempSync(join(tmpdir(), 'keyframes-init-'));
  scratches.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of scratches) {
    rmSync(dir, { recursive: true, force: true });
  }
  scratches = [];
});

/** The report `check` gives the plan in `root`, found the way the CLI finds it. */
const checkIn = (root: string) => {
  const repo = diskRepo(root);
  const found = findPlan(repo);
  if ('problem' in found) {
    throw new Error(found.problem);
  }
  return check(found.plan, repo);
};

describe('init', () => {
  test('fresh template', () => {
    const root = scratch();
    expect(init(root)).toEqual({ written: 'keyframes.md' });
    const report = checkIn(root);
    expect(report.findings).toEqual([
      {
        line: template('').split('\n').indexOf('## Intent') + 1,
        severity: 'warning',
        code: 'no-intent',
        message: `"## Intent" is empty; say why this project exists and who it's for`,
      },
    ]);
    expect(exitCode(report, false)).toBe(0);
  });

  test('titles the plan with its directory name', () => {
    const root = scratch();
    init(root);
    expect(readdirSync(root)).toEqual(['keyframes.md']);
    const written = readFileSync(join(root, 'keyframes.md'), 'utf8');
    expect(written).toBe(template(basename(root)));
    expect(written.startsWith(`# ${basename(root)}\n\n<!--\n`)).toBe(true);
  });

  test.each(['keyframes.md', 'KEYFRAMES.md', 'Keyframes.md'])(
    'refuses when %s is already there, and writes nothing',
    (name) => {
      const root = scratch();
      writeFileSync(join(root, name), 'Ours.\n');
      expect(init(root)).toEqual({ problem: `${name} already exists; init never overwrites a plan` });
      expect(readdirSync(root)).toEqual([name]);
      expect(readFileSync(join(root, name), 'utf8')).toBe('Ours.\n');
    },
  );

  test('lets a failure it does not expect rise', () => {
    expect(() => init(join(scratch(), 'gone'))).toThrow(/ENOENT/);
  });
});

describe('the template', () => {
  test('checks clean once its comments are opened, so every example in it is one to copy', () => {
    const text = template('example').replaceAll(/^(?:<!--|-->)$/gm, '');
    const repo = memoryRepo({
      'keyframes.md': text,
      'src/api/': '',
      'test/writes.test.ts': "test('only the sync worker writes', () => {});\n",
    });
    const report = check({ name: 'keyframes.md', text }, repo);
    expect(report.findings).toEqual([]);
    expect(report.items.map(({ id }) => id)).toEqual(['P1', 'M1', 'C1', 'S1', 'D1', 'T1', 'Q1', 'I1']);
  });

  test('keeps everything but its headings in comments', () => {
    const report = check({ name: 'keyframes.md', text: template('example') }, memoryRepo({}));
    // Two words for each of its ten headings, `# example` and the nine sections, and none besides.
    expect({ items: report.items, words: report.words.count }).toEqual({ items: [], words: 2 * 10 });
  });
});
