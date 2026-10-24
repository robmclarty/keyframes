import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, beforeAll, expect, test } from 'vitest';

import { buildScratch, runBin } from '../helpers/scratch.js';

// S1 (first-plan) in keyframes.md: someone runs init, writes a little intent and a few items, runs
// check, and gets either a clean report or a finding that says exactly how to fix it.

let root = '';

beforeAll(() => {
  root = buildScratch();
}, 60_000);

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

// What they write, under the heading it goes under.
const WRITTEN: ReadonlyArray<readonly [string, readonly string[]]> = [
  [
    '## Intent',
    [
      'Tally keeps score at board game nights: who played, who won, and the running totals, on one',
      'phone passed around the table.',
    ],
  ],
  [
    '## Principles',
    [
      '- **P1 (quick-at-the-table)**: Recording a game takes less time than setting up the next one.',
      '  - because: nobody stops game night to fill in a form.',
    ],
  ],
  ['## Constraints', ['- **C1 (one-scorer)**: Only the scoring screen writes scores.', '  - held-by: review']],
  [
    '## Decisions',
    [
      '- **D1 (on-the-phone)**: Scores live on the phone, with no account.',
      "  - because: game night happens where the wifi doesn't.",
    ],
  ],
];

/** The plan with `lines` written under `heading`, below the comment the template left there. */
const writeUnder = (plan: string, heading: string, lines: readonly string[]): string => {
  const at = plan.indexOf(`\n${heading}\n`);
  const end = plan.indexOf('\n-->\n', at);
  if (at === -1 || end === -1) {
    throw new Error(`the template has no "${heading}" with a comment under it`);
  }
  const cut = end + '\n-->\n'.length;
  return `${plan.slice(0, cut)}\n${lines.join('\n')}\n${plan.slice(cut)}`;
};

test('first plan', () => {
  const dir = join(root, 'tally');
  mkdirSync(dir);
  const keyframes = (...args: string[]) => runBin(root, dir, ...args);
  const path = join(dir, 'keyframes.md');

  const init = keyframes('init');
  expect(init).toMatchObject({ status: 0, stderr: '' });
  expect(init.stdout).toMatch(/^Wrote keyframes\.md\. Paste this into the file your agents already read/);
  expect(readdirSync(dir)).toEqual(['keyframes.md']);

  const plan = WRITTEN.reduce((text, [heading, lines]) => writeUnder(text, heading, lines), readFileSync(path, 'utf8'));
  writeFileSync(path, plan);
  expect(keyframes('check')).toMatchObject({
    status: 0,
    stdout: [
      'keyframes.md',
      '',
      'intent        yes',
      'principles    1',
      'map           0 parts',
      'constraints   1 · 1 review',
      'scenarios     0',
      'decisions     1 · 1 active',
      'taste         0',
      'questions     0',
      'ideas         0',
      'words         100 of 2000',
      '',
      'no findings',
      '',
    ].join('\n'),
    stderr: '',
  });

  // They drop the parentheses around a slug, and check shows the line as it should be written. It's
  // a warning, so a plain check still exits 0, and --strict fails the run.
  const broken = plan.replace('- **C1 (one-scorer)**:', '- **C1 one-scorer**:');
  writeFileSync(path, broken);
  const line = broken.split('\n').indexOf('- **C1 one-scorer**: Only the scoring screen writes scores.') + 1;
  const report = keyframes('check');
  expect(report).toMatchObject({ status: 0, stderr: '' });
  expect(report.stdout.split('\n').filter((each) => each.startsWith('keyframes.md:'))).toEqual([
    `keyframes.md:${String(line)}  warning  not-an-item  "- **C1 one-scorer**" isn't read as an item; put its slug in parentheses: - **C1 (one-scorer)**: …`,
  ]);
  expect(report.stdout).toMatch(/\n\n1 warning\n$/);
  expect(keyframes('check', '--strict').status).toBe(1);
});
