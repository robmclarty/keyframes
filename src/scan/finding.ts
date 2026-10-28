/** How much a finding matters: an error fails a run, a warning only under --strict, a note never. */
export type Severity = 'error' | 'warning' | 'note';

// Every finding code, with its severity from the spec's Findings table. Codes are stable, and every
// pass of `check` reports from this list.
const SEVERITIES = {
  'duplicate-section': 'error',
  'malformed-item': 'error',
  'wrong-letter': 'error',
  'duplicate-id': 'error',
  'duplicate-key': 'error',
  'broken-citation': 'error',
  'slug-mismatch': 'error',
  'bad-pointer': 'error',
  'broken-pointer': 'error',
  'broken-path': 'error',
  'bad-reference': 'error',
  'file-too-large': 'error',
  'no-intent': 'warning',
  'not-an-item': 'warning',
  'item-outside-section': 'warning',
  'missing-slug': 'warning',
  'unknown-key': 'warning',
  'key-not-allowed': 'warning',
  'missing-because': 'warning',
  'built-not-new': 'warning',
  'planned-text-missing': 'warning',
  'path-overlap': 'warning',
  'over-budget': 'warning',
  'unclosed-fence': 'warning',
  'unclosed-comment': 'warning',
  'alternate-form': 'note',
} as const satisfies Readonly<Record<string, Severity>>;

/** A finding's code, one of the spec's Findings table. */
export type Code = keyof typeof SEVERITIES;

/** Something `check` found on one line of the plan. */
export type Finding = {
  readonly line: number;
  readonly severity: Severity;
  readonly code: Code;
  readonly message: string;
};

/** A finding with `code` on `line`, at the severity the code always carries. */
export const finding = (code: Code, line: number, message: string): Finding => ({
  line,
  severity: SEVERITIES[code],
  code,
  message,
});
