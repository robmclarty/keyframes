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

# Build log: keyframes prototype

**Current step:** 6 — feat(items): parse items and sub-lines
**Heavy check:** checkride (set a "check" key in .plumbbob/settings.json to override)

## Steps

*(Mirror of intent.md's Steps, with live status; CLI-maintained, not hand-edited.
`build`/`checkpoint`/`revert` re-render this from intent.md, and set the Current step
line above. Only ONE step is in flight; a step is done only after a checkpoint:
check green + checkpoint taken, via `/plumbbob:verify` or `/plumbbob:build`.)*

- ☑ 1. chore(scaffold): realign the scaffold to the prototype spec
- ☑ 2. feat(cli): add the CLI entry and the keyframes bin
- ☑ 3. fix(cli): drop -v and make the CLI test titles name their arguments
- ☑ 4. docs(design): point the spec at the plumbbob build and its decisions
- ☑ 5. feat(scan): read markdown into blocks and sections
- ☐ 6. feat(items): parse items and sub-lines
- ☐ 7. feat(cite): resolve citations and references
- ☐ 8. feat(repo): resolve pointers and Map paths
- ☐ 9. feat(report): count, budget, and render text and JSON
- ☐ 10. feat(init): write the template, snippet and docs
- ☐ 11. test(dogfood): give this repo its own plan
- ☐ 12. docs(pilots): run the pilots
- ☐ 13. chore(release): publish a 0.x for the pilots to install

## Park list

> Mid-step, every new problem / idea / "ooh what if" lands HERE, untouched, and you
> go straight back to the step. Acting the instant an idea arrives is the disease.
> Capture is one line (`/plumbbob:park` composes it). Harvest happens only at the boundary.

- [ ] the CLI help still says exit 2 is 'a usage or read problem'; the spec now adds an internal problem (D13), so step 9's crash wiring should update the help line and its test
- [ ] README.md and docs/archive/README.md still call docs/prototype.md 'the current plan', while AGENTS.md now names the plumbbob build as the plan and the spec as its reference
- [ ] the spec's The report names `feat(report): count, budget, and render text and JSON` as the step that settles the item shape; when D15 splits step 9, point it at the piece that writes the schema
- [ ] the spec's Appendix C draft still marks src/cli.ts and bin/keyframes.js (new), though step 2 built them; check would note built-not-new when step 11 runs it
- [ ] step 6 will need Line, Section, SectionName and Finding re-exported from src/scan/index.ts, outside its seam: fallow rejects unused re-exports, so step 5's barrel exports only what its tests use; widen the seam when splitting step 6
- [ ] a comment that starts a line and never closes hides the rest of the plan with no finding; the spec has unclosed-fence but no unclosed-comment
- [ ] setext headings (a line of text over ---) render as h2 but the scanner reads only ## headings, so a setext Constraints heading is not a section; the pilots may show whether anyone writes them

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

- 2026-10-23 — plan committed · 9b687ce65

  **Recommendation**: Approve it. The read checked that each of the eight answers lands where a builder will see it (Decisions D13 to D18, the wider case rule in [D9 (easy-to-get-right)](intent.md#d9), and the done-whens of steps 4, 8, 9 and 13), that step 13 builds before the pilots, and that every done-when names something a test or a person here can check; the one loose end, which line the note on a capitalized plan name points at, belongs to step 9's split.

- 2026-10-23 — step 3 checkpointed · 73e60e846 — fix(cli): drop -v and make the CLI test titles name their arguments (2m)
- 2026-10-23 — step 4 checkpointed · 43b15e90f — docs(design): point the spec at the plumbbob build and its decisions (4m)
- 2026-10-23 — step 5 checkpointed · 9ead7bfb9 — feat(scan): read markdown into blocks and sections (9m)
