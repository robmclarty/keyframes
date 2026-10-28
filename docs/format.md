# The keyframes format

`keyframes.md` is one markdown file at the root of a repo, where people write down the intent
behind a project: why it exists, what matters, what must always hold, and how it should feel.
Other people read it and build on it. Coding agents read it and are guided by it. `keyframes check`
keeps it consistent, and gives the same answer every time.

This page is the whole format. You don't need to learn it before you start: `keyframes init`
writes a starter file with an example in every section, and `keyframes check` says exactly where a
line doesn't read and how to fix it. To tell your agents about the plan, see
[agents.md](agents.md).

## A small plan

Here's a whole plan for a small notes app:

<!-- check: clean -->

```markdown
# inkwell

## Intent

Inkwell keeps one person's notes in step between a phone and a laptop, for someone who writes on
planes. Good looks like an edit that's never lost. It isn't a team wiki.

## Principles

- **P1 (local-first)**: The device holds the truth; the server only relays.

## Map

- **M1 (sync)**: The sync worker, the only part that writes notes.
  - paths: src/sync/

## Constraints

- **C1 (one-writer)**: Only the sync worker writes to the database, per [P1 (local-first)].
  - because: two writers made the replay disagree with the live state.
  - held-by: file:test/writes.test.ts#"only the sync worker writes"

## Decisions

- **D1 (sqlite)**: Each device keeps its notes in one SQLite file.
  - because: one file is easy to back up and to reason about.

## Questions

- **Q1 (merging)**: How should two edits to the same line merge?
```

`keyframes check` reads it and prints:

```text
keyframes.md

intent        yes
principles    1
map           1 part · 1 path
constraints   1 · 1 linked
decisions     1 · 1 active
questions     1 · 1 open
words         143 of 2000

no findings
```

The rest of this page explains each piece.

## Starting a plan

`keyframes init` writes a starter `keyframes.md` in the current directory, or in the one you name:
`keyframes init path/to/repo`. Every section is there, with a note and an example in each, inside
HTML comments. It never overwrites a plan that's already there.

Then it prints a short snippet for the file your agents already read, such as `AGENTS.md`;
[agents.md](agents.md) says where it goes.

`keyframes check` on the fresh file finds one thing: `no-intent`, a warning that Intent is empty.
That's the first prompt to write something.

## Sections

`##` headings divide the file into sections. There are nine. Every one is optional, and they can
come in any order.

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

- **Intent is prose.** Write it the way you'd explain the project to a new teammate. Every other
  section is a list of items.
- **Any other `##` heading is yours.** A `## Glossary` or `## Notes` is kept, and read by people
  and agents. `check` doesn't parse it.
- **`###` headings group items** inside a section. A `#` heading ends the section.
- **Each section appears once.** Heading text matches in any case.
- **Code and comments are invisible to `check`.** Nothing inside a code block, inline code or an
  HTML comment is a heading, an item or a citation. That's why the starter's examples sit in
  comments. A code block or a comment that never closes hides the rest of the file, so `check`
  warns.

## Items

An item is a bullet at the start of a line, under its section:

<!-- check: no-intent -->

```markdown
## Constraints

- **C3 (one-writer)**: Only the sync worker writes to the database.
  - because: two writers made the replay disagree with the live state.
  - held-by: file:test/writes.test.ts#"only the sync worker writes"
```

- **The ID**, `C3`, is the section's letter and a number. Numbers start at 1, and gaps are fine.
  No two items share an ID. A deleted item's ID is never used again, so an old citation can't end
  up pointing at a different item. That one's a convention, since `check` can't see what was
  deleted.
- **The slug**, `one-writer`, is a short name in lowercase words joined by hyphens, in any
  language: `café-crème` works too. It's how `check` notices a citation that still uses an item's
  old name.
- **The text** follows the colon. Indented lines below it that aren't bullets carry it on. The
  item ends at the next line that starts at the left margin.
