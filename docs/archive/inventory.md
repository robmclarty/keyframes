# Inventory: what the tools actually do

> **Archived 2026-10-04.** Historical reference, not current intent. The current plan is
> [`docs/prototype.md`](../prototype.md); see [this folder's README](README.md) for why.

Phase 1 of the keyframe-development review. It checks the claims in
`~/projects/_writing/_ai/ai_index_rocket_fuel/keyframe-development.md` (the draft)
against source code, not READMEs. Written 2026-10-02.

**Legend.** ✔ confirmed · ✎ corrected (partly true; the correction follows) · ✘ wrong.

**Citations.** `repo:path:line`, where `repo:` is the root of that repo:

| Prefix | Root |
| --- | --- |
| `plumbbob:` | `~/projects/plumbbob/code/plumbbob/` |
| `ridgeline:` | `~/projects/ridgeline/code/ridgeline/` |
| `checkride:` | `~/projects/checkride/code/checkride/` |
| `fascicle:` | `~/projects/fascicle/code/fascicle/` |
| `volley:` | `~/projects/volley/code/volley/` |
| `atis:` | `~/projects/atis/code/atis/` |
| `night-shift:` | `~/projects/night-shift/code/night-shift/` |
| `runciter:` | `~/projects/runciter/code/runciter/` |
| `weft:` | `~/projects/fascicle/code/weft/` |

Repo versions read: plumbbob 0.12.1, ridgeline 0.12.14, checkride 0.13.0, fascicle 0.12.13,
volley 0.6.0, atis at `0d42c0c`, night-shift at `594fd5f`, runciter 0.0.3.

---

## 0. Headline

The draft says "the pieces are mostly built; what's missing is the binding". The
code says something narrower and more awkward:

1. **Five graph models already exist, and none of them is concepts + synchronizations.**

   | Graph | Kind | Source |
   | --- | --- | --- |
   | fascicle `FlowNode` composition tree | extracted | `fascicle:src/core/types.ts:118-125` |
   | atis module/cell graph (TypeScript import scan) | extracted | `atis:apps/atis/src/sources/imports.ts:1-27` |
   | fallow boundary zones and allow-rules: a declared module DAG, *already enforced* in the `dead` slot | declared | `fascicle:fallow.toml:122-231` |
   | runciter's task state machine as a data table | declared | `runciter:src/intents/transitions.ts:11-21` |
   | ridgeline's phase DAG (orders work, not system shape) | declared | `ridgeline:src/engine/phase-graph.ts:19-99` |

   Two of these, fallow zones and runciter `TRANSITIONS`, are human-declared *intended* graphs
   that code is already held to. A keyframe format would be a sixth graph unless it builds on them.
2. **Every existing "diagram held to code" test compares code against a picture *of the code*.**
   Neither side is authored intent:
   - volley's test (`volley:test/unit/flow_diagram.test.ts:28,32`);
   - fascicle's blueprint rule 3 (`fascicle:docs/blueprint.md:123-144`).

   These are documentation-drift tests, not intended⟷extracted gauges. The draft treats them as
   the seed of the core conformance gauge. They are the seed of the *extractor* half only.
3. **Prose and code have drifted apart in most of these repos.** This is the generation-loss
   thesis happening to the tools themselves, and it is the strongest evidence that the problem is
   real. Each case below is a prose claim that no gauge holds to the code.
   - **ridgeline:** the docs call the check command "a hard gate enforced by the harness", and the
     harness never runs it (§1).
   - **runciter:** the state machine exists in four unlinked code copies plus hand-drawn Mermaid,
     and three spec↔code drifts are already catalogued (§2).
   - **checkride:** the README's mutation floor (55) disagrees with the config (break 68), and
     `tools.md` pins fallow 3.9.1 where the code pins 3.22.0.
   - **night-shift:** `docs/embedding.md:86,96` documents `--contained` and `volley --json`, where
     the code uses an env var and reads `summary.json`.
   - **atis:** the SPEC says fallow has no graph dump, but fallow 3.22 has `viz` (§1).

   None of these is caught by any gate. The drift that *is* caught is exactly the drift something
   mechanical holds: fascicle/volley diagram headers, and plumbbob D-id citations through the
   `refs` slot.

---

## 1. The draft's §2 table, row by row

### plumbbob

| Claim | Verdict | Evidence |
| --- | --- | --- |
| `intent.md` has Frame, Decisions and Constraints with anchored, slugged IDs, and Steps with done-when and seam | ✎ | All present (`plumbbob:templates/intent.md:21,38,49,57,76-80`). The template also has Architecture sketch, Build order, Open questions and Verdicts sections, plus Phase/Size/Scope headers. Steps also carry an optional `model:` line (D62). |
| The readout reports check / done-when / decisions honored / constraints honored / seam held / diff | ✎ | **The rows are `check, done-when, decisions, constraints, seam, diff, spent`**: `RECAP_ROW_NAMES` (`plumbbob:src/lib/orient.ts:635`) plus `diff`/`spent` (`orient.ts:1043-1066`). "Honored" and "held" are verdict words, not labels. **D82 caps the fence at seven rows, in that order** (`plumbbob:docs/decisions.md:686-688`). A worst-of Verdict ladder is computed from the rows (`orient.ts:773`). |
| The approval latch exists | ✔ | `evaluateLatch`, a five-row predicate (`plumbbob:src/lib/latch.ts:88-101`), enforced in `checkpoint` (`plumbbob:src/verbs/checkpoint.ts:89,182`) and `abandon` (`plumbbob:src/verbs/abandon.ts:65`). It reads only `TURN/TICK/GRANT/isTTY` (D64). |
| park / harvest | ✔ | `park` is a CLI verb (`plumbbob:src/verbs/park.ts`). `harvest` exists only as a skill (`plumbbob:skills/harvest/SKILL.md:27-35`) (D7). |
| Spikes for forks | ✔ | Worktree per option (`plumbbob:src/verbs/spike.ts:1-9`), with a durable `spike-NN-<slug>.md` report (D70). |
| "Compress what's settled; expand what's pending" | ✔ | `plumbbob:templates/intent.md:9`. Also in `docs/techniques.md:69`. |
| The Architecture sketch is freeform ASCII or a photo, neither structured nor checkable | ✔, with a finding | `plumbbob:templates/intent.md:32-35` says "Hand-drawn is best". No code parses it; only `refine`'s attack mode reads it (`plumbbob:skills/refine/SKILL.md:28`). **Finding:** all 38 real builds across six repos fill this section (3–48 lines). The sketches are deployment topologies (`night-shift:.plumbbob/builds/2026-09-27-…/intent.md`), decision predicates (`plumbbob:.plumbbob/builds/2026-07-09-the-approval-latch/intent.md`), data-flow pipelines (`fascicle:.plumbbob/builds/2026-08-25-viewer-run-canvas/intent.md`) and config→adapter chains (`checkride:.plumbbob/builds/2026-08-04-prose-slot-…/intent.md`). **None is a concept/sync event graph.** |
| "Decisions honored" is the model's self-review, not evidence | ✔ | D16 (check plus self-review). The model writes the three judgment rows (`plumbbob:src/verbs/handoff.ts:17-22`). The CLI only counts `## Constraints` bullets for the denominator (`orient.ts:440`). No code checks whether a decision was honored. `scrapeBullets` returns D/C bullets verbatim, for agent context only (`plumbbob:src/lib/intent.ts:270`; D61 "not a gate"). |
| Build intents ride the PR and archive, but don't fold into a standing design | ✔, with a nuance | `/plumbbob:finish` writes `report.md`, commits and clears control state. "Nothing is copied out… Updating real docs is a separate, explicit ask" (`plumbbob:skills/finish/SKILL.md:77-80`; D29). **Nuance:** plumbbob's own repo folds by hand. Build-local decisions are renumbered and "Promoted from the … build" into `docs/decisions.md` (`plumbbob:docs/decisions.md:14-21`; D68, D71–D86). The fold is a habit, not a feature. |

### ridgeline

| Claim | Verdict | Evidence |
| --- | --- | --- |
| `spec.md` / `constraints.md` (hard; reviewer checks; violations fail the phase) / `taste.md` (soft; deviations go in the handoff; reviewer ignores) | ✎ | The split is as stated (`ridgeline:docs/constraints-and-taste.md:29-33`; `ridgeline:src/agents/core/reviewer.md:75`; `ridgeline:src/agents/core/builder.md:110`). Constraints are required and taste is optional (`ridgeline:src/config.ts:48-68`). Two corrections: (1) every Claude agent, the reviewer included, gets a cached "stable block" of constraints, taste and spec (`ridgeline:src/engine/legacy-shared.ts:144-152`), so the reviewer *sees* taste and ignores it by instruction; (2) the reviewer *does* read taste for visual-score thresholds (`reviewer.md:128`). |
| Phases with acceptance criteria | ✔ | `ridgeline:src/agents/core/planner.md:54-59`; verdict `criteriaResults[]` (`reviewer.md:89-91`). Criteria are numbered prose within a phase, with **no stable IDs across replans**. |
| Adversarial plan reviewer | ✔ | `ridgeline:src/agents/core/plan-reviewer.md:6`. It gets **one revision only** (`ridgeline:src/commands/plan.ts:49`). |
| Retrospective → `learnings.md` → `retro-refine` of the input doc | ✎ | The retrospective appends to `.ridgeline/learnings.md` after a fully passing build (`ridgeline:src/commands/retrospective.ts:143-144`; `ridgeline:src/commands/build.ts:475-488`), and the builder reads it back in (`ridgeline:src/engine/builder.ts:46-52`). **retro-refine does not edit the input.** It writes a new `<buildDir>/refined-input.md` (`ridgeline:src/commands/retro-refine.ts:191-192`). |
| Read-only UI dashboard | ✔ | Non-GET requests get 405 (`ridgeline:src/ui/dashboard/server.ts:121-122`). It shows a flat phase list plus budget, with no graph view (`ridgeline:src/ui/dashboard/snapshot.ts:5-27`). |
| GAP: the spec is prose; constraints are enforced by an LLM reviewer, not linked to mechanical checks | ✔, and **worse than stated** | `constraints.md` may carry a `## Check Command` block (parsed at `ridgeline:src/stores/inputs.ts:20-28`), but **the harness never runs it**. It only reaches the builder's prompt as "Run this command after making changes" (`ridgeline:src/engine/builder.ts:61-65`). The only processes spawned in `src/` are git, claude, greywall and `which`. `checkTimeoutSeconds` is set (`ridgeline:src/config.ts:97`) and read nowhere, and `ridgeline check` is a stub (`ridgeline:src/commands/check.ts:5`). Pass/fail is always the LLM reviewer's JSON verdict. **The docs contradict the code:** "a hard gate enforced by the harness" (`ridgeline:docs/constraints-and-taste.md:94-95`). Deterministic sensors (playwright, axe, contrast) are non-fatal and advisory (`ridgeline:docs/preflight-and-sensors.md:88-91`). The gap is acknowledged in `~/projects/ridgeline/docs/architecture-constraint-system-scope.md:3,11-16` ("Early exploration… nothing validates them"); its proposed `architecture.yaml` was never built. |
| GAP: there is no graph to project progress onto | ✎ | There *is* a phase DAG: `depends_on` frontmatter (`ridgeline:src/stores/phases.ts:26-39`) → `phase-graph.ts:19-99` (cycle check, ready sets) → parallel worktree waves (`ridgeline:src/engine/flows/build.flow.ts:156,202-206`). What's missing is a graph of the system's *intended shape*. The existing graph orders work. |

ridgeline-mk2 (`~/projects/ridgeline/code/ridgeline-mk2`, Mastra, v0.0.1, last commit
2026-04-19) is abandoned. Its goals came back into v1 through the fascicle migration.

### checkride

| Claim | Verdict | Evidence |
| --- | --- | --- |
| One command; exit 0 = done | ✎ | 0/1/2 taxonomy, where 2 means the harness itself broke (`checkride:docs/contract.md:15-25`). Exit 0 means "every *executed* check passed" (`:19`). Zero checks run is a vacuous green unless `--strict` is set (`:27-44`). Opt-in slots aren't in the default run (`checkride:src/adapters.ts:33-38`). |
| Raw JSON per tool in `.check/` | ✎ | Written to `.check/<outputFile>` only if the adapter declares one and stdout parses as JSON. Otherwise output goes to `<slot>.stdout.txt`/`.stderr.txt` (`checkride:src/orchestrator/execute.ts:40-54`). "Raw output stays authoritative… This is the product's thesis and will not change" (`contract.md:72-76`). |
| Deep-module boundaries enforced mechanically via ast-grep | ✔, with a caveat | The `struct` slot (`adapters.ts:249-258`); key rule `checkride:rules/no-deep-sibling-import.yml:10-15`. Cross-package boundaries belong to fallow (`checkride:docs/deep-modules.md:97-122`). `init` ships a subset of the rules (`checkride:src/init.ts:600,1038-1051`). Boundaries are import rules; nothing models the system as a graph of concepts. |
| The draft slot-provenance spec says *why* each check runs; provenance stops at which config enabled a slot | ✔ (characterization), ✎ (status) | "Why" in the spec means *how the slot came to run*: `config`, `detected`, `built-in` or `custom` (`checkride:docs/spec-slot-provenance.md:26-50`). **Status: draft, not built** (`:7`). Only a detection-only `detectedVia` exists, and only `doctor` shows it (`checkride:src/config.ts:220-225`; `checkride:src/doctor.ts:425-427`). No `origin` field exists in the code or the schema. Nothing in `src/` mentions constraints, invariants, scenarios or keyframes. |

Things the draft didn't claim but leaned on:

- **Custom checks need no source change.** Any non-catalogue `checks` key with
  `{command, args, outputFile?, order?, optIn?, timeout?}` becomes a synthetic adapter whose
  verdict is the exit code (`checkride:src/config.ts:621-633,741-775`;
  `checkride:src/orchestrator/spawn.ts:183`). There is precedent:
  - plumbbob's `refs` slot (`plumbbob:scripts/check-refs.ts`; D74);
  - fascicle's `examples` slot (`fascicle:checkride.config.json`).
- **Unknown keys in a check entry are ignored at runtime.** An `enforces: [C3]` annotation would
  be dropped silently, and `note` is validated then discarded (`checkride:src/config.ts:22-31`).
  The editor schema rejects such keys with `additionalProperties:false`.
- **`summary.json` is additive-only and `additionalProperties:false`**
  (`checkride:schema/checkride.summary.schema.json:7,41`). A constraint→check map needs a schema
  field added in lockstep.
- **Mutation is an opt-in, single-order slot with no timeout** (`checkride:src/adapters.ts:140,412-428`).
  The repo's own `stryker.config.mjs` does all the scoping, and `--changed` doesn't narrow it.

### fascicle

| Claim | Verdict | Evidence |
| --- | --- | --- |
| The blueprint's one rule: one composition layer, `flow.ts`, where the topology is the file | ✔ | `fascicle:docs/blueprint.md:15,17,9`. It is a convention for *apps built on* fascicle; the library itself has none. Six examples have `src/flow.ts`. The name is not essential (`:109`). |
| `describe` extracts the flow structure | ✎ | `fascicle:src/core/describe.ts:68-72` has three forms: `describe` (text), `describe.json` (`FlowNode`) and `describe.diagram` (box tree). **It walks constructed `Step` values. It is not static analysis.** You call `build_flow(...)` first, usually with a stub engine (`blueprint.md:125-133`). Caveats for diffing: composer ids come from module counters (`branch_N`, `sequence_1`; `fascicle:src/core/branch.ts:21-28`), so **they are unstable across construction order**. Branch predicates render as opaque `<fn:name>` (`describe.ts:166-168`). Step bodies are opaque unless an `arm` is declared (`fascicle:src/core/types.ts:73-82`). There are 21 node kinds (`fascicle:src/core/step_kinds.ts:12-34`). |
| The viewer draws the composition first, then lights spans | ✔ | `fascicle:docs/viewer.md:64-74`. It is a pure fold `reduce(structure, events[0..t])` (`fascicle:src/viewer/app/lib/reduce.ts:4-16`) that joins spans to nodes **by step `id`**. |
| `bench` + judges + `regression` against a committed baseline, with mutation-tested judges | ✎ | `bench` is a library function, not a CLI (`fascicle:src/composites/bench.ts:95-100`). `regression_compare` is at `fascicle:src/composites/regression.ts:61`. The baseline is `bench/reviewer/baseline.json`. **"Mutation-tested judges" means Stryker mutating the judge *source code*** (`fascicle:stryker.config.mjs:17-18`; `fascicle:docs/regression-testing-model-behavior.md:139-141`). It does not test whether an app's LLM judge catches bad outputs. **Judges never see the trajectory:** `JudgeArgs = {input, output, meta?}` (`bench.ts:24-28`). |
| Stub engines for zero-network tests | ✔ | `make_stub_engine`, `make_capture_engine`, `make_script_engine` (`fascicle:src/testing/index.ts:19-26`). |
| GAP: extraction only works for fascicle flows; ordinary code needs a convention such as span attributes | ✔, and broader | Even Tier 1 engine-only fascicle apps produce no graph (`blueprint.md:25,29-48`). **Runner spans have no attribute channel.** Span meta is fixed to `{id, parent_span_id}` (`fascicle:src/core/runner.ts:64-68`), and `StepMetadata` is a closed type. A step body *can* open a child span with arbitrary meta through `ctx.trajectory.start_span(name, meta)`, which surfaces in OTel as `fascicle.<key>` (`fascicle:src/otel/trajectory_logger.ts:46-49,207-209`). |

**Not in the draft: fascicle already has a documentation-only Flow DSL.**
`fascicle:src/core/flow-schema.json:4-5` is titled "fascicle Flow DSL… Documentation-only in v1",
and it is exported as `flow_schema`. The docs say: "A YAML shape of the composition tree exists for
documentation and for LLM-writable specs. It's **not parsed at runtime**, and a loader stays out of
the surface until downstream demand appears" (`fascicle:docs/composition.md:298-301`).

### volley

| Claim | Verdict | Evidence |
| --- | --- | --- |
| Builder/critic loop until a deterministic check *and* a natural-language review both pass | ✎ | Stop condition: `check.ok && verdict === 'approved' && !gate_edit` (`volley:src/loop_state.ts:61`). The loop is fascicle's (`volley:src/flow.ts:148-158`). **The check is optional.** `--check none` resolves to `ok: true`, leaving the loop "critic-gated only" (`volley:src/check/command.ts:47`; `volley:src/check/detect.ts:36-38`). The critic runs even when the check is red. Default max is 10 iterations (`volley:src/config.ts:24`). Exhaustion exits 2 and records `unmet_criteria` (`volley:src/exit_codes.ts:9`; `volley:src/summary.ts:84-88`). **There is no human escalation.** |
| The README diagram is generated from code and a test holds it | ✔ | `volley:test/unit/flow_diagram.test.ts:28,32` uses exact string equality against `describe.diagram(flow())`, for both the `flow.ts` header and the README block. The output is **ASCII, not Mermaid**. It compares topology plus `description` strings, not behavior. Both sides come from code. |
| GAP: the diagram↔code test exists for volley's README only | ✎ | The *pattern* is fascicle blueprint rule 3, recommended for every fascicle app (`fascicle:docs/blueprint.md:123-144`). It ships with a `fascicle-diagram` bin (`:144`). But **no fascicle example ships the test** (a grep of `examples/` finds no `describe.diagram`), and volley's extraction helpers are private to its test file. |

Not in the draft:

- **The critic prompt takes exactly four fields:** criteria, iteration, check and changes
  (`volley:src/critic/prompt.ts:155-170`). It has no slot for extra input. A gauge's output can
  still reach it today if the gauge *is* the `--check` command; the command's stdout becomes
  "check output" (`volley:src/check/command.ts:28`; `prompt.ts:149-150`).
- **The builder never sees check output.** It sees only the critic's feedback
  (`volley:src/builder.ts:255-261`).
- **`gate_paths` detects edits to tests, fixtures and check configs** (`volley:src/changes.ts:36-48`).
  With `--fail-on-gate-edit` such an edit is fatal. This is the existing guard against a tween
  editing its own gauge.
- **volley has no "plan-draft" mode.** That is a night-shift kind (below).

### atis

| Claim | Verdict | Evidence |
| --- | --- | --- |
| Review as a weather map over stable terrain | ✔ | `atis:SPEC.md:35-39`; separate `terrain{}`/`weather{}` blocks (`atis:libs/core/src/map.ts:530-551`). |
| Attention budget: at most six notices | ✔ | P1 (`atis:SPEC.md:85-88`). In code, "the array *is* the budget" (`atis:libs/core/src/notices.ts:37-42`). The cap is on notices, not marks; fascicle's maps carry 71 storms (`atis:docs/glance-test.md:147-150`). |
| "Terrain is stable; weather never moves it" | ✎ | Quote exact; it is P2 (`SPEC.md:89-91`). Within one map it holds: the base is laid out first and added files are pinned (`atis:libs/core/src/layout/index.ts:12-14,196-211`). **The cross-commit half (a terrain cache, incremental relayout) is not built** (`atis:libs/core/src/schema.ts:171`). A fixed seed substitutes for it (`atis:libs/core/src/layout/random.ts:19-23`). |
| One meaning per channel, cited as **P3/P4** | ✎ | It is **P3**. P4 is "Motion is a budget, not a palette" (`SPEC.md:92-97`). |
| Evidence as luminance | ✎ | P3 says it (`SPEC.md:94`), but **the code gives luminance two meanings, evidence and reach** (`atis:libs/svg/src/tokens.ts:62,78,91`; `atis:docs/design.md:17,98-104`). It is inverted, too: "Evidence lights what the tests left open" (D71). |
| Informs, never blocks | ✔ | P7 (`SPEC.md:102-103`), §10 (`:425`). It exits 0 regardless of the weather (`atis:apps/atis/src/run.ts:12-13`). |
| The glance test as acceptance | ✎ | It is the acceptance test, and "fail means the encodings change, not the test" (`SPEC.md:435-449`). **It has never passed:** 2/5 in round one, 3/5 on the retake, unscored after the fifth pass (`atis:docs/glance-test.md:168,393,431-435`). |
| GAP: weather is projected onto code terrain (files, modules, depth), not intent | ✔ | Cells are modules and organelles are files; up to seven depth bands, depth being the longest path from an entry point (`atis:libs/core/src/schema.ts:9-52`; `depth.ts:1-8`). **The graph comes from atis's own TypeScript compiler-API import scan**, not fallow (`atis:apps/atis/src/sources/imports.ts:1-27`; D21). fallow supplies entry points only (`imports.ts:925-948`); atis's stated reason, that fallow has no graph dump, is now stale (see the fallow row below). Nothing reads plumbbob state or specs; `.plumbbob/**` renders as "docs" shore dots (`atis:apps/atis/src/config.ts:127`). |

The draft's §9 says to "start with a local web canvas… (atis's model: one command, one tab)".
That is ✎: **atis has no browser tab yet.** It writes `map.json` and a still SVG that it opens in
the OS viewer (`atis:apps/atis/src/run.ts:114-131`). The three.js app, the server, watch mode and
PR comments are phases 2–4 (`atis:SPEC.md:459-470`).

