import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { run } from '../cli.js';

const VERSION = (
  JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
    version: string;
  }
).version;

/**
 * Runs the CLI on a whole command line, such as `keyframes check --json`, capturing its exit code
 * and both streams. The line splits on spaces, so no argument here contains one. `write` stands in
 * for stdout's own writing, so a test can make it fail.
 */
const cli = (line: string, write: (text: string) => void = () => {}) => {
  const [, ...argv] = line.split(' ');
  let stdout = '';
  let stderr = '';
  const code = run(argv, {
    stdout: (text) => {
      write(text);
      stdout += text;
    },
    stderr: (text) => {
      stderr += text;
    },
  });
  return { code, stdout, stderr };
};

describe('help', () => {
  test.each([
    'keyframes --help',
    'keyframes -h',
    'keyframes help',
    'keyframes check --help',
    'keyframes frob --help',
  ])('%s prints the usage to stdout and exits 0', (line) => {
    const { code, stdout, stderr } = cli(line);
    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toContain('keyframes init [dir]');
    expect(stdout).toContain('keyframes check [dir] [--json] [--strict]');
    expect(stdout).toContain('keyframes --help | --version');
    expect(stdout).toContain('2  a usage or read problem, or an unexpected error');
  });
});

describe('version', () => {
  test.each(['keyframes --version', 'keyframes check --version'])(
    '%s prints the package version and exits 0',
    (line) => {
      expect(cli(line)).toEqual({ code: 0, stdout: `${VERSION}\n`, stderr: '' });
    },
  );
});

describe('usage problems exit 2, say what is wrong, and show the usage', () => {
  test.each([
    ['keyframes', 'missing a command'],
    ['keyframes frob', 'unknown command "frob"'],
    ['keyframes --frob', 'unknown flag "--frob"'],
    ['keyframes -v', 'unknown flag "-v"'],
    ['keyframes check --jsn', 'unknown flag "--jsn"'],
    ['keyframes init --json', "init doesn't take --json"],
    ['keyframes check a b', 'check takes one directory, not 2'],
  ])('%s', (line, problem) => {
    const { code, stdout, stderr } = cli(line);
    expect(code).toBe(2);
    expect(stdout).toBe('');
    expect(stderr).toMatch(new RegExp(`^keyframes: ${problem}\n\nUsage:\n`));
  });
});

describe('commands not built yet', () => {
  test('keyframes init parses, then says so and exits 2', () => {
    expect(cli('keyframes init')).toEqual({ code: 2, stdout: '', stderr: "keyframes: init isn't built yet\n" });
  });
});

// The trees the check commands run on, in a scratch directory the tests run from, so each command
// line names its tree as a short relative path.
const TREES: Readonly<Record<string, string | Uint8Array>> = {
  'warns/keyframes.md': '## Intent\nWhy.\n## Taste\n- **T1**: No slug.\n',
  'notes/keyframes.md': '## Intent\nWhy.\n## Taste\n* **T1 (calm)**: A star bullet.\n',
  'fails/keyframes.md': '## Intent\nWhy.\n## Taste\n- **T1 (calm)**: Per [T9 (gone)].\n',
  'upper/KEYFRAMES.md': '## Intent\nWhy.\n',
  'binary/keyframes.md': new Uint8Array([0x23, 0x20, 0xff, 0x0a]),
  'empty/README.md': '',
};

let scratch = '';
const START = process.cwd();

beforeAll(() => {
  scratch = mkdtempSync(join(tmpdir(), 'keyframes-cli-'));
  for (const [path, body] of Object.entries(TREES)) {
    mkdirSync(join(scratch, path, '..'), { recursive: true });
    writeFileSync(join(scratch, path), body);
  }
  process.chdir(scratch);
});

afterAll(() => {
  process.chdir(START);
  rmSync(scratch, { recursive: true, force: true });
});

describe('check exits by what it found', () => {
  test.each([
    ['keyframes check warns', 0, 'missing-slug'],
    ['keyframes check warns --strict', 1, 'missing-slug'],
    ['keyframes --strict check warns', 1, 'missing-slug'],
    ['keyframes check notes --strict', 0, 'alternate-form'],
    ['keyframes check fails', 1, 'broken-citation'],
  ])('%s exits %i, reporting %s', (line, code, found) => {
    const result = cli(line);
    expect(result.code).toBe(code);
    expect(result.stderr).toBe('');
    expect(result.stdout).toMatch(/^keyframes\.md\n\nintent {8}yes\n/);
    expect(result.stdout).toContain(`  ${found}  `);
  });

  test('keyframes check fails --json writes one JSON object instead', () => {
    const { code, stdout, stderr } = cli('keyframes check fails --json');
    expect({ code, stderr }).toEqual({ code: 1, stderr: '' });
    expect(JSON.parse(stdout)).toMatchObject({ schema_version: 1, plan: 'keyframes.md', errors: 1 });
  });

  test('keyframes check upper --strict finds KEYFRAMES.md, with a note that never fails the run', () => {
    expect(cli('keyframes check upper --strict')).toEqual({
      code: 0,
      stdout: [
        'KEYFRAMES.md',
        '',
        'intent        yes',
        'words         3 of 2000',
        '',
        'KEYFRAMES.md:1  note  alternate-form  "KEYFRAMES.md" reads fine; the usual form is "keyframes.md"',
        '',
        '1 note',
        '',
      ].join('\n'),
      stderr: '',
    });
  });
});

describe('check exits 2 on a read problem, saying what it is on stderr', () => {
  test.each([
    ['keyframes check', `there's no keyframes.md to check; "keyframes init" writes one`],
    ['keyframes check empty', `there's no keyframes.md to check; "keyframes init" writes one`],
    ['keyframes check gone', "there's no directory gone"],
    ['keyframes check warns/keyframes.md', "warns/keyframes.md isn't a directory"],
    ['keyframes check binary', "keyframes.md isn't UTF-8 text"],
  ])('%s', (line, problem) => {
    expect(cli(line)).toEqual({ code: 2, stdout: '', stderr: `keyframes: ${problem}\n` });
  });
});

describe('an unexpected error prints one line and exits 2', () => {
  test.each(['keyframes --help', 'keyframes check warns'])('%s, when writing to stdout fails', (line) => {
    const { code, stderr } = cli(line, () => {
      throw new Error('stdout is closed:\n  EPIPE');
    });
    expect({ code, stderr }).toEqual({ code: 2, stderr: 'keyframes: stdout is closed: EPIPE\n' });
  });
});
