import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, beforeAll, expect, test } from 'vitest';

import { buildScratch, runBin } from '../helpers/scratch.js';

// S2 (second-editor) in keyframes.md: a second person replaces a decision, marks the old one
// superseded, cites the new one elsewhere, and check passes.

let root = '';

beforeAll(() => {
  root = buildScratch();
}, 60_000);

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

const D1 = [
  '- **D1 (json-file)**: Scores live in one JSON file on the phone.',
  "  - because: it's the simplest file that holds a season of games.",
];

const D2 = [
  '- **D2 (sqlite)**: Scores live in one SQLite file on the phone.',
  '  - because: the JSON file lost a season of games when the app crashed mid-write.',
];

/** The plan, with its Intent citing `decision`, and `decisions` under its Decisions. */
const plan = (decision: string, decisions: readonly string[]): string =>
  [
    '# tally',
    '',
    '## Intent',
    '',
    'Tally keeps score at board game nights, on one phone passed around the table. The scores stay',
    `on the phone, in the file ${decision} describes.`,
    '',
    '## Decisions',
    '',
    ...decisions,
    '',
  ].join('\n');

test('second editor', () => {
  const dir = join(root, 'tally');
  mkdirSync(dir);
  const path = join(dir, 'keyframes.md');
  writeFileSync(path, plan('[D1 (json-file)]', D1));

  // The second person replaces D1 with D2. D1 stays, marked superseded, so the reason it was chosen
  // isn't lost, and the Intent cites D2 where it cited D1.
  writeFileSync(path, plan('[D2 (sqlite)]', [...D1, '  - superseded-by: D2', ...D2]));
  expect(runBin(root, dir, 'check')).toMatchObject({
    status: 0,
    stdout: [
      'keyframes.md',
      '',
      'intent        yes',
      'decisions     2 · 1 active · 1 superseded',
      'words         86 of 2000',
      '',
      'no findings',
      '',
    ].join('\n'),
    stderr: '',
  });
});
