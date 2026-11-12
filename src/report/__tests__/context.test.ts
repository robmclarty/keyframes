import { describe, expect, test } from 'vitest';

import { check } from '../../check/index.js';
import { selectContext, type Context } from '../../context/index.js';
import { memoryRepo } from '../../repo/index.js';
import { renderContextJson, renderContextText } from '../index.js';

/** The context for `paths` on a plan, from its lines, against `files`. */
const context = (lines: readonly string[], paths: readonly string[] = [], files: Readonly<Record<string, string>> = {}): Context => {
  const selected = selectContext(
    check({ name: 'keyframes.md', text: lines.map((line) => `${line}\n`).join('') }, memoryRepo(files)),
    paths,
  );
  if ('problem' in selected) {
    throw new Error(selected.problem);
  }
  return selected;
};

describe('the context text', () => {
  test('prints each section with items under its heading, and nothing past the items when the plan is clean', () => {
    const text = renderContextText(
      context(['## Intent', 'Why.', '## Taste', '- **T1 (quiet)**: Quiet.', '## Principles', '- **P1 (dull)**: Dull.']),
    );
    expect(text).toBe(['## Principles', '', '- **P1 (dull)**: Dull.', '', '## Taste', '', '- **T1 (quiet)**: Quiet.', ''].join('\n'));
  });

  test('leaves out a section with no items', () => {
    expect(renderContextText(context(['## Constraints', '## Taste', '- **T1 (quiet)**: Quiet.']))).toBe(
      '## Taste\n\n- **T1 (quiet)**: Quiet.\n',
    );
  });

  test('prints nothing at all for a plan with no such items and no paths', () => {
    expect(renderContextText(context(['## Intent', 'Why.', '## Decisions', '- **D1 (x)**: X.', '  - because: so.']))).toBe('');
  });

  test('indents an item’s later lines and a sub-line’s, and keeps a planned pointer’s "(new)"', () => {
    const text = renderContextText(
      context(
        [
          '## Constraints',
          '- **C1 (one-writer)**: Only the worker',
          '  writes.',
          '  - because: two writers',
          '    disagreed.',
          '  - held-by: file:test/a.test.ts (new), review',
          '- **C2**: No slug.',
        ],
        [],
        {},
      ),
    );
    expect(text).toBe(
      [
        '## Constraints',
        '',
        '- **C1 (one-writer)**: Only the worker',
        '  writes.',
        '  - because: two writers',
        '    disagreed.',
        '  - held-by: file:test/a.test.ts (new), review',
        '- **C2**: No slug.',
        '',
      ].join('\n'),
    );
  });

  test('closes with the paths, each naming the parts it meets, or none', () => {
    const plan = ['## Map', '- **M1 (api)**: API.', '  - paths: src/api/', '- **M2**: Jobs.', '  - paths: src/jobs/ (new)'];
    expect(renderContextText(context(plan, ['src/', 'docs/'], { 'src/api/a.ts': '' }))).toBe(
      ['## Paths', '', '- src/: M1 (api), M2', '- docs/: none', ''].join('\n'),
    );
  });
});

describe('the context JSON', () => {
  test('carries its own version, the items, paths, parts and counts, in that order', () => {
    const plan = ['## Intent', 'Why.', '## Map', '- **M1 (api)**: API.', '  - paths: src/api/', '## Taste', '- **T1 (quiet)**: Quiet.'];
    const json = JSON.parse(renderContextJson(context(plan, ['src/api/x.ts'], { 'src/api/a.ts': '' }))) as Record<string, unknown>;
    expect(Object.keys(json)).toEqual(['schema_version', 'plan', 'items', 'paths', 'parts', 'errors', 'warnings']);
    expect(json).toMatchObject({
      schema_version: 1,
      plan: 'keyframes.md',
      items: [{ id: 'T1', slug: 'quiet', section: 'taste', line: 7, text: 'Quiet.' }],
      paths: [{ path: 'src/api/x.ts', parts: ['M1'] }],
      parts: [{ id: 'M1', section: 'map', paths: [{ path: 'src/api/', result: 'resolved' }] }],
      errors: 0,
      warnings: 0,
    });
  });

  test('leaves out a field an item does not have', () => {
    const json = JSON.parse(renderContextJson(context(['## Taste', '- **T1**: Quiet.']))) as { items: object[] };
    expect(Object.keys(json.items[0] ?? {})).toEqual(['id', 'section', 'line', 'text']);
  });
});
