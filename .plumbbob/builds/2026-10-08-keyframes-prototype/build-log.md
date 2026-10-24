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

**Current step:** 16 — chore(package): keep the pnpm engine out of the published package
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
- ☑ 6. feat(items): parse items and sub-lines
- ☑ 7. feat(cite): resolve citations and references
- ☑ 8. feat(repo): resolve pointers and Map paths
- ☑ 9. feat(report): count, budget, and render text and JSON
- ☑ 10. feat(init): write the template, snippet and docs
- ☑ 11. test(dogfood): give this repo its own plan
- ☑ 12. docs(pilots): add the record the pilots fill in
- ☑ 13. chore(release): publish a 0.x for the pilots to install
- ☑ 14. test(e2e): hold the first-plan and second-editor scenarios
- ☑ 15. docs(agents): give this repo's agents the keyframes snippet
- ☐ 16. chore(package): keep the pnpm engine out of the published package

## Park list

> Mid-step, every new problem / idea / "ooh what if" lands HERE, untouched, and you
> go straight back to the step. Acting the instant an idea arrives is the disease.
> Capture is one line (`/plumbbob:park` composes it). Harvest happens only at the boundary.

- [x] the CLI help still says exit 2 is 'a usage or read problem'; the spec now adds an internal problem (D13), so step 9's crash wiring should update the help line and its test
- [x] README.md and docs/archive/README.md still call docs/prototype.md 'the current plan', while AGENTS.md now names the plumbbob build as the plan and the spec as its reference
- [x] the spec's The report names `feat(report): count, budget, and render text and JSON` as the step that settles the item shape; when D15 splits step 9, point it at the piece that writes the schema
- [x] the spec's Appendix C draft still marks src/cli.ts and bin/keyframes.js (new), though step 2 built them; check would note built-not-new when step 11 runs it
- [x] step 6 will need Line, Section, SectionName and Finding re-exported from src/scan/index.ts, outside its seam: fallow rejects unused re-exports, so step 5's barrel exports only what its tests use; widen the seam when splitting step 6
- [x] a comment that starts a line and never closes hides the rest of the plan with no finding; the spec has unclosed-fence but no unclosed-comment
- [x] setext headings (a line of text over ---) render as h2 but the scanner reads only ## headings, so a setext Constraints heading is not a section; the pilots may show whether anyone writes them
- [x] an item line with no bullet (**C3 (x)**: … as a paragraph), or with its bullet indented one to three spaces, reads as prose with no finding
- [x] IDs, slugs and keys read only ASCII letters and digits, so a slug like (café) is malformed-item; a pilot writing in another language would show whether that bites
- [x] the spec's Variants table should list what steps 6 and 7 accept beyond it (other spacing in a sub-line, en and em dashes, a leading zero or a bare [D9] in a citation or reference), and Items should say a no-bold item needs its section's letter and an unknown key counts only in the usual shape
- [x] a ./ or doubled / in a pointer or Map path reads silently with no alternate-form note, unlike every other variant D9 lists
- [x] item-line notes show the generic - **C3 (one-writer)**: … rather than the item's own ID and slug, which reads oddly on C1 and C2 in format.md's variants example
- [x] S1 and S2 in keyframes.md point at e2e tests that don't exist yet (first-plan, second-editor), so both scenarios stay planned until someone writes them
- [x] AGENTS.md doesn't carry the keyframes snippet yet, so agents here aren't told to read keyframes.md, and its generated checkride block lists active checks without the new keyframes slot
- [x] package.json's engines.pnpm (>=9.0.0) ships to every consumer, though it constrains only this repo's development; move it to devEngines or packageManager so a pilot's yarn or pnpm doesn't warn
- [ ] keyframes.md's I6 (drafting-interview) stops mid-sentence at 'drafts a first plan from'; the spec's draft goes on 'existing notes, for a person to edit. Only after the pilots, since it would muddy H1', so a person should finish or cut it
- [ ] CLAUDE.md links to AGENTS.md as a markdown link rather than an @AGENTS.md import, so Claude Code sessions here never load the snippet (this session's context held CLAUDE.md but not AGENTS.md); docs/agents.md itself recommends the @AGENTS.md line
- [ ] the snippet's last line says to run keyframes check, which isn't on PATH in this repo; here pnpm check runs it as the keyframes slot, or node bin/keyframes.js check by hand

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

- 2026-10-23, at range 2 of 7's stop: 10 parked ideas, classified.
- **blocker**: park 1 · the CLI help still says exit 2 is 'a usage or read problem'; the spec now adds an internal problem (D13), so step 9's crash wiring should update the help line and its test → step 9's CLI piece should name the help line, or it ships saying exit 2 is only usage or read
- **tangent**: park 2 · README.md and docs/archive/README.md still call docs/prototype.md 'the current plan', while AGENTS.md now names the plumbbob build as the plan and the spec as its reference → two stale README lines, cheap to fix whenever a docs step next touches them
- **blocker**: park 3 · the spec's The report names `feat(report): count, budget, and render text and JSON` as the step that settles the item shape; when D15 splits step 9, point it at the piece that writes the schema → the spec names step 9 by its title, which the split replaces, so the split should repoint it
- **tangent**: park 4 · the spec's Appendix C draft still marks src/cli.ts and bin/keyframes.js (new), though step 2 built them; check would note built-not-new when step 11 runs it → step 11's person edits the draft anyway, and built-not-new names both lines when it runs
- **tangent**: park 5 · step 6 will need Line, Section, SectionName and Finding re-exported from src/scan/index.ts, outside its seam: fallow rejects unused re-exports, so step 5's barrel exports only what its tests use; widen the seam when splitting step 6 → step 6 did it, and its checkpoint named the stray
- **tangent**: park 6 · a comment that starts a line and never closes hides the rest of the plan with no finding; the spec has unclosed-fence but no unclosed-comment → a new finding code is a spec change the pilots can justify, and an unclosed comment is rare
- **tangent**: park 7 · setext headings (a line of text over ---) render as h2 but the scanner reads only ## headings, so a setext Constraints heading is not a section; the pilots may show whether anyone writes them → the pilots will show whether anyone writes setext headings
- **tangent**: park 8 · an item line with no bullet (**C3 (x)**: … as a paragraph), or with its bullet indented one to three spaces, reads as prose with no finding → the pilots will show whether anyone writes an item without its bullet at column 0
- **tangent**: park 9 · IDs, slugs and keys read only ASCII letters and digits, so a slug like (café) is malformed-item; a pilot writing in another language would show whether that bites → the pilots' non-TypeScript repo will show whether slugs want letters beyond ASCII
- **blocker**: park 10 · the spec's Variants table should list what steps 6 and 7 accept beyond it (other spacing in a sub-line, en and em dashes, a leading zero or a bare [D9] in a citation or reference), and Items should say a no-bold item needs its section's letter and an unknown key counts only in the usual shape → the spec is the living reference (D8), and step 10's docs are written from it
- 2026-10-23, at range 4 of 7's stop: 2 parked ideas, classified.
- **tangent**: park 11 · a ./ or doubled / in a pointer or Map path reads silently with no alternate-form note, unlike every other variant D9 lists → `check` reads these paths correctly, and whether `./` earns a note is a call for the pilots' variant review
- **tangent**: park 12 · item-line notes show the generic - **C3 (one-writer)**: … rather than the item's own ID and slug, which reads oddly on C1 and C2 in format.md's variants example → the messages are correct and pinned by tests, so the wording can wait for the pilots' finding review
- 2026-10-24, at the step 12 boundary: 3 parked ideas, classified.
- **blocker**: park 13 · S1 and S2 in keyframes.md point at e2e tests that don't exist yet (first-plan, second-editor), so both scenarios stay planned until someone writes them → the refine already folded it into the plan as step 14, which writes both e2e tests and drops S1's and S2's `(new)` markers
- **blocker**: park 14 · AGENTS.md doesn't carry the keyframes snippet yet, so agents here aren't told to read keyframes.md, and its generated checkride block lists active checks without the new keyframes slot → the refine already folded it into the plan as step 15, which adds the snippet to `AGENTS.md` and refreshes its checkride block
- **blocker**: park 15 · package.json's engines.pnpm (>=9.0.0) ships to every consumer, though it constrains only this repo's development; move it to devEngines or packageManager so a pilot's yarn or pnpm doesn't warn → the refine already folded it into the plan as step 16, which moves `engines.pnpm` out before the first publish

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
- 2026-10-23 — step 6 checkpointed · 6398818f1 — feat(items): parse items and sub-lines (1 drift, 8m)
- 2026-10-23 — step 7 checkpointed · 64bde75d8 — feat(cite): resolve citations and references (1 drift, 3m)
- 2026-10-23 — step 8 checkpointed · 1434dfce9 — feat(repo): resolve pointers and Map paths (5m)
- 2026-10-23 — range 2 of 7's stop recorded — review the parser (items, citations and the repo view) before the report builds on it, then split step 9 with `/plumbbob:step` into `check` with its counts and budgets, the two renderers, and the CLI wiring

  **Summary**: Range 2 built the three passes the report will stand on: items and sub-lines with every variant and finding (step 6), citations and references (step 7), and a read-only, exact-case repo view that resolves pointers and Map paths (step 8). The suite is at 280 tests, all green.

  1. Steps 6 and 7 each reached into the module before them, on purpose
  2. Step 6 was built whole, not split as D15 planned
  3. The error boundary rests on three calls the spec doesn't spell out
  4. Two shapes step 9 will rely on: notes group by message, and links join by line
  5. Exact case is proven on this disk, and a link out of the root is an escaping path

  **Readout**:

  ```text
  steps        3 of 3 landed
               - 6 6398818 · 7 64bde75 · 8 1434dfc
  check        green: 10 of 10 checks, 3 landings
  done-when    met
  decisions    bent: D15 (split-when-due), step 6 was built whole
               → the grant named steps 6-8, and a split renumbers them
  constraints  11 of 11 honored
  seam         strayed: 4 paths outside 2 steps' seams
               - step 6: src/scan/index.ts
               - step 7: src/items/id.ts and 2 others
  diff         +2850 -42 across 28 files
  spent        21 min · green first run at every landing · 2 drift warnings
  ```

  **Verdict**: ○ Out of plumb (decisions bent)

  **Harvested**: 10 of 10 parked ideas open

  - P1 · the CLI help still says exit 2 is 'a usage or read problem'; the spec now adds an internal problem (D13), so step 9's crash wiring should update the help line and its test → lean: blocker, step 9's CLI piece should name the help line, or it ships saying exit 2 is only usage or read
  - P2 · README.md and docs/archive/README.md still call docs/prototype.md 'the current plan', while AGENTS.md now names the plumbbob build as the plan and the spec as its reference → lean: tangent, two stale README lines, cheap to fix whenever a docs step next touches them
  - P3 · the spec's The report names `feat(report): count, budget, and render text and JSON` as the step that settles the item shape; when D15 splits step 9, point it at the piece that writes the schema → lean: blocker, the spec names step 9 by its title, which the split replaces, so the split should repoint it
  - P4 · the spec's Appendix C draft still marks src/cli.ts and bin/keyframes.js (new), though step 2 built them; check would note built-not-new when step 11 runs it → lean: tangent, step 11's person edits the draft anyway, and built-not-new names both lines when it runs
  - P5 · step 6 will need Line, Section, SectionName and Finding re-exported from src/scan/index.ts, outside its seam: fallow rejects unused re-exports, so step 5's barrel exports only what its tests use; widen the seam when splitting step 6 → lean: tangent, step 6 did it, and its checkpoint named the stray
  - P6 · a comment that starts a line and never closes hides the rest of the plan with no finding; the spec has unclosed-fence but no unclosed-comment → lean: tangent, a new finding code is a spec change the pilots can justify, and an unclosed comment is rare
  - P7 · setext headings (a line of text over ---) render as h2 but the scanner reads only ## headings, so a setext Constraints heading is not a section; the pilots may show whether anyone writes them → lean: tangent, the pilots will show whether anyone writes setext headings
  - P8 · an item line with no bullet (**C3 (x)**: … as a paragraph), or with its bullet indented one to three spaces, reads as prose with no finding → lean: tangent, the pilots will show whether anyone writes an item without its bullet at column 0
  - P9 · IDs, slugs and keys read only ASCII letters and digits, so a slug like (café) is malformed-item; a pilot writing in another language would show whether that bites → lean: tangent, the pilots' non-TypeScript repo will show whether slugs want letters beyond ASCII
  - P10 · the spec's Variants table should list what steps 6 and 7 accept beyond it (other spacing in a sub-line, en and em dashes, a leading zero or a bare [D9] in a citation or reference), and Items should say a no-bold item needs its section's letter and an unknown key counts only in the usual shape → lean: blocker, the spec is the living reference (D8), and step 10's docs are written from it

  **Recommendation**: Take every lean, then split step 9 as the stop asks, folding P1 and P3 into its pieces and P10 into step 10's done-when. The parser hands the report what it needs (items in their usual form, findings by line, notes that group by message, links by item line), and the three blockers are wording that would otherwise ship stale.

  **1.** Steps 6 and 7 each reached into the module before them, on purpose

  Both landed "a hair off" for a seam stray, and both strays are the same kind of move. Step 6 widened `src/scan/index.ts` by three type exports (`Finding`, `Line`, `SectionName`). The `no-deep-sibling-import` rule only lets `src/items/` import through that barrel, which is exactly what P5 predicted. Step 7 moved the ID and slug grammar (`readId`, `readSlug`) out of `src/items/item-line.ts` into a new `src/items/id.ts` and exported it from the items barrel. That way `[C03 (one writer)]` in a citation and `- **C03 (one writer)**:` in an item read the same way, with the same notes, instead of from two copies that could drift apart. Step 8 stayed inside its seam.

  **2.** Step 6 was built whole, not split as D15 planned

  D15 says step 6 gets split with `/plumbbob:step` just before it's built, and range 1's stop asked for that split, but the plan still had one step 6 when this run began. The grant named steps 6-8. A split would have renumbered the pieces out of it, so I built step 6 whole rather than stop the run. D15 wanted each piece to review in one pass, and the tests keep that shape: `src/items/__tests__/items.test.ts` groups items and sub-lines, then the findings, then the variants. The variants table ends the file and can be read on its own. Step 9's split is still ahead, and the stop asks for it.

  **3.** The error boundary rests on three calls the spec doesn't spell out

  Each one keeps ordinary prose from failing a run (D10), and each is a place to look first:

  - **A no-bold item needs its section's letter.** `- C3 (one-writer): …` under Constraints is the spec's no-bold variant. `- S3 (uploads): holds files` under Map reads two ways, so it's `not-an-item`, a warning, rather than `wrong-letter`, an error. With bold, a wrong letter is still `wrong-letter`.
  - **An unknown key counts only in the usual shape:** a `-` bullet two to five spaces in, a lowercase key, then a colon and a space. So `- because:` typos like `- why:` warn as `unknown-key`, while nested prose such as `- Pros: fast` or `- http://localhost` stays prose. Known keys still read in any case and in every variant.
  - **A bare `[S3]` is a citation only while S3 exists.** Otherwise it's plain text, so a markdown reference link never fails a run. `[S3 (slug)]` with no S3 is `broken-citation`.

  P10 proposes writing these into the spec, along with the few variants accepted beyond its table.

  **4.** Two shapes step 9 will rely on: notes group by message, and links join by line

  Every `alternate-form` note has one message per kind of variant, the same on every line, such as `"*" bullets read fine; the usual form is "-"`. So the text report can group notes by message to print the spec's `(lines 12, 19, 27)`. The exceptions quote the item's own slug, where the slug is the news: a bare `[C3]` and a citation spacing note. `resolvePointers` returns one `Links` per item, by item line. Each holds `heldBy` and `status` for Constraints and Scenarios, and `paths` for Map parts, ready to join onto the JSON's `items`. Item status (linked, planned, review, unlinked, broken) is computed there, so step 9 only counts it.

  **5.** Exact case is proven on this disk, and a link out of the root is an escaping path

  Both repos find each path segment among its parent's directory entries before looking at the path. So `file:docs/guide.txt` is broken against the committed tree `test/fixtures/repos/tree/Docs/Guide.txt`, even though this Mac's disk would open it (D16). With `..` and absolute paths already errors, a path can only resolve outside the root through a link. The disk repo follows links with `realpath` and reports one that leaves the root, and the pointer or path is `bad-pointer`, tested against links made in a temp dir. One judgment call: `file-too-large` fires only when a pointer would search the file's text. A plain `file:big.log` just needs the file to exist.

- 2026-10-23 — step 9 checkpointed · 724989ece — feat(report): count, budget, and render text and JSON (1 drift, 22m)
- 2026-10-23 — range 3 of 7's stop recorded — read the text and JSON reports and every finding's message before the docs quote them

  **Summary**: Range 3 built the report and wired up `keyframes check`. `check(plan, repo)` counts each section, applies the budgets, and sorts the findings. Two renderers turn that into the text report and the JSON report, and `schema/report.schema.json` describes the JSON and ships in the package. The command has exit codes 0, 1 and 2, honors `--strict`, finds the plan in any case, and turns any unexpected error into one line with exit 2. Golden reports for two real trees pin both outputs, and the suite is at 354 tests, all green.

  1. Two paths sit outside the seam, both on purpose
  2. The golden reports are the read this stop asks for
  3. Calls the spec left open, now written into it
  4. An unexpected error is one line and exit 2, even after `run` returns
  5. Determinism and the schema are each checked two ways

  **Readout**:

  ```text
  steps        1 of 1 landed
               - 9 724989e
  check        green: 10 of 10 checks, 1 landing
  done-when    met
  decisions    honored
               - D9 (easy-to-get-right), D11 (json-carries-items)
               - D13 (crash-exits-2), D16 (local-proof), D17 (any-case-plan)
  constraints  11 of 11 honored
  seam         strayed: 14 paths outside step 9's seam
               - src/cite/index.ts
               - src/cite/references.ts
               - test/fixtures/golden/clean.json
               - test/fixtures/golden/clean.txt
               - test/fixtures/golden/clean/keyframes.md
               - test/fixtures/golden/clean/src/api/handler.ts
               - test/fixtures/golden/clean/src/sync/worker.ts
               - test/fixtures/golden/clean/test/offline.test.ts
               - test/fixtures/golden/clean/test/writes.test.ts
               - test/fixtures/golden/findings.json
               - test/fixtures/golden/findings.txt
               - test/fixtures/golden/findings/keyframes.md
               - test/fixtures/golden/findings/src/api/handler.ts
               - test/fixtures/golden/findings/test/writes.test.ts
  diff         +2799 -38 across 35 files
  spent        22 min · green first run at every landing · 1 drift warning
  ```

  **Verdict**: ◐ A hair off (seam strayed)

  **Recommendation**: Read `test/fixtures/golden/findings.txt` first, then `clean.txt` and `findings.json`, looking hardest at the calls in highlight 3 and the quoting in highlight 2, then approve and type the next run. Step 10's template and docs will quote these messages and this report shape word for word, so a change now touches only the renderers, the golden files and the tests that pin them.

  **1.** Two paths sit outside the seam, both on purpose

  `src/cite/` now exports `referenceId`. The JSON's `superseded_by` and `resolved_by` must carry the decision's ID in its usual form (`[D2 (sqlite)]` is written as `D2`), and the only grammar for a reference lives in `src/cite/references.ts`. I moved its parse into one `readReference` that both the finding and the export use, rather than copy the regex into `src/check/`. Step 7 avoided the same kind of second copy for IDs and slugs.

  The golden trees and their reports live in `test/fixtures/golden/`: `clean/` and `findings/`, each a small repo with a `keyframes.md`, beside `clean.txt`, `clean.json`, `findings.txt` and `findings.json`. They can't go in `test/integration/`, which is in the seam, because markdownlint and the links check read every `.md` outside `test/fixtures/`, and the findings plan is broken on purpose. Those 12 files and the two in `src/cite/` are the 14 paths the seam row names.

  **2.** The golden reports are the read this stop asks for

  `test/fixtures/golden/findings.txt` has 24 of the 25 finding codes in one report, so every message can be read in one place. The missing code is `file-too-large`, which needs a file over 1 MiB. The step 8 tests cover it in memory, with the message `file:<path>#"<text>" points at a file over 1 MiB, so its text isn't searched; point at a smaller file`. `clean.txt` shows every count row with nothing to report, and the two `.json` files are the same reports as JSON.

  One thing to look for as you read: messages quote things in one of two ways. Text quoted as written, which `check` couldn't read or is pointing at, goes in double quotes (`"## Intent"`, `"test:signing"`, `"why:"`). Things shown in their usual form go bare: pointers, paths, IDs and citations (`file:test/worker.test.ts`, `src/jobs/`, `[D1 (sqlite-only)]`). The one exception is a citation, which is quoted as written but bare. If you'd rather have one rule, this is the cheapest moment to change it, before step 10's docs quote the messages.

  **3.** Calls the spec left open, now written into it

  These settle how the report reads, and `docs/prototype.md` now says each one:

  - **`intent` always shows**, as `yes` or `no`, so a plan with no sections still reports something above `words`. Every other absent section is left out, and so is any count of zero after a row's first (`ideas  2 · 2 open`, with no `0 resolved`). One of a thing is singular: `map  1 part · 1 path`.
  - **A word is any run of non-whitespace, markup included**, as the spec literally says. So `- **C3 (one-writer)**:` costs three words of the 2000, and inline code, fenced code and comments cost none. The pilots may want markup left out.
  - **Budgets land on a line.** The whole file's breach goes on line 1, an item's on its own line, and a section's on its heading. A section counts its items by their letter, wherever they sit, which matches the JSON's `section`. So the message says `the plan has 9 principles; the budget is 7`, not that the heading holds nine.
  - **A plan named in another case**, such as `KEYFRAMES.md`, is reported under that name, with its note on line 1. That settles the loose end left when the plan was approved. Two spellings side by side exit 2, which only an in-memory repo can show, since this disk can't hold both (D16).

  **4.** An unexpected error is one line and exit 2, even after `run` returns

  `run` now wraps every command, so a throw anywhere prints `keyframes: <message>` on one line and returns 2. `--help` now says `2  a usage or read problem, or an unexpected error`.

  While testing that, I found a way past it. When `keyframes check | head` closes stdout on a report bigger than a pipe holds, node raises EPIPE after `run` has already returned. The bin then died with a stack trace and exit 1, on a plan with no errors at all, which breaks D13's rule that 1 only ever means errors. `bin/keyframes.js` now handles errors on its own streams: a stdout failure prints `keyframes: write EPIPE` and exits 2. An e2e test reproduces it with a 2000-item plan, and it fails if the handler is removed.

  **5.** Determinism and the schema are each checked two ways

  The test titled "byte-identical" runs `check` on the findings tree from three working directories: inside the tree, from the repo root with a relative path, and from a temp dir with an absolute path. It also checks a copy of the tree in another place, since an absolute path would be the same for every working directory that checks one tree. Its text and JSON bytes must match exactly. I also broke it on purpose by putting the root's path in the output, and it failed. A second test shows the same plan with CRLF, a BOM and tabs gives the same bytes. The bin's e2e test runs both golden trees from two working directories against the committed reports.

  The schema validates through a small validator, about 100 lines inside `test/integration/report-schema.test.ts`, rather than a new dev dependency such as ajv. It reads only the keywords the schema uses and refuses any other, so the schema can't lean on one it would skip. It's also stricter than JSON Schema on purpose: a field the report writes but the schema doesn't declare fails the test. The shipped schema stays open, so a reader of a later report can ignore fields it doesn't know. Seven broken reports show the validator rejects what it should, and one more test checks that the schema's list of codes matches the spec's Findings table. If you'd rather lean on ajv, it's a dev-only swap.

- 2026-10-23 — step 10 checkpointed · 9c761b56f — feat(init): write the template, snippet and docs (1 drift, <1m)
- 2026-10-23 — range 4 of 7's stop recorded — read the template, `docs/format.md` and `docs/agents.md` the way a newcomer would, before this repo writes its own plan

  **Summary**: Range 4 built `keyframes init` and the docs people learn the format from. `keyframes init [dir]` writes the template as `keyframes.md`, titled with the directory's name, then prints the agent snippet under one line saying where to paste it. It refuses with exit 2 when a plan is already there in any case, writing nothing, and the test titled "fresh template" shows `check` on its output finds exactly `no-intent`. `docs/format.md` teaches the format to people, and `docs/agents.md` gives the snippet and where it goes. The spec's Variants table now lists every variant `check` reads, and its Items section says what stays prose. A new test checks every example plan in the docs, and the suite is at 382 tests, all green.

  1. One test sits outside the seam, where the layout rules put it
  2. Every example in the docs is checked, and every report they show is pinned
  3. Where a newcomer might trip, for this stop's read
  4. The spec now lists every variant check reads, and what stays prose
  5. init refuses any plan check would find, and leaves other failures to the one-line error

  **Readout**:

  ```text
  steps        1 of 1 landed
               - 10 9c761b5
  check        green: 10 of 10 checks, 1 landing
  done-when    met
  decisions    honored
               - D8 (spec-stays-live), D9 (easy-to-get-right)
               - D13 (crash-exits-2), D17 (any-case-plan)
               - D19 (prose-stays-prose)
  constraints  11 of 11 honored
  seam         strayed: 1 path outside step 10's seam
               → test/integration/docs.test.ts
  diff         +1103 -37 across 11 files
  spent        50s · green first run at every landing · 1 drift warning
  ```

  **Verdict**: ◐ A hair off (seam strayed)

  **Harvested**: 2 of 12 parked ideas open

  - P11 · a ./ or doubled / in a pointer or Map path reads silently with no alternate-form note, unlike every other variant D9 lists → lean: tangent, `check` reads these paths correctly, and whether `./` earns a note is a call for the pilots' variant review
  - P12 · item-line notes show the generic - **C3 (one-writer)**: … rather than the item's own ID and slug, which reads oddly on C1 and C2 in format.md's variants example → lean: tangent, the messages are correct and pinned by tests, so the wording can wait for the pilots' finding review

  **Recommendation**: Read `docs/format.md` top to bottom as a newcomer, then `docs/agents.md`, then run `node bin/keyframes.js init` on a scratch directory and check it, checking the harness table hardest; take both parks as tangents, and type the next run. Step 11's plan is the first one written from these docs, so a confusing passage is cheapest to fix now, and the tests pin every example and report, so an edit can't quietly drift from what `check` says.

  **1.** One test sits outside the seam, where the layout rules put it

  `test/integration/docs.test.ts` is the one path the seam row names. It checks the docs against `init` and `check` together, so it spans modules, and C10 (repo-layout) puts a test like that in `test/integration/`, not in a module's `__tests__/`. Every other change is inside the seam.

  One slip in the record: I wrote the code before running `plumbbob build 10`, and entered the step just before the checkpoint. Nothing in the diff depends on it, but the step's recorded start time is late, so its `spent` reads shorter than the work took.

  **2.** Every example in the docs is checked, and every report they show is pinned

  Each markdown block in the docs is either the agent snippet, word for word, or an example plan with a comment above it saying what `check` finds there, such as `<!-- check: clean -->` or `<!-- check: no-intent, 8 alternate-form -->`. The comment is invisible when the docs render. The test runs `check` on each example against a small in-memory repo holding the files they point at, and fails on any block without a comment, so a new example can't slip past.

  `docs/format.md` also shows three reports: the small plan's, the variants example's, and a plan with mistakes. Each must be byte for byte what `check` prints. The test also keeps three tables equal to the spec's (the sections, the variants and the finding codes with their severities), and checks that the spec's Appendix A and B are what `init` writes and prints. In `src/init/`, a second test opens the template's comments and checks its examples clean, so every example in it is safe to copy. I broke a doc example, a table row, a comment and a template path on purpose, one at a time, and each one failed a test.

  **3.** Where a newcomer might trip, for this stop's read

  - **The variants report says `8 notes` over seven note lines.** Notes of one kind share a line, as in `(lines 3, 4)`, and the summary counts each note. That's how step 9 settled it, and the spec's own example does the same, but it's the first thing a newcomer might count.
  - **Each item-line note shows the usual form with C3's ID and slug**, as `- **C3 (one-writer)**: …`, even on C1 and C2. I parked that as P12.
  - **The harness table in `docs/agents.md` is from memory.** It lists `AGENTS.md` (Codex, Cursor, Amp), `CLAUDE.md` with an `@AGENTS.md` import (Claude Code), `GEMINI.md` (Gemini CLI), `.github/copilot-instructions.md` (GitHub Copilot) and a `--read` conventions file (Aider). It says these are examples and that each agent's docs have the final word. Check it against the agents you actually use.
  - **The template is the spec's Appendix A, unchanged.** `node bin/keyframes.js init <a scratch dir>` shows it the way an owner first sees it. Checking it right after lists all eight itemized sections at 0 (`principles    0`, `map           0 parts`, …) above the one `no-intent` warning, since the sections are there but empty. That's the first report every owner reads.

  **4.** The spec now lists every variant check reads, and what stays prose

  The Variants table gained an ID row (leading zeros, wherever an ID is written), the en and em dashes after the bold, "nothing when there's a slug", other spacing in a sub-line, and `[D9]` as a reference. A no-bold item line counts only under its own section. The rows now follow the order a plan is read in: file, heading, item line, ID, slug, sub-line, citation, reference.

  Items has a new list of what stays prose (D19): a no-bold item line under another letter's section, bold with no slug and no colon, nested bullets not shaped like a key (`- Pros: fast`), and `[S3]` when there's no S3. Pointers now says `./` and doubled slashes are dropped without a note, which is what `check` does. I parked whether they should get a note as P11, since that's the only silent form besides case and backticks.

  **5.** init refuses any plan check would find, and leaves other failures to the one-line error

  `init` lists the root's names and refuses on any spelling of `keyframes.md`, so it never writes a second plan beside `KEYFRAMES.md`, which `check` would then refuse to read (D17). It also writes with the `wx` flag, so a plan that appears between the listing and the write still isn't overwritten. A missing directory or a file given as the directory exits 2 with the same message `check` gives, now that both commands share one root lookup in `src/cli.ts`. Any other failure, such as a read-only directory, goes through the one-line error and exits 2 (D13).

- 2026-10-23 — step 11 checkpointed · f33be3963 — test(dogfood): give this repo its own plan (6m)

  **Summary**: `keyframes.md` now sits at the repo root. It's the spec's Appendix C draft with only the fixes `check` and the docs lint asked for. A new `keyframes` slot in the gate runs `node bin/keyframes.js check --strict` last, after the `types` slot's `tsc --build` writes `dist/`, and the whole gate is green. At the pause, the owner approved it as it stood, without the candidate lines in highlight 3, so it lands as the draft plus those fixes.

  1. The plan is the spec's draft, changed only where check or the lint asked
  2. The new slot runs after the build that makes dist/, and it fails on a single warning
  3. The draft predates five decisions and a constraint the build settled, and I left them for you
  4. A few draft lines are judgment calls worth a second look
  5. Two tangents parked, both outside this step's seam

  **Readout**:

  ```text
  check        green: 11 of 11 checks
  done-when    met
  decisions    1 of 1 honored
  constraints  11 of 11 honored
  seam         held: 2 of 2 declared, no strays
  diff         +125 -0 across 2 files
  spent        6 min · 1 turn · 8s gate · green first run
  ```

  **Verdict**: ● Plumb

  **Recommendation**: Edit `keyframes.md` yourself: read every line, take or cut the candidates in highlight 3, settle the D3 wording, then run `node bin/keyframes.js check --strict` and say looks good. The stop reserves this file for a person because P1 says agents propose and a person accepts, and the gate slot will hold whatever you write to the same standard from here on.

  **1.** The plan is the spec's draft, changed only where check or the lint asked

  The tool's first run on its own draft gave 12 `built-not-new` warnings, one for each `(new)` target that exists now: the ten Map paths and the pointers on C2 and C4. I dropped those markers. S1 and S2 keep theirs, since `test/e2e/first-plan.test.ts` and `test/e2e/second-editor.test.ts` don't exist yet, so both read as planned, which `--strict` allows.

  The docs slot then failed: markdownlint read the `__tests__` in C4's pointer as bold (MD050). I wrapped that one pointer in backticks, which the spec says `check` ignores, and the JSON report shows C4 still `linked`. Every other line is the draft word for word. The report reads: 5 principles, 5 parts and 10 paths, 5 constraints (3 linked, 1 review, 1 unlinked), 3 scenarios (2 planned, 1 review), 7 decisions, 3 taste, 3 questions (2 open), 6 ideas, 960 of 2000 words, no findings.

  **2.** The new slot runs after the build that makes dist/, and it fails on a single warning

  `bin/keyframes.js` imports `../dist/cli.js`, so the slot has to wait for `types`. A custom check with no `order` would share the first wave with `types` and race it, so the entry sets `"order": "last"`, which checkride runs as its own wave after a barrier. To prove it, I deleted `dist/` and `tsconfig.tsbuildinfo` and ran the whole gate: `types` rebuilt `dist/`, and `keyframes` ran after every other slot and passed. Then I put one `(new)` back on `src/repo/`, and `checkride --only keyframes` went red on that single warning, which shows `--strict` is in effect. I restored the file, and the full gate is green (11 checks). `checkride doctor` lists the slot as `custom:keyframes`, installed.

  One caveat: a narrowed run like `--only keyframes` skips `types`, so it checks whatever `dist/` is already there. The full gate and the stop hook both run `types` first.

  **3.** The draft predates five decisions and a constraint the build settled, and I left them for you

  The spec's draft was written before refine and the build settled D10, D11, D13, D17 and D19 in `intent.md`. Those are about the product, not this build, and the draft carries none of them. (D9 is already P5.) Since the stop reserves every line for you, I didn't add them. Instead I drafted them in the plan's format and checked them in a scratch copy of the repo: still no findings, C6 linked, 12 decisions and 1178 of 2000 words. To take any of them, paste it in, the decisions after D7 and C6 after C5:

  ```markdown
  - **C6 (exit-codes)**: Commands return their exit code, and only the bin sets it: 0 for no
    errors, 1 for errors or any warning under `--strict`, and 2 when no verdict was reached.
    - held-by: file:rules/no-process-exit.yml#"id: no-process-exit"

  - **D8 (errors-for-unclear)**: Errors are for what's unclear or broken. A bullet is
    `malformed-item` only when it starts like an item and still can't be read.
    - because: ordinary bold text such as `- **C4 model**: …` must never fail a run.
  - **D9 (crash-exits-2)**: An unexpected error prints one line, `keyframes: <message>`, and
    exits 2.
    - because: 1 must only ever mean the plan has errors, and 2 already means no verdict was
      reached.
  - **D10 (any-case-plan)**: `check` finds the plan in any case, with a note for any name but
    `keyframes.md`. `init` still writes `keyframes.md`.
    - because: the plan sits beside `AGENTS.md` and `README.md`, where people reach for capitals.
  - **D11 (json-carries-items)**: `--json` carries every item in its usual form, with its text,
    sub-lines and results.
    - because: a harness can then hand an agent the items that touch its work without parsing
      markdown.
  - **D12 (prose-stays-prose)**: A line that could mean two things stays prose. A no-bold item
    line counts only under its own section, and a bare `[C3]` is a citation only while C3 exists.
    - because: `- S3 (uploads): …` in the Map and a markdown link like `[S3]` are ordinary prose.
  ```

  I left out the build's process decisions on purpose: D8 (spec-stays-live), D14 (npm-for-pilots), D15 (split-when-due), D16 (local-proof) and D18 (recruit-early). D12 (lenient-cli) is a smaller call, and it could join D11 if you want the command line's forgiveness on record.

  **4.** A few draft lines are judgment calls worth a second look

  - **D3 (file-pointers)** says `held-by:` "has one pointer kind, `file:`", yet C3 and S3 are held by `review`. That matches the spec's Pointers section, but a newcomer could read it as a contradiction. Something like "one pointer kind, `file:`, beside `review`" would close the gap.
  - **C3 (no-runtime-deps)** is held by `review`. `rules/node-builtins-only.yml` holds only the `src/` imports half of it, not `package.json`, so `review` is the honest pointer unless you add a test over `package.json`.
  - **C5 (stands-alone)** is unlinked, which counts but never warns (D5).
  - **S1 and S2** stay planned until someone writes their e2e tests (parked as P13).
  - **Q2, Q3 and Ideas I1 to I6** are as the spec wrote them on 2026-10-04 and since. Check that each is still open, and still something you'd want considered.

  **5.** Two tangents parked, both outside this step's seam

  P13 is the two missing e2e tests behind S1 and S2. P14 is `AGENTS.md`: it doesn't carry the keyframes snippet yet, so agents in this repo aren't told to read `keyframes.md`, and its generated checkride block still lists the active checks without `keyframes`. Both are for a later boundary.

- 2026-10-23 — step 13 checkpointed · fdc91301f — chore(release): publish a 0.x for the pilots to install (1 red, 565m)

  **Summary**: The package is ready to publish: `prepack` deletes `dist/` and rebuilds it before every pack, the tarball holds only `bin/`, `dist/`, `schema/` and the package's own files, `publishConfig` makes the scoped package public, and the packed tarball prints its version through `npx` from an empty directory. Publishing to npm takes your account, so that part is yours.

  1. The publish is yours once this step lands, and I'd release 0.2.0 rather than the 0.1.1 in `package.json`
  2. `prepack` deletes `dist/` and rebuilds it with `--force`, since a plain `tsc --build` leaves an emptied `dist/` empty
  3. The pack lists 169 files, all under `bin/`, `dist/` and `schema/`, plus `LICENSE`, `README.md` and `package.json`
  4. `publishConfig` makes the scoped package public, and `npm publish --dry-run` confirms it
  5. The packed tarball runs through `npx` from an empty directory

  **Readout**:

  ```text
  check        green: 11 of 11 checks
  done-when    not met: the public 0.x waits on your publish
               → the empty-directory npx run used the packed tarball
  decisions    1 of 1 honored
  constraints  11 of 11 honored
  seam         held: 2 of 3 declared, no strays
  diff         +15 -4 across 2 files
  spent        9h 25m · 2 turns · 6s gate · 1 red run
  ```

  **Verdict**: ○ Out of plumb (done-when not met)

  **Recommendation**: Say `looks good` to land the packaging. Then run `git stash push -- .plumbbob`, `/version minor`, `git stash pop`, `npm publish`, and finally `npx @robmclarty/keyframes --version` from an empty directory. `/version` refuses a dirty tree, and only the checkpoint can commit this step's work, so the release has to come after the landing. Stashing the record around it keeps the `v0.2.0` tag to exactly the packaging npm serves.

  **1.** The publish is yours once this step lands, and I'd release 0.2.0 rather than the 0.1.1 in `package.json`

  npm has no versions of `@robmclarty/keyframes` yet (`npm view` returns 404). `v0.1.1` is already tagged at `98c97f0`, a commit with no CLI, and its changelog entry says "The `keyframes` CLI itself isn't built yet". Publishing 0.1.1 now would put a working CLI under a tag and notes that say it doesn't exist. A minor bump gives the first public release a version, tag and changelog entry of its own.

  My first recommendation was to release at this pause, before the checkpoint. That can't work: `/version minor` refused, because its engine won't bump a dirty tree, and only the checkpoint may commit this step's `package.json` and `.claude/version.md`. A checkpoint also leaves plumbbob's record (`checkpoints`, `stats.json`, `intent.md`, `build-log.md`) modified until the next one, so `/version` will refuse again right after the landing unless that record is stashed. The order that works: say `looks good` to land the packaging, then `git stash push -- .plumbbob`, `/version minor`, `git stash pop`. The `v0.2.0` tag then holds exactly the packaging npm serves. Then run `npm publish` from your logged-in account and `npx @robmclarty/keyframes --version` from an empty directory, which should print `0.2.0`. The done-when's publish and registry `npx` clauses are met just after the step lands rather than before. `.claude/version.md` now lists the publish steps for every later release. Say so if you want the stash note added there before the step lands. `.claude/version.json` is unchanged, because a tag push still publishes nothing, so `publish.confirm` stays false.

  **2.** `prepack` deletes `dist/` and rebuilds it with `--force`, since a plain `tsc --build` leaves an emptied `dist/` empty

  I tested the obvious script first: with `dist/` moved away, `tsc --build` emitted nothing, because the root `tsconfig.tsbuildinfo` (where `composite` puts it, beside `rootDir: ./src`) still said every output was up to date. A pack after deleting `dist/` would have shipped a package without its CLI. The script is now `node --eval "require('node:fs').rmSync('dist', …)" && tsc --build --force`. Removing the folder clears outputs from deleted sources, `--force` ignores the stale build info, and `node --eval` runs on any OS where `rm -rf` wouldn't. To prove it, I planted `dist/stale.js` and ran `npm pack --dry-run`. The stale file was gone, and the rebuilt `dist/` matched the old one file for file.

  **3.** The pack lists 169 files, all under `bin/`, `dist/` and `schema/`, plus `LICENSE`, `README.md` and `package.json`

  The existing `files` list and its `!dist/**/*.test.*` line already keep the compiled tests out (zero `__tests__` paths in the list), so it needed no change. One thing does ship that shouldn't: `engines.pnpm` (`>=9.0.0`) constrains only this repo's development, but it goes to every consumer. `npx` ignores it, so it doesn't block the pilots, and I parked it (P15) rather than widen the step.

  **4.** `publishConfig` makes the scoped package public, and `npm publish --dry-run` confirms it

  npm publishes a scoped package as restricted by default, and on a free account that fails unless you pass `--access public`. With `publishConfig.access` set, a bare `npm publish` is enough, and the dry run printed `Publishing to https://registry.npmjs.org/ with tag latest and public access`.

  **5.** The packed tarball runs through `npx` from an empty directory

  `npm pack` wrote the tarball to a temp folder, and `npx --package=<tarball> keyframes --version` printed `0.1.1` and exited 0 from an empty directory. `keyframes check` there exited 2 with its "no keyframes.md" line, and the directory stayed empty. This is the done-when's last clause run against the tarball. The registry form, `npx @robmclarty/keyframes --version`, can only run after you publish.

- 2026-10-24 — step 12 checkpointed · 8ff42cab9 — docs(pilots): add the record the pilots fill in (648m)

  **Summary**: `docs/pilots.md` is the record the pilots fill in. It has a table for the repos and their readers, a results table for H1 to H4, one record to copy per pilot, the questions the build left for the pilots, and the closing call as a table with one row for every section, pointer form, variant, finding and budget the spec lists. Every cell is empty until a pilot runs, and the file says so on its first line.

  1. The file is a blank record, since every result in it belongs to a pilot owner
  2. The closing call is a table with one row per thing the spec says to keep, change or cut
  3. The nine questions the build left for the pilots now sit where the pilots will read them
  4. The file's publish line names no version, so it stays true once the first release is a patch

  **Readout**:

  ```text
  check        green: 11 of 11 checks
  done-when    met
  decisions    1 of 1 honored
  constraints  11 of 11 honored
  seam         held: 1 of 1 declared, no strays
  diff         +222 -0 across 1 file
  spent        10h 48m · 4 turns · 9s gate · green first run
  ```

  **Verdict**: ◐ A hair off (1 commit outside the ledger)

  **Recommendation**: Say `looks good` to land the record, then type `/plumbbob:run` for steps 14 to 16. The stop asks you to read the file the way a pilot owner would, and its first table is the one to fill in when you line up the repos. Nothing else in it needs a person until a pilot starts.

  **1.** The file is a blank record, since every result in it belongs to a pilot owner

  Under `~/Projects`, the only `keyframes.md` is this repo's own, and nothing records which repos or second readers were lined up. Every result is the owner's: their timing, their second reader's three sentences, their four tasks, and their triage of each finding. So each cell is empty, and each pilot's heading reads "Not run." The refine you approved moved the pilots out of this build, and step 12's done-when now asks for the record, not the results.

  **2.** The closing call is a table with one row per thing the spec says to keep, change or cut

  The file lists:

  - the 9 sections;
  - 4 pointer forms, with `(new)` counted as one;
  - the 8 rows of the Variants table;
  - all 25 finding codes, with their severities;
  - the 6 budgets, which the spec calls starting values for the pilots to tune.

  I diffed the finding codes against the ones `src/` emits, and the two lists match exactly. The protocol stays in the spec (D8 (spec-stays-live)). This file links to it and carries only what a pilot fills in.

  **3.** The nine questions the build left for the pilots now sit where the pilots will read them

  Several parks were harvested as tangents because "the pilots will show". That reason lived only in the build log, so the file's "What to watch for" list asks each one as a question an owner can answer:

  - whether an unlinked constraint should warn;
  - whether any plan hits the 2000-word budget;
  - whether markup counts as words;
  - setext headings;
  - items with no bullet, or an indented one;
  - slugs beyond ASCII;
  - whether `./` in a path needs a note;
  - the wording of item-line notes;
  - unclosed comments.

  I left out the park handles, since `P7` reads as a Principle in a keyframes doc.

  **4.** The file's publish line names no version, so it stays true once the first release is a patch

  npm still returns 404 for `@robmclarty/keyframes`. `v0.2.0` is tagged on origin, and step 16 changes `package.json` after that tag, so the first version on npm will be a patch at range 8's stop. The file's first prerequisite now says to publish a 0.x and run `npx @robmclarty/keyframes --version` from an empty directory, without naming a version that would go stale.

- 2026-10-24 — step 14 checkpointed · 65e4ac8d5 — test(e2e): hold the first-plan and second-editor scenarios (1 drift, 6m)
- 2026-10-24 — step 15 checkpointed · 8fd4857c6 — docs(agents): give this repo's agents the keyframes snippet (3m)
