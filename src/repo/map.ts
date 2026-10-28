import type { Item } from '../items/index.js';
import { finding, type Finding } from '../scan/index.js';
import { OUTSIDE, pathNote, readClaim, readPath, shown, type Path } from './paths.js';
import type { Result } from './pointers.js';
import type { Repo } from './repo.js';

/** A Map path in its usual form, the line it's on, and what it resolved to. */
export type PathLink = { readonly path: string; readonly line: number; readonly result: Result };

/** A path a part claims, read, with the part and the line it's on, for path-overlap. */
type Claim = Path & { readonly id: string; readonly line: number };

/** What a path that can be read resolves to, and what it finds on `line`. */
const resolvePath = (
  path: Path,
  planned: boolean,
  repo: Repo,
  line: number,
): readonly [Result, readonly Finding[]] => {
  const name = shown(path);
  const stat = repo.stat(path.path);
  if (stat?.kind === 'outside') {
    return ['broken', [finding('bad-pointer', line, `${name} ${OUTSIDE}`)]];
  }
  const found = stat?.kind === (path.directory ? 'directory' : 'file');
  if (planned) {
    return found
      ? ['resolved', [finding('built-not-new', line, `${name} resolves now; drop "(new)"`)]]
      : ['planned', []];
  }
  if (found) {
    return ['resolved', []];
  }
  const why =
    stat === undefined
      ? `isn't in the repo; fix the path, or add "(new)" if it's planned`
      : path.directory
        ? `is a file, not a directory; drop its trailing "/"`
        : `is a directory; end it with "/" to claim the directory`;
  return ['broken', [finding('broken-path', line, `${name} ${why}`)]];
};

/** The path-overlap warning for a claim that repeats an earlier part's path, or sits inside it. */
const overlap = (claim: Claim, earlier: Claim): Finding | undefined => {
  const [mine, theirs] = [shown(claim), shown(earlier)];
  if (claim.path === earlier.path) {
    return finding('path-overlap', claim.line, `${mine} is in both ${earlier.id} and ${claim.id}; give it to one part`);
  }
  const inside = claim.path.startsWith(`${earlier.path}/`);
  if (!inside && !earlier.path.startsWith(`${claim.path}/`)) {
    return undefined;
  }
  const [inner, outer] = inside ? [`${mine} in ${claim.id}`, `${theirs} in ${earlier.id}`] : [`${theirs} in ${earlier.id}`, `${mine} in ${claim.id}`];
  return finding('path-overlap', claim.line, `${inner} is inside ${outer}; give each path to one part`);
};

/** path-overlap for every claim that meets an earlier one from another part, on the later line. */
const overlaps = (claims: readonly Claim[]): Finding[] =>
  claims.flatMap((claim, index) =>
    claims
      .slice(0, index)
      .filter((earlier) => earlier.id !== claim.id)
      .flatMap((earlier) => overlap(claim, earlier) ?? []),
  );

/** One path as a part writes it, resolved: its link, what it finds, and its claim for path-overlap. */
const resolveWritten = (
  written: string,
  id: string,
  line: number,
  repo: Repo,
): { readonly link: PathLink; readonly findings: readonly Finding[]; readonly claim?: Claim } => {
  const { text, planned } = readClaim(written);
  const path = readPath(text);
  if ('problem' in path) {
    return {
      link: { path: text, line, result: 'broken' },
      findings: [finding('bad-pointer', line, `"${text}" ${path.problem}`)],
    };
  }
  const [result, findings] = resolvePath(path, planned, repo, line);
  const note = path.varied ? [finding('alternate-form', line, pathNote(text, shown(path)))] : [];
  return {
    link: { path: shown(path), line, result },
    findings: [...findings, ...note],
    claim: { path: path.path, directory: path.directory, id, line },
  };
};

/**
 * Resolves every Map part's `paths:`: each path must exist and be the kind it claims, a file or a
 * directory ending in `/`, unless it's `(new)`. Two parts claiming one path, or one inside the
 * other's, is path-overlap.
 */
export const resolvePaths = (
  items: readonly Item[],
  repo: Repo,
): { readonly links: ReadonlyMap<Item, readonly PathLink[]>; readonly findings: readonly Finding[] } => {
  const resolved = items.flatMap((item) => {
    const sub = item.subLines.find((each) => each.key === 'paths');
    const paths = (sub?.parts ?? []).flatMap((part) =>
      part.text
        .split(',')
        .filter((written) => written.trim() !== '')
        .map((written) => resolveWritten(written, item.id, part.line, repo)),
    );
    return sub === undefined ? [] : [[item, paths] as const];
  });
  const all = resolved.flatMap(([, paths]) => paths);
  return {
    links: new Map(resolved.map(([item, paths]) => [item, paths.map((each) => each.link)])),
    findings: [
      ...all.flatMap((each) => each.findings),
      ...overlaps(all.flatMap((each) => (each.claim === undefined ? [] : [each.claim]))),
    ],
  };
};
