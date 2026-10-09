import { readFileSync } from 'node:fs';

import { describe, expect, test } from 'vitest';

import { run } from '../cli.js';

const VERSION = (
  JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
    version: string;
  }
).version;

/** Runs the CLI on `argv`, capturing its exit code and both streams. */
const cli = (...argv: string[]) => {
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
  test.each([['--help'], ['-h'], ['help'], ['check', '--help'], ['frob', '--help']])(
    '%s prints the usage to stdout and exits 0',
    (...argv) => {
      const { code, stdout, stderr } = cli(...argv);
      expect(code).toBe(0);
      expect(stderr).toBe('');
      expect(stdout).toContain('keyframes init [dir]');
      expect(stdout).toContain('keyframes check [dir] [--json] [--strict]');
      expect(stdout).toContain('keyframes --help | --version');
      expect(stdout).toContain('2  a usage or read problem');
    },
  );
});

describe('version', () => {
  test.each([['--version'], ['-v'], ['check', '--version']])(
    '%s prints the package version and exits 0',
    (...argv) => {
      expect(cli(...argv)).toEqual({ code: 0, stdout: `${VERSION}\n`, stderr: '' });
    },
  );
});

describe('usage problems exit 2, say what is wrong, and show the usage', () => {
  test.each([
    [[], 'missing a command'],
    [['frob'], 'unknown command "frob"'],
    [['--frob'], 'unknown flag "--frob"'],
    [['check', '--jsn'], 'unknown flag "--jsn"'],
    [['init', '--json'], "init doesn't take --json"],
    [['check', 'a', 'b'], 'check takes one directory, not 2'],
  ])('%j', (argv, problem) => {
    const { code, stdout, stderr } = cli(...argv);
    expect(code).toBe(2);
    expect(stdout).toBe('');
    expect(stderr).toMatch(new RegExp(`^keyframes: ${problem}\n\nUsage:\n`));
  });
});

describe('commands not built yet', () => {
  test.each([['init'], ['check'], ['check', 'repo', '--json', '--strict'], ['--strict', 'check']])(
    '%s parses, then says so and exits 2',
    (...argv) => {
      const { code, stdout, stderr } = cli(...argv);
      expect(code).toBe(2);
      expect(stdout).toBe('');
      expect(stderr).toBe(`keyframes: ${argv.find((arg) => !arg.startsWith('-')) ?? ''} isn't built yet\n`);
    },
  );
});
