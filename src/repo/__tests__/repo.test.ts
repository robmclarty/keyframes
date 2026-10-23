import { describe, expect, test } from 'vitest';

import { readItems } from '../../items/index.js';
import { scan } from '../../scan/index.js';
import { memoryRepo, resolvePointers } from '../index.js';

/** A plan from its lines, each ending in a newline. */
const md = (...lines: string[]): string => lines.map((line) => `${line}\n`).join('');

const MIB = 1024 * 1024;

// The repo every test resolves against unless it brings its own.
const FILES: Readonly<Record<string, string>> = {
  'src/api/handler.ts': 'export const handler = 1;\n',
  'test/writes.test.ts': "test('only the sync worker writes', () => {});\ntest('a, b', () => {});\n",
  'test/quotes.test.ts': 'test(\'says "hi" and \\ back\', () => {});\n',
  'test/crlf.test.ts': "line one\r\ntest('escalates', () => {});\r\n",
  'docs/': '',
  'big.log': `${'x'.repeat(MIB)}y`,
  'edge.log': `${'x'.repeat(MIB - 1)}y`,
};

/** What resolving a plan's pointers and paths finds, against `files`. */
const resolve = (lines: readonly string[], files: Readonly<Record<string, string>> = FILES) => {
  const { lines: read } = scan(md(...lines));
  return resolvePointers(readItems(read).items, memoryRepo(files));
};

/** A Constraint held by `held`, as plan lines: the item on line 2 and its held-by on line 3. */
const held = (value: string): string[] => [
  '## Constraints',
  '- **C1 (one-writer)**: Only the sync worker writes.',
  `  - held-by: ${value}`.trimEnd(),
];

/** What one held-by resolves to: each pointer and result, the status, and each finding's code. */
const pointers = (value: string, files?: Readonly<Record<string, string>>) => {
  const { links, findings } = resolve(held(value), files);
  return {
    held: links[0]?.heldBy?.map(({ pointer, result }) => [pointer, result]),
    status: links[0]?.status,
    codes: findings.map(({ code }) => code),
  };
};

/** A Map part with `value` as its paths, as plan lines: the item on line 2 and its paths on line 3. */
const mapped = (value: string): string[] => [
  '## Map',
  '- **M1 (api)**: The HTTP API.',
  `  - paths: ${value}`,
];

/** What one paths line resolves to: each path and result, and each finding's code. */
const paths = (value: string) => {
  const { links, findings } = resolve(mapped(value));
  return {
    paths: links[0]?.paths?.map(({ path, result }) => [path, result]),
    codes: findings.map(({ code }) => code),
  };
};

