import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';

import { exactStat, type Repo, type Stat } from './repo.js';

/** Whether an error only says nothing is there: no such entry, or a file where a directory was. */
const absent = (error: unknown): boolean =>
  error instanceof Error && 'code' in error && (error.code === 'ENOENT' || error.code === 'ENOTDIR');

/** `read()`, or undefined when nothing is there. Any other error is unexpected, and rises. */
const attempt = <T>(read: () => T): T | undefined => {
  try {
    return read();
  } catch (error) {
    if (absent(error)) {
      return undefined;
    }
    throw error;
  }
};

/**
 * A repo on disk, rooted at `root`. It only reads, and it finds every name by reading directory
 * entries, so a wrong-case path is missing here even on a disk that ignores case. A path whose
 * real location, once links are followed, is outside the root is `outside`.
 */
export const diskRepo = (root: string): Repo => {
  const real = realpathSync(root);
  const at = (path: string): string => (path === '' ? root : join(root, ...path.split('/')));
  const list = (path: string): readonly string[] | undefined =>
    attempt(() => readdirSync(at(path)).toSorted());
  const look = (path: string): Stat | undefined =>
    attempt(() => {
      const target = realpathSync(at(path));
      if (target !== real && !target.startsWith(`${real}${sep}`)) {
        return { kind: 'outside' };
      }
      const stats = statSync(target);
      if (stats.isFile()) {
        return { kind: 'file', size: stats.size };
      }
      return stats.isDirectory() ? { kind: 'directory' } : undefined;
    });
  return { stat: exactStat(list, look), list, read: (path) => readFileSync(at(path)) };
};
