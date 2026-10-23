import { readFileSync } from 'node:fs';

import { describe, expect, test } from 'vitest';

import { run } from '../cli.js';

const VERSION = (
  JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
    version: string;
  }
).version;

/**
 * Runs the CLI on a whole command line, such as `keyframes check --json`, capturing its exit code
 * and both streams. The line splits on spaces, so no argument here contains one.
 */
const cli = (line: string) => {
  const [, ...argv] = line.split(' ');
  let stdout = '';
  let stderr = '';
  const code = run(argv, {
    stdout: (text) => {
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
    expect(stdout).toContain('2  a usage or read problem');
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
  test.each([
    ['keyframes init', 'init'],
    ['keyframes check', 'check'],
    ['keyframes check repo --json --strict', 'check'],
    ['keyframes --strict check', 'check'],
  ])('%s parses, then says so and exits 2', (line, command) => {
    const { code, stdout, stderr } = cli(line);
    expect(code).toBe(2);
    expect(stdout).toBe('');
    expect(stderr).toBe(`keyframes: ${command} isn't built yet\n`);
  });
});
