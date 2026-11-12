import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, beforeAll, expect, test } from 'vitest';

import { buildScratch, runBin } from '../helpers/scratch.js';

// S4 (context-for-paths) in keyframes.md: a harness runs context with the paths a step touches and
// gets the plan's principles, constraints, scenarios and taste, with the Map parts each path meets.

let root = '';

beforeAll(() => {
  root = buildScratch();
}, 60_000);

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

// What the plan's author writes, under the heading it goes under.
const WRITTEN: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['## Intent', ['Tally keeps score at board game nights, on one phone passed around the table.']],
  ['## Principles', ['- **P1 (quick-at-the-table)**: Recording a game takes less time than setting up the next.']],
  [
    '## Map',
    ['- **M1 (scoring)**: The scoring screen and what it writes.', '  - paths: src/scoring/ (new)'],
  ],
  ['## Constraints', ['- **C1 (one-scorer)**: Only the scoring screen writes scores.', '  - held-by: review']],
  ['## Scenarios', ['- **S1 (tied-game)**: Two players tie, and both see the tie.', '  - held-by: review']],
  [
    '## Decisions',
    ['- **D1 (on-the-phone)**: Scores live on the phone.', "  - because: game night happens where the wifi doesn't."],
  ],
  ['## Taste', ['- **T1 (big-buttons)**: Buttons big enough to hit after a few drinks.']],
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

test('context for paths', () => {
  const dir = join(root, 'tally');
  mkdirSync(dir);
  const keyframes = (...args: string[]) => runBin(root, dir, ...args);
  const path = join(dir, 'keyframes.md');

  expect(keyframes('init')).toMatchObject({ status: 0, stderr: '' });
  writeFileSync(path, WRITTEN.reduce((text, [heading, lines]) => writeUnder(text, heading, lines), readFileSync(path, 'utf8')));

  const { status, stdout, stderr } = keyframes('context', 'src/scoring/screen.ts', 'docs/', '--json');
  expect({ status, stderr }).toEqual({ status: 0, stderr: '' });
  const context = JSON.parse(stdout) as {
    items: { id: string; section: string }[];
    paths: { path: string; parts: string[] }[];
    parts: { id: string; paths: { path: string; result: string }[] }[];
  };
  expect(context.items.map(({ id, section }) => [id, section])).toEqual([
    ['P1', 'principles'],
    ['C1', 'constraints'],
    ['S1', 'scenarios'],
    ['T1', 'taste'],
  ]);
  expect(context.paths).toEqual([
    { path: 'src/scoring/screen.ts', parts: ['M1'] },
    { path: 'docs/', parts: [] },
  ]);
  expect(context.parts).toMatchObject([{ id: 'M1', paths: [{ path: 'src/scoring/', result: 'planned' }] }]);
  expect(stdout).not.toContain('on-the-phone');
});
