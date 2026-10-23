/** What's at a path: a file and its size in bytes, a directory, or something that resolves outside the repo. */
export type Stat =
  | { readonly kind: 'file'; readonly size: number }
  | { readonly kind: 'directory' }
  | { readonly kind: 'outside' };

/**
 * A read-only view of a repo, by root-relative paths that use `/`. `check` sees the tree only
 * through this, so tests run against an in-memory repo and every repo checks case the same way.
 */
export type Repo = {
  /** What's at `path` with exactly this case, found by reading directory entries, or nothing. */
  readonly stat: (path: string) => Stat | undefined;
  /** The names in a directory as the repo spells them, sorted, or undefined with no directory. */
  readonly list: (path: string) => readonly string[] | undefined;
  /** A file's bytes. It's only read once `stat` has found it. */
  readonly read: (path: string) => Uint8Array;
};

/**
 * A `stat` that finds each segment of a path, in exact case, among its parent's entries before it
 * looks at the path itself, so a case-insensitive disk answers the way a case-sensitive one does.
 */
export const exactStat =
  (list: Repo['list'], look: (path: string) => Stat | undefined): Repo['stat'] =>
  (path) => {
    const segments = path.split('/');
    const found = segments.every(
      (segment, index) => list(segments.slice(0, index).join('/'))?.includes(segment) === true,
    );
    return found ? look(path) : undefined;
  };
