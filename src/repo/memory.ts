import { exactStat, type Repo, type Stat } from './repo.js';

/**
 * A repo held in memory, from its files by root-relative path. A path ending in `/` is a directory
 * with nothing in it, and every file's parent directories exist.
 */
export const memoryRepo = (files: Readonly<Record<string, string | Uint8Array>>): Repo => {
  const contents = new Map<string, Uint8Array>();
  const directories = new Map<string, Set<string>>([['', new Set()]]);
  for (const [path, body] of Object.entries(files)) {
    const segments = path.split('/').filter((segment) => segment !== '');
    for (const [index, segment] of segments.entries()) {
      directories.get(segments.slice(0, index).join('/'))?.add(segment);
      const here = segments.slice(0, index + 1).join('/');
      if ((index < segments.length - 1 || path.endsWith('/')) && !directories.has(here)) {
        directories.set(here, new Set());
      }
    }
    if (!path.endsWith('/')) {
      contents.set(segments.join('/'), typeof body === 'string' ? new TextEncoder().encode(body) : body);
    }
  }
  const list = (path: string): readonly string[] | undefined => {
    const names = directories.get(path);
    return names === undefined ? undefined : [...names].toSorted();
  };
  const look = (path: string): Stat | undefined => {
    const body = contents.get(path);
    if (body !== undefined) {
      return { kind: 'file', size: body.byteLength };
    }
    return directories.has(path) ? { kind: 'directory' } : undefined;
  };
  const read = (path: string): Uint8Array => {
    const body = contents.get(path);
    if (body === undefined) {
      throw new Error(`no file at ${path}`);
    }
    return body;
  };
  return { stat: exactStat(list, look), list, read };
};