describe('file pointers', () => {
  test.each([
    ['found', 'file:src/api/handler.ts', 'resolved', 'linked', []],
    ['missing', 'file:src/api/gone.ts', 'broken', 'broken', ['broken-pointer']],
    ['planned', 'file:src/api/gone.ts (new)', 'planned', 'planned', []],
    ['planned but built', 'file:src/api/handler.ts (new)', 'resolved', 'linked', ['built-not-new']],
    ['a directory', 'file:docs/', 'broken', 'broken', ['broken-pointer']],
  ])('a file pointer that is %s', (_, value, result, status, codes) => {
    expect(pointers(value)).toEqual({
      held: [[value.replace(' (new)', ''), result]],
      status,
      codes,
    });
  });

  test.each([
    ['found', 'file:test/writes.test.ts#"only the sync worker writes"', 'resolved', []],
    ['missing its text', 'file:test/writes.test.ts#"only one writer"', 'broken', ['broken-pointer']],
    ['missing its file', 'file:test/gone.test.ts#"only one writer"', 'broken', ['broken-pointer']],
    ['planned, with no file', 'file:test/gone.test.ts#"one writer" (new)', 'planned', []],
    [
      'planned, in a file without its text',
      'file:test/writes.test.ts#"one writer" (new)',
      'planned',
      ['planned-text-missing'],
    ],
    [
      'planned, and built',
      'file:test/writes.test.ts#"only the sync worker writes" (new)',
      'resolved',
      ['built-not-new'],
    ],
  ])('a text pointer that is %s', (_, value, result, codes) => {
    expect(pointers(value)).toMatchObject({ held: [[value.replace(' (new)', ''), result]], codes });
  });

  test('the messages say what was found and what to do', () => {
    const messages = (value: string): string[] => resolve(held(value)).findings.map((each) => each.message);
    expect(messages('file:src/api/gone.ts')).toEqual([
      `file:src/api/gone.ts isn't in the repo; fix the path, or add "(new)" if it's planned`,
    ]);
    expect(messages('file:test/writes.test.ts#"only one writer"')).toEqual([
      `file:test/writes.test.ts#"only one writer" doesn't contain that text; fix it, or add "(new)" if it's planned`,
    ]);
    expect(messages('file:test/writes.test.ts#"only the sync worker writes" (new)')).toEqual([
      'file:test/writes.test.ts#"only the sync worker writes" resolves now; drop "(new)"',
    ]);
    expect(messages('file:test/writes.test.ts#"one writer" (new)')).toEqual([
      'file:test/writes.test.ts#"one writer" is planned, but its file exists without that text: a typo?',
    ]);
  });

  test('a path matches with exact case, so a wrong-case path is broken', () => {
    expect(pointers('file:SRC/api/handler.ts')).toMatchObject({ status: 'broken', codes: ['broken-pointer'] });
    expect(pointers('file:src/API/handler.ts')).toMatchObject({ status: 'broken', codes: ['broken-pointer'] });
    expect(pointers('file:src/api/Handler.ts')).toMatchObject({ status: 'broken', codes: ['broken-pointer'] });
  });

  test('a CRLF file matches LF text', () => {
    expect(pointers(`file:test/crlf.test.ts#"test('escalates', () => {});"`)).toMatchObject({
      status: 'linked',
      codes: [],
    });
  });

  test('inside the text, \\" and \\\\ are escapes, and commas do not split pointers', () => {
    expect(pointers('file:test/quotes.test.ts#"says \\"hi\\" and \\\\ back"')).toMatchObject({
      status: 'linked',
      codes: [],
    });
    expect(pointers('file:test/writes.test.ts#"a, b", review')).toEqual({
      held: [
        ['file:test/writes.test.ts#"a, b"', 'resolved'],
        ['review', 'review'],
      ],
      status: 'linked',
      codes: [],
    });
  });

  test("a file over 1 MiB is file-too-large when a pointer would search it, and found when it wouldn't", () => {
    expect(pointers('file:big.log#"y"')).toMatchObject({ status: 'broken', codes: ['file-too-large'] });
    expect(pointers('file:edge.log#"y"')).toMatchObject({ status: 'linked', codes: [] });
    expect(pointers('file:big.log')).toMatchObject({ status: 'linked', codes: [] });
    expect(resolve(held('file:big.log#"y"')).findings[0]?.message).toBe(
      `file:big.log#"y" points at a file over 1 MiB, so its text isn't searched; point at a smaller file`,
    );
  });

  test('backticks around a pointer or its path are ignored', () => {
    expect(pointers('`file:src/api/handler.ts`, file:`src/api/handler.ts`, `file:src/gone.ts` (new)')).toEqual({
      held: [
        ['file:src/api/handler.ts', 'resolved'],
        ['file:src/api/handler.ts', 'resolved'],
        ['file:src/gone.ts', 'planned'],
      ],
      status: 'planned',
      codes: [],
    });
  });
});

describe('pointer keywords', () => {
  test('review, file: and (new) match in any case, with no note', () => {
    expect(pointers('REVIEW, File:src/api/handler.ts, FILE:src/gone.ts (NEW), file:src/later.ts (New)')).toEqual({
      held: [
        ['review', 'review'],
        ['file:src/api/handler.ts', 'resolved'],
        ['file:src/gone.ts', 'planned'],
        ['file:src/later.ts', 'planned'],
      ],
      status: 'planned',
      codes: [],
    });
  });
});

