# keyframes context verb

**Phase** (your own bookkeeping while framing): plan
**Size:** small
**Scope:** context

*Source: the planning brief of 2026-11-11, with [`docs/user-plan-and-runciter.md`](../../../docs/user-plan-and-runciter.md) (its I9 and its `context [path]`), runciter's `docs/specs/long-horizon-builder-roadmap.md` ("Build after the bootstrap", item 1) and `docs/specs/runciter-memory-tiers-and-night-shift.md` (leans 4 and 5). The living reference for the format and the tool stays [`docs/prototype.md`](../../../docs/prototype.md).*

**IDs in this file.** Items anchored here are this build's own, numbered after the last ID of their letter in [`keyframes.md`](../../../keyframes.md) (D11 is left for step 1), so no ID in this file means two things. The plan's items keep their plan IDs and are cited as `[C1 (read-only-check)]`, linked to `keyframes.md`; step notes and commits cite them the same way.

## Frame

- **Problem:** A harness that builds an agent's context has no way to ask keyframes which items apply to the files a task touches. runciter's `keyframes` pack section is the first such reader, and it's next on runciter's roadmap. Without a verb, every reader parses `check --json` and picks sections itself, so the selection is written once per reader, and the chain scoped plans will need later gets written once per reader too.
- **Smallest thing that solves it:** `keyframes context [path…]` reads the root `keyframes.md` the way `check` finds it, and prints the items that apply to the paths, as text or, with `--json`, against a versioned `schema/context.schema.json` beside `schema/report.schema.json`.
- **Done looks like:** from a repo with a plan, `keyframes context <paths> --json` prints the sections [Q4 (which-sections)](#q4) settles, in a shape the schema describes and a test validates; the spec documents the verb; a Scenario for it is held by an e2e test; the same plan and tree give byte-identical output from any working directory [C2 (byte-identical)](../../../keyframes.md); and `pnpm check` is green.
- **Explicitly NOT doing:** the user-level plan (its conflict with [P3 (same-answer-everywhere)](../../../keyframes.md) and [C2 (byte-identical)](../../../keyframes.md) is open); scoped plans, which wait for a plan that outgrows its budgets [D8 (grow-by-scope)](../../../keyframes.md); the `watch:` key; any budget, cap or truncation, since the 15% cap is runciter's; runciter's side of the call; and publishing a release.

## Architecture sketch

```text
keyframes context [path…] [--json]          src/cli.ts (M5)
        │
        ├── findPlan(repo), check(plan, repo)   unchanged: the same read check makes (D13)
        │
        ▼
  selectContext(report, paths)               src/context/ (new; where step 1's Map puts it)
  the sections Q4 names, the parts Q5 names
        │
        ▼
  renderContextText / renderContextJson      src/report/ (M4), schema/context.schema.json
```

## Decisions

- <a id="d12"></a>**D12 (root-only)**: `context` reads the root plan alone, found exactly as `check` finds it, *because* no plan here has outgrown its budgets, and the user plan waits on its conflict with [C2 (byte-identical)](../../../keyframes.md).
- <a id="d13"></a>**D13 (reads-through-check)**: `context` runs the same `findPlan` and `check(plan, repo)` the `check` command runs and selects from the report's items, *because* one parser and one item shape mean the two verbs can't disagree about what an item says, and the findings count comes free.
- <a id="d14"></a>**D14 (same-item-shape)**: The JSON's items carry the report's item fields under the same names (`id`, `slug`, `section`, `line`, `text` and the sub-lines), in their own schema with its own `schema_version: 1`, where fields are only ever added, *because* a harness that reads both outputs shouldn't learn two shapes, and the two verbs should version apart.
- <a id="d15"></a>**D15 (no-budget)**: `context` prints every item that applies, with no cap, truncation or word budget, *because* the 15% cap and its cut order are runciter's, and keyframes can't know the size of anyone's pack.
- <a id="d16"></a>**D16 (spec-first)**: [`docs/prototype.md`](../../../docs/prototype.md) gains a `### context` section before any code, and the code steps are measured against it, *because* the spec is the living reference, and runciter will build against what it says.
- <a id="d17"></a>**D17 (step-drops-new)**: Each step that creates a `(new)` target step 1 writes into `keyframes.md` drops that marker in the same step (as proposed: step 4 for `src/context/`, step 5 for `schema/context.schema.json`, step 7 for S4's test), and approving this plan is the ask `AGENTS.md` needs for exactly those edits to `keyframes.md`, *because* a target that resolves while marked `(new)` warns `built-not-new`, and a warning fails `--strict`, which `pnpm check` runs ([Q8 (new-markers)](#q8)).
- <a id="d18"></a>**D18 (four-sections)**: `context` prints Principles, Constraints, Scenarios and Taste, in the format's order whatever order the plan writes them, each section's items in line order, and never the Intent prose, the Map's items, Decisions, Questions or Ideas, *because* a reader that cuts from the bottom then drops Taste, then Scenarios, before it reaches Constraints, as runciter's lean 4 cuts, and a plan's own layout can't undo that ([Q4 (which-sections)](#q4), [Q9 (format-order)](#q9)).
- <a id="d19"></a>**D19 (path-names-parts)**: Every root item prints whatever the path. Each path is read the way Map paths are (`readPath`): `./` and doubled `/` fold to the usual form, which the output shows, and a backslash or an empty path is a usage problem that exits 2, as an escaping one is [D21 (cwd-root-many-paths)](#d21). Each path lists every Map part it meets by path-overlap's rule (a part path equal to it, or one inside the other, compared without the trailing `/`), none when it meets no part, *because* a root item holds everywhere [D8 (grow-by-scope)](../../../keyframes.md), the parts are the contract paths runciter wants ([Q5 (path-parts)](#q5)), and a seam that names a directory reaches every part inside it ([Q10 (path-meets-part)](#q10)).
- <a id="d20"></a>**D20 (print-despite-findings)**: A plan with findings still prints and exits 0; when it has errors, one stderr line says how many and to run `keyframes check`, warnings and notes say nothing, the JSON carries `errors` and `warnings`, and only a plan that can't be found or read exits 2, *because* a non-zero exit would leave the reader's agent with no intent at all [P6 (constrain-not-block)](../../../keyframes.md) ([Q6 (findings-exit)](#q6)).
- <a id="d21"></a>**D21 (cwd-root-many-paths)**: The root is the working directory, and `context` takes zero or more root-relative paths; one that escapes the root (absolute, or through `..`) is a usage problem that exits 2, one need not exist, and with none it prints the items and no parts, *because* runciter passes a step's several seam paths at once, and a seam can name a file a step will create ([Q7 (path-form)](#q7)).

## Constraints

- <a id="c1"></a>**C1 (read-only-check)**: The plan's [C1 (read-only-check)](../../../keyframes.md), carried to the new verb: `context` writes nothing, starts no process and opens no network connection; `writes-only-in-init`, `no-subprocess` and `no-network` already cover all of `src/`. The plan's statement names only `check` (step 1's call).
- <a id="c2"></a>**C2 (byte-identical)**: The plan's [C2 (byte-identical)](../../../keyframes.md): the same plan, tree and arguments give byte-identical `context` output, text and JSON, from any working directory.
- <a id="c3"></a>**C3 (no-runtime-deps)**: The plan's [C3 (no-runtime-deps)](../../../keyframes.md): `src/` imports Node builtins and relative paths only (`node-builtins-only`).
- <a id="c6"></a>**C6 (plan-items-bind)**: [D4 (no-config)](../../../keyframes.md), [P4 (narrow-words)](../../../keyframes.md) and [T2 (quiet-when-fine)](../../../keyframes.md) bind the verb: no config file or environment variable; its words never claim an item is enforced or followed, only that it's in the plan and applies; and a clean run prints the items and nothing else.
- <a id="c7"></a>**C7 (repo-layout)**: The layout and style rules in `rules/` hold, as `AGENTS.md` lists them: unit tests in `__tests__/` beside their code, barrels that only re-export, no classes or `this`, and a `/** */` comment on every top-level function.
- <a id="c8"></a>**C8 (green-is-done)**: `pnpm check` green is done, and a finding is fixed, never baselined.

## Steps

1. [x] docs(plan): add the context verb to keyframes.md, **done when:** Rob has added I9 (context-verb), carrying `resolved-by: D11` as I5 carries `resolved-by: D8` ([Q12 (i9-resolved)](#q12)); a Decision at the next free ID (D11) for building it now, whose because names runciter's pack section as the use [D10 (close-without-pilots)](../../../keyframes.md) waits for; a Scenario at the next free ID (S4) for the verb, held by `file:test/e2e/context.test.ts#"context for paths"` marked `(new)` ([Q11 (anchor-text)](#q11)); and whatever Map change the verb needs; and `pnpm check` is green
   - seam: `keyframes.md`
   - note: Rob's step; the agent checks it and edits nothing. Proposals for Rob, not settled: a part M6 (context) with `paths: src/context/ (new)`, and `schema/context.schema.json (new)` added to M4's paths; and whether [C1 (read-only-check)](../../../keyframes.md) should name `context` beside `check`
2. [x] docs(notes): renumber the three notes past the plan's new IDs, **done when:** every ID proposed in `docs/scoped-plans.md`, `docs/lookouts-contract.md` and `docs/user-plan-and-runciter.md` follows the last ID of its letter in `keyframes.md`, with no repeats across the three; their cross-references and "these numbers continue after" lines match; the user-plan note's I9 proposal becomes a pointer to the plan's I9; and `pnpm check --only docs,links,spell` is green
   - seam: `docs/scoped-plans.md`, `docs/lookouts-contract.md`, `docs/user-plan-and-runciter.md`
   - model: sonnet (mechanical renumbering)
3. [x] docs(spec): specify the context verb, **done when:** `docs/prototype.md` has a `### context` section stating the command line, how the root and paths are read ([Q7 (path-form)](#q7), [Q10 (path-meets-part)](#q10)), which sections print and in what order ([Q4 (which-sections)](#q4), [Q9 (format-order)](#q9)), what a path adds ([Q5 (path-parts)](#q5), [Q10 (path-meets-part)](#q10)), what findings do to the output and exit code ([Q6 (findings-exit)](#q6)), the text output, and the JSON shape with an example; `## The tool`'s usage block lists `context`; and `pnpm check --only docs,links,spell` is green
   - seam: `docs/prototype.md`
   - model: opus (the contract runciter builds against)
4. [x] feat(context): select the items that apply to paths, **done when:** `src/context/__tests__/context.test.ts` shows, against in-memory repos, the sections and order step 3's spec names, with Decisions, Questions, Ideas and the Map's items never printed, the parts each path meets as the spec says (a file part, a path equal to or inside a directory part, a directory holding parts, a path that meets none), each path in its usual form, and a plan with errors still yielding its items; the function is pure over a `Report`; and `keyframes.md` drops the `(new)` on `src/context/` if step 1 wrote one [D17 (step-drops-new)](#d17)
   - seam: `src/context/`, `keyframes.md`
   - model: opus (the selection is the contract)
5. [x] feat(report): render context as text and JSON with its schema, **done when:** golden tests in `test/fixtures/golden/` pin both outputs; `schema/context.schema.json` declares `schema_version: 1` and the item fields of [D14 (same-item-shape)](#d14); a test in `test/integration/context-schema.test.ts` validates the JSON against it the way `report-schema.test.ts` does; the text says nothing past the items when the plan is clean [T2 (quiet-when-fine)](../../../keyframes.md); and `keyframes.md` drops the `(new)` on `schema/context.schema.json` [D17 (step-drops-new)](#d17)
   - seam: `src/report/`, `schema/context.schema.json`, `test/integration/context-schema.test.ts`, `test/fixtures/golden/`, `keyframes.md`
   - model: opus (golden outputs and a public schema)
6. [x] feat(cli): add keyframes context, **done when:** `keyframes context` runs from the CLI with `--json`, its help and usage lines, and the exit codes and stderr line step 3's spec names; a path that escapes the root, has a backslash or is empty is a usage problem that exits 2 [D19 (path-names-parts)](#d19); `src/__tests__/cli.test.ts` titles each case with its whole command line; and a test titled "context byte-identical" in `test/integration/determinism.test.ts` runs it from two working directories and compares the bytes [C2 (byte-identical)](../../../keyframes.md)
   - seam: `src/cli.ts`, `src/__tests__/cli.test.ts`, `test/integration/determinism.test.ts`, `src/repo/index.ts` (to export `readPath`)
   - model: sonnet (wiring, specified by step 3's spec)
7. [x] test(e2e): hold the context scenario, **done when:** `test/e2e/context.test.ts` has a test titled "context for paths" that runs the bin's `init` in an empty directory, writes a few items and a Map part, runs `context <path> --json`, and gets the items and parts the spec says; S4 in `keyframes.md` loses only its `(new)` marker [D17 (step-drops-new)](#d17); and `keyframes check --strict` reads S4 as `linked`
   - seam: `test/e2e/context.test.ts`, `keyframes.md`
   - model: sonnet (the scenario spells the test out)
8. [ ] docs(agents): tell harnesses about keyframes context, **done when:** `docs/agents.md`, where it names `check --json` for harnesses, names `context --json` as the call for a context pack, and `README.md` lists the verb beside `init` and `check`, with `pnpm check` green in full
   - seam: `docs/agents.md`, `README.md`, `test/integration/docs.test.ts`
   - model: sonnet (doc edits)

## Build order

## Build ranges

Drive the build with `/plumbbob:run`, one range at a time; each stops where a call is yours.

1. `/plumbbob:build 1`, **stop:** Rob writes I9, D11, S4 and the Map change into `keyframes.md`
   - model: sonnet
2. `/plumbbob:build 2-3`, **stop:** review the spec's `### context` section, the contract runciter builds against, before any code commits to it
   - model: opus
3. `/plumbbob:build 4-8`, **stop:** review the verb end to end, and decide whether to cut a release for runciter to install, which is yours to publish
   - model: opus

## Open questions

- <a id="q4"></a>**Q4 (which-sections)**: Which sections does `context` print, and in what order?, *resolved:* 2026-11-11, the lean: Principles, Constraints, Scenarios and Taste, in plan order ([D18 (four-sections)](#d18))
  - *plain:* The order is a contract, since runciter cuts its pack section from the bottom. The I9 note says Principles and Constraints; runciter's lean 4 cuts "Taste first, then Scenarios, never Constraints", which implies both are in the section too.
  - *lean:* Principles, Constraints, Scenarios and Taste, in the plan's own section order. Cutting from the bottom then drops Taste, then Scenarios, and reaches Constraints last; the Intent prose, the Map, Decisions, Questions and Ideas never print (runciter's own lean leaves Decisions out).
- <a id="q5"></a>**Q5 (path-parts)**: What does a path do while only the root plan exists?, *resolved:* 2026-11-11, the lean: every root item prints, and each path lists the Map parts that contain it ([D19 (path-names-parts)](#d19))
  - *plain:* It decides whether runciter gets contract paths from this verb or parses the Map itself. Every root item holds everywhere [D8 (grow-by-scope)](../../../keyframes.md), so a path changes no item until scoped plans exist; what it can add now is the Map parts it falls under, which runciter wants as contract paths.
  - *lean:* Print every root item whatever the path, and list, for each path, the Map parts whose `paths:` contain it: a file part equal to it, or a directory part it sits under. A path under no part lists none.
- <a id="q6"></a>**Q6 (findings-exit)**: When the plan has findings, does `context` still print and exit 0?, *resolved:* 2026-11-11, the lean: yes, with one stderr line when the plan has errors ([D20 (print-despite-findings)](#d20))
  - *plain:* A non-zero exit leaves the reader's agent with no intent at all, while a silent print hands it items that may be wrong. runciter runs `check --strict` in its verify anyway.
  - *lean:* Print anyway and exit 0 [P6 (constrain-not-block)](../../../keyframes.md). When the plan has errors, one stderr line says how many and to run `keyframes check`; warnings and notes say nothing [T2 (quiet-when-fine)](../../../keyframes.md); the JSON carries `errors` and `warnings` counts; exit 2 only when no plan can be found or read, as `check` does.
- <a id="q7"></a>**Q7 (path-form)**: How does `context` find the root, and how many paths does it take?, *resolved:* 2026-11-11, the lean: the working directory is the root, and it takes zero or more root-relative paths ([D21 (cwd-root-many-paths)](#d21))
  - *plain:* A wrong call here is a breaking change for runciter later. `check`'s positional is the root directory, while `context`'s is a path inside it, and runciter passes a step's several seam paths at once.
  - *lean:* The root is the working directory, as for `check` with no `dir`, and `context` takes zero or more root-relative paths. A path that escapes the root (absolute, or through `..`) is a usage problem that exits 2; a path need not exist, since a seam can name a file a step will create; with no path it prints the items and no parts.
- <a id="q8"></a>**Q8 (new-markers)**: Who drops the `(new)` markers step 1 writes on Map paths?, *resolved:* 2026-11-11, the lean: the step that creates a `(new)` target drops its marker, an edit approved with the plan ([D17 (step-drops-new)](#d17))
  - *plain:* A plan that can't drop its markers can't go green, since `pnpm check` runs `check --strict` and a `(new)` path that resolves warns `built-not-new`. Step 4 creates `src/context/` and step 5 creates `schema/context.schema.json`, but D17 as first written covered only S4's marker, so neither step could land without an edit to `keyframes.md` nobody had asked for.
  - *lean:* Widen D17 to every marker step 1 writes: the step that creates a `(new)` target drops its marker in the same step (step 4 for `src/context/`, step 5 for the schema, step 7 for S4), approving the plan is the ask for exactly those edits, and `keyframes.md` joins the seams of steps 4 and 5.
- <a id="q9"></a>**Q9 (format-order)**: Do the four sections print in the plan's order or the format's?, *resolved:* 2026-11-11, the lean: in the format's order, whatever order the plan writes them ([D18 (four-sections)](#d18))
  - *plain:* As written, D18 lets a plan's own layout undo the cut order it promises. The format lets sections come in any order, so a plan that writes Taste above Constraints prints Taste first under [D18 (four-sections)](#d18), and a reader that cuts from the bottom then drops Constraints before Taste.
  - *lean:* Print Principles, Constraints, Scenarios and Taste in that fixed order, the format's order (the one `check`'s report already lists sections in), whatever order the plan writes them; items within a section keep line order. D18's "in the plan's section order" becomes "in the format's order".
- <a id="q10"></a>**Q10 (path-meets-part)**: How does a path given to `context` meet a Map part?, *resolved:* 2026-11-11, the lean: read by `readPath`, and matched by path-overlap's rule ([D19 (path-names-parts)](#d19))
  - *plain:* As written, D19 misses the most common seam, a path equal to a directory part. [D19 (path-names-parts)](#d19) names a file part equal to the path, or a directory part it sits under, so `src/report/` matching M4's `src/report/` isn't covered, and neither is `src/`, which holds parts runciter would treat as a barrier. It doesn't say how `./`, a backslash or a missing trailing `/` read either.
  - *lean:* Read each path with `readPath`, the reader Map paths already use: an absolute path, `..`, a backslash or an empty path exits 2, and `./` and doubled `/` fold to the usual form, which the output shows. Then list every part the path meets by path-overlap's own rule: the same path, or one inside the other, compared without the trailing `/`.
- <a id="q11"></a>**Q11 (anchor-text)**: Should S4's pointer quote more than the word "context"?, *resolved:* 2026-11-11, the lean: the test is titled "context for paths", and S4 quotes that title
  - *plain:* As written, S4 reads `linked` even with its test deleted. A `#"text"` pointer holds wherever the text appears in the file, and `test/e2e/context.test.ts` has to contain "context" just to run the verb, so `#"context"` can't break while the file exists, which is the drift [P4 (narrow-words)](../../../keyframes.md) exists to catch.
  - *lean:* Title step 7's test "context for paths" and point S4 at `file:test/e2e/context.test.ts#"context for paths"`, a phrase only the title holds; the done-when of steps 1 and 7 change to match.
- <a id="q12"></a>**Q12 (i9-resolved)**: Does I9 carry `resolved-by: D11` once D11 decides to build it?, *resolved:* 2026-11-11, the lean: yes, as I5 carries `resolved-by: D8`, and I2 stays open
  - *plain:* Left open, I9 tells every agent "not agreed yet, don't build it" while D11 says build it. An open I9 also counts against the open-ideas budget. The plan already has a pattern for this: I5 (scoped-plans) carries `resolved-by: D8`.
  - *lean:* I9 carries `resolved-by: D11`, as I5 carries `resolved-by: D8`. I2 (scoped-slice) stays open, since a path changes no item until scoped plans exist, and D11 may cite it as where `context` grows.

## Verdicts
