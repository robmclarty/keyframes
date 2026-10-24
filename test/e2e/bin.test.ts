import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { buildScratch, runBin } from '../helpers/scratch.js';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const VERSION = (
  JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8')) as { version: string }
).version;

let root = '';

beforeAll(() => {
  root = buildScratch();
}, 60_000);

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

/** Runs the scratch package's bin with `args`, from the repo's root. */
const keyframes = (...args: string[]) => keyframesIn(REPO, ...args);

/** Runs the scratch package's bin with `args`, from `cwd`. */
const keyframesIn = (cwd: string, ...args: string[]) => runBin(root, cwd, ...args);

const GOLDEN = join(REPO, 'test', 'fixtures', 'golden');

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

describe('keyframes check, run by the bin', () => {
  test.each([
    ['clean', 0],
    ['findings', 1],
  ])('the %s golden plan prints its golden reports and exits %i, from any working directory', (name, code) => {
    const text = readFileSync(join(GOLDEN, `${name}.txt`), 'utf8');
    const json = readFileSync(join(GOLDEN, `${name}.json`), 'utf8');
    for (const [cwd, args] of [
      [join(GOLDEN, name), []],
      [REPO, [join('test', 'fixtures', 'golden', name)]],
    ] as const) {
      expect(keyframesIn(cwd, 'check', ...args)).toMatchObject({ status: code, stdout: text, stderr: '' });
      expect(keyframesIn(cwd, 'check', ...args, '--json')).toMatchObject({ status: code, stdout: json, stderr: '' });
    }
  });

  test('a reader that closes stdout early gets one line on stderr and exit 2, not a stack trace', async () => {
    // A plan with no errors whose report is far bigger than a pipe holds, so the bin is still
    // writing when its reader goes away, as it is under `keyframes check | head`.
    const items = Array.from({ length: 2000 }, (_, index) => `- **T${String(index + 1)}**: No slug.`);
    const dir = join(root, 'long');
    mkdirSync(dir);
    writeFileSync(join(dir, 'keyframes.md'), ['## Intent', 'Why.', '## Taste', ...items, ''].join('\n'));
    const bin = join(root, 'bin', 'keyframes.js');
    const whole = spawnSync(process.execPath, [bin, 'check', dir], { encoding: 'utf8', maxBuffer: 2 ** 24 });
    expect(whole.status).toBe(0);
    expect(whole.stdout.length).toBeGreaterThan(2 ** 17);
    const child = spawn(process.execPath, [bin, 'check', dir], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.setEncoding('utf8').on('data', (text: string) => {
      stderr += text;
    });
    child.stdout.once('data', () => child.stdout.destroy());
    const status = await new Promise((done) => child.on('close', done));
    expect({ status, stderr }).toEqual({ status: 2, stderr: 'keyframes: write EPIPE\n' });
  });

  test('a missing directory exits 2 with the problem on stderr', () => {
    const { status, stdout, stderr } = keyframes('check', 'no-such-dir');
    expect({ status, stdout, stderr }).toEqual({
      status: 2,
      stdout: '',
      stderr: "keyframes: there's no directory no-such-dir\n",
    });
  });
});

describe('the package', () => {
  test('ships schema/report.schema.json', () => {
    const pack = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
      cwd: REPO,
      encoding: 'utf8',
      env: { ...process.env, npm_config_update_notifier: 'false' },
    });
    expect(pack.status).toBe(0);
    const [manifest] = JSON.parse(pack.stdout) as [{ files: { path: string }[] }];
    expect(manifest.files.map(({ path }) => path)).toContain('schema/report.schema.json');
  });
});
