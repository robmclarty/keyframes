<!--
build-log.md: your live ledger for execution. Append constantly; reorganize at
step boundaries. The antidote to "my plan got lost in the noise."

  Steps     : where you are. One step in flight at a time. CLI-maintained: `build`,
              `checkpoint`, and `revert` keep this mirror and the Current step line
              in sync with intent.md; you never hand-edit them.
  Park list : where ideas go so you do not chase them. CAPTURE, never act inline.
  Harvest   : the boundary ritual that keeps you on one branch.
  Log       : the build's history. `plumbbob checkpoint` appends a line per step as it
              lands; feeds the /plumbbob:finish report, which rides the branch into the PR.
-->

# Build log: keyframes context verb

**Current step:** none (at the boundary)
**Heavy check:** checkride (set a "check" key in .plumbbob/settings.json to override)

## Steps

*(Mirror of intent.md's Steps, with live status; CLI-maintained, not hand-edited.
`build`/`checkpoint`/`revert` re-render this from intent.md, and set the Current step
line above. Only ONE step is in flight; a step is done only after a checkpoint:
check green + checkpoint taken, via `/plumbbob:verify` or `/plumbbob:build`.)*

- ☑ 1. docs(plan): add the context verb to keyframes.md
- ☑ 2. docs(notes): renumber the three notes past the plan's new IDs
- ☑ 3. docs(spec): specify the context verb
- ☑ 4. feat(context): select the items that apply to paths
- ☑ 5. feat(report): render context as text and JSON with its schema
- ☑ 6. feat(cli): add keyframes context
- ☑ 7. test(e2e): hold the context scenario
- ☑ 8. docs(agents): tell harnesses about keyframes context

## Park list

> Mid-step, every new problem / idea / "ooh what if" lands HERE, untouched, and you
> go straight back to the step. Acting the instant an idea arrives is the disease.
> Capture is one line (`/plumbbob:park` composes it). Harvest happens only at the boundary.

## Harvest  *(run `/plumbbob:harvest` at each step boundary, after green)*

Classify each parked item as exactly ONE. Naming it before acting is what keeps you
from sprawling across branches.

| Class            | Meaning                                   | Action                               |
| ---------------- | ----------------------------------------- | ------------------------------------ |
| **blocker**      | Plan was wrong/incomplete; can't proceed  | `/plumbbob:revert`, fold into intent |
| **tangent**      | A different path, not clearly better      | Defer or kill. Default here.         |
| **pivot signal** | Evidence the whole approach is wrong      | Stop. Replan deliberately.           |

> Reality check: almost everything that *feels* like a pivot is a tangent. Require a
> failed assumption, not a shinier idea, before you pivot.

Harvest results this boundary:

- (none yet)

## Log

*(The build's history, oldest first. `plumbbob checkpoint` appends an entry here
every time a step lands (via `/plumbbob:build` or `/plumbbob:verify`): the dated line,
and beneath it the pause as you approved it, so this fills in as you go, not at the
end, and an older step's detail is a scroll away. Add your own decision/event lines too: this is what
you point at to say "I did that: the LLM helped, but those were my calls."
`/plumbbob:finish` reads this for the report; `plumbbob finish` commits it with the build
folder, so it rides the branch into the PR.)*

- 2026-11-12 — step 1 checkpointed · 759670d06 — docs(plan): add the context verb to keyframes.md (24m)

  **Summary**: `keyframes.md` now has I9 (context-verb), resolved by D11 (context-now), plus S4 (context-for-paths) held by a `(new)` pointer to the e2e test, a new Map part M6 (context), and the context schema added to M4. C1 now names `context` beside `check`. Rob picked each wording in the question dialog. `keyframes check --strict` reports no findings, and `pnpm check` is green.

  1. Rob chose the text, and the agent wrote it in
  2. Three (new) markers wait for later steps

  **Readout**:

  ```text
  check        green: 11 of 11 checks
  done-when    met
  decisions    1 of 1 honored
  constraints  6 of 6 honored
  seam         held: 1 of 1 declared, no strays
  diff         +15 -3 across 1 file
               - keyframes.md +15 -3
  spent        24 min · 2 turns · 9s gate · green first run
  ```

  **Verdict**: ● Plumb

  **Recommendation**: Reply `looks good` to land step 1. All four additions match what you picked, and the plan is clean under `--strict`, so step 2 can renumber the notes past D11, S4, M6 and I9.

  **1.** Rob chose the text, and the agent wrote it in

  The plan's note said this step was Rob's to write. At the pause Rob asked to finish it through questions, and picked the drafted wording for I9 and D11, S4, the Map (a new M6 part, with the schema in M4) and C1. Answering the dialog was Rob accepting the text (P1 people-own-it), so I wrote it into `keyframes.md` as chosen.

  **2.** Three (new) markers wait for later steps

  `src/context/ (new)` on M6, `schema/context.schema.json (new)` on M4, and S4's `(new)` pointer each come off in the step that creates the target: steps 4, 5 and 7, as D17 (step-drops-new) says. Until then they count as planned, and the plan reads 4 scenarios, 2 linked, 1 planned and 1 held by review.

