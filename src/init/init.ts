import { readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { template } from './template.js';

// The name init writes. `check` finds a plan by this name in any case, so init looks for it that way.
const PLAN = 'keyframes.md';

/** What init did: the plan it wrote, by its name in the root, or why it wrote nothing. */
type Written = { readonly written: string } | { readonly problem: string };

/** The refusal for a plan that's already in the root, named as the root spells it. */
const refuse = (name: string): Written => ({ problem: `${name} already exists; init never overwrites a plan` });

/** Whether a write failed only because its file was already there. */
const taken = (error: unknown): boolean =>
  error instanceof Error && 'code' in error && error.code === 'EEXIST';

/**
 * Writes a starter `keyframes.md` in `root`, from the template titled with the root's name. It never
 * overwrites: a plan already in the root, in any case, as `check` would find it, is the problem
 * instead. Any other failure to write is unexpected, and rises.
 */
export const init = (root: string): Written => {
  const existing = readdirSync(root).find((name) => name.toLowerCase() === PLAN);
  if (existing !== undefined) {
    return refuse(existing);
  }
  try {
    // `wx` fails rather than overwrite a plan that appeared since the root was read.
    writeFileSync(join(root, PLAN), template(basename(root) || root), { flag: 'wx' });
  } catch (error) {
    if (taken(error)) {
      return refuse(PLAN);
    }
    throw error;
  }
  return { written: PLAN };
};
