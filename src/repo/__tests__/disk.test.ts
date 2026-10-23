import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { readItems } from '../../items/index.js';
import { scan } from '../../scan/index.js';
import { diskRepo, resolvePointers, type Repo } from '../index.js';

// A real tree, committed with exactly these cases: Docs/Guide.txt, src/api/handler.txt and
// test/writes.txt. On this machine's disk, which ignores case, opening docs/guide.txt would find
// Docs/Guide.txt; the repo must not.
const TREE = fileURLToPath(new URL('../../../test/fixtures/repos/tree/', import.meta.url));

/** A plan from its lines, each ending in a newline. */
const md = (...lines: string[]): string => lines.map((line) => `${line}\n`).join('');

/** What resolving a plan's pointers and paths finds, against `repo`. */
const resolve = (repo: Repo, ...lines: string[]) => {
  const { lines: read } = scan(md(...lines));
  return resolvePointers(readItems(read).items, repo);
};

describe('diskRepo', () => {
  test('stat finds a path in its exact case, by reading directory entries', () => {
    const repo = diskRepo(TREE);
    expect(repo.stat('Docs/Guide.txt')).toEqual({ kind: 'file', size: 27 });
    expect(repo.stat('Docs')).toEqual({ kind: 'directory' });
    expect(repo.stat('docs/Guide.txt')).toBeUndefined();
    expect(repo.stat('Docs/guide.txt')).toBeUndefined();
    expect(repo.stat('docs')).toBeUndefined();
    expect(repo.list('')).toEqual(['Docs', 'src', 'test']);
    expect(repo.list('Docs/Guide.txt')).toBeUndefined();
    expect(new TextDecoder().decode(repo.read('Docs/Guide.txt'))).toBe('How to write a first plan.\n');
  });

  test('a wrong-case path is broken in a real tree, as it is in memory', () => {
    const { links, findings } = resolve(
      diskRepo(TREE),
      '## Map',
      '- **M1 (docs)**: The guide.',
      '  - paths: Docs/, docs/',
      '## Constraints',
      '- **C1 (one-writer)**: Only the sync worker writes.',
      '  - held-by: file:test/writes.txt#"only the sync worker writes",',
      '    file:Docs/Guide.txt#"first plan",',
      '    file:docs/guide.txt,',
      '    file:Docs/guide.txt#"first plan"',
    );
    expect(links.map(({ paths, heldBy }) => (paths ?? heldBy)?.map(({ result }) => result))).toEqual([
      ['resolved', 'broken'],
      ['resolved', 'resolved', 'broken', 'broken'],
    ]);
    expect(findings.map(({ line, code }) => [line, code])).toEqual([
      [3, 'broken-path'],
      [8, 'broken-pointer'],
      [9, 'broken-pointer'],
    ]);
  });
});

describe('paths that escape the root', () => {
  let base = '';
  let root = '';

  beforeAll(() => {
    base = mkdtempSync(join(tmpdir(), 'keyframes-repo-'));
    root = join(base, 'repo');
    mkdirSync(join(root, 'src'), { recursive: true });
    mkdirSync(join(base, 'outside'));
    writeFileSync(join(root, 'src', 'inside.ts'), 'inside\n');
    writeFileSync(join(base, 'outside', 'secret.ts'), 'secret\n');
    symlinkSync(join('..', 'outside', 'secret.ts'), join(root, 'leak.ts'));
    symlinkSync(join('..', 'outside'), join(root, 'out'));
    symlinkSync(join('src', 'inside.ts'), join(root, 'alias.ts'));
  });

  afterAll(() => {
    rmSync(base, { recursive: true, force: true });
  });

  test('a link whose real path is outside the root is outside, and one inside it is followed', () => {
    const repo = diskRepo(root);
    expect(repo.stat('leak.ts')).toEqual({ kind: 'outside' });
    expect(repo.stat('out/secret.ts')).toEqual({ kind: 'outside' });
    expect(repo.stat('alias.ts')).toEqual({ kind: 'file', size: 7 });
  });

  test('a pointer or path that resolves outside the root is bad-pointer', () => {
    const { findings } = resolve(
      diskRepo(root),
      '## Map',
      '- **M1 (out)**: Somewhere else.',
      '  - paths: out/',
      '## Constraints',
      '- **C1 (inside)**: Stays inside.',
      '  - held-by: file:leak.ts, file:alias.ts, file:out/secret.ts#"secret"',
    );
    expect(findings.map(({ line, code, message }) => [line, code, message])).toEqual([
      [3, 'bad-pointer', 'out/ resolves outside the repo; paths stay inside it, relative to its root'],
      [6, 'bad-pointer', 'file:leak.ts resolves outside the repo; paths stay inside it, relative to its root'],
      [
        6,
        'bad-pointer',
        'file:out/secret.ts#"secret" resolves outside the repo; paths stay inside it, relative to its root',
      ],
    ]);
  });
});