- 2026-11-12 — step 2 checkpointed · 13ffbe5c2 — docs(notes): renumber the three notes past the plan's new IDs (1m)
- 2026-11-12 — step 3 checkpointed · 4bbb97b98 — docs(spec): specify the context verb (3m)
- 2026-11-12 — range 2 of 3's stop recorded — review the spec's `### context` section, the contract runciter builds against, before any code commits to it

  **Summary**: The three notes now number their proposals after the plan's own IDs, and `docs/prototype.md` has a `### context` section that specifies the verb from command line to JSON shape, with the usage block listing it. The spec settles a few details the decisions left open, and those are what this review should look at before step 4 builds to them.

  1. The JSON adds a top-level `parts` list that the decisions didn't name
  2. The text output is markdown, closing on a `## Paths` section
  3. Small calls the spec makes for step 6
  4. The notes renumber to D12 and up

  **Readout**:

  ```text
  steps        2 of 2 landed
               - 2 13ffbe5 · 3 4bbb97b
  check        green: 11 of 11 checks, 2 landings
  done-when    met
  decisions    honored:
               - D16 (spec-first), D18 (four-sections), D19 (path-names-parts)
               - D20 (print-despite-findings), D21 (cwd-root-many-paths)
               - D14 (same-item-shape), D15 (no-budget), D12 (root-only)
  constraints  6 of 6 honored
  seam         held: 2 of 2 steps, no strays
  diff         +177 -23 across 4 files
               - docs/lookouts-contract.md +6 -6
               - docs/prototype.md +156 -1
               - docs/scoped-plans.md +7 -7
               - docs/user-plan-and-runciter.md +8 -9
  spent        4 min · green first run at every landing
  ```

  **Verdict**: ● Plumb

  **Recommendation**: Approve the spec as written, unless you'd rather inline `{ id, slug }` under each path than keep the top-level `parts` list. That list is the one shape choice runciter will feel, and once step 5's schema ships at `schema_version: 1` it can only gain fields, so this stop is the cheapest place to change it.

  **1.** The JSON adds a top-level `parts` list that the decisions didn't name

  D19 says each path lists the Map parts it meets, but not how a part is shown. The spec has each `paths` entry name the part IDs it meets (`{ "path": "src/sync/worker.ts", "parts": ["M2"] }`), and a top-level `parts` list holds each part that some path meets, once, in Map order, as the report's own Map item. That way runciter gets a part's `paths:` (its contract paths) without parsing the Map, and a part met by several paths isn't repeated. The other option was to inline `{ id, slug }` under each path, which is smaller but leaves runciter to look up the part's paths in `check --json`.

  **2.** The text output is markdown, closing on a `## Paths` section

  The text prints one `##` heading per section that has items, each item in its usual form with its sub-lines (`because:`, `held-by:`, a `(new)` kept), and a `## Paths` section with one line per path (`- src/sync/worker.ts: M2 (sync)`, or `none`). It can be pasted into a prompt as it is. It prints no header line or findings summary, so a clean plan prints the items and nothing else, as C6 (plan-items-bind) asks.

  **3.** Small calls the spec makes for step 6

  The stderr line reads `keyframes.md has 2 errors; run keyframes check to see them` (with `1 error` and `it` for one). A path given twice is listed once, where it first appears. An argument starting with `-` is read as a flag. A trailing `/` on a path is kept as given. Every path a part lists counts toward a meeting, `(new)` or not. `context` never exits 1.

  **4.** The notes renumber to D12 and up

  scoped-plans takes D12-D15 and S5 (Q4 and Q5 unchanged, since the plan stops at Q3), lookouts-contract takes D16, D17 and Q6, and the user-plan note takes D18 and Q7. Its I9 proposal is now a short pointer to the plan's I9 (context-verb), resolved by D11 (context-now). scoped-plans' "IDs continue from the plan as it stands" date moved to 2026-11-11.

