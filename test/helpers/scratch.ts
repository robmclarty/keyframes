import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { cpSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// bin/keyframes.js is plain JavaScript that imports the built CLI, so the end-to-end tests build
// src/ into a scratch copy of the package and run the bin there, the way an installed package
// runs. Nothing is written inside the repo, so they can't race the gate's own build of dist/.

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const TSC = join(REPO, 'node_modules', 'typescript', 'bin', 'tsc');

/**
 * Builds src/ into a scratch copy of the package, with its bin and package.json, in a new
 * directory outside the repo, and returns that directory. The caller removes it.
 */
export const buildScratch = (): string => {
  const root = mkdtempSync(join(tmpdir(), 'keyframes-bin-'));
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
  return root;
};

/** Runs the bin of the scratch package in `root` with `args`, from `cwd`. */
export const runBin = (root: string, cwd: string, ...args: string[]): SpawnSyncReturns<string> =>
  spawnSync(process.execPath, [join(root, 'bin', 'keyframes.js'), ...args], { cwd, encoding: 'utf8' });
