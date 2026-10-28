import type { Finding } from './finding.js';
import { readLines } from './lines.js';
import { readSections, type Line, type Section } from './sections.js';

/** A plan read into lines and sections, with what reading it found. */
export type Scan = {
  /** Every line of the plan, in order. */
  readonly lines: readonly Line[];
  /** The `##` sections in order, known or free prose. */
  readonly sections: readonly Section[];
  /**
   * duplicate-section, no-intent, unclosed-fence, unclosed-comment, and a note for each singular or
   * underlined heading, by line.
   */
  readonly findings: readonly Finding[];
};

/**
 * Reads a plan's markdown into lines and sections, the first pass of `check`. It reads only the
 * subset of markdown the format defines: fenced code and comments, whose contents nothing reads,
 * headings, `#` or underlined, thematic breaks, and everything else as text for the item parser.
 */
export const scan = (source: string): Scan => {
  const read = readLines(source);
  const { lines, sections, findings } = readSections(read.lines);
  return {
    lines,
    sections,
    findings: [...read.findings, ...findings].toSorted((a, b) => a.line - b.line),
  };
};