### generation-loss.md

| Claim | Verdict | Evidence |
| --- | --- | --- |
| "Iterating through a lossy medium leaves you with the medium; the message erodes" | ✔ | `plumbbob:docs/generation-loss.md:39-41`. It is hand-owned anchor prose and is deliberately exempt from model re-punctuation (D78, `plumbbob:docs/decisions.md:605-606`). |

### The draft's other factual claims about the tools

| Claim (draft §) | Verdict | Evidence |
| --- | --- | --- |
| "night-shift appears only indirectly, as overnight volley plan-draft runs referenced in fascicle and volley" (header) | ✎ | plan-draft is one of **night-shift's** two kinds (`night-shift:src/types.ts:1`), not a volley mode. fascicle's `.gitignore:45-50` names it. The 13 `.volley*` directories in fascicle's checkout are night-shift plan-draft runs. |
| "fallow import graph" as an extractor (§5, §6, §12) | ✎ | fallow 3.22 **does** export the whole file-level import graph, but only as Mermaid or DOT through `fallow viz --viz-format mermaid\|dot`. Verified 2026-10-02 with `--no-cache` on fascicle, output to `/tmp`, repo untouched: 1,945 lines, 1,405 edges, no zone grouping. JSON is per file only: `dead-code --trace-file` returns `imports_from/imported_by` (`checkride:node_modules/fallow/types/output-contract.d.ts:9326-9350`). Checkride's `dead` slot stores findings, not the graph (`checkride:src/adapters.ts:259-273`). atis's "no full-graph dump exists in fallow 3.22's `--help`" (`atis:SPEC.md:396-399`) is **stale**. **What the draft missed:** fallow `boundaries` already *declares* the intended module shape (see §3). |
| Concept bindings `-> src/limiter/` line up with checkride's module model (§4) | ✔ | The form matches plumbbob's `dir/` seam grant (D23, `plumbbob:src/lib/intent.ts:70-129`) and checkride/atis module identification (`atis:SPEC.md:140-143`). |
| Example taste deviation "default export in src/limiter/index.ts" (§6 readout) | ✘, by the user's own split | Across these repos, no-default-export is a **constraint**, enforced by ast-grep in `struct`: plumbbob C1 (`plumbbob:docs/decisions.md:29-31`), atis D3, and `rules/no-default-export.yml` in checkride, volley, ridgeline, fascicle and runciter. Under ridgeline's rule ("if violating it should fail the build, it is a constraint", `ridgeline:docs/constraints-and-taste.md:219-220`) the example is mis-filed. |
| D66 is out-of-band-commit surfacing (§8) | ✔ | `plumbbob:docs/decisions.md:392-400`. |
| Cited doc paths (§13) | ✔, with one exception | All exist. Exception: volley's diagram-drift test lives in `volley:test/unit/flow_diagram.test.ts`, not in `README.md`. |

