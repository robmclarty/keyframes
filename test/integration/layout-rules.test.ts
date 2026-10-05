import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

// The location rules match `kind: program`, so only their `files`/`ignores`
// globs decide what fires, and `ast-grep test` cannot see paths. This scans a
// real tree built from the repo's own sgconfig.yml and rules/ instead.

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const AST_GREP = join(REPO, 'node_modules', '.bin', 'ast-grep');

const EXPORT = 'export const value = 1;\n';
const SPAWN = "import { spawn } from 'node:child_process';\nexport { spawn };\n";
const WRITE = "import { writeFileSync } from 'node:fs';\nwriteFileSync('a', 'b');\n";
const TYPESCRIPT = "import ts from 'typescript';\nexport { ts };\n";
const LEAK = "import { value } from '../../test/helpers/make.js';\nexport { value };\n";

// Each file, its contents, and exactly the rules that must fire on it.
const CASES: ReadonlyArray<readonly [string, string, readonly string[]]> = [
  ['src/plan/parse.test.ts', EXPORT, ['colocate-unit-tests']],
  ['src/plan/__tests__/parse.test.ts', EXPORT, []],
  ['src/plan/parse.spec.ts', EXPORT, ['no-spec-suffix']],
  ['test/loose.test.ts', EXPORT, ['test-dir-layout']],
  ['test/__tests__/stray.test.ts', EXPORT, ['test-dir-layout', 'tests-dir-is-src-only']],
  ['test/integration/flow.test.ts', EXPORT, []],
  ['test/e2e/cli.test.ts', EXPORT, []],
  ['test/contract/report.test.ts', EXPORT, []],
  ['test/helpers/make.ts', EXPORT, []],
  ['test/fixtures/repo/src/z.test.ts', EXPORT, []],
  ['test/fixtures/repo/src/index.ts', 'export default 1;\n', []],
  ['src/check/run.ts', SPAWN, ['no-subprocess']],
  ['src/cli.ts', SPAWN, ['no-subprocess']],
  ['src/init/write.ts', WRITE, []],
  ['src/report/out.ts', WRITE, ['writes-only-in-init']],
  ['src/scan/parse.ts', TYPESCRIPT, ['node-builtins-only']],
  // Reaching into test/ is also a deep import, so both rules agree here.
  ['src/report/leak.ts', LEAK, ['no-deep-sibling-import', 'src-never-imports-test']],
];

type Finding = { readonly ruleId: string; readonly file: string };

let root = '';
let fired = new Map<string, string[]>();

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'keyframes-layout-'));
  cpSync(join(REPO, 'sgconfig.yml'), join(root, 'sgconfig.yml'));
  cpSync(join(REPO, 'rules'), join(root, 'rules'), { recursive: true });
  for (const [path, body] of CASES) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  // ast-grep exits 1 when it finds error-level diagnostics, which is the point
  // here; only a missing binary or a broken rule (no JSON on stdout) is fatal.
  const scan = spawnSync(AST_GREP, ['scan', '--json=compact'], { cwd: root, encoding: 'utf8' });
  if (scan.error !== undefined || !scan.stdout.trim().startsWith('[')) {
    throw new Error(`ast-grep scan did not report: ${scan.stderr || String(scan.error)}`);
  }
  const findings = JSON.parse(scan.stdout) as Finding[];
  fired = new Map();
  for (const { ruleId, file } of findings) {
    fired.set(file, [...(fired.get(file) ?? []), ruleId]);
  }
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('layout rules, scanned on a real tree', () => {
  test.each(CASES)('%s', (path, _body, expected) => {
    const ids = [...new Set(fired.get(path) ?? [])].toSorted();
    expect(ids).toEqual(expected.toSorted());
  });
});
