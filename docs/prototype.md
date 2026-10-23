# Spec: the keyframes prototype

**Status:** draft, 2026-10-04, revised 2026-10-08 and 2026-10-22. This replaces the first-slice
spec as the first thing we build. That spec and its design documents are in
[`archive/`](archive/README.md) as historical reference. Nothing here depends on them.

## Frame

- **What keyframes is.** One markdown file, `keyframes.md`, where people write down what a
  project is for, what matters, what must hold, how it should feel, and why. Other people build
  on it and refine it. Agents read it and are guided by it. A small CLI keeps the file consistent
  and checks whatever can be checked, the same way every time.
- **The problem.** Every project carries intent that never gets written down in one place. It
  lives in people's heads, chat threads, PR comments and stale READMEs. New people piece it
  together slowly, and agents see none of it unless someone pastes it into a prompt.
- **The bet.** A short, shared, lightly structured file closes that gap if three things are true:
  it's easy to write, other people can pick it up and improve it, and agents behave differently
  when it's there. Deterministic checks make the file trustworthy. They don't make it useful, so
  they come fourth.

**Goals, in order.** When two conflict, the earlier one wins.

1. A person can easily express intent, including the soft parts: purpose, values and feel.
2. Another person can read it quickly, then extend and refine it.
3. Agents read it and are guided by it.
4. Whatever can be checked deterministically is checked, with the same result every time.

**The prototype is done when:**

- `keyframes init` and `keyframes check` work in any repo, in any language, with no config;
- this repo has its own `keyframes.md`, checked in its own gate;
- three pilot repos have a `keyframes.md` written by their owners, and the findings are recorded
  in `docs/pilots.md` with a decision on what to build next.

**Not doing in the prototype:**

- checking the map against the code (dependency extraction, import graphs);
- running anything: no tests, linters, subprocesses, network calls or LLMs;
- knowing about any other tool, harness, language or CI system, beyond plain-text snippets;
- a folder form, a config file, a formatter or auto-fix;
- parsing Mermaid (a diagram in the Map is a picture);
- scanning code, commits or PRs for citations;
- anything that reads git history.

## What the prototype tests

