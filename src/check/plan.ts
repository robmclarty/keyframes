import type { Repo } from '../repo/index.js';

/** A plan as `check` reads it: its name in the repo's root, spelled as the root spells it, and its text. */
export type Plan = { readonly name: string; readonly text: string };

/** The plan's usual name. */
export const PLAN = 'keyframes.md';

/** The error code a failed read carries, such as `EACCES`, if it carries one. */
const codeOf = (error: unknown): string | undefined =>
  error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : undefined;

/** A plan's bytes, or why they can't be read. */
const readBytes = (repo: Repo, name: string): Uint8Array | { readonly problem: string } => {
  try {
    return repo.read(name);
  } catch (error) {
    const code = codeOf(error);
    return { problem: `${name} can't be read${code === undefined ? '' : ` (${code})`}` };
  }
};

/**
 * Finds the plan in a repo's root by reading the root's entries, so `keyframes.md` matches in any
 * case, and reads it as UTF-8. No plan, two names that differ only in case, a plan that isn't a
 * file, and one that can't be read as UTF-8 are each a read problem: `check` never guesses which
 * file is the plan, or what its bytes say.
 */
export const findPlan = (repo: Repo): { readonly plan: Plan } | { readonly problem: string } => {
  const names = (repo.list('') ?? []).filter((name) => name.toLowerCase() === PLAN);
  const [name] = names;
  if (name === undefined) {
    return { problem: `there's no ${PLAN} to check; "keyframes init" writes one` };
  }
  if (names.length > 1) {
    return { problem: `${names.join(' and ')} differ only in case, so neither is read as the plan; keep one` };
  }
  if (repo.stat(name)?.kind !== 'file') {
    return { problem: `${name} isn't a file` };
  }
  const bytes = readBytes(repo, name);
  if ('problem' in bytes) {
    return bytes;
  }
  try {
    return { plan: { name, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) } };
  } catch {
    return { problem: `${name} isn't UTF-8 text` };
  }
};
