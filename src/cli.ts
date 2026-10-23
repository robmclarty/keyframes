import { readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { check, exitCode, findPlan } from './check/index.js';
import { init, SNIPPET } from './init/index.js';
import { KEYFRAMES } from './name.js';
import { diskRepo } from './repo/index.js';
import { renderJson, renderText } from './report/index.js';

/** Where the CLI writes: stdout for what was asked for, stderr for usage and read problems and errors. */
export type Io = {
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
};

type Command = 'init' | 'check';

/** What a command line asks for, once it's understood. */
type Request =
  | { readonly kind: 'help' }
  | { readonly kind: 'version' }
  | { readonly kind: 'usage'; readonly problem: string }
  | {
      readonly kind: 'command';
      readonly command: Command;
      readonly dir: string | undefined;
      readonly flags: ReadonlySet<string>;
    };

// The flags each command takes. Help and version are separate: they work anywhere.
const FLAGS: Readonly<Record<Command, readonly string[]>> = {
  init: [],
  check: ['--json', '--strict'],
};

const KNOWN_FLAGS: ReadonlySet<string> = new Set(Object.values(FLAGS).flat());
const HELP_FLAGS: ReadonlySet<string> = new Set(['--help', '-h']);

const USAGE = `Usage:
  keyframes init [dir]                        write a starter keyframes.md; refuse if one exists
  keyframes check [dir] [--json] [--strict]   check the plan against itself and the repo
  keyframes --help | --version
`;

const HELP = `keyframes starts and checks keyframes.md, the file where a project's intent is written down.

${USAGE}
dir is the repo root. It defaults to the working directory.

Exit codes:
  0  no errors
  1  errors, or any warning under --strict
  2  a usage or read problem, or an unexpected error
`;

/** Whether `name` is one of the commands. */
const isCommand = (name: string): name is Command => Object.hasOwn(FLAGS, name);

/** A request that stops at a usage problem. */
const usage = (problem: string): Request => ({ kind: 'usage', problem });

/**
 * Reads a command line into a request, or the first usage problem in it.
 *
 * Help and version win wherever they appear. Flags may come before or after the command, since
 * nothing is ambiguous about either order.
 */
const parse = (argv: readonly string[]): Request => {
  if (argv[0] === 'help' || argv.some((arg) => HELP_FLAGS.has(arg))) {
    return { kind: 'help' };
  }
  // Not -v, which could as well mean verbose: a variant reads one way only.
  if (argv.includes('--version')) {
    return { kind: 'version' };
  }
  const flags = argv.filter((arg) => arg.startsWith('-'));
  const [command, ...dirs] = argv.filter((arg) => !arg.startsWith('-'));
  const unknown = flags.find((flag) => !KNOWN_FLAGS.has(flag));
  if (unknown !== undefined) {
    return usage(`unknown flag "${unknown}"`);
  }
  if (command === undefined) {
    return usage('missing a command');
  }
  if (!isCommand(command)) {
    return usage(`unknown command "${command}"`);
  }
  const misplaced = flags.find((flag) => !FLAGS[command].includes(flag));
  if (misplaced !== undefined) {
    return usage(`${command} doesn't take ${misplaced}`);
  }
  if (dirs.length > 1) {
    return usage(`${command} takes one directory, not ${String(dirs.length)}`);
  }
  return { kind: 'command', command, dir: dirs[0], flags: new Set(flags) };
};

/** The version in this package's package.json, one level above this file in src/ and dist/. */
const packageVersion = (): string => {
  const manifest: unknown = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  );
  if (
    typeof manifest === 'object' &&
    manifest !== null &&
    'version' in manifest &&
    typeof manifest.version === 'string'
  ) {
    return manifest.version;
  }
  throw new Error('package.json has no version');
};

/** The repo root a command works in, from `dir` or the working directory, or why there's none. */
const rootOf = (dir: string | undefined): { readonly root: string } | { readonly problem: string } => {
  const root = resolve(dir ?? '.');
  const stats = statSync(root, { throwIfNoEntry: false });
  if (stats === undefined) {
    return { problem: `there's no directory ${dir ?? '.'}` };
  }
  return stats.isDirectory() ? { root } : { problem: `${dir ?? '.'} isn't a directory` };
};

/**
 * Checks the plan in `root`, writes the report to stdout, and returns the exit code it earns. A
 * plan that can't be found or read is a read problem: it goes to stderr and exits 2.
 */
const runCheck = (root: string, flags: ReadonlySet<string>, io: Io): number => {
  const repo = diskRepo(root);
  const found = findPlan(repo);
  if ('problem' in found) {
    io.stderr(`${KEYFRAMES}: ${found.problem}\n`);
    return 2;
  }
  const report = check(found.plan, repo);
  io.stdout(flags.has('--json') ? renderJson(report) : renderText(report));
  return exitCode(report, flags.has('--strict'));
};

/**
 * Writes a starter plan in `root`, then prints the agent snippet with one line saying where to paste
 * it. A plan already there, in any case, goes to stderr and exits 2, since init never overwrites.
 */
const runInit = (root: string, dir: string | undefined, io: Io): number => {
  const result = init(root);
  if ('problem' in result) {
    io.stderr(`${KEYFRAMES}: ${result.problem}\n`);
    return 2;
  }
  const plan = dir === undefined ? result.written : join(dir, result.written);
  io.stdout(
    `Wrote ${plan}. Paste this into the file your agents already read, such as AGENTS.md or CLAUDE.md:\n\n${SNIPPET}`,
  );
  return 0;
};

/** Runs a command in the root it names, once that root is found. */
const runCommand = (request: Extract<Request, { kind: 'command' }>, io: Io): number => {
  const found = rootOf(request.dir);
  if ('problem' in found) {
    io.stderr(`${KEYFRAMES}: ${found.problem}\n`);
    return 2;
  }
  return request.command === 'check'
    ? runCheck(found.root, request.flags, io)
    : runInit(found.root, request.dir, io);
};

/** Runs a command line once it's parsed, and returns its exit code. */
const dispatch = (argv: readonly string[], io: Io): number => {
  const request = parse(argv);
  switch (request.kind) {
    case 'help':
      io.stdout(HELP);
      return 0;
    case 'version':
      io.stdout(`${packageVersion()}\n`);
      return 0;
    case 'usage':
      io.stderr(`${KEYFRAMES}: ${request.problem}\n\n${USAGE}`);
      return 2;
    default:
      return runCommand(request, io);
  }
};

/** An unexpected error's message on one line, so the CLI's report of it is one line too. */
const oneLine = (error: unknown): string => {
  const message = (error instanceof Error ? error.message : String(error)).replaceAll(/\s*\n\s*/g, ' ').trim();
  return message === '' ? 'an unexpected error' : message;
};

/**
 * Runs the keyframes CLI on `argv`, without the node and script paths, and returns its exit code.
 *
 * It never exits the process or touches stdout itself, so tests can call it directly. An unexpected
 * error prints one line, `keyframes: <message>`, and exits 2, since 1 must only ever mean the plan
 * has errors, and 2 already means no verdict was reached.
 */
export const run = (argv: readonly string[], io: Io): number => {
  try {
    return dispatch(argv, io);
  } catch (error) {
    io.stderr(`${KEYFRAMES}: ${oneLine(error)}\n`);
    return 2;
  }
};
