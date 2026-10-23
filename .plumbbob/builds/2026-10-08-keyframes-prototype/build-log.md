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

**Current step:** 10 — feat(init): write the template, snippet and docs
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
- ☐ 10. feat(init): write the template, snippet and docs
- ☐ 11. test(dogfood): give this repo its own plan
- ☐ 12. docs(pilots): run the pilots
- ☐ 13. chore(release): publish a 0.x for the pilots to install

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
- [ ] a ./ or doubled / in a pointer or Map path reads silently with no alternate-form note, unlike every other variant D9 lists
- [ ] item-line notes show the generic - **C3 (one-writer)**: … rather than the item's own ID and slug, which reads oddly on C1 and C2 in format.md's variants example

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
