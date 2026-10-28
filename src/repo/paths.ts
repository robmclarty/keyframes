/** A root-relative path in its usual form, and whether it claims a directory, as a trailing `/` does. */
export type Path = { readonly path: string; readonly directory: boolean };

/** A path read from what's written, and whether it was written with a `.` segment or a doubled `/`. */
export type ReadPath = Path & { readonly varied: boolean };

// `(new)` after a pointer or path, in any case: its target is planned.
const NEW = /[ \t]*\(new\)$/i;
// A Windows drive, as in `C:\` or `C:/`, which makes a path absolute.
const DRIVE = /^[A-Za-z]:/;

// Why a path's form can't be read, as the end of a message that quotes it.
const ABSOLUTE = 'is absolute; paths are relative to the repo root, as in src/api/';
const BACKSLASH = 'uses "\\"; paths use "/", as in src/api/';
const PARENT = 'has a ".." segment; paths stay inside the repo, relative to its root';
const EMPTY = 'names no path; write one relative to the repo root, as in src/api/';

/** Why a path that looks fine still can't be followed: it resolves outside the repo. */
export const OUTSIDE = 'resolves outside the repo; paths stay inside it, relative to its root';

/** `text` without one pair of backticks around it, which a pointer or path may have. */
const unticked = (text: string): string =>
  text.length >= 2 && text.startsWith('`') && text.endsWith('`') ? text.slice(1, -1).trim() : text;

/**
 * A pointer or path as written, without backticks around it or its `(new)`, and whether it had
 * `(new)`. The backticks may go around the whole of it, or inside the `(new)`.
 */
export const readClaim = (written: string): { readonly text: string; readonly planned: boolean } => {
  const bare = unticked(written.trim());
  return { text: unticked(bare.replace(NEW, '').trim()), planned: NEW.test(bare) };
};

/**
 * A path in its usual form, with `.` and empty segments dropped, or why it can't be read: it's
 * absolute, uses backslashes, climbs out with `..`, or is empty. A dropped segment is a variant, so
 * it's marked `varied`, while backticks around the path aren't, since they keep markdown from
 * reading a path's underscores as emphasis.
 */
export const readPath = (written: string): ReadPath | { readonly problem: string } => {
  const path = unticked(written.trim());
  if (path.startsWith('/') || DRIVE.test(path)) {
    return { problem: ABSOLUTE };
  }
  if (path.includes('\\')) {
    return { problem: BACKSLASH };
  }
  const parts = path.split('/');
  const segments = parts.filter((segment) => segment !== '' && segment !== '.');
  if (segments.includes('..')) {
    return { problem: PARENT };
  }
  const directory = path.endsWith('/');
  // The empty part after a trailing `/` is the usual form's, so only the parts before it count.
  const varied = parts
    .slice(0, directory ? -1 : undefined)
    .some((segment) => segment === '' || segment === '.');
  return segments.length === 0 ? { problem: EMPTY } : { path: segments.join('/'), directory, varied };
};

/** The note for a path written with a `.` segment or a doubled `/`, showing its usual form. */
export const pathNote = (written: string, usual: string): string =>
  `"${written}" reads fine; the usual form drops "./" and doubled slashes: ${usual}`;

/** A path as messages and the report show it, with its trailing `/` when it claims a directory. */
export const shown = ({ path, directory }: Path): string => `${path}${directory ? '/' : ''}`;
