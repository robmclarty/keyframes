import type { Item } from '../items/index.js';
import { finding, type Finding } from '../scan/index.js';
import { OUTSIDE, readClaim, readPath, shown, type Path } from './paths.js';
import type { Repo } from './repo.js';

/** What a pointer or path resolved to. `review` is the review pointer, which a person checks. */
export type Result = 'resolved' | 'planned' | 'broken' | 'review';

/** What a Constraint's or Scenario's pointers add up to. */
export type Status = 'linked' | 'planned' | 'review' | 'unlinked' | 'broken';

/** A pointer in its usual form, the line it's on, and what it resolved to. */
export type PointerLink = { readonly pointer: string; readonly line: number; readonly result: Result };

/** A sub-line of an item, as `readItems` reads it. */
type SubLine = Item['subLines'][number];

/** A `file:` pointer read into its parts. */
type FilePointer = Path & { readonly text: string | undefined; readonly planned: boolean };

/** A pointer read from what's written: the review pointer, a file pointer, or why it can't be read. */
type Pointer =
  | { readonly kind: 'review' }
  | ({ readonly kind: 'file' } & FilePointer)
  | { readonly kind: 'bad'; readonly problem: string };

// The largest file whose text a pointer searches: 1 MiB.
const MAX_SIZE = 1024 * 1024;
const FILE = /^file:/i;
// What `file:` takes, as a bad pointer's message shows it.
const USUAL = 'held-by takes review or file:<path>, as in file:test/writes.test.ts';

/** A pointer's text, unquoted with `\"` and `\\` read as escapes, or undefined when it's quoted wrong. */
const unquote = (quoted: string): string | undefined => {
  if (!quoted.startsWith('"')) {
    return undefined;
  }
  let text = '';
  for (let at = 1; at < quoted.length; at += 1) {
    const char = quoted.charAt(at);
    const next = quoted.charAt(at + 1);
    if (char === '\\' && (next === '"' || next === '\\')) {
      text += next;
      at += 1;
    } else if (char === '"') {
      return at === quoted.length - 1 && text !== '' ? text : undefined;
    } else {
      text += char;
    }
  }
  return undefined;
};

/** Splits a line of a held-by value into pointers at its commas, except commas inside quotes. */
const splitPointers = (line: string): string[] => {
  const pointers: string[] = [];
  let start = 0;
  let quoted = false;
  for (let at = 0; at < line.length; at += 1) {
    const char = line.charAt(at);
    if (quoted && char === '\\') {
      at += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      pointers.push(line.slice(start, at));
      start = at + 1;
    }
  }
  return [...pointers, line.slice(start)];
};

/** Reads one pointer as written: `review`, `file:<path>`, or `file:<path>#"<text>"`, any with `(new)`. */
const readPointer = (written: string): Pointer => {
  const { text, planned } = readClaim(written);
  if (text.toLowerCase() === 'review') {
    return planned
      ? { kind: 'bad', problem: `can't be planned, since review always resolves; drop "(new)"` }
      : { kind: 'review' };
  }
  if (!FILE.test(text)) {
    return { kind: 'bad', problem: `isn't a pointer; ${USUAL}` };
  }
  const rest = text.slice('file:'.length);
  const hash = rest.indexOf('#');
  const quoted = hash === -1 ? undefined : unquote(rest.slice(hash + 1).trim());
  if (hash !== -1 && quoted === undefined) {
    return {
      kind: 'bad',
      problem: `has text that isn't quoted right; the usual form is file:<path>#"<text>", with \\" for a quote inside it`,
    };
  }
  const path = readPath(hash === -1 ? rest : rest.slice(0, hash));
  return 'problem' in path
    ? { kind: 'bad', problem: path.problem }
    : { kind: 'file', ...path, text: quoted, planned };
};

/** A file pointer in its usual form, its text quoted with `\"` and `\\` escaped. */
const usual = (pointer: FilePointer): string => {
  const text = pointer.text?.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  return `file:${shown(pointer)}${text === undefined ? '' : `#"${text}"`}`;
};

