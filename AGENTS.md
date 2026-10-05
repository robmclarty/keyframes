# AGENTS.md

Instructions for any coding agent working in this repository.

<!-- checkride:begin hash=v15dbbcd1d686fce67 -->

## Checkride: the definition of done

`pnpm check` is the single source of truth for "done". Exit 0 means the work is
complete; any other exit code means it is not. Never claim a task is finished while
`pnpm check` is red.

When it fails:

1. Read `.check/summary.json` to see which check failed.
2. Read that check's raw output (`.check/<slot>.json` or `.check/<slot>.stdout.txt`).
3. Fix the root cause, then re-run.

`pnpm exec checkride triage` runs this procedure in full and reads `.check/` for you
(`/checkride:check` and `/checkride-check` are the same thing as a skill).

Tight feedback loops: `pnpm check --bail`, `pnpm check --only types,lint`, and
`pnpm check --changed`.

If a stop-gate hook is configured (`.claude/settings.json` or `.cursor/hooks.json`),
it runs the check when a turn ends — so while iterating, prefer the narrow commands
above rather than running the full check yourself every loop. Read the gate's verdict
rather than assuming it covered everything: a repo can narrow the gate with `gate` in
`checkride.config.json`, and a narrowed one names its narrowing (`only …`, `without …`,
`affected-only`) in every verdict. That green is not the "done" defined above; run
`pnpm check` in full before you claim the work is finished.

### Baseline

If `checkride.baseline.json` is present, checkride grandfathers the diagnostics it
lists: a slot is green as long as only baselined findings remain, while a genuinely
new diagnostic still fails it. Fixing a baselined finding prunes it from the file —
the ratchet, so the baseline only ever shrinks. Never add to the baseline to make a
check pass; fix the finding.

### Module boundaries

The `struct` check runs whatever ast-grep rules `sgconfig.yml` points at
(`rules/` by default). Those files are this repo's boundary convention —
read them rather than assuming one.

Active checks in this repo: types, lint, struct, dead, test, docs, links, spell, rule-tests, typecheck-tests.

<!-- checkride:end -->

## Current plan

[`docs/prototype.md`](docs/prototype.md) is the current plan. [`docs/archive/`](docs/archive/)
is historical reference, not current intent, so don't build from it.

## Repository layout

Each rule below fails the gate; the id in parentheses is the ast-grep rule in `rules/`.

- **Unit tests** sit in a `__tests__/` folder beside the code they cover, named
  `<thing>.test.ts` (`colocate-unit-tests`, `tests-dir-is-src-only`, `no-spec-suffix`).
- **`test/`** holds five things only (`test-dir-layout`):
  - `test/integration/`, `test/e2e/` and `test/contract/` for tests that span modules;
  - `test/helpers/` for shared test code;
  - `test/fixtures/` for data that is never run or linted (plans, fake repos).
- **Shipped code** never imports from `test/` (`src-never-imports-test`), and barrels
  re-export only (`no-logic-in-barrel`).
These rules hold the prototype spec's build constraints (`docs/prototype.md`, Build
constraints).

- **The checker stays read-only:**
  - no `child_process` anywhere in `src/` (`no-subprocess`);
  - filesystem writes only in `src/init/` (`writes-only-in-init`);
  - no network (`no-network`);
  - no `process.exit` in `src/`: commands return their exit code (`no-process-exit`).
- **No runtime dependencies:** `src/` imports Node builtins and relative paths only
  (`node-builtins-only`).
- **Functional style** (`no-class`, `no-this`, `no-extends`). Every top-level function
  carries a `/** */` doc comment (`function-doc-comment`).

Content rules have fixtures in `rule-tests/`; record snapshots with `pnpm exec ast-grep test -U`.
Location rules match on paths, which `ast-grep test` can't see, so
`test/integration/layout-rules.test.ts` checks them by scanning a real tree.

## Taste

Guidance, not gated:

- camelCase for functions and values, PascalCase for types.
- Single quotes and semicolons, as the scaffold's files use.
