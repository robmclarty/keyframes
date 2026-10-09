import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

// bin/keyframes.js is plain JavaScript that imports the built CLI, so this
// builds src/ into a scratch copy of the package and runs the bin there, the
// way an installed package runs. Nothing is written inside the repo, so it
// can't race the gate's own build of dist/.

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const TSC = join(REPO, 'node_modules', 'typescript', 'bin', 'tsc');
const VERSION = (
  JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8')) as { version: string }
).version;

let root = '';

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'keyframes-bin-'));
  cpSync(join(REPO, 'bin'), join(root, 'bin'), { recursive: true });
  cpSync(join(REPO, 'package.json'), join(root, 'package.json'));
  const build = spawnSync(
    process.execPath,
    [
      TSC,
      '--project',
      join(REPO, 'tsconfig.json'),
      '--outDir',
      join(root, 'dist'),
      // JavaScript only: no build info, declarations or maps to write.
      '--composite',
      'false',
      '--incremental',
      'false',
      '--declaration',
      'false',
      '--declarationMap',
      'false',
      '--sourceMap',
      'false',
    ],
    { encoding: 'utf8' },
  );
  if (build.status !== 0) {
    throw new Error(`tsc could not build the CLI:\n${build.stdout}${build.stderr}`);
  }
}, 60_000);

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

/** Runs the scratch package's bin with `args`. */
const keyframes = (...args: string[]) =>
  spawnSync(process.execPath, [join(root, 'bin', 'keyframes.js'), ...args], { encoding: 'utf8' });

describe('the keyframes bin', () => {
  test('--version prints the package version and exits 0', () => {
    const { status, stdout, stderr } = keyframes('--version');
    expect({ status, stdout, stderr }).toEqual({ status: 0, stdout: `${VERSION}\n`, stderr: '' });
  });

  test('--help prints the usage and exits 0', () => {
    const { status, stdout } = keyframes('--help');
    expect(status).toBe(0);
    expect(stdout).toContain('keyframes check [dir] [--json] [--strict]');
  });

  test('an unknown command exits 2 with the problem on stderr', () => {
    const { status, stdout, stderr } = keyframes('frob');
    expect(status).toBe(2);
    expect(stdout).toBe('');
    expect(stderr).toMatch(/^keyframes: unknown command "frob"\n/);
  });

  test('an unknown flag exits 2 with the problem on stderr', () => {
    const { status, stderr } = keyframes('check', '--jsn');
    expect(status).toBe(2);
    expect(stderr).toMatch(/^keyframes: unknown flag "--jsn"\n/);
  });
});
