# keyframes prototype

**Phase** (your own bookkeeping while framing): plan
**Size:** medium
**Scope:** prototype

*Source: [`docs/prototype.md`](../../../docs/prototype.md) as of `789f1bc`, absorbed 2026-10-08. The spec stays the living reference for the format and the tool ([D8 (spec-stays-live)](#d8)), so this plan cites its sections instead of copying them.*

## Frame

- **Problem:** Every project carries intent that never gets written down in one place: why it exists, what matters, what must hold, how it should feel. It lives in people's heads, chat threads, PR comments and stale READMEs, so new people piece it together slowly, and agents see none of it unless someone pastes it into a prompt.
- **Smallest thing that solves it:** One markdown file, `keyframes.md`, where people write that intent as prose (Intent) and short ID'd items (Principles, Map, Constraints, Scenarios, Decisions, Taste, Questions, Ideas); a snippet that tells agents to read it, cite it and stop before crossing a constraint; and a small CLI, `keyframes init` and `keyframes check`, that keeps the file consistent and checks what can be checked, the same way every time. When goals conflict, the earlier one wins: easy to express, easy for a second person to extend, guiding for agents, deterministically checked.
- **Done looks like:** `keyframes init` and `keyframes check` work in any repo, in any language, with no config; this repo has its own `keyframes.md`, checked in its own gate; and three pilot repos have plans written by their owners, with the findings and a decision on what to build next in `docs/pilots.md`. The pilots test four hypotheses ([the spec's table](../../../docs/prototype.md#what-the-prototype-tests)): a plan is quick to write (H1), quick for a second person to read and extend (H2), changes what agents do (H3), and its findings are mostly worth knowing (H4).
- **Explicitly NOT doing:** checking the Map against the code; running anything (tests, linters, subprocesses, network calls, LLMs); knowing about any other tool, harness, language or CI system beyond plain-text snippets; a folder form, a config file, a formatter or auto-fix; parsing Mermaid; scanning code, commits or PRs for citations; reading git history.

## Architecture sketch

```text
bin/keyframes.js ──► src/cli.ts       parses the command line, returns the exit code
                        │
          ┌─────────────┴───────────────┐
          ▼                             ▼
     init (src/init/)            check(plan, repo) (src/check/)
     the only writer             pure: no writes, clock, network or processes
                                        │
          ┌────────────┬────────────────┼────────────────┐
          ▼            ▼                ▼                ▼
     scan          items            cite             report ──► text, or JSON
     src/scan/     src/items/       src/cite/        src/report/   (schema/report.schema.json)
     blocks,       items,           citations,       counts, budgets,
     sections      sub-lines,       references       findings
                   variants
                                        ▲
     repo (src/repo/): a read-only, exact-case view of the tree (stat, list, read)
```

## Decisions

- <a id="d1"></a>**D1 (one-file)**: One `keyframes.md` at the repo root, *because* one place to look, and budgets keep it small.
- <a id="d2"></a>**D2 (bracket-citations)**: A citation is the bracketed `[C3 (slug)]`, and a bare `C3` is plain text, *because* bare IDs collide with ordinary words like S3 and D3.
- <a id="d3"></a>**D3 (file-pointers)**: `held-by:` takes `review` or `file:<path>`, with an optional `#"text"`, and nothing else, *because* every test, rule and config entry lives in a file, and naming tools would tie the format to them.
- <a id="d4"></a>**D4 (no-config)**: The prototype has no config file, *because* the pilots should show what needs configuring before any knob exists.
- <a id="d5"></a>**D5 (counts-not-nags)**: Unlinked and review-only items are counted, not warned, *because* a warning should mean "probably a mistake".
- <a id="d6"></a>**D6 (map-is-a-picture)**: A Mermaid diagram in the Map isn't parsed, *because* checking the Map against the code waits on what the pilots show.
- <a id="d7"></a>**D7 (section-names)**: Nine sections with one name each, matched in any case, and a singular heading like `## Constraint` is a variant rather than an alias, *because* "Rules" is too vague and aliases complicate the parser.
- <a id="d8"></a>**D8 (spec-stays-live)**: [`docs/prototype.md`](../../../docs/prototype.md) stays the living spec of the format and the tool (grammar, findings, report, template, snippet, pilots); this plan cites its sections, and a spec change that moves a step goes through `/plumbbob:refine`, *because* the format's tables are too long to repeat in every step, and two copies of them would drift.
- <a id="d9"></a>**D9 (easy-to-get-right)**: Each form has one usual form, which the template, the docs, every message and the JSON report use; `check` reads the common variants exactly like it, each with an `alternate-form` note that never fails a run, and case never matters, the pointer keywords `review`, `file:` and `(new)` included, *because* nobody learns a format that punishes every slip, and nobody trusts one that guesses.
- <a id="d10"></a>**D10 (errors-for-unclear)**: Errors are for what's unclear or broken, and `malformed-item` fires only on a bullet that starts like an item (a bold ID followed by `(` or a colon) and still can't be read, *because* ordinary bold text such as `- **C4 model**: …` must never fail a run.
- <a id="d11"></a>**D11 (json-carries-items)**: `--json` carries every item, in its usual form, with its text, sub-lines and results, *because* a harness can then hand an agent the items that touch its work without parsing markdown.
- <a id="d12"></a>**D12 (lenient-cli)**: The CLI takes `-h` and `help` for `--help`, and flags before or after the command, while its help shows only the usual forms, *because* the variant rule in [D9 (easy-to-get-right)](#d9) applies to the command line too.
- <a id="d13"></a>**D13 (crash-exits-2)**: An unexpected error prints one line, `keyframes: <message>`, and exits 2, *because* 1 must only ever mean the plan has errors, and 2 already means no verdict was reached, as it does for grep.
- <a id="d14"></a>**D14 (npm-for-pilots)**: Pilots install a public 0.x of `@robmclarty/keyframes` from npm and run it with `npx`, packed by a `prepack` script that builds `dist/` clean, *because* a git install has no `dist/`, and a pilot owner should be one line from a working `keyframes`.
- <a id="d15"></a>**D15 (split-when-due)**: Steps 6 and 9 get split with `/plumbbob:step` just before they're built: 6 into items with their findings, then the variants with their notes; 9 into `check` with its counts and budgets, then the text and JSON renderers, then the CLI wiring, *because* steps 5 to 8 will show their shapes, and each piece should review in one pass.
- <a id="d16"></a>**D16 (local-proof)**: A done-when claims only what a test on this machine can show, so cross-OS behavior is proven with in-memory repos and this case-insensitive disk, and a CI matrix waits until a pilot runs on Linux or Windows, *because* a done-when nobody can measure gets waved through.
- <a id="d17"></a>**D17 (any-case-plan)**: `check` finds the plan by reading the root's directory entries in any case, with an `alternate-form` note for any name but `keyframes.md`, and two spellings side by side is a read problem that exits 2; `init` still writes `keyframes.md`, *because* the plan sits beside `AGENTS.md` and `README.md`, where people reach for capitals.
- <a id="d18"></a>**D18 (recruit-early)**: The pilot repos and second readers get lined up while steps 3 to 10 are built: two of your own agent-heavy TypeScript tools and one non-TypeScript repo from someone else, each with a named second reader, *because* recruiting has the longest lead time in the build, and none of it lives in the repo.

## Constraints

- <a id="c1"></a>**C1 (no-runtime-deps)**: TypeScript, ESM, Node 24 or later; `src/` imports only `node:` builtins and relative paths, and the package has no runtime dependencies (`node-builtins-only`).
- <a id="c2"></a>**C2 (read-only-check)**: `check` writes nothing, opens no network connection and starts no process; only `src/init/` writes files (`writes-only-in-init`, `no-network`, `no-subprocess`).
- <a id="c3"></a>**C3 (exit-codes)**: Commands return their exit code, and only `bin/keyframes.js` sets it (`no-process-exit`): 0 for no errors, 1 for errors or any warning under `--strict`, 2 for a usage, read or internal problem ([D13 (crash-exits-2)](#d13)); notes never change it.
- <a id="c4"></a>**C4 (pure-core)**: `check(plan, repo)` returns a report, and `repo` is a small read-only interface (exact-case stat, list a directory, read a file), so tests run against in-memory repos.
- <a id="c5"></a>**C5 (line-parser)**: The parser is line-based over the markdown subset the spec defines, with no general markdown parser, and fenced code, inline code and HTML comments are invisible to it.
- <a id="c6"></a>**C6 (byte-identical)**: The same plan and tree give byte-identical output on any OS, from any working directory: findings sorted by line, code, then message, with notes last; JSON keys in a fixed order; root-relative `/` paths; no timestamps, durations, colors, absolute paths or locale-formatted numbers; a BOM stripped, CRLF read as LF, leading tabs as four spaces; existence checked with exact case, by reading directory entries.
- <a id="c7"></a>**C7 (narrow-words)**: The report claims only what it checked: a pointer *resolves*, it is never *enforced*, and every finding says what it found and shows the usual form.
- <a id="c8"></a>**C8 (stands-alone)**: No format rule names a language, toolchain or product.
- <a id="c9"></a>**C9 (functional-style)**: No classes, `this` or inheritance, and a `/** */` doc comment on every top-level function (`no-class`, `no-this`, `no-extends`, `function-doc-comment`).
- <a id="c10"></a>**C10 (repo-layout)**: Unit tests sit in a `__tests__/` folder beside their code; `test/` holds only `integration/`, `e2e/`, `contract/`, `helpers/` and `fixtures/`; shipped code never imports `test/`, and barrels only re-export (the layout rules in `rules/`, listed in [`AGENTS.md`](../../../AGENTS.md)).
- <a id="c11"></a>**C11 (green-is-done)**: `pnpm check` (checkride) green is the definition of done, and a finding is fixed, never added to a baseline.

## Steps

Steps 1 and 2 landed before this build began, in `4edd048` and `789f1bc`, and step 3 closes the findings from step 2's review. Each later step names the spec section its done-when is measured against. Step 13 was added later and builds before step 12; [Build order](#build-order) holds the sequence.

1. [x] chore(scaffold): realign the scaffold to the prototype spec, **done when:** the rules in `rules/` and `AGENTS.md` cite the prototype spec; `no-subprocess` has no `src/extract/` exception and `node-builtins-only` no TypeScript exception; the README and the `package.json` description match the Frame; and the gate is green
   - seam: `rules/`, `rule-tests/`, `test/integration/layout-rules.test.ts`, `AGENTS.md`, `README.md`, `package.json`
2. [x] feat(cli): add the CLI entry and the keyframes bin, **done when:** `--help` and `--version` work, and an unknown command or flag exits 2
   - seam: `bin/keyframes.js`, `src/cli.ts`
3. [x] fix(cli): drop -v and make the CLI test titles name their arguments, **done when:** `keyframes -v` exits 2 as an unknown flag while `--version` still prints the version; and every test in `src/__tests__/cli.test.ts` is titled with its whole command line, with no two titles alike
   - seam: `src/cli.ts`, `src/__tests__/cli.test.ts`
   - model: sonnet (mechanical, fully specified by the done-when)
4. [ ] docs(design): point the spec at the plumbbob build and its decisions, **done when:** the spec's `## Steps` section is a short pointer to this plan; the spec names steps by title, never by number; the spec carries the calls settled here: exit 2 for an internal problem ([D13 (crash-exits-2)](#d13)), the plan file found in any case ([D17 (any-case-plan)](#d17)), and pointer keywords in any case ([D9 (easy-to-get-right)](#d9)); and `AGENTS.md` says the build plan and its record live in `.plumbbob/builds/2026-10-08-keyframes-prototype/`
   - seam: `docs/prototype.md`, `AGENTS.md`
   - model: sonnet (a mechanical doc edit)
5. [ ] feat(scan): read markdown into blocks and sections, **done when:** fixtures pass for both fence styles, a long fence containing a shorter one, an unclosed fence, multi-line comments, CRLF, a BOM, tabs, a thematic break such as `* * *`, `###` grouping and a singular heading, each with correct line numbers; and `duplicate-section`, `no-intent` and `unclosed-fence` have fixtures ([The file](../../../docs/prototype.md#the-file))
   - seam: `src/scan/`
   - model: opus (parser edge cases: nested fences, comments, line endings)
6. [ ] feat(items): parse items and sub-lines, **done when:** every item and sub-line finding in the spec's [Findings](../../../docs/prototype.md#findings) table has a fixture, including `malformed-item` against `not-an-item`, `item-outside-section`, `missing-slug`, and continuation lines for both items and sub-lines; and every item, slug and sub-line variant in [Variants](../../../docs/prototype.md#variants) parses exactly like its usual form, with one `alternate-form` note
   - seam: `src/items/`
   - model: opus (the grammar, its variants and the error boundary)
7. [ ] feat(cite): resolve citations and references, **done when:** citations resolve in every section and in sub-line values, but never inside code or comments; `broken-citation`, `slug-mismatch` and `bad-reference` have fixtures; citation and reference variants resolve like their usual forms, with a note; and a bare `S3` or `D3.js` in prose produces no finding ([Citations](../../../docs/prototype.md#citations))
   - seam: `src/cite/`
   - model: opus (citation variants against everyday text)
8. [ ] feat(repo): resolve pointers and Map paths, **done when:** each status has found, missing and planned fixtures; a wrong-case path is broken both in an in-memory repo and in a real tree on this case-insensitive disk, found by reading directory entries ([D16 (local-proof)](#d16)); `review`, `file:` and `(new)` match in any case; a CRLF file matches LF text; absolute, `..` and escaping paths error; and `bad-pointer`, `file-too-large`, `built-not-new`, `planned-text-missing` and `path-overlap` have fixtures ([Pointers](../../../docs/prototype.md#pointers), [The Map](../../../docs/prototype.md#the-map))
   - seam: `src/repo/`, `test/fixtures/repos/`
   - model: opus (exact-case existence that agrees across OSes)
9. [ ] feat(report): count, budget, and render text and JSON, **done when:** golden tests pass for both outputs; the JSON validates against the schema, which ships in the package, and carries every item with its text, sub-lines and results; `keyframes check` runs from the CLI, with exit codes and `--strict` as specified, notes that never fail a run and group by kind in the text report, the plan found in any case ([D17 (any-case-plan)](#d17)), and an unexpected error printed as one line with exit 2 ([D13 (crash-exits-2)](#d13)); and a test titled "byte-identical" in `test/integration/determinism.test.ts` runs `check` from two working directories and compares the bytes ([check](../../../docs/prototype.md#check), [The report](../../../docs/prototype.md#the-report))
   - seam: `src/check/`, `src/report/`, `schema/report.schema.json`, `src/cli.ts`, `src/__tests__/cli.test.ts`, `bin/keyframes.js`, `test/e2e/bin.test.ts`, `test/integration/`, `package.json`
   - model: opus (golden outputs, the schema and determinism)
10. [ ] feat(init): write the template, snippet and docs, **done when:** `keyframes init` runs from the CLI and writes only when no plan exists; a test titled "fresh template" in `src/init/__tests__/init.test.ts` shows `check` on a fresh template yields exactly `no-intent`; `docs/format.md` (the format, written for people) and `docs/agents.md` (the snippet and where it goes) exist; and a test checks every example plan in them ([init](../../../docs/prototype.md#init), [the template](../../../docs/prototype.md#appendix-a-the-template), [the snippet](../../../docs/prototype.md#appendix-b-the-agent-snippet))
    - seam: `src/init/`, `src/cli.ts`, `src/__tests__/cli.test.ts`, `docs/format.md`, `docs/agents.md`
    - model: opus (docs written for people, and tests over their examples)
11. [ ] test(dogfood): give this repo its own plan, **done when:** a person has edited the spec's [draft plan](../../../docs/prototype.md#appendix-c-this-repos-plan-a-draft) and committed it as `keyframes.md`, and `keyframes check --strict` runs green as a slot in this repo's gate, after the build that makes `dist/`
    - seam: `keyframes.md`, `checkride.config.json`
12. [ ] docs(pilots): run the pilots, **done when:** `docs/pilots.md` holds each pilot repo's results and the closing decision ([Pilots](../../../docs/prototype.md#pilots))
    - seam: `docs/pilots.md`
13. [ ] chore(release): publish a 0.x for the pilots to install, **done when:** a `prepack` script builds `dist/` clean before every pack; `npm pack --dry-run` lists only `bin/`, `dist/`, `schema/` and the package's own files; a person has published a public 0.x ([D14 (npm-for-pilots)](#d14)); and `npx @robmclarty/keyframes --version` prints it from an empty directory
    - seam: `package.json`, `.claude/version.json`, `.claude/version.md`
    - model: sonnet (mechanical packaging; a person publishes)

## Build order

*(Optional. The sequence to build the steps in once it stops being their numbering: one
line of comma-separated step numbers, such as `7, 8, 5, 10, 6`; empty means document
order. `plumbbob order 7 8 5 10 6` (`/plumbbob:order`) writes it, and `status`, `build`,
`checkpoint`, and `handoff` all read it, so the dashboard's `← next`, a bare
`/plumbbob:build`, and the card's Next Up agree. A step keeps its number for life; this
line is where the sequence lives.)*

3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 12

## Build ranges

Type `/plumbbob:run` once per range: the first lands the CLI fix, the spec's new wording and the scanner, the parser lands in one run, the report and the docs each stop for your read, and the last three stop for things only you can do.

1. `/plumbbob:build 3-5`, **stop:** review the CLI fix, the spec's new wording and the scanner, then split step 6 with `/plumbbob:step` into items with their findings, then the variants
   - model: opus
2. `/plumbbob:build 6-8`, **stop:** review the parser (items, citations and the repo view) before the report builds on it, then split step 9 with `/plumbbob:step` into `check` with its counts and budgets, the two renderers, and the CLI wiring
   - model: opus
3. `/plumbbob:build 9-9`, **stop:** read the text and JSON reports and every finding's message before the docs quote them
   - model: opus
4. `/plumbbob:build 10-10`, **stop:** read the template, `docs/format.md` and `docs/agents.md` the way a newcomer would, before this repo writes its own plan
   - model: opus
5. `/plumbbob:build 11`, **stop:** at step 11's pause, edit the draft plan yourself, since `keyframes.md` lands only once a person stands behind every line
6. `/plumbbob:build 13`, **stop:** at step 13's pause, publish the 0.x to npm yourself, since it takes your account
   - model: sonnet
7. `/plumbbob:build 12`, **stop:** at step 12's pause, make the pilots' closing call (keep, change or cut each section, variant and finding, then what to build next), then `/plumbbob:finish`

## Open questions

- <a id="q1"></a>**Q1 (crash-exit-code)**: What exit code should an unexpected error get, as opposed to a usage or read problem? *resolved:* 2026-10-22, exit 2 with a one-line message ([D13 (crash-exits-2)](#d13))
- <a id="q2"></a>**Q2 (pilot-install)**: How do the pilot repos install keyframes? *resolved:* 2026-10-22, a public 0.x on npm, run with `npx` ([D14 (npm-for-pilots)](#d14), step 13)
- <a id="q3"></a>**Q3 (plan-or-spec)**: Should this plan lean on the living spec, or carry the spec in itself? *resolved:* 2026-10-22, lean on it ([D8 (spec-stays-live)](#d8))
- <a id="q4"></a>**Q4 (split-big-steps)**: Should steps 6 and 9 be split before they're built? *resolved:* 2026-10-22, yes, each just before it's built ([D15 (split-when-due)](#d15))
- <a id="q5"></a>**Q5 (cross-os-proof)**: How does step 8 show cross-OS behavior when the gate only runs on this Mac? *resolved:* 2026-10-22, prove it locally, and add CI when a pilot needs it ([D16 (local-proof)](#d16))
- <a id="q6"></a>**Q6 (plan-file-case)**: Should `check` find the plan when it's named `KEYFRAMES.md`? *resolved:* 2026-10-22, yes, in any case ([D17 (any-case-plan)](#d17))
- <a id="q7"></a>**Q7 (pointer-keyword-case)**: Do `review`, `file:` and `(new)` follow "case never matters"? *resolved:* 2026-10-22, yes ([D9 (easy-to-get-right)](#d9))
- <a id="q8"></a>**Q8 (pilot-recruiting)**: Which three repos, owners and second readers will the pilots use? *resolved:* 2026-10-22, line them up now ([D18 (recruit-early)](#d18))

## Verdicts

- 2026-10-04: section names → kept Constraints and Taste, and split real Questions from Ideas, one name per section; because "Rules" is too vague, and an idea shouldn't read as a question someone has to answer.
- 2026-10-08: strict near-miss errors versus lenient variants → chose one usual form with accepted variants and notes that never fail; because a format that's annoying to use never gets learned, and errors stay for what's unclear or broken ([D9 (easy-to-get-right)](#d9), [D10 (errors-for-unclear)](#d10)).
- 2026-10-08: steps tracked by hand versus a plumbbob build → moved them into this plan and kept the work already landed as steps 1 and 2; because the spec's steps were already in plumbbob's format, and a checklist kept by hand had no review pause.
- 2026-10-22: refine's eight open questions → took every lean, recorded as [D13 (crash-exits-2)](#d13) to [D18 (recruit-early)](#d18), with [D8 (spec-stays-live)](#d8) kept, [D9 (easy-to-get-right)](#d9) widened to the pointer keywords, and step 13 added before the pilots; because each kept the format forgiving, the steps reviewable and every done-when measurable.