| | Hypothesis | How we'll know |
| --- | --- | --- |
| **H1** | **Expressible.** An owner writes a useful first plan from `init` in under 45 minutes, reading nothing but the template. | Time taken. Which sections they used and skipped. Anything they wanted to say and couldn't place. The variants `check` noted. |
| **H2** | **Shareable.** A second person reads the plan in under 10 minutes, explains the project back, and makes a meaningful edit. | The owner rates the explanation. The edit passes `check` first time, and its diff reads clearly. |
| **H3** | **Guiding.** With the plan and the agent snippet present, agents cite the items they rely on, cross fewer constraints, and ask before crossing one. | The paired trial in [Pilots](#pilots). |
| **H4** | **Checkable.** Most findings are worth knowing. | The owner triages every finding as useful, noise or wrong. Target: at least 80% useful. |

**What would change the plan:**

- H1 fails: simplify the format before building anything else.
- H3 shows no difference: rethink how agents receive the plan before adding checks.
- H4 is noisy: cut checks. Don't add configuration to quiet them.

## Principles

- **People own the file.** Agents may draft an edit while a person approves it. Nothing edits
  the file unattended.
- **It's just markdown.** It reads well with nothing installed and renders wherever markdown
  renders. Someone who has never heard of keyframes can edit it, and if they break the
  structure, `check` says exactly where and how to fix it.
- **Easy to get right.** Each thing has one usual form, and the template, the docs and every
  message show it. `check` also reads common variants, such as `*` bullets, a colon inside the
  bold or `held by:`, exactly like the usual form, and notes them without failing. It never
  guesses: errors are for what's unclear or broken, not for another way to write the same thing.
- **Soft things are first-class.** Purpose, values and feel get named sections, not a leftover
  prose bucket. The tool never judges them, but it keeps them findable and citable.
- **Same answer everywhere.** `check` is a pure function of the plan and the repo tree. The same
  inputs give byte-identical output on any OS, from any working directory. No clock, network,
  randomness, subprocess or LLM.
- **Sparse by budget.** Budgets warn. They never fail unless `--strict` is set. A plan nobody can
  read in ten minutes stops being read.
- **Narrow words.** The report claims only what it checked. A pointer *resolves*; it is never
  *enforced*.
- **Stands alone.** No format rule names a language, toolchain or product.

## The format

### The file

- The plan is `keyframes.md` at the repo root. `check` finds it in any case, by reading the root's
  directory entries, *because* it sits beside files like `AGENTS.md` and `README.md`, where people
  reach for capitals. Another spelling, such as `KEYFRAMES.md`, is a [variant](#variants). Two
  spellings side by side are a read problem, since `check` never guesses which one is the plan.
  `init` always writes `keyframes.md`.
- `##` headings divide it into sections. A `###` or deeper heading stays inside its section, so
  people can group items under it. A `#` heading closes the current section.
- The known sections are below. Heading text matches case-insensitively, after trimming. Any
  other `##` heading is free prose: kept, read by people and agents, and not parsed.
- Every section is optional, and order is free. A known section that appears twice is an error.
- Fenced code blocks (backticks or tildes), inline code and HTML comments are invisible to the
  parser. Nothing inside them is a heading, an item or a citation.

| Section | Item letter | What goes there | Agents treat it as |
| --- | --- | --- | --- |
| **Intent** | none: prose | Why this exists, who it's for, what good looks like, what it isn't | Orientation |
| **Principles** | P | Values that settle judgment calls | How to decide when nothing else says |
| **Map** | M | The main parts, what each is for, and where each lives | Where things go |
| **Constraints** | C | What must always be true; breaking one is a bug | Hard limits: stop and ask before crossing one |
| **Scenarios** | S | Journeys the system must support | Behavior to keep working |
| **Decisions** | D | Choices made, and why | Settled: don't reverse without a person |
| **Taste** | T | How it should look, read and feel | Preferences: follow unless there's a reason |
| **Questions** | Q | Questions that still need an answer | Unsettled: raise them, don't decide alone |
| **Ideas** | I | Statements for future consideration: possibilities, hunches, someday | Not agreed: don't build one unless a person asks |

### Items

In every known section except Intent, an item is a top-level list item, with its `-` at column 0:

```markdown
- **C3 (one-writer)**: Only the sync worker writes to the database.
  - because: two writers made the replay disagree with the live state.
  - held-by: file:test/writes.test.ts#"only the sync worker writes"
```

- **The item line** is `- **<letter><number> (<slug>)**: <text>`.
  - The letter matches the section.
  - The number is a positive integer with no leading zeros.
  - The slug is lowercase letters and digits in hyphen-separated words, like `one-writer`.
  - The text isn't empty. Indented lines after it that aren't bullets continue it.
- **IDs are unique in the file.** Gaps are fine. A deleted item's ID is never reused. That's a
  convention: the prototype can't see history.
- **A sub-line** is a bullet indented two to five spaces under its item, of the form
  `- <key>: <value>`, where the key is lowercase letters and hyphens. Indented lines after it
  that aren't bullets continue its value. Each key appears at most once per item. Any other
  nested bullet is part of the item's prose.
- **The item ends** at the next non-blank line at column 0.

| Key | Allowed on | Value |
| --- | --- | --- |
| `because` | any item | Why. Expected on every Decision. |
| `held-by` | C, S | `review`, one or more pointers, or both, comma-separated |
| `paths` | M | Repo paths, comma-separated; directories end in `/` |
| `superseded-by` | D | The ID of the decision that replaces this one |
| `resolved-by` | Q, I | The ID of the decision that settled this question or idea |

Paragraphs between items are welcome, and so are bullets nested under an item. Other top-level
bullets in an itemized section are read like this:

- **No slug.** `- **C3**: …` still counts as an item, with a `missing-slug` warning, *because*
  the slug is what lets a citation notice a rename.
- **Starts like an item.** A bold ID followed by `(` or a colon, as in `**C4 (`, `**C4:**` or
  `**C4**:`, is meant as an item. If it can't be read as one, even with no slug or as a
  [variant](#variants), that's a `malformed-item` error.
- **Anything else** is a `not-an-item` warning, *because* people and agents will read it as a
  rule, but nothing can cite it. Bold text such as `- **C4 model**: …` lands here, not in
  `malformed-item`.

### Citations

- A citation is an ID and its slug in square brackets: `[C3 (one-writer)]`.
- Citations count anywhere outside code and comments: in Intent, in free-prose sections, in item
  text and in sub-line values.
- Outside brackets, an ID is plain text. A bare `C3`, `S3` or `D3` isn't a citation, *because*
  bare IDs collide with ordinary words: Amazon S3, D3.js, the C4 model.
- A citation must name an existing ID with that item's current slug. When a slug changes, `check`
  lists every citation still using the old one.
- `superseded-by:` and `resolved-by:` take a bare ID, such as `D9`. It must exist and be a
  decision.

### Pointers

`held-by:` takes pointers:

| Pointer | Resolves when |
| --- | --- |
| `review` | Always. A person checks this. |
| `file:<path>` | `<path>` is a file in the repo. |
| `file:<path>#"<text>"` | The file exists and contains `<text>` exactly. Use it to point at a test's name, a rule's ID or a config entry. |

- Add `(new)` after a pointer whose target doesn't exist yet. It's **planned**: counted, not an
  error.
- One pointer kind is enough, *because* every test, lint rule and config entry lives in a file.
  Naming tools would tie the format to them.
- Inside `"<text>"`, `\"` and `\\` are escapes, and commas don't split pointers.
- Paths are relative to the repo root and use `/`. Paths can't contain commas. An absolute path,
  a `..` segment, or a path that resolves outside the root is an error. Backticks around a pointer
  or path are ignored.

### Variants

The forms above are the usual ones, and the template, the docs, every message and the JSON report
use them. `check` also accepts the common variants below. It reads each one exactly like its
usual form, and gives it an `alternate-form` note that shows the usual form. A note never fails a
run, even with `--strict`. Case never matters: headings, IDs, slugs, keys and the pointer keywords
`review`, `file:` and `(new)` match in any case, without a note. Names in the repo are different:
a path matches with exact case, and the plan's own name in another case is a variant.

| Form | Usual | Also accepted, with a note |
| --- | --- | --- |
| Plan file | `keyframes.md` | The name in any other case: `KEYFRAMES.md` |
| Item line | `- **C3 (one-writer)**: …` | A `*`, `+` or numbered bullet. `__` for bold, or no bold when a colon follows the slug. The colon inside the bold, a dash instead of it, or nothing. Other spacing, or leading zeros in the number |
| Slug | `one-writer` | Spaces or underscores for the hyphens: `(one writer)` |
| Sub-line | `- because: …`, two to five spaces in | A bold key, or a space or underscore for its hyphen: `held by:`. `path:` for `paths:`. A `*` or `+` bullet, at any indent under the item |
| Heading | `## Constraints` | The singular: `## Constraint` |
| Citation | `[C3 (one-writer)]` | Other spacing: `[C3(one-writer)]`. A bare `[C3]` while C3 exists, though it can't notice a rename |
| Reference | `superseded-by: D9` | The ID with its slug, bracketed or not: `D9 (sqlite)` or `[D9 (sqlite)]`. The slug must match |

Every variant reads one way only. A line that could mean two things isn't a variant: `check`
reports it and shows the usual form, and never guesses. The list is a starting point, and the
pilots will show which variants people actually write.

### The Map

- An M item names a part. `paths:` says where it lives: files, or directories ending in `/`. A
  part with no paths is fine: it may be a concept, or not built yet.
- Each path must exist and be the kind it claims (file or directory). A path marked `(new)` is
  planned.
- The same path in two parts, or one part's path inside another's, warns.
- A Mermaid diagram in the Map is welcome. It's a picture, and the prototype doesn't parse it.

### Budgets

These are starting values, and the pilots will tune them. Every breach is a warning.

| What | Budget |
| --- | --- |
| The whole file, outside code and comments | 2000 words |
| One item's text | 60 words |
| Principles, and Map parts | 7 each |
| Constraints, and Taste | 12 each |
| Scenarios, open Questions, and open Ideas | 10 each |
| Active Decisions (not superseded) | 20 |

A word is a run of non-whitespace characters.

### What supports refinement

The format is built for a file that many people edit over a long time.

- **Stable IDs with slugs.** References survive reordering, and a renamed slug is caught at every
  citation.
- **History stays.** A replaced decision is marked `superseded-by:`, and a settled question or
  idea is marked `resolved-by:`. Citations to any of them still resolve, so the trail of thinking
  survives.
- **Unsettled thinking has a home.** Questions and Ideas are sections, so half-formed thoughts
  can be written down without being mistaken for agreement. Agents know not to settle a question
  or build an idea on their own.
- **`check` is the safety net.** After any edit, from anyone, it reports what the edit broke.
- **Budgets keep diffs small enough to review.**

## The tool

```text
keyframes init [dir]                        write a starter keyframes.md; refuse if one exists
keyframes check [dir] [--json] [--strict]   check the plan against itself and the repo
keyframes --help | --version
```

`dir` defaults to the working directory. It's the repo root, and the plan is `<dir>/keyframes.md`,
found in any case ([The file](#the-file)).

An unexpected error in any command prints one line, `keyframes: <message>`, and exits 2, *because*
1 must only ever mean the plan has errors, and 2 already means no verdict was reached.

### check

- **Exit codes.**
  - 0: no errors. Warnings are allowed, and notes always are.
  - 1: errors, or any warning under `--strict`.
  - 2: a usage, read or internal problem: no plan, two plans whose names differ only in case, an
    unreadable or non-UTF-8 plan, a bad flag, a missing directory, an unexpected error.
- **Output.** The text report goes to stdout. `--json` replaces it with one JSON object; the
  schema is `schema/report.schema.json`. Usage errors go to stderr.
- **Determinism rules.**
  - Findings are sorted by line, then code, then message, with notes after errors and warnings.
    JSON keys come in a fixed order.
  - Paths in the output are relative to the root and use `/`.
  - No timestamps, durations, colors, absolute paths or locale-formatted numbers.
  - A BOM is stripped, CRLF is read as LF, and leading tabs expand to four spaces.
  - Existence is checked with exact case, by reading directory entries, so macOS, Windows and
    Linux agree.
  - Files are read as UTF-8 with CRLF normalized before text matching. A pointer's file over
    1 MiB isn't searched.

**Item statuses**, for Constraints and Scenarios:

| Status | Meaning |
| --- | --- |
| `linked` | Every pointer resolves |
| `planned` | Some pointer is `(new)`, and none is broken |
| `review` | Held only by `review` |
| `unlinked` | No `held-by:` line |
| `broken` | Some pointer doesn't resolve (an error) |

`unlinked` and `review` are counted, not warned, *because* a warning should mean "probably a
mistake", and most constraints start life without a check.

### Findings

Codes are stable, and every finding names its line in the plan. An error fails a run, a warning
fails it only under `--strict`, and a note never does.

| Code | Severity | When |
| --- | --- | --- |
| `duplicate-section` | error | A known section appears twice |
| `malformed-item` | error | A bullet starts like an item (`**C4 (`, `**C4**:`) but can't be read as one, even as a variant |
| `wrong-letter` | error | An item's letter doesn't match its section |
| `duplicate-id` | error | Two items share an ID |
| `duplicate-key` | error | An item repeats a sub-line key |
| `broken-citation` | error | A citation names an ID that doesn't exist |
| `slug-mismatch` | error | A citation's slug isn't the item's current slug |
| `bad-pointer` | error | An unknown kind, bad quoting, an empty `held-by:`, or an absolute, `..` or escaping path |
| `broken-pointer` | error | A pointer's file or text isn't there, and it isn't `(new)` |
| `broken-path` | error | A Map path doesn't exist or is the wrong kind, and it isn't `(new)` |
| `bad-reference` | error | `superseded-by` or `resolved-by` names a missing ID or a non-decision |
| `file-too-large` | error | A pointer's file is over 1 MiB |
| `no-intent` | warning | There's no Intent section, or it's empty |
| `not-an-item` | warning | A top-level bullet in an itemized section isn't an item, and doesn't start like one |
| `item-outside-section` | warning | An item is outside the itemized sections, as in Intent or under an unknown heading |
| `missing-slug` | warning | An item has no slug, so citations to it can't notice a rename |
| `unknown-key` | warning | A sub-line key isn't one of the five |
| `key-not-allowed` | warning | A known key on the wrong kind of item, such as `held-by` on a Principle |
| `missing-because` | warning | A Decision without `because:` |
| `built-not-new` | warning | A `(new)` target exists now, so the marker can go |
| `planned-text-missing` | warning | A `(new)` pointer's file exists but doesn't contain its text: a typo? |
| `path-overlap` | warning | Two parts claim the same path, or one part's path is inside another's |
| `over-budget` | warning | A budget is exceeded |
| `unclosed-fence` | warning | A code fence never closes, so the rest of the file reads as code |
| `alternate-form` | note | A [variant](#variants) of a usual form, read exactly like it |

Every message says what it found and shows the usual form:

```text
keyframes.md:14  warning  not-an-item     "- **C4 one-writer**" isn't read as an item; put its slug in parentheses: - **C4 (one-writer)**: …
keyframes.md:22  note     alternate-form  "- **C5 (no-pii):**" reads fine; the usual form puts the colon after the bold: - **C5 (no-pii)**: …
```

### The report

```text
keyframes.md

intent        yes
principles    4
map           5 parts · 9 paths · 2 planned
constraints   6 · 3 linked · 1 planned · 1 review · 1 unlinked
scenarios     3 · 1 linked · 1 planned · 1 review
decisions     8 · 6 active · 2 superseded
taste         3
questions     3 · 2 open · 1 resolved
ideas         2 · 2 open
words         1240 of 2000

keyframes.md:41  warning  built-not-new   file:test/kill.test.ts#"escalates" resolves now; drop "(new)"
keyframes.md:63  error    slug-mismatch   [D4 (sqlite-only)] cites D4, which is now (one-database)
keyframes.md:12  note     alternate-form  "*" bullets read fine; the usual form is "-" (lines 12, 19, 27)

1 error · 1 warning · 3 notes
```

Sections absent from the plan are left out. A clean run ends with `no findings`. Notes come last,
one line for each kind of variant, naming every line that uses it, so a habit shows up once.

The JSON report has the same counts and findings, and it also carries every item. A harness can
then hand an agent the items that touch its work without parsing markdown, and without keyframes
knowing anything about the harness:

```json
{
  "schema_version": 1,
  "plan": "keyframes.md",
  "intent": true,
  "sections": {
    "constraints": { "items": 6, "linked": 3, "planned": 1, "review": 1, "unlinked": 1, "broken": 0 }
  },
  "words": { "count": 1240, "budget": 2000 },
  "items": [
    {
      "id": "M2",
      "slug": "repo",
      "section": "map",
      "line": 22,
      "text": "A read-only, exact-case view of the repo for pointers and paths.",
      "paths": [{ "path": "src/repo/", "result": "planned" }]
    },
    {
      "id": "C3",
      "slug": "one-writer",
      "section": "constraints",
      "line": 41,
      "text": "Only the sync worker writes to the database.",
      "because": "two writers made the replay disagree with the live state.",
      "held_by": [{ "pointer": "file:test/writes.test.ts#\"only the sync worker writes\"", "result": "resolved" }],
      "status": "linked"
    }
  ],
  "findings": [{ "line": 63, "severity": "error", "code": "slug-mismatch", "message": "…" }],
  "errors": 1,
  "warnings": 1,
  "notes": 3
}
```

- `items` lists every item in the plan, in line order. Each has its `id`, `slug` (if it has one),
  `section`, `line` and `text`, plus the sub-lines it has: `because`, `paths`, `held_by`,
  `superseded_by` and `resolved_by`. Sub-line keys are written with underscores, so `held-by`
  becomes `held_by`.
- IDs, slugs and keys appear in their usual form, whatever variant the plan used. `findings` lists
  every note separately, each with its own line.
- `text` is the item's prose without its ID or its sub-lines. Its lines are joined with `\n`, and
  their indentation is removed.
- Every path and pointer carries a `result`: `resolved`, `planned` or `broken`, or `review` for
  the `review` pointer. Constraints and Scenarios also carry their item `status`.

Within a `schema_version`, fields are only ever added, so the step
`feat(report): count, budget, and render text and JSON` settles this item shape along with the
schema.

### init

- Writes `<dir>/keyframes.md` from the [template](#appendix-a-the-template), titled with the
  directory's name. If the file exists, it refuses and exits 2. It's the only command that writes.
- Then prints the [agent snippet](#appendix-b-the-agent-snippet) to stdout, with one line saying
  where to paste it.
- `check` on a fresh template exits 0 with exactly one finding: `no-intent`. That warning is the
  first prompt to write something.

## Agents

Agents learn about the plan through a short snippet that a person pastes into whatever file their
agents already read (`AGENTS.md`, `CLAUDE.md` and the like). The snippet is the same everywhere.
`docs/agents.md` shows where it goes for a few common harnesses, as examples, not integrations.

The snippet asks agents to:

- read `keyframes.md` before changing code;
- treat each section the way the table in [The file](#the-file) says;
- cite the items they relied on, as `[C3 (slug)]`, in their summary or commit message;
- leave `keyframes.md` alone unless a person asks, and propose a change when it looks wrong or
  incomplete;
- run `keyframes check` after changing anything the plan points at.

This part is guidance, and an agent can ignore it. H3 measures how much it doesn't.

## Build constraints

- TypeScript, ESM, Node 24 or later. **No runtime dependencies:** Node builtins only.
- A pure core: `check(plan, repo)` returns a report. `repo` is a small read-only interface
  (exact-case stat, list a directory, read a file). The CLI is a thin shell around it, so tests
  run against in-memory repos.
- The parser is line-based over the markdown subset defined here. It doesn't use a general
  markdown parser.
- `check` writes nothing, opens no network connection and starts no process. Only `src/init/`
  writes files.
- Commands return their exit code, and only `bin/keyframes.js` sets it, so everything in `src/`
  stays importable by tests.
- Functional style: no classes, `this` or inheritance, and a doc comment on every top-level
  function.
- This repo's existing scaffold and gate stay. They're how we build, not what we build. The
  ast-grep rules in `rules/` hold the constraints above, and `AGENTS.md` lists them.

## Steps

The steps that build the prototype, and the decisions they settled, live in this repo's plumbbob
build:
[`.plumbbob/builds/2026-10-08-keyframes-prototype/intent.md`](../.plumbbob/builds/2026-10-08-keyframes-prototype/intent.md).
Each step's done-when cites the section of this spec it's measured against. This spec stays the
living reference for the format and the tool, so a change here that moves a step goes through
`/plumbbob:refine`.

## Pilots

- **Repos.** Three, chosen by their owners. At least one isn't TypeScript, at least one has a
  second regular contributor, and at least one gets a real share of its code from agents.
- **H1.** The owner runs `init`, writes the plan and times it. They note anything they wanted to
  say and couldn't place.
- **H2.** A second person reads the plan cold, timed, and explains the project back in three
  sentences. Then they make one edit of their choice and run `check`.
- **H3.** Pick four real tasks per repo, at least two of which touch a constraint or a decision.
  Run each task in fresh agent sessions, once with the plan and the snippet and once with
  neither, on two models: a frontier model, and a local model in a harness with a small built-in
  prompt. The local runs matter *because* a plan probably helps the weaker model most, and a large
  built-in prompt can cost a local model minutes of reading before it reaches the plan. For each
  run, record:
  - the items cited;
  - the constraints crossed;
  - whether the agent asked before crossing one;
  - whether it followed the taste, in the owner's judgment;
  - roughly how many tokens the plan and the snippet added to its context.

  That's 48 runs. Agents vary from run to run, so repeat any condition that's cheap to repeat,
  and treat the result as a direction, not proof. If a repo has an agent that runs unattended,
  also give it one of the four tasks, with and without the plan. With nobody to ask, "asked
  before crossing one" means it stopped and flagged the crossing instead.
- **H4.** The owner triages every finding: useful, noise or wrong.
- **Close.** Keep, change or cut each section, pointer form, variant and finding. Then choose what
  to build next. The candidates:
  - checking the Map against the code;
  - a formatter that puts the file in one canonical form;
  - scanning code and commits for citations;
  - giving agents a scoped slice of the plan;
  - something the pilots surface.

## Open questions

- **Q1 (section-names):** *resolved 2026-10-04.* Constraints stays, because "Rules" is too vague:
  principles are rules too. Taste stays, because it says what it holds. Questions holds only real
  questions, and a separate Ideas section holds statements for future consideration. Each section
  has exactly one name, with no aliases, so the parser stays simple. A singular heading is a
  [variant](#variants) of that name, not an alias. H1 still watches for misplaced items.
- **Q2 (unlinked-warns):** should a constraint with no `held-by:` warn? *Lean:* no. Revisit with
  H4's data.
- **Q3 (intent-structure):** should Intent have parsed parts (problem, who it's for, what good
  looks like, what it isn't)? *Lean:* no. The template suggests them, and Intent stays prose.
- **Q4 (one-file):** will a large project need a folder of files? *Lean:* not until a pilot hits
  the word budget and splitting is clearly better than cutting. Size may not be the only
  pressure: a capability with its own instructions, such as a skill's folder, may want a plan of
  its own that cites the root one (`I5 (scoped-plans)` in Appendix C).

## Appendix A: the template

What `init` writes. Everything but the headings sits in comments, so the template checks clean
apart from `no-intent`.

````markdown
# <directory name>

<!--
keyframes.md holds the intent behind this project: what it's for, what matters, what must hold,
and how it should feel. People write it. Everyone who works here, human or agent, works from it.
Keep it short enough to read in ten minutes. Every section is optional. Delete these comments
whenever you like, and run `keyframes check` after you edit.
-->

## Intent

<!--
Why does this exist, and who is it for? What should it feel like to use? What does "good" look
like? What is it deliberately not? Write it the way you'd explain it to a new teammate.
-->

## Principles

<!--
The values that settle judgment calls when nothing else does. For example:

- **P1 (no-lost-work)**: Losing someone's work is worse than being slow.
  - because: people forgive a spinner; they don't forgive a blank page.
-->

## Map

<!--
The main parts, seven or fewer: what each is for, and where each lives. For example:

- **M1 (api)**: The HTTP API: requests in, events out.
  - paths: src/api/

A Mermaid diagram is welcome here. It's a picture, and nothing checks it.
-->

## Constraints

<!--
Things that must always be true. Breaking one is a bug. Say what checks it, if anything does:

- **C1 (one-writer)**: Only the sync worker writes to the database.
  - because: two writers made the replay disagree with the live state.
  - held-by: file:test/writes.test.ts#"only the sync worker writes"

Write `held-by: review` if a person checks it. Add (new) after a pointer that doesn't exist yet.
-->

## Scenarios

<!--
Journeys the system must support, a sentence or two each:

- **S1 (offline-edit)**: Someone edits on a plane, lands, and their changes sync without a prompt.
  - held-by: review
-->

## Decisions

<!--
Choices made, and why. When a decision changes, don't delete it: add the new one, and mark the
old one `superseded-by: D2`.

- **D1 (sqlite)**: One SQLite file holds all state.
  - because: one boring database beats two clever ones.
-->

## Taste

<!--
How it should look, read and feel:

- **T1 (calm-errors)**: Error messages are calm, specific, and say what to do next.
-->

## Questions

<!--
Questions that still need an answer. When one is settled, record a decision and mark the question
`resolved-by: D3`.

- **Q1 (sharing)**: Should plans be shareable by link, or is that a different product?
-->

## Ideas

<!--
Things worth considering someday: possibilities, hunches, directions. Writing one down doesn't
mean anyone agreed to it. If one is taken up or turned down, record a decision and mark the idea
`resolved-by: D4`.

- **I1 (dark-mode)**: A dark theme that follows the system setting.
-->
````

## Appendix B: the agent snippet

What `init` prints, for a person to paste into the file their agents read.

```markdown
## Keyframes

This project's intent is in `keyframes.md`. Read it before you change code.

- **Constraints (C)** must always hold. If a change would break one, stop and ask.
- **Scenarios (S)** must keep working.
- **Decisions (D)** are settled. Don't reverse one without asking.
- **Questions (Q)** are open. Raise them; don't settle them on your own.
- **Ideas (I)** aren't agreed yet. Don't build one unless a person asks.
- **Principles (P)** decide judgment calls the plan doesn't cover.
- **Taste (T)** is preference. Follow it unless you have a reason, and say what the reason was.
- **Map (M)** says where things live. Put new code in the part it belongs to.
- When your work relies on an item, cite it as `[C3 (slug)]` in your summary or commit message.
- Don't edit `keyframes.md` unless a person asks you to. If it looks wrong or incomplete, say so
  and propose the change.
- After changing anything the plan points at, run `keyframes check`.
```

## Appendix C: this repo's plan, a draft

The starting point for the step `test(dogfood): give this repo its own plan`, and the fullest
example of the format. A person edits it before it's committed; it isn't committed as written.
Targets that don't exist yet are marked `(new)`. The three rule files under C1 exist today.

````markdown
# keyframes

## Intent

Every project carries intent that never gets written down in one place: why it exists, what
matters, what must never happen, how it should feel. keyframes is one short markdown file where
people write that down, so that others, human or agent, can work from it and refine it.

- **For:** solo builders and small teams who work alongside coding agents.
- **Good looks like:** someone new reads the file in ten minutes and can explain the project
  back. An agent working in the repo cites the items it relied on, and stops before crossing a
  constraint.
- **Not:** a spec for every feature, a code generator, a project tracker or a judge of prose.

## Principles

- **P1 (people-own-it)**: People decide what the file says. Agents propose; a person accepts.
  - because: the file is only worth trusting if someone stands behind every line.
- **P2 (expression-first)**: When ease of writing and ease of checking conflict, writing wins.
  - because: a perfectly checkable file that nobody writes is worth nothing.
- **P3 (same-answer-everywhere)**: The same files give the same answer on every machine.
  - because: people stop trusting a check they can't reproduce.
- **P4 (narrow-words)**: The report claims only what it checked, in the narrowest true words.
  - because: "linked" read as "enforced" is how intent and code drift apart without anyone
    noticing.
- **P5 (easy-to-get-right)**: Each thing has one usual form that everything shows. Common variants
  work too, with a note, and only what's unclear or broken is an error.
  - because: nobody learns a format that punishes every slip, and nobody trusts one that guesses.

## Map

- **M1 (scan)**: Reads markdown into sections, items, sub-lines and citations.
  - paths: src/scan/ (new), src/items/ (new), src/cite/ (new)
- **M2 (repo)**: A read-only, exact-case view of the repo for pointers and paths.
  - paths: src/repo/ (new)
- **M3 (check)**: Turns a parsed plan and a repo view into findings and counts.
  - paths: src/check/ (new)
- **M4 (report)**: Renders the result as text or JSON.
  - paths: src/report/ (new), schema/report.schema.json (new)
- **M5 (cli)**: Commands, flags, exit codes and the starter template.
  - paths: src/cli.ts (new), src/init/ (new), bin/keyframes.js (new)

## Constraints

- **C1 (read-only-check)**: `check` writes nothing, opens no network connection and starts no
  process.
  - held-by: file:rules/writes-only-in-init.yml#"id: writes-only-in-init",
    file:rules/no-network.yml#"id: no-network",
    file:rules/no-subprocess.yml#"id: no-subprocess"
- **C2 (byte-identical)**: The same plan and tree give byte-identical output on any OS, from any
  working directory.
  - held-by: file:test/integration/determinism.test.ts#"byte-identical" (new)
- **C3 (no-runtime-deps)**: The published package has no runtime dependencies.
  - held-by: review
- **C4 (fresh-template)**: `check` on a fresh template reports exactly one finding, `no-intent`.
  - held-by: file:src/init/__tests__/init.test.ts#"fresh template" (new)
- **C5 (stands-alone)**: No format rule names a language, toolchain or product.

## Scenarios

- **S1 (first-plan)**: Someone runs `init`, writes a little intent and a few items, runs `check`,
  and gets either a clean report or a finding that says exactly how to fix it.
  - held-by: file:test/e2e/first-plan.test.ts#"first plan" (new)
- **S2 (second-editor)**: A second person replaces a decision, marks the old one superseded,
  cites the new one elsewhere, and `check` passes.
  - held-by: file:test/e2e/second-editor.test.ts#"second editor" (new)
- **S3 (agent-cites)**: An agent working in a repo with the snippet cites the items it relied on.
  - held-by: review

## Decisions

- **D1 (one-file)**: One `keyframes.md` at the repo root.
  - because: one place to look, and budgets keep it small.
- **D2 (bracket-citations)**: A citation is only the bracketed form, `[C3 (slug)]`.
  - because: bare IDs collide with ordinary words like S3 and D3.
- **D3 (file-pointers)**: `held-by:` has one pointer kind, `file:`, with optional `#"text"`.
  - because: every test, rule and config entry lives in a file, and naming tools would tie the
    format to them.
- **D4 (no-config)**: The prototype has no config file.
  - because: the pilots should show what needs configuring before we add knobs.
- **D5 (counts-not-nags)**: Unlinked and review-only items are counted, not warned.
  - because: a warning should mean "probably a mistake".
- **D6 (map-is-a-picture)**: The Map's Mermaid diagram isn't parsed in the prototype.
  - because: checking the map against the code waits on what the pilots show.
- **D7 (section-names)**: Keep Constraints and Taste. Questions hold only real questions, and
  Ideas hold statements for future consideration.
  - because: "Rules" is too vague, since principles are rules too, and an idea written down
    shouldn't read as a question someone has to answer.

## Taste

- **T1 (fixable-messages)**: Every finding says what's wrong and how to fix it, with the expected
  form.
- **T2 (quiet-when-fine)**: A clean report is short. Nothing celebrates.
- **T3 (warm-template)**: The template reads like a note from a teammate, not a form.

## Questions

- **Q1 (section-names)**: Are these the right section names?
  - resolved-by: D7
- **Q2 (unlinked-warns)**: Should an unlinked constraint warn? Decide after the pilots.
- **Q3 (map-vs-code)**: Is checking the Map against the code the next thing to build?

## Ideas

- **I1 (formatter)**: A formatter that puts the file in one canonical form, so diffs between
  editors show only real changes.
- **I2 (scoped-slice)**: Give an agent only the part of the plan that touches the files it's
  changing, once plans outgrow one read.
- **I3 (code-citations)**: Check citations in code comments and commit messages too, so they
  break loudly when the plan changes.
- **I4 (skill-form)**: Ship the snippet and a short guide to the format as an Agent Skill
  (`SKILL.md`), so an agent asked to draft a plan edit knows the grammar even in repos without
  the format docs. The snippet itself stays in `AGENTS.md`, since a skill loads only when it
  looks relevant.
- **I5 (scoped-plans)**: A plan scoped to one part or capability, such as a package or a skill's
  folder, checked the same way and citing the root plan.
- **I6 (drafting-interview)**: An agent that interviews the owner, or drafts a first plan from
  existing notes, for a person to edit. Only after the pilots, since it would muddy H1.
````