- **Sub-lines** are bullets indented two spaces under the item, written `- key: value`. Indented
  lines below one carry its value on. There are five keys, and each appears at most once on an
  item:

| Key | Goes on | What it holds |
| --- | --- | --- |
| `because` | any item | Why. Every Decision should have one. |
| `held-by` | Constraints and Scenarios | What holds it: `review`, pointers to files, or both ([Pointers](#pointers)) |
| `paths` | Map parts | Where the part lives ([The Map](#the-map)) |
| `superseded-by` | Decisions | The ID of the decision that replaced this one, such as `D9` |
| `resolved-by` | Questions and Ideas | The ID of the decision that settled it, such as `D9` |

Paragraphs between items are welcome, and so are other bullets nested under an item: they're part
of its prose.

### What isn't an item

In a section with items, a bullet at the left margin that isn't an item is a warning, *because*
people and agents will read it as a rule, but nothing can cite it:

- **No slug.** `- **C3**: …` still counts as an item, with a `missing-slug` warning.
- **Starts like an item.** A bold ID followed by `(` or a colon is meant as an item. If it still
  can't be read, as in `- **C8 (bad slug!)**: …`, that's a `malformed-item` error.
- **Anything else** is a `not-an-item` warning: `- **C4 model**: …` or `- Remember to …`.

Some lines look like the grammar but stay prose, so ordinary writing never fails a run:

- **An item without bold counts only under its own letter.** `- S3 (uploads): …` is a Scenario
  under Scenarios. In the Map it's `not-an-item`, and under Intent or a heading of your own it's
  plain prose. With bold, `- **S3 (uploads)**: …` is meant as an item wherever it is.
- **Bold with no slug and no colon isn't an ID.** `- **S3** holds uploads` is prose.
- **Under an item, only a bullet shaped like a sub-line is read as one.** A key nobody knows gets
  an `unknown-key` warning only when it's written the way a key is: a `-` bullet two to five
  spaces in, then a lowercase word, a colon and a space. `- Pros: fast`, `- http://localhost` and
  numbered bullets are part of the item's text.
- **A bracketed ID with no slug is a citation only while that item exists**, so a markdown link
  such as `[S3]` stays a link.

Here, `check` reads one decision, and its Pros and Cons are part of its text:

<!-- check: no-intent -->

```markdown
## Decisions

- **D2 (object-store)**: Uploads go to S3, not the database.
  - because: files that size don't belong in a row.
  - Pros: cheap, and someone else runs it.
  - Cons: one more service to sign in to.
```

## Citations

A citation is an item's ID and slug in square brackets: `[C1 (one-writer)]`.

- **Cite anywhere** outside code and comments: in Intent, in an item's text, in a sub-line, or
  under a heading of your own. Agents cite items the same way in their summaries and commit
  messages.
- **A citation must name an item that exists, by its current slug.** Rename a slug and `check`
  lists every citation still using the old one.
- **Without brackets, an ID is plain text**, so S3, D3.js and the C4 model mean what they always
  meant.
- **`superseded-by:` and `resolved-by:` take a bare ID**, such as `D2`. It must exist, and be a
  decision.

<!-- check: no-intent -->

```markdown
## Decisions

- **D1 (postgres)**: Each device keeps its notes in Postgres.
  - because: it was what we knew.
  - superseded-by: D2
- **D2 (sqlite)**: Each device keeps its notes in one SQLite file.
  - because: one file is easy to back up, and it answers [Q1 (storage)].

## Questions

- **Q1 (storage)**: Where should a device keep its notes?
  - resolved-by: D2
```

## Pointers

`held-by:` on a Constraint or a Scenario says what holds it:

| Pointer | Resolves when |
| --- | --- |
| `review` | Always. A person checks this. |
| `file:<path>` | `<path>` is a file in the repo. |
| `file:<path>#"<text>"` | The file exists and contains `<text>` exactly: a test's name, a rule's ID, a config entry. |

- **Add `(new)` after a pointer whose target doesn't exist yet.** It's planned: counted, not an
  error. Once the target exists, `check` says so, and the marker can go.
- **List several pointers with commas**, across lines if you like. Inside the quotes, `\"` is a
  quote, `\\` is a backslash, and a comma doesn't split pointers.
- **Paths are relative to the repo root and use `/`.** They match the repo's names with exact case,
  on every OS. An absolute path, a `..`, or a path that leads outside the repo is an error.
  Backticks around a pointer or a path are ignored, since they keep markdown from reading a
  path's underscores as emphasis. `./` and doubled slashes read fine, with a note. A file over
  1 MiB isn't searched for text.
- **One kind of pointer is enough**, *because* every test, lint rule and config entry lives in a
  file.

Each Constraint and Scenario gets a status from its pointers:

<!-- check: no-intent -->

```markdown
## Constraints

- **C1 (one-writer)**: Only the sync worker writes to the database.
  - held-by: file:test/writes.test.ts#"only the sync worker writes"
- **C2 (no-text-in-logs)**: Logs never hold a note's text.
  - held-by: file:test/logs.test.ts (new), review
- **C3 (small-payloads)**: A sync payload stays under 64 KiB.
  - held-by: review
- **C4 (utf8)**: Notes are UTF-8 everywhere.
```

| Status | Meaning | Above |
| --- | --- | --- |
| `linked` | Every pointer resolves | C1 |
| `planned` | Some pointer is `(new)`, and none is broken | C2 |
| `review` | Held only by `review` | C3 |
| `unlinked` | No `held-by:` line | C4 |
| `broken` | Some pointer doesn't resolve, which is an error | |

`unlinked` and `review` are counted, not warned, *because* a warning should mean "probably a
mistake", and most constraints start life without a check.

## The Map

A Map part names one of the project's main parts, and `paths:` says where it lives: files, or
directories ending in `/`, separated by commas.

<!-- check: no-intent -->

```markdown
## Map

- **M1 (sync)**: The sync worker, the only part that writes notes.
  - paths: src/sync/
- **M2 (api)**: The HTTP API the phone talks to.
  - paths: src/api/handler.ts, src/api/routes.ts (new)
- **M3 (history)**: How a note's history is drawn; a concept for now.
```

- Each path must exist and be the kind it claims, a file or a directory, unless it's `(new)`.
- A part with no paths is fine. It may be a concept, or not built yet.
- The same path in two parts, or one part's path inside another's, is a warning.
- A Mermaid diagram is welcome here. It's a picture, and nothing checks it.

## Changing the plan

The format is built for a file that many people edit over a long time.

- **Add an item** with a number no item has used.
- **Replace a decision** by adding the new one and marking the old one `superseded-by: D2`. Keep
  the old one: citations to it still resolve, and the trail of thinking stays.
- **Settle a question or an idea** by recording a decision and marking it `resolved-by: D3`.
- **Rename a slug** on the item, then run `keyframes check`: it lists every citation that still
  uses the old one.
- **Agents propose; people decide.** Run `keyframes check` after any edit, from anyone. It reports
  what the edit broke.

## Budgets

A plan nobody can read in ten minutes stops being read, so `check` warns when one grows past these:

| What | Budget |
| --- | --- |
| The whole file, outside code and comments | 2000 words |
| One item's text | 60 words |
| Principles, and Map parts | 7 each |
| Constraints, and Taste | 12 each |
| Scenarios, open Questions, and open Ideas | 10 each |
| Active Decisions (not superseded) | 20 |

A word is any run of characters between spaces, markup included, so `- **C3 (one-writer)**:` is
three. A budget is a warning, and fails a run only under `--strict`. These are starting values,
and they'll change as people use the format.

## Other ways to write it

Each piece of the format has one usual form, and this page, the starter file and every message
from `check` use it. `check` also reads common variants exactly like the usual form, and gives
each one a note that shows the usual form. A note never fails a run, even with `--strict`.

Case never matters, and gets no note: `## constraints`, `c3`, `(One-Writer)`, `Because:`, `REVIEW`
and `File:` all read fine. Paths are different: they match the repo's names with exact case.

| Form | Usual | Also read, with a note |
| --- | --- | --- |
| Plan file | `keyframes.md` | The name in any other case: `KEYFRAMES.md` |
| Heading | `## Constraints` | The singular: `## Constraint`. The heading's text on a line of its own, with a line of `-` under it |
| Item line | `- **C3 (one-writer)**: …` | A `*`, `+` or numbered bullet. A bullet one to three spaces in. No bullet, as a paragraph, when a colon or a dash follows the bold. `__` for bold. No bold, when a colon follows the slug and the item is under its own section. The colon inside the bold, a dash (`-`, `–` or `—`) instead of it, or nothing when there's a slug. Other spacing |
| ID | `C3` | Leading zeros: `C03` |
| Slug | `one-writer` | Spaces or underscores for the hyphens: `(one writer)` |
| Sub-line | `- because: …`, two to five spaces in | A `*` or `+` bullet, at any indent under the item. A bold key, with the colon inside the bold or after it. A space or underscore for the key's hyphen: `held by:`. `path:` for `paths:`. Other spacing |
| Citation | `[C3 (one-writer)]` | Other spacing: `[C3(one-writer)]`. A bare `[C3]` while C3 exists, though it can't notice a rename |
| Reference | `superseded-by: D9` | Brackets, a slug, or both: `[D9]`, `D9 (sqlite)` or `[D9 (sqlite)]`. A slug must be the decision's own |
| Path | `src/api/` | `.` segments and doubled slashes: `./src//api/` |

A line that could mean two things isn't a variant. `check` reports it with the usual form, and
never guesses.

<!-- check: no-intent, 8 alternate-form -->

```markdown
## Constraint

* **C1 (one writer):** Only the sync worker writes to the database.
  * held by: file:test/writes.test.ts#"only the sync worker writes"
- C2 (no-text-in-logs): Logs never hold a note's text, per [C1(one-writer)].
```

`check` reads that exactly like the usual form, and notes each variant once, naming every line
that uses it:

```text
keyframes.md

intent        no
constraints   2 · 1 linked · 1 unlinked
words         33 of 2000

keyframes.md:1  warning  no-intent       there's no "## Intent"; add one that says why this project exists and who it's for
keyframes.md:1  note     alternate-form  "## Constraint" reads fine; the usual form is "## Constraints"
keyframes.md:3  note     alternate-form  "*" bullets read fine; the usual form is "-" (lines 3, 4)
keyframes.md:3  note     alternate-form  a colon inside the bold reads fine; the usual form puts it after the bold: - **C<n> (<slug>)**: …
keyframes.md:3  note     alternate-form  spaces in a slug read fine; the usual form joins its words with hyphens: (one-writer)
keyframes.md:4  note     alternate-form  "held by:" reads fine; the usual form is "held-by:"
keyframes.md:5  note     alternate-form  "[C1(one-writer)]" reads fine; the usual form is [C1 (one-writer)]
keyframes.md:5  note     alternate-form  an item without bold reads fine; the usual form puts its ID and slug in bold: - **C<n> (<slug>)**: …

1 warning · 8 notes
```

## Checking the plan

```text
keyframes check [dir] [--json] [--strict]
```

`dir` is the repo root, and defaults to the current directory. `check` reads the plan, follows
every pointer and path into the repo, and prints a report. It only reads: it writes nothing, runs
nothing, and opens no network connection, so the same plan and files give the same report on any
machine.

| Exit code | Means |
| --- | --- |
| 0 | No errors. Warnings and notes are allowed. |
| 1 | Errors, or any warning under `--strict` |
| 2 | No verdict: no plan, an unreadable one, a bad flag or directory, or an unexpected error |

`--json` prints one JSON object instead of the text: the same counts and findings, plus every item
with its text, its sub-lines and what each pointer and path resolved to. Its shape is
[`schema/report.schema.json`](../schema/report.schema.json).

### The report

Here's a plan with a few mistakes in it:

<!-- check: broken-pointer, duplicate-id, missing-because, slug-mismatch -->

```markdown
# inkwell

## Intent

Inkwell keeps one person's notes in step between a phone and a laptop.

## Constraints

- **C1 (one-writer)**: Only the sync worker writes to the database.
  - held-by: file:test/writer.test.ts
- **C2 (no-text-in-logs)**: Logs never hold a note's text.
- **C2 (small-payloads)**: A sync payload stays under 64 KiB.

## Decisions

- **D1 (sqlite)**: Each device keeps its notes in one SQLite file, per [C1 (single-writer)].
```

And its report:

```text
keyframes.md

intent        yes
constraints   3 · 2 unlinked · 1 broken
decisions     1 · 1 active
words         69 of 2000

keyframes.md:10  error    broken-pointer   file:test/writer.test.ts isn't in the repo; fix the path, or add "(new)" if it's planned
keyframes.md:12  error    duplicate-id     C2 is already the ID on line 11; give this item a number no other item uses
keyframes.md:16  warning  missing-because  D1 doesn't say why; add a line under it: - because: …
keyframes.md:16  error    slug-mismatch    [C1 (single-writer)] cites C1, which is now (one-writer)

3 errors · 1 warning
```

The counts come first: each section the plan has, what its items add up to, and the words against
the budget. Then each finding names its line in the plan, how much it matters, a code that never
changes, and a message that says what it found and shows the usual form. Notes come last, one line
for each kind of variant. A clean run ends with `no findings`.

### Findings

An error fails a run. A warning fails it only under `--strict`. A note never does.

| Code | Severity | When |
| --- | --- | --- |
| `duplicate-section` | error | A section appears twice |
| `malformed-item` | error | A bullet starts like an item (`**C4 (`, `**C4**:`) but can't be read as one, even as a variant |
| `wrong-letter` | error | An item's letter doesn't match its section |
| `duplicate-id` | error | Two items share an ID |
| `duplicate-key` | error | An item repeats a sub-line key |
| `broken-citation` | error | A citation names an ID that doesn't exist |
| `slug-mismatch` | error | A citation's slug isn't the item's current slug |
| `bad-pointer` | error | An unknown pointer, bad quoting, an empty `held-by:`, or an absolute, `..` or outside path |
| `broken-pointer` | error | A pointer's file or text isn't there, and it isn't `(new)` |
| `broken-path` | error | A Map path doesn't exist or is the wrong kind, and it isn't `(new)` |
| `bad-reference` | error | `superseded-by` or `resolved-by` names a missing ID or one that isn't a decision |
| `file-too-large` | error | A pointer's file is over 1 MiB, so its text isn't searched |
| `no-intent` | warning | There's no Intent section, or it's empty |
| `not-an-item` | warning | A bullet in a section with items isn't an item, and doesn't start like one |
| `item-outside-section` | warning | An item sits outside the sections with items, as in Intent or under a heading of your own |
| `missing-slug` | warning | An item has no slug, so citations to it can't notice a rename |
| `unknown-key` | warning | A sub-line's key isn't one of the five |
| `key-not-allowed` | warning | A key on the wrong kind of item, such as `held-by` on a Principle |
| `missing-because` | warning | A Decision doesn't say why |
| `built-not-new` | warning | A `(new)` target exists now, so the marker can go |
| `planned-text-missing` | warning | A `(new)` pointer's file exists but doesn't contain its text: a typo? |
| `path-overlap` | warning | Two parts claim the same path, or one part's path is inside another's |
| `over-budget` | warning | A [budget](#budgets) is exceeded |
| `unclosed-fence` | warning | A code block never closes, so the rest of the file reads as code |
| `unclosed-comment` | warning | A comment never closes, so the rest of the file is hidden |
| `alternate-form` | note | A [variant](#other-ways-to-write-it) of a usual form, read exactly like it |
