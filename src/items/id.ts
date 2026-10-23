import type { SectionName } from '../scan/index.js';
import { toLetter, type Letter } from './kinds.js';

/** An ID in its usual form, with the alternate-form notes its number earns. */
export type Id = {
  /** The ID in its usual form, such as `C3`. */
  readonly id: string;
  readonly letter: Letter;
  /** The section the letter belongs to. */
  readonly section: SectionName;
  readonly notes: readonly string[];
};

// Lowercase letters and digits in words, joined by a hyphen, an underscore, or spaces, in any case.
const SLUG = /^[A-Za-z0-9]+(?:(?:-|_| +)[A-Za-z0-9]+)*$/;

/** An ID's number without its leading zeros. */
export const numberOf = (digits: string): string => digits.replace(/^0+(?=\d)/, '');

/**
 * An ID in its usual form, if `letter` is an item letter in any case and the number isn't zero. A
 * leading zero reads fine, with a note.
 */
export const readId = (letter: string, digits: string): Id | undefined => {
  const known = toLetter(letter);
  const number = numberOf(digits);
  if (known === undefined || number === '0') {
    return undefined;
  }
  return {
    id: `${known[0]}${number}`,
    letter: known[0],
    section: known[1],
    notes: /^0\d/.test(digits)
      ? ['a leading zero in an ID reads fine; the usual form drops it: C3, not C03']
      : [],
  };
};

/**
 * A slug in its usual form, if what's written reads as one, with a note for each variant in it:
 * spaces or underscores for its hyphens. Case never matters, and earns no note.
 */
export const readSlug = (written: string): { slug: string; notes: string[] } | undefined => {
  const slug = written.trim();
  if (!SLUG.test(slug)) {
    return undefined;
  }
  const joined = 'the usual form joins its words with hyphens: (one-writer)';
  const notes = [
    slug.includes(' ') ? `spaces in a slug read fine; ${joined}` : undefined,
    slug.includes('_') ? `underscores in a slug read fine; ${joined}` : undefined,
  ];
  return {
    slug: slug.toLowerCase().replaceAll(/_| +/g, '-'),
    notes: notes.filter((note) => note !== undefined),
  };
};