/** Whether a file's text, read as UTF-8 with CRLF read as LF, contains `text` exactly. */
const contains = (repo: Repo, path: string, text: string): boolean =>
  new TextDecoder().decode(repo.read(path)).replaceAll('\r\n', '\n').includes(text);

/** What a file pointer resolves to, and what it finds on `line`. */
const resolveFile = (
  pointer: FilePointer,
  repo: Repo,
  line: number,
): readonly [Result, readonly Finding[]] => {
  const name = usual(pointer);
  const stat = repo.stat(pointer.path);
  if (stat?.kind === 'outside') {
    return ['broken', [finding('bad-pointer', line, `${name} ${OUTSIDE}`)]];
  }
  const missing = stat?.kind !== 'file';
  if (!missing && pointer.text !== undefined && stat.size > MAX_SIZE) {
    return [
      'broken',
      [finding('file-too-large', line, `${name} points at a file over 1 MiB, so its text isn't searched; point at a smaller file`)],
    ];
  }
  const found = !missing && (pointer.text === undefined || contains(repo, pointer.path, pointer.text));
  if (pointer.planned) {
    if (found) {
      return ['resolved', [finding('built-not-new', line, `${name} resolves now; drop "(new)"`)]];
    }
    return [
      'planned',
      missing
        ? []
        : [finding('planned-text-missing', line, `${name} is planned, but its file exists without that text: a typo?`)],
    ];
  }
  if (found) {
    return ['resolved', []];
  }
  const why =
    stat?.kind === 'directory'
      ? 'is a directory; a pointer names a file'
      : missing
        ? `isn't in the repo; fix the path, or add "(new)" if it's planned`
        : `doesn't contain that text; fix it, or add "(new)" if it's planned`;
  return ['broken', [finding('broken-pointer', line, `${name} ${why}`)]];
};

/** What one pointer, as written on `line`, resolves to, and what it finds. */
const resolvePointer = (written: string, repo: Repo, line: number): readonly [PointerLink, readonly Finding[]] => {
  const pointer = readPointer(written);
  if (pointer.kind === 'review') {
    return [{ pointer: 'review', line, result: 'review' }, []];
  }
  if (pointer.kind === 'bad') {
    const shownAs = written.trim();
    return [
      { pointer: shownAs, line, result: 'broken' },
      [finding('bad-pointer', line, `"${shownAs}" ${pointer.problem}`)],
    ];
  }
  const [result, findings] = resolveFile(pointer, repo, line);
  return [{ pointer: usual(pointer), line, result }, findings];
};

/** An item's status, from what its pointers resolved to; with no held-by it's unlinked. */
const statusOf = (links: readonly PointerLink[] | undefined): Status => {
  const results = links?.map((link) => link.result);
  if (results === undefined) {
    return 'unlinked';
  }
  if (results.length === 0 || results.includes('broken')) {
    return 'broken';
  }
  if (results.includes('planned')) {
    return 'planned';
  }
  return results.every((result) => result === 'review') ? 'review' : 'linked';
};

/**
 * Resolves a held-by sub-line: each pointer, on the line it's written on, and the item's status. A
 * comma ending a line, as a list across lines has, adds no pointer, while a held-by with none is
 * bad-pointer.
 */
export const resolveHeldBy = (
  sub: SubLine | undefined,
  repo: Repo,
): { readonly links: readonly PointerLink[] | undefined; readonly status: Status; readonly findings: readonly Finding[] } => {
  if (sub === undefined) {
    return { links: undefined, status: 'unlinked', findings: [] };
  }
  const resolved = sub.parts.flatMap((part) =>
    splitPointers(part.text)
      .filter((written) => written.trim() !== '')
      .map((written) => resolvePointer(written, repo, part.line)),
  );
  const links = resolved.map(([link]) => link);
  const empty =
    links.length === 0
      ? [finding('bad-pointer', sub.line, `"held-by:" is empty; write review, or point at a file: - held-by: file:<path>`)]
      : [];
  return { links, status: statusOf(links), findings: [...empty, ...resolved.flatMap(([, found]) => found)] };
};