describe('statuses', () => {
  test.each([
    ['linked when every pointer resolves', 'review, file:src/api/handler.ts', 'linked'],
    ['planned when some pointer is new and none is broken', 'file:src/api/handler.ts, file:src/gone.ts (new)', 'planned'],
    ['review when only review holds it', 'review', 'review'],
    ['broken when some pointer does not resolve', 'review, file:src/gone.ts (new), file:src/gone.ts', 'broken'],
  ])('an item is %s', (_, value, status) => {
    expect(pointers(value).status).toBe(status);
  });

  test('an item with no held-by is unlinked, and only Constraints and Scenarios carry a status', () => {
    const { links } = resolve([
      '## Constraints',
      '- **C1 (one-writer)**: Only one writer.',
      '## Scenarios',
      '- **S1 (offline)**: Edits on a plane.',
      '  - held-by: review',
      '## Taste',
      '- **T1 (calm)**: Calm.',
    ]);
    expect(links).toEqual([
      { id: 'C1', line: 2, heldBy: undefined, status: 'unlinked', paths: undefined },
      { id: 'S1', line: 4, heldBy: [{ pointer: 'review', line: 5, result: 'review' }], status: 'review', paths: undefined },
      { id: 'T1', line: 7, heldBy: undefined, status: undefined, paths: undefined },
    ]);
  });

  test('a held-by across lines resolves each pointer on its own line', () => {
    const { links, findings } = resolve([
      '## Constraints',
      '- **C1 (read-only-check)**: `check` writes nothing.',
      '  - held-by: file:src/api/handler.ts,',
      '    file:src/gone.ts,',
      '    review',
    ]);
    expect(links[0]?.heldBy?.map(({ line, result }) => [line, result])).toEqual([
      [3, 'resolved'],
      [4, 'broken'],
      [5, 'review'],
    ]);
    expect(findings.map(({ line, code }) => [line, code])).toEqual([[4, 'broken-pointer']]);
  });
});

describe('bad-pointer', () => {
  test.each([
    ['an unknown kind', 'test:writes', `isn't a pointer; held-by takes review or file:<path>, as in file:test/writes.test.ts`],
    ['a path with no kind', 'src/api/handler.ts', `isn't a pointer; held-by takes review or file:<path>, as in file:test/writes.test.ts`],
    ['text never closed', 'file:test/writes.test.ts#"only', `has text that isn't quoted right; the usual form is file:<path>#"<text>", with \\" for a quote inside it`],
    ['text with no quotes', 'file:test/writes.test.ts#only', `has text that isn't quoted right; the usual form is file:<path>#"<text>", with \\" for a quote inside it`],
    ['a quote inside the text', 'file:test/writes.test.ts#"a"b"', `has text that isn't quoted right; the usual form is file:<path>#"<text>", with \\" for a quote inside it`],
    ['empty text', 'file:test/writes.test.ts#""', `has text that isn't quoted right; the usual form is file:<path>#"<text>", with \\" for a quote inside it`],
    ['an absolute path', 'file:/etc/passwd', 'is absolute; paths are relative to the repo root, as in src/api/'],
    ['a drive', 'file:C:/src/api/handler.ts', 'is absolute; paths are relative to the repo root, as in src/api/'],
    ['a .. segment', 'file:../outside.ts', 'has a ".." segment; paths stay inside the repo, relative to its root'],
    ['a .. inside the path', 'file:src/../../outside.ts', 'has a ".." segment; paths stay inside the repo, relative to its root'],
    ['backslashes', 'file:src\\api\\handler.ts', 'uses "\\"; paths use "/", as in src/api/'],
    ['no path', 'file:', 'names no path; write one relative to the repo root, as in src/api/'],
    ['a planned review', 'review (new)', `can't be planned, since review always resolves; drop "(new)"`],
  ])('%s is bad-pointer', (_, value, problem) => {
    const { links, findings } = resolve(held(value));
    expect(links[0]?.status).toBe('broken');
    expect(findings.map(({ line, code, message }) => [line, code, message])).toEqual([
      [3, 'bad-pointer', `"${value}" ${problem}`],
    ]);
  });

  test('an empty held-by is bad-pointer, and the item is broken', () => {
    const { links, findings } = resolve(held(''));
    expect(links[0]).toMatchObject({ heldBy: [], status: 'broken' });
    expect(findings.map(({ line, message }) => [line, message])).toEqual([
      [3, `"held-by:" is empty; write review, or point at a file: - held-by: file:<path>`],
    ]);
  });

  test('a comma at the end of a line adds no pointer', () => {
    expect(pointers('file:src/api/handler.ts, ')).toMatchObject({ status: 'linked', codes: [] });
  });
});