---

## 2. Rows the draft lacks

### night-shift: an overnight, propose-only queue over volley

A one-shot CLI and SDK. It reads markdown task files and runs each through volley inside a fascicle
flow (`map` with concurrency 1, per-task timeout, checkpoint). It writes `outcome.json`,
`reports/<date>.md`, `events.jsonl` and `ledger.jsonl`. Sources: `night-shift:package.json:4`;
`night-shift:src/cli.ts:62-72`; `night-shift:docs/spec.md:17-39`. **The only success status is
`proposal`, and nothing is merged or pushed** (D2).

- **Kinds** (`night-shift:src/kinds/index.ts:45-52`):
  - **`plan-draft`.** The builder drafts a plumbbob-shaped `intent.md` (Frame, D#, C#, Steps with
    done-when and seam, Q#) (`night-shift:prompts/plan-draft.md:18-46`). It is gated by
    **`night-shift check-draft`**, a deterministic citation gate that grades every cited path as
    `ok | missing | new` and exits 1 on any failure (`night-shift:src/kinds/draft_citations.ts:109-174`).
  - **`candidate-diff`.** A contained volley run with `check:'auto'` (checkride) and `gate_paths`
    (`night-shift:src/kinds/candidate_diff.ts:21-41`). **No real run has succeeded yet**
    (`night-shift:docs/first-run.md:622-643`).
- **The critic seat was chosen by measurement, and the measurement is the finding.** Candidate
  critics judged one draft containing a planted false claim and one sound draft. **No candidate
  caught the false claim** (`night-shift:docs/first-run.md:458`). gemma4:26b won on well-formedness
  (`:592-600`).
- **Triage.** volley's loop absorbs failures up to `max_iterations`, which defaults to 3
  (`night-shift:src/task.ts:25`). Beyond that: "Re-queueing is a human act"
  (`night-shift:docs/embedding.md:175`).
  - Nine statuses, each with an exit code (`night-shift:src/cli.ts:19-29`).
  - `review <id> accept|edit|discard` refuses without `--why` and appends to `ledger.jsonl`
    (`night-shift:src/cli.ts:186-236`).
- **Not built:**
  - The scheduler. D35's launchd/systemd rendering sits in unchecked steps 9–13
    (`night-shift:.plumbbob/builds/2026-09-27-…/intent.md:154-172`).
  - The notifier, which exists only as a type (`night-shift:src/flow.ts:101-103`).
  - The `triage` and `long-horizon` kinds (`night-shift:docs/spec.md:114-115`).

### runciter: an event-sourced control plane that queues ridgeline runs

Humans submit intents. A single-writer reconciler validates each one against a declared transition
table, appends events to an append-only SQLite log and folds them into projections. A scheduler
spawns ridgeline per task (`runciter:README.md:3-10`; `runciter:src/reconciler/scheduler.ts:12-43`).
A Kanban web UI is a pure reducer over SSE (`runciter:web/src/state/board-state.ts:80-83`).

- **The state machine is data:** "The machine is data, not code" (`runciter:docs/state-machine.md:3-5`).
  - `TRANSITIONS: Record<intent, {from[], to, event}>` (`runciter:src/intents/transitions.ts:11-21`).
    Each row reads "when intent X arrives in status S, emit event E". Structurally that is a
    synchronization in Meng & Jackson's sense.
  - Enforcement: a pure validator (`transitions.ts:60-113`), a closed Zod union and a `never`
    exhaustiveness guard on the reducer (`runciter:src/events/reducers.ts:145-149`).
  - Tests: a property test over every transition × status pair
    (`runciter:src/intents/__tests__/transitions.test.ts:34-57`) and replay equivalence
    (`runciter:test/integration/replay-equivalence.test.ts:18-87`).
- **The same graph exists in at least four unlinked copies:**
  1. `TRANSITIONS`;
  2. the reducer switch (`reducers.ts:82-139`);
  3. the board's `STATUS_AFTER` (`runciter:web/src/state/board-state.ts:19-27`);
  4. the drag map `LEGAL` (`runciter:web/src/board/drag-map.ts:7-13`).

  The docs and spec add hand-written Mermaid copies (`runciter:docs/state-machine.md:9-54`).
  - **The copies agree today.** Checked 2026-10-02: `STATUS_AFTER` and `LEGAL` are consistent
    with `TRANSITIONS`. The drift risk is latent, not realized; nothing would notice if one
    copy changed.
  - **Machine edges are not in the table at all.** Claim, pass, fail, timeout and orphan are
    hard-coded emissions (`scheduler.ts:35-42,59-69`; `runciter:src/reconciler/orphans.ts:15-18`).
  - Spec↔code drift is already catalogued (`runciter:research/first-build-evaluation.md:104-142`).
- **Gate:** runner exit 0 **and** `pnpm check` exit 0 (`runciter:src/reconciler/runners/ridgeline.ts:60-69`).
  It reads no `.check/` JSON, and `run.passed` carries an empty payload (`scheduler.ts:61`).
- **Human surface:** the Review column is the inbox. Reject requires a reason
  (`runciter:src/intents/types.ts:45-53`). Orphans need a human retry by design
  (`runciter:src/reconciler/orphans.ts:5-10`).
- **Never mentions** volley, night-shift, atis or fascicle. fascicle is an explicit non-goal for v1
  (`~/projects/runciter/docs/runciter-spec.md:672-681`).

### weft: a read-only flow canvas, stale

A React Flow + ELK canvas over `describe.json`. It is explicitly non-editable: `nodesDraggable={false}`,
`nodesConnectable={false}` (`weft:packages/core/src/canvas/WeftCanvas.tsx:368-369`). Last release
v0.1.11, 2026-05-05. Its README names primitives fascicle has since removed (`cycle`, `wrap`).
fascicle's in-repo viewer has superseded it for run visualization.

### fallow (external tool, v3.22.0 in checkride/fascicle, v2.13.0 in ridgeline)

fallow already contributes to the gauge stage, and the draft under-credited it. Through
checkride's `dead` slot it reports boundary, coverage and call violations plus cycles
(`.check/dead.json` keys `boundary_violations`, `boundary_coverage_violations`,
`boundary_call_violations`, `circular_dependencies`).

Its adoption is uneven:

| Repo | Boundary configuration |
| --- | --- |
| fascicle | 13 zones and 13 allow-rules (`fascicle:fallow.toml:122-231`) |
| checkride | sets `boundary-violation = "error"` but **defines no zones** (`checkride:fallow.toml:36-41`) |
| ridgeline | no boundaries |
| ts-check-scaffold | apps/libs zones (`~/projects/ts-check-scaffold/code/ts-check-scaffold/fallow.toml:35-56`) |

Other commands not used anywhere yet: `guard <files>` (which rules apply before an edit) and
`decision-surface` (advisory structural questions for a change).

### Siblings

| Project | What it is | Relevance to keyframes |
| --- | --- | --- |
| agent-tools `ast-grep-rules` | Turns stated conventions into enforced ast-grep rules, each with a fixture | **High.** `/audit` is the rules gauge for conventions (§3). |
| Stryker configs (checkride, fascicle, ridgeline, plumbbob, weft, ts-check-scaffold) | Mutate the whole `src` scope; ridgeline runs it through its own `scripts/check.mjs`, the others through checkride's opt-in `mutation` slot | **Medium.** `killedBy`/`coveredBy` make per-enforcer kill rates computable. No repo scopes by enforcer. |
| ts-check-scaffold | The canonical deep-modules scaffold, with fallow zones and `no-deep-sibling-import` | Low. It is where conventions originate. |
| paceline | E2EE group coordination app | **Medium, as a hand-written keyframe specimen.** The spec has a §9 failure-mode table with columns `scenario \| expected behavior \| test` (`~/projects/paceline/docs/paceline-coordination-spec.md:313-325`) and named invariants (`:332`). The code has a proposal transition table (`~/projects/paceline/code/paceline/packages/node/src/policy.ts:53-64`). |
| gantry | Design-phase harness spec, no code | Low–medium. `feature {acceptance, verifier_predicate?}` is a human predicate paired with a machine check, i.e. invariant plus enforced-by (`~/projects/gantry/code/gantry/docs/specification.md:271-273`). |
| faultline | Reverse-engineers code into specs | Medium. `Domain {directories[], key_files[], depends_on[]}` is concept → paths plus edges, *extracted* (`~/projects/faultline/code/faultline/src/types.ts:68-78`). |
| storium | Drizzle/Zod DAL that runciter uses | Low. The `qa-trace` skill maps tests ↔ source. |
| lodestar, rob-ot | Memory over a bi-temporal claim graph; human review queue for contested claims | Low. Patterns only: supersession as "fold", a queue as a triage inbox. |
| trellis | Claude Code plugin: sketch → pitch → spec → plan → tasks, with a judge agent | Low–medium. Spec §6 Business Rules and §7 Failure Modes are the scenarios. |
| harness-kit, fsm | A prompt; a toy FSM | None. |

### Your prior art the draft never saw

The draft presents keyframe development as new. You have specified most of it before, in pieces.
Most of those specs stalled at the same places.

- **Intent Engineering whitepaper** (`~/projects/_minga/ai-future/intent-engineering/intent-engineering-whitepaper.md`).
  The same inversion ("specifications… become the canonical source of truth. Code is a derived
  artifact"), the same MDD/DbC/formal-methods lineage (§2), and overnight builds (§7).
  - It has a metric the draft lacks: **spec coverage by "dry builds"**. Regenerate from spec in
    isolation, then run the behavioral tests; failures mark spec gaps (§6, `:75-83`).
  - Its companion, `trellis-ecosystem-outline.md`, plans a spec critic (`:110`), a "diff probe"
    for structural drift (`:177`) and an extractor that decompiles code back into a spec (`:181`).
- **foundry / mindustry** (`~/projects/foundry/docs/mindustry/spec.md`). A canvas editor for flows
  with typed sockets and a `MismatchEdge` that rejects ill-typed drops (`:145,212,249`), plus a
  `diff_descriptors(a, b)` structural diff (`:366`).
  - foundry's last commit was 2026-04-18, and **no mindustry package exists**. Its packages are
    config, foundry-core, two harnesses and workflows-standard.
- **sightline** (`~/projects/fascicle/docs/sightline-spec.md`). A React Flow visualizer for
  composition trees: "Static rendering only in v0; live execution (v1) and **edit-in-place (v2)**
  are specified at a contract level and deferred." The React Flow canvas that did ship, weft, is
  read-only.
- **marrow** (`~/projects/marrow/docs/marrow-spec.md`; `code/` is empty). Deterministic ts-morph
  call/ref edges, then clustering into domains, then **round-trip verification**: reimplement from
  the spec alone and run the original tests (`:552-571`). It also defines a leaf format with
  Invariants and Anchors (`:801-850`). This is the most complete extraction design you have.

**Pattern.** The editable canvas has been specified twice before, in mindustry and sightline v2.
Both times it was deferred while a read-only renderer shipped. The draft's §9 is the third time.
The text/spec side keeps shipping: plumbbob intent, night-shift plan-draft, ridgeline spec, fallow
zones.

### Loop-stage matrix (all tools, as built)

Key: ● = does it today · ◐ = partial or advisory · ○ = nothing.

| Tool | frame | simulate | render | gauge | review | adjust | fold |
| --- | --- | --- | --- | --- | --- | --- | --- |
| plumbbob | ● intent.md (Steps and Build order machine-read) | ○ | ◐ host model builds; plumbbob never dispatches (D3) | ◐ checkride gate in-process (D32); judgment rows model-attested | ● readout, Verdict, latch | ● refine, step, harvest, blocked/drift (D52) | ◐ build folder is the record (D29); promotion by hand |
| ridgeline | ● shape, spec, constraints, taste | ○ | ● phased builds, worktree waves | ◐ LLM reviewer only; check command never run | ◐ read-only dashboard | ◐ 2 retries with feedback, then exit 1 | ● retrospective → learnings → refined-input.md |
| checkride | ○ | ○ | ○ | ● the gate; custom checks | ◐ triage, qa, digest readers | ○ | ◐ baseline ratchet |
| fascicle | ◐ flow.ts plus doc-only Flow DSL | ○ | ● the substrate everyone renders on | ◐ bench, judges, regression (outputs only) | ● viewer run canvas | ○ | ◐ committed bench baselines |
| volley | ◐ prompt and criteria | ○ | ● builder | ◐ optional check plus gate-edit detector | ◐ LLM critic | ● critic feedback → builder | ◐ per-iteration archive |
| atis | ○ | ○ | ○ | ◐ reads checkride, derives reach | ● weather map (glance test unpassed) | ◐ notices carry the why | ○ |
| night-shift | ● plan-draft (AI drafts, human accepts) | ○ | ● contained volley | ● check-draft citation gate; checkride oracle | ● morning report; review with mandatory why | ◐ edit the task, re-queue by hand | ◐ accepted draft → `/plumbbob:plan` |
| runciter | ◐ free-text task | ○ | ● dispatches ridgeline | ◐ exit codes only | ● Review column, approve/reject with reason | ◐ retry, without the reject reason | ● append-only event log |
| fallow (external) | ● boundary zones and rules: declared shape | ○ | ○ | ● boundary, coverage and cycle findings via `dead` | ○ | ○ | ○ |

**The simulate column is empty across every tool.** Design-level simulation (§7 Level 1) is wholly
new. Every other stage has at least one existing owner.

---

## 3. What the draft reinvents vs. what it assumes into existence

### Reinvents (it already exists; reuse it)

| Draft proposal | What already exists |
| --- | --- |
| A new keyframe DSL for intended structure (§4) | fascicle's doc-only **Flow DSL** "for LLM-writable specs" (`fascicle:src/core/flow-schema.json`; `fascicle:docs/composition.md:298-301`). runciter's **`TRANSITIONS` table** is already a declared sync table. |
| Concept bindings `concept X -> src/x/` plus forbidden edges plus strays: the shape gauge (§4, §6) | **fallow `boundaries`**. `zones` (name → path patterns) are concept bindings. `rules` (`from`/`allow`/`allowTypeOnly`) are allowed edges, default-deny. `coverage.requireAllFiles` reports files in no zone, i.e. strays. `calls.forbidden` bans calls per zone (`checkride:node_modules/fallow/schema.json:256,1592-1737`). fascicle declares 13 zones and 13 rules (`fascicle:fallow.toml:122-231`), "mirrors the ast-grep boundary rules", and violations already fail the gate via `.check/dead.json`. **The one thing fallow cannot assert is that a declared edge *exists*.** Allow-lists catch extras, not absences. |
| The rules gauge for conventions: "is every stated rule enforced by something?" (§6) | **agent-tools `ast-grep-rules` `/audit`** diffs the conventions stated in docs against the rule ids that exist, verifies by *running* each rule, and reports unenforced ones with `path:line`. A deterministic first pass is `scan.mjs --conventions` (`~/projects/agent-tools/code/agent-tools/plugins/ast-grep-rules/README.md:62-75`). `/rule` won't finish until its fixture passes. It covers ast-grep only and is model-assisted past the first pass. |
| Mutation testing of enforcers (§6 rules, §12.3) | Stryker's `.check/mutation.json` already records `killedBy` and `coveredBy` test ids per mutant, plus `testFiles` (seen in `fascicle:.check/mutation.json`). "Did enforcer T kill mutants under concept C's path?" can be computed from existing output with no new Stryker configuration. |
| A diagram↔code gauge, "generalizing volley's test" (§5, §12.2) | fascicle **blueprint rule 3** plus the shipped `fascicle-diagram` bin (`fascicle:docs/blueprint.md:123-144`). It is already general, but it is a doc-drift test. |
| A tween-bug triage loop (§6) | volley's check+critic loop (`volley:src/loop_state.ts:61`); plumbbob's **D52 blocked-vs-drift** ("drift = the plan no longer matches reality", `plumbbob:docs/decisions.md:292-296`); D82's Verdict ladder, whose fourth rung splits "fix the work" from "fix the plan" (`:702-704`). The keyframe-vs-tween split is largely D52 under another name. |
| Guarding gauges from the tween (§11 Goodhart) | volley `gate_paths` with `--fail-on-gate-edit` (`volley:src/changes.ts:36-48`); checkride's `protect` hook, which denies agent edits to the baseline (`checkride:docs/contract.md:173-174`). |
| Gauges deterministic, model judgment advisory (§6 authority column) | plumbbob **D80** ("whatever can be deterministic is rendered by the CLI"), **D82** ("measured beats attested"), **D45** ("a gate an agent can trip is the lock returning in autonomy's costume"). |
| Provenance: which checks enforce which C-ids (§12.3) | plumbbob's `refs` slot already checks D/C *citations* mechanically (`plumbbob:scripts/check-refs.ts`; D74). It is the nearest working pattern: a custom checkride slot that parses IDs out of prose. |
| AI-drafted intent with a deterministic gate and a human verdict that carries a why | night-shift **plan-draft + check-draft + `review --why`**. |
| A committed scenario baseline (§3) | fascicle `bench/<flow>/baseline.json` with `regression_compare`. |
| Retro → learnings → refined input (§8 fold) | ridgeline retrospective → `learnings.md` → `refined-input.md`. |
| A graph renderer for the canvas (§9) | fascicle viewer (`fascicle:src/viewer/`); weft (read-only, stale). |
| A local, no-service delivery model | atis P7/D18; fascicle "no hosted service" (`fascicle:VALUES.md:105-111`). |

### Assumes into existence (it doesn't exist; someone must build it)

| Draft assumption | Reality |
| --- | --- |
| A *JSON* module-graph extractor to diff against | Partial. fallow gives a file-level Mermaid/DOT graph (`viz`) and per-file JSON (`--trace-file`). atis core has a TypeScript compiler-API scanner with module identification (`atis:apps/atis/src/sources/imports.ts`; `atis:libs/core/src/modules.ts:1-8`), but it is packaged inside an app, not exported. Nothing yet answers "does declared edge X→Y exist?" |
| "Span attributes `keyframe.sync=check`" on generated code | fascicle runner spans have **no attribute channel** (`fascicle:src/core/runner.ts:64-68`). The workaround is a manual child span inside a step body. Non-fascicle code (runciter, ridgeline) emits **no spans at all**; ridgeline's adapter drops span boundaries (`ridgeline:src/engine/adapters/ridgeline_trajectory_logger.ts:46-49`). |
| "A judge that reads the trajectory and checks `expect path`" (§12.4) | Judges receive `{input, output, meta}` only (`fascicle:src/composites/bench.ts:24-28`). Trajectories are written per case to `trajectory_dir` (`bench.ts:75`), so a path assertion is a post-pass over JSONL, not a judge. |
| Stable IDs to diff on | fascicle composer ids are counter-based (`fascicle:src/core/branch.ts:21-28`). Step ids are stable only where authors name them. ridgeline acceptance criteria have no IDs. |
| "Mutation-tested judges" meaning calibrated judges | Stryker covers judge *code* only. The only judge-calibration experiment in these repos is night-shift's planted-claim bake-off, and every candidate failed it. |
| ridgeline as a "settled render" backend that a gauge can gate | ridgeline never runs a deterministic check (§1 above). A gauge would have to be *added* to its loop, not plugged into it. |
| night-shift running "overnight" | There is no scheduler. Runs are manual. |
| An atis browser tab to host overlays | Not built. atis is a CLI that writes an SVG. |
| A standing `design/` that finish folds into | No such concept anywhere. The nearest is plumbbob's hand-maintained `docs/decisions.md`. |
| Design-level simulation, dead-keyframe mutation, Alloy/TLA+ translation | Nothing in any repo. The sibling scan's hits are below. |

---

## 4. Conflicts with settled decisions

Each row cites the decision, then says what in the draft collides with it. "Amend" means the
proposal is only possible if you change the decision.

### plumbbob (`plumbbob:docs/decisions.md`)

| Draft proposal | Decision | Conflict |
| --- | --- | --- |
| A `keyframes held` readout row (§12.1, §6 readout) | **D82 (readout-ladder)**, `:686-720`: "seven rows at most, in order: check, done-when, decisions, constraints, seam, diff, spent". **D80**, `:634-657`: a shape change is "a change to `docs/presentation.md` first". | **Amend.** An eighth row breaks the cap. Fold keyframes into an existing row (`seam` already reads "held: N of N declared, no strays", the draft's own vocabulary), or replace a row. If it ships, it must be CLI-measured, never attested. |
| A fenced `keyframe` block replacing the Architecture sketch (§12.1) | **D6/D86 (parseable-steps/build-order)**, `:92-96,797-819`: only Steps and Build order are machine-read. **D61 (best-effort-scrape)**: a gating parse must be strict like D23. **D74 records-stay**: finished intents are never retrofitted. | **Amend D6**, as D86 did, adding a third machine-read section. The block must be optional and need no migration. **Replacing** the sketch also discards a section that all 38 real builds use, in forms a concept/sync block can't hold (deployment, predicates, pipelines). |
| Seam derived from concept bindings (§4, §8) | **D23 (no-glob-seams)**, **D4 (flat-step-files)**, **D13/D82** (seam is awareness, not a lock). | **Compatible** if the derivation writes exact paths or `dir/` grants into `- seam:` lines at plan time. **Conflicts** if it introduces globs or makes the seam a lock. |
| `/plumbbob:finish` folds into `design/` (§3, §12.6) | **D29 (finish-replaces-wrap)**, `:173-177`: "no separate archive copy… the tracked folder already *is* the record". D20 (a separate archive) was superseded for this reason. **D9 (finish-no-gate)**. Finish skill: "nothing is copied out… Updating real docs is a separate, explicit ask" (`plumbbob:skills/finish/SKILL.md:77-80`). | **Amend D29**, or give the fold to a different verb or tool. Counter-precedent: your manual promotion into `docs/decisions.md` *is* a fold. It is just human-run. |
| Teach-back line required by the latch (§9) | **D64 (approval-latch)**: the predicate reads "only `TURN`/`TICK`/`GRANT`/`isTTY`". **D67**: "guidance-first… it adds no lock". **D73**: no gate on human-read one-liners. **D83**: `looks good` is the approval move. | **Amend D64.** A content requirement adds a sixth row and fails open on TTY or hookless hosts anyway. A forge-proof route exists: `grantFromPrompt` already parses the human's literal prompt (`plumbbob:src/verbs/turn.ts:113`; D65). |
| A keyframe slot failing the gate (§6 shape: "fails the gate") | **D45 (advisory-review)**, **D75 (two-gates)**: "checkride gates *the code*, plumbbob latches *the record*". | **Compatible** if the shape gauge is a checkride slot. **Conflicts** if it is an agent's verdict or a plumbbob verb that refuses. |
| Control flow in harness config (dispatch to volley/ridgeline/night-shift) | **C3 (bindings-not-logic)**; **C6 (no-advance-verb)**; **D3 (author-blind-executor)**. | **Compatible** only if dispatch lives in an agent (code) or in prose, never in `harness.json`, and never advances the loop. |

### atis (`atis:SPEC.md` §13 plus principles; the build's C1–C11)

| Draft proposal | Decision | Conflict |
| --- | --- | --- |
| Keyframe graph as terrain (§12.5) | **D13 (geometry)**: depth terraces from the import graph. **D16 (surface)**. **P3**: position = structure. **§10**: "Not a general codebase explorer or architecture-diagram product" (`:424`). | **Conflicts** if it replaces terrain. **Compatible** as a separate, toggleable view read from the base ref (P2), muted when absent (P8), shown as a delta (P6), with a `map.json` `schema_version` bump (§9.2). |
| "Runtime light" overlay: amber path over dim geometry (§9) | **P3/C11**: luminance already carries evidence *and* reach. **§5.1**: "A drawn line always means 'look here'" (`:163-166`). **P4**: motion budget. No runtime source in §9.1. | **Conflicts.** It would be a third meaning for light, plus drawn edges that are not alarms. |
| "Drift ghosts" for code without a keyframe (§9) | The dashed ghost already means **missing co-change** (`:201-204`). | **Conflicts (P3).** Use another channel. |
| Per-keyframe approval inside the tool (§9 Review mode) | **P7** "no new review process"; **§10** "Not a gate"; **P9/D7/C6** "no author field anywhere in `map.json`". | **Conflicts.** Approval belongs to plumbbob's latch, not atis. |
| Canvas that edits keyframes (§5, §9) | **D2**: the renderer never reads git or `.check/` (`:418-419`). Data flows one way. | **Conflicts** inside atis. An editor must be a different program. |
| CI Mermaid PR comments (§9) | **§5.1** (no drawn ordinary edges), **§10** (not an architecture diagram), R5 (the PR image is a headless capture of the same app). | **Conflicts** as an atis feature. Phase 4's `--comment` posts the map image, not Mermaid. |

### checkride (`checkride:docs/contract.md`, `docs/why.md`, `docs/reliability.md`)

| Draft proposal | Promise | Conflict |
| --- | --- | --- |
| checkride parses keyframes and computes the graph diff (§12.2) | "Raw output stays authoritative… never normalized, reshaped, or filtered" (`contract.md:72-76`); "It stays dumb: it never parses diagnostics" (`checkride:src/orchestrator/index.ts:4-5`); "adds no checker of its own" (`checkride:docs/why.md:184-186`, already loosened by the links/pack/smoke built-ins). | **Conflicts** if checkride computes the diff. **Compatible** if an external tool computes it and runs as a custom check, with its JSON as raw output: `.check/keyframe.json` via `outputFile`. |
| `.check/provenance.json` and `scenarios.json` as artifacts (§3) | The contract names only `summary.json`, per-slot raw files, `digest.md` and the baseline. | **Compatible** only as some slot's raw output. Otherwise it is outside the contract and needs its own versioned schema, atomic write and staleness rule. |
| Constraint→check map in the summary (§12.3) | `summary.json` is additive-only and `additionalProperties:false`. `note` is dropped. | **Additive schema change**, in lockstep, released under a **Contract** CHANGELOG heading (`contract.md:431-434`). Or keep the map outside checkride (lean). |
| Stryker scoped to enforcers (§12.3) | The mutation slot has `timeout: 0` and is "opt-in and never in the gate the cap protects" (`contract.md:405-407`). | **Compatible** as opt-in. **Conflicts** with the contract's intent if put in the default gate. |

### fascicle (`fascicle:docs/blueprint.md`, `fascicle:VALUES.md`)

| Draft proposal | Decision | Conflict |
| --- | --- | --- |
| A keyframe DSL *above* flow.ts as the source of truth | Blueprint one rule (`blueprint.md:15`): **one** composition layer. Rule 3 (`:123`): **code is truth, picture derived**. | **Tension.** Two topology sources is what the one rule forbids. It is resolvable only if the keyframe is a *spec checked against* `flow.ts`, never a second composition, and the diff is the gauge. |
| Keyframe layer or loader inside fascicle core | VALUES "no batteries you did not ask for" (`VALUES.md:72-73`); RAG, memory and evals are "separate tools you compose in" (`:126-132`); Flow DSL loader stays out "until downstream demand appears" (`docs/composition.md:300-301`). | **Conflicts** if built into core. The demand-gated Flow DSL loader is the sanctioned door. |
| Requiring keyframe IDs in span attributes | No metadata channel on runner spans. `meta.name` contract: "changing it is always safe because nothing keys off it" (`fascicle:src/core/types.ts:60-62`). Ids must be JS identifiers. | **Conflicts** if keyed off `meta.name` or a central ID registry ("no central object to register into", `VALUES.md:28-29`). **Compatible:** make the sync name equal the step `id`. The viewer already joins on `id`. |
| A canvas that writes DSL | viewer: "nothing about it reaches your source code" (`fascicle:docs/viewer.md:9`); weft is non-editable by construction. | **Conflicts** inside fascicle's viewer. It needs a separate tool. |

### ridgeline (constraints-vs-taste split, `ridgeline:docs/constraints-and-taste.md`)

| Draft proposal | Rule | Conflict |
| --- | --- | --- |
| Taste gauge where "critic samples, deviations noted, not failed" (§6) | "The reviewer does not check taste" (`:29-33`), *because* "enforcing style preferences as hard gates produces unnecessary retries" (`:41-43`). | **Conflicts if the taste critic feeds a loop.** volley loops until the critic approves (`volley:src/loop_state.ts:61`), so taste findings in the critic's prompt become retries, the exact failure the split exists to prevent. Taste has to bypass the convergence loop and land only in the readout. |
| Constraints as C-ids "enforced by" checks | "If violating it should fail the build, it is a constraint" (`:219-220`). | **Compatible, and sharper.** A C-id with no enforcing check is, by this rule, taste wearing a constraint's name. That is the rules gauge's whole job. |
| "Learnings → taste/constraints" fold (§8) | "When in doubt, start with taste… promote the entry to constraints" (`:233-235`). | **Compatible.** It is the same ratchet. |

---

## 5. What this inventory does not settle

These are Phase 2 inputs. They are recorded here so they don't get lost.

- **Which graph model is the substrate:** fascicle FlowNode, atis cells, runciter TRANSITIONS, or
  something new. The code can't decide that. It only shows that none of the four is
  concepts + syncs and that each covers a different kind of codebase.
- **Whether "keyframe" means authored-first (code must conform) or approved-snapshot** (golden
  file: the extracted graph is committed and human-approved, so a diff is the hypothesis). Every
  existing drift test is the second kind, and it is much cheaper.
- **Whether LLM critics can serve as gauges at all,** given night-shift's measured 0-for-N on a
  planted false claim.
- **Shape gauge.** Should it extend fallow `boundaries` with a missing-edge check, plus the existing
  `requireAllFiles` for strays, rather than become a new extractor?
- **Spec coverage.** Should the Intent Engineering whitepaper's dry-build spec coverage come back
  as a gauge? It measures whether keyframes are *sufficient*; the draft only measures whether code
  *conforms*.
- **External citations** (Meng & Jackson, Kleppmann, Anthropic's skill-formation study, Litt) were
  not checked in this phase. They belong to the design argument, not the tool inventory, and will
  be verified, or flagged unverified, in Phase 2.
