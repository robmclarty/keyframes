# Report · keyframes context verb

## What shipped

`keyframes context [path…] [--json]`, a new read-only verb that prints the root plan's items that apply to some paths, for a harness building an agent's context (runciter's pack section first). Steps 1 to 3 added the verb to `keyframes.md` (I9, D11, S4, M6), renumbered the three design notes past the plan's new IDs, and specified the verb in `docs/prototype.md`'s `### context`. Steps 4 to 8 built it against that spec: a pure `selectContext` in `src/context/`, text and JSON renderers in `src/report/` with `schema/context.schema.json`, the CLI command, an e2e test that holds S4 (now `linked`), and harness docs in `docs/agents.md` and the README.

## Decisions and why

- **D12 (root-only)**: only the root plan is read, since no plan here has outgrown its budgets and the user plan conflicts with C2.
- **D13 (reads-through-check)**: `context` runs the same `findPlan` and `check` as `check`, so the two verbs can't disagree about an item.
- **D14 (same-item-shape)**: JSON items are the report's items under the same names, in their own schema at `schema_version: 1`. A test pins the shared defs to the report schema's.
- **D15 (no-budget)**: no cap or truncation. The 15% cap belongs to runciter.
- **D16 (spec-first)**: the spec section landed before any code, and runciter builds against it.
- **D17 (step-drops-new)**: each step that created a `(new)` target dropped its marker (steps 4, 5 and 7).
- **D18 (four-sections)**: Principles, Constraints, Scenarios and Taste print in the format's order, so cutting from the bottom drops Taste first and Constraints last.
- **D19 (path-names-parts)**: paths are read with `readPath` and meet Map parts by path-overlap's rule. A bad path exits 2.
- **D20 (print-despite-findings)**: a plan with findings still prints and exits 0, with one stderr line when it has errors.
- **D21 (cwd-root-many-paths)**: the working directory is the root, and the verb takes zero or more root-relative paths.

## Parked & harvested

Nothing was parked during the build.

## Final status

Done. All 8 steps landed and `pnpm check` is green. Steps 4 and 5 each changed files outside their seams: `readPath` was exported early from `src/repo/index.ts`, and the schema validator moved to `test/helpers/json-schema.ts`. No release has been cut yet. Publishing is Rob's call, through `/version`.

## Deferred tangents

None were parked. Three things from the range 3 review are still open for whoever picks this up:

- Whether the stderr errors line should start with `keyframes:` like the CLI's other stderr lines. The spec currently says it doesn't.
- `test/e2e/bin.test.ts` doesn't assert that `schema/context.schema.json` ships.
- Cutting the release runciter will install.

## Checkpoints

- baseline fc35f7e94c06d67d21af55e654665c20614c49ca
- step 1 759670d060393c38b4c7b763ec0461941671bd0f
- step 2 13ffbe5c2e96888084a471fcfd70bb5bc5f3cc86
- step 3 4bbb97b98432ea8145ef03d2a1dd73ef0b1bdcb9
- step 4 511c01d22f67c2adedd407625a39737675106b00
- step 5 c33998d343653a3a003f6897943bc048edf27c63
- step 6 1f8f49cab4c88e8595edfbb6dbe12276439b3681
- step 7 b57d633e082130fb7440f9dc1d004d4d5522623c
- step 8 df09bae529b966a10e3563b88d458b00bd65b639

## Stats

| step | red checks | drift warnings | reverts | wall-clock |
| ---- | ---------- | -------------- | ------- | ---------- |
| 1 | 0 | 0 | 0 | 24m |
| 2 | 0 | 0 | 0 | 1m |
| 3 | 0 | 0 | 0 | 3m |
| 4 | 0 | 1 | 0 | 3m |
| 5 | 0 | 1 | 0 | 3m |
| 6 | 0 | 0 | 0 | 2m |
| 7 | 0 | 0 | 0 | 1m |
| 8 | 0 | 0 | 0 | <1m |
| **total** | 0 | 2 | 0 | 39m |