- 2026-11-12 — step 4 checkpointed · 511c01d22 — feat(context): select the items that apply to paths (1 drift, 3m)
- 2026-11-12 — step 5 checkpointed · c33998d34 — feat(report): render context as text and JSON with its schema (1 drift, 3m)
- 2026-11-12 — step 6 checkpointed · 1f8f49cab — feat(cli): add keyframes context (2m)
- 2026-11-12 — step 7 checkpointed · b57d633e0 — test(e2e): hold the context scenario (1m)
- 2026-11-12 — step 8 checkpointed · df09bae52 — docs(agents): tell harnesses about keyframes context (<1m)
- 2026-11-12 — range 3 of 3's stop recorded — review the verb end to end, and decide whether to cut a release for runciter to install, which is yours to publish

  **Summary**: `keyframes context [path…] [--json]` works end to end. A pure `selectContext` over the report picks Principles, Constraints, Scenarios and Taste in the format's order, plus each path's Map parts. Two renderers print it as markdown or as JSON against a new `schema/context.schema.json`. The CLI wires it up with the exit codes the spec gives. An e2e test holds S4, which now reads `linked`, and `docs/agents.md` and the README tell harnesses about it. All three `(new)` markers are gone from `keyframes.md`, and `pnpm check` is green across all 11 slots.

  1. Steps 4 and 5 each changed a few files outside their seams, and both landed a hair off.
  2. The errors line on stderr has no `keyframes:` prefix, which is what the spec says, but other stderr lines have one.
  3. A bad path is caught when the command line is parsed, before the plan is read.
  4. The text output follows the spec's example, and the golden files pin it on the clean and findings trees.
  5. Two smaller notes for the release.

  **Readout**:

  ```text
  steps        5 of 5 landed
               - 4 511c01d · 5 c33998d · 6 1f8f49c · 7 b57d633 · 8 df09bae
  check        green: 11 of 11 checks, 5 landings
  done-when    met
  decisions    honored:
               - D13 (reads-through-check), D14 (same-item-shape)
               - D15 (no-budget), D17 (step-drops-new), D18 (four-sections)
               - D19 (path-names-parts), D20 (print-despite-findings)
               - D21 (cwd-root-many-paths)
  constraints  6 of 6 honored
  seam         strayed: 4 paths outside 2 steps' seams
               - step 4: src/repo/index.ts
               - step 5: test/helpers/json-schema.ts and 2 others
  diff         +1659 -124 across 25 files
               - README.md +4 -0
               - docs/agents.md +9 -0
               - keyframes.md +3 -3
               - schema/context.schema.json +192 -0
               - src/__tests__/cli.test.ts +112 -0
               - src/cli.ts +61 -13
               - src/context/__tests__/context.test.ts +187 -0
               - and 18 more
  spent        11 min · green first run at every landing · 2 drift warnings
  ```

  **Verdict**: ◐ A hair off (seam strayed)

  **Recommendation**: Review the verb from a real repo, then cut a minor release with `/version` for runciter to install, and publish it yourself. It's a new command, it doesn't change `check`, and both outputs, the schema and the scenario are pinned by tests. Before you tag it, decide whether the errors line gets the `keyframes:` prefix (section 2): once runciter reads stderr, that line is part of the contract.

  **1.** Steps 4 and 5 each changed a few files outside their seams, and both landed a hair off.

  Step 4 exported `readPath` from `src/repo/index.ts` one step early. The `no-deep-sibling-import` rule keeps `src/context/` from reaching into `src/repo/paths.ts`, and step 6's seam already named that export. Step 5 moved the JSON Schema validator out of `test/integration/report-schema.test.ts` into `test/helpers/json-schema.ts`, so the report and context schema tests share it instead of carrying two copies. It also added the golden context cases to `test/integration/golden.test.ts`, because the fixtures folder holds data, not tests. No behaviour outside the verb changed.

  **2.** The errors line on stderr has no `keyframes:` prefix, which is what the spec says, but other stderr lines have one.

  The spec quotes the line as `keyframes.md has 2 errors; run keyframes check to see them`, and the CLI prints exactly that. Every other stderr line (usage, read problems, unexpected errors) starts with `keyframes:`. A harness that merges the two streams would see one line without the prefix. If you want the prefix, change the spec first, since runciter builds against it.

  **3.** A bad path is caught when the command line is parsed, before the plan is read.

  An absolute path, a `..` segment, a backslash or an empty path exits 2 with the usage block, even in a directory with no plan. `selectContext` reads the paths with `readPath` too, so the function also works on its own, and the CLI's fallback for a path problem coming back from it can't be reached in practice.

  **4.** The text output follows the spec's example, and the golden files pin it on the clean and findings trees.

  Items print in their usual form. An item's or a sub-line's later lines are indented, a planned pointer keeps `(new)`, and `## Paths` names each part as `M1 (api)`, or `none`. A plan with no such items and no paths prints an empty string, with no newline either. The JSON keeps the report's own `itemJson`, and a test checks that the context schema's `item`, `result`, `line` and `count` defs match the report schema's exactly.

  **5.** Two smaller notes for the release.

  `test/e2e/bin.test.ts` still only asserts that `schema/report.schema.json` ships. The package's `files` lists `schema/`, so the new schema ships too, but nothing pins it. Separately, one manual check ran `npx tsx` to read S4's status, and that fetched `tsx` into the npm cache. It's not a project dependency, and nothing in the tree changed.
