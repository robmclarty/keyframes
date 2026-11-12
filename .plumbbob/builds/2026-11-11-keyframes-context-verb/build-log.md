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

**Current step:** 3 — docs(spec): specify the context verb
**Heavy check:** checkride (set a "check" key in .plumbbob/settings.json to override)

## Steps

*(Mirror of intent.md's Steps, with live status; CLI-maintained, not hand-edited.
`build`/`checkpoint`/`revert` re-render this from intent.md, and set the Current step
line above. Only ONE step is in flight; a step is done only after a checkpoint:
check green + checkpoint taken, via `/plumbbob:verify` or `/plumbbob:build`.)*

- ☑ 1. docs(plan): add the context verb to keyframes.md
- ☑ 2. docs(notes): renumber the three notes past the plan's new IDs
- ☐ 3. docs(spec): specify the context verb
- ☐ 4. feat(context): select the items that apply to paths
- ☐ 5. feat(report): render context as text and JSON with its schema
- ☐ 6. feat(cli): add keyframes context
- ☐ 7. test(e2e): hold the context scenario
- ☐ 8. docs(agents): tell harnesses about keyframes context

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