describe('map paths', () => {
  test.each([
    ['a file that is found', 'src/api/handler.ts', 'resolved', []],
    ['a directory that is found', 'src/api/', 'resolved', []],
    ['a missing file', 'src/api/gone.ts', 'broken', ['broken-path']],
    ['a missing directory', 'src/gone/', 'broken', ['broken-path']],
    ['a planned file', 'src/api/gone.ts (new)', 'planned', []],
    ['a planned directory', 'src/gone/ (new)', 'planned', []],
    ['a planned directory that exists now', 'src/api/ (new)', 'resolved', ['built-not-new']],
    ['a directory written as a file', 'src/api', 'broken', ['broken-path']],
    ['a file written as a directory', 'src/api/handler.ts/', 'broken', ['broken-path']],
    ['a wrong-case directory', 'Docs/', 'broken', ['broken-path']],
    ['an absolute path', '/src/api/', 'broken', ['bad-pointer']],
    ['a .. segment', '../elsewhere/', 'broken', ['bad-pointer']],
  ])('%s', (_, value, result, codes) => {
    const shown = value.replace(' (new)', '');
    expect(paths(value)).toEqual({ paths: [[shown, result]], codes });
  });

  test('paths are comma-separated, backticks are ignored, and the messages say what to do', () => {
    expect(paths('`src/api/`, docs/, `src/later/` (new)').paths).toEqual([
      ['src/api/', 'resolved'],
      ['docs/', 'resolved'],
      ['src/later/', 'planned'],
    ]);
    const messages = (value: string): string[] => resolve(mapped(value)).findings.map((each) => each.message);
    expect(messages('src/gone/, src/api, src/api/handler.ts/, src/api/ (new)')).toEqual([
      `src/gone/ isn't in the repo; fix the path, or add "(new)" if it's planned`,
      'src/api is a directory; end it with "/" to claim the directory',
      'src/api/handler.ts/ is a file, not a directory; drop its trailing "/"',
      'src/api/ resolves now; drop "(new)"',
    ]);
  });

  test('a part with no paths is fine', () => {
    expect(resolve(['## Map', '- **M1 (idea)**: A concept, not built yet.'])).toMatchObject({
      links: [{ paths: undefined }],
      findings: [],
    });
  });
});

describe('path-overlap', () => {
  test('two parts claiming one path, or one inside the other, warn on the later line', () => {
    const { findings } = resolve([
      '## Map',
      '- **M1 (src)**: All the source.',
      '  - paths: src/',
      '- **M2 (api)**: The HTTP API.',
      '  - paths: src/api/, docs/',
      '- **M3 (handler)**: The handler.',
      '  - paths: src/api/handler.ts, docs/ (new)',
    ]);
    expect(findings.map(({ line, code, message }) => [line, code, message])).toEqual([
      [5, 'path-overlap', 'src/api/ in M2 is inside src/ in M1; give each path to one part'],
      [7, 'built-not-new', 'docs/ resolves now; drop "(new)"'],
      [7, 'path-overlap', 'src/api/handler.ts in M3 is inside src/ in M1; give each path to one part'],
      [7, 'path-overlap', 'src/api/handler.ts in M3 is inside src/api/ in M2; give each path to one part'],
      [7, 'path-overlap', 'docs/ is in both M2 and M3; give it to one part'],
    ]);
  });

  test('a later part that holds an earlier one warns too, and one part may repeat its own paths', () => {
    const { findings } = resolve([
      '## Map',
      '- **M1 (api)**: The HTTP API.',
      '  - paths: src/api/, src/api/handler.ts',
      '- **M2 (src)**: All the source.',
      '  - paths: src/',
    ]);
    expect(findings.map(({ line, message }) => [line, message])).toEqual([
      [5, 'src/api/ in M1 is inside src/ in M2; give each path to one part'],
      [5, 'src/api/handler.ts in M1 is inside src/ in M2; give each path to one part'],
    ]);
  });
});

describe('memoryRepo', () => {
  test('stat finds files and directories in exact case, by their entries', () => {
    const repo = memoryRepo({ 'src/api/handler.ts': 'abc', 'docs/': '' });
    expect(repo.stat('src/api/handler.ts')).toEqual({ kind: 'file', size: 3 });
    expect(repo.stat('src/api')).toEqual({ kind: 'directory' });
    expect(repo.stat('docs')).toEqual({ kind: 'directory' });
    expect(repo.stat('Src/api')).toBeUndefined();
    expect(repo.list('')).toEqual(['docs', 'src']);
    expect(repo.list('src/api/handler.ts')).toBeUndefined();
    expect(() => repo.read('src/gone.ts')).toThrow('no file at src/gone.ts');
  });
});
