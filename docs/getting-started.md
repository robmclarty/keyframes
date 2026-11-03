# Getting started

This page takes you from a repo with no plan to one that people can read, agents work from, and
`keyframes check` keeps honest. It shows each step once, in the usual form.
[format.md](format.md) is the whole format, every finding included, and [agents.md](agents.md)
covers everything to do with agents.

## What keyframes does

keyframes is two things: a file and a check.

- **`keyframes.md`** is one short markdown file at the root of your repo. People use it to write
  down the intent behind the project: why it exists, what must always hold, what's been decided
  and why, what's still open, and how it should feel. Intent is prose. Everything else is a list
  of short items, each with an ID and a slug such as `C1 (one-writer)`, so people and agents can
  cite them.
- **`keyframes check`** reads that file against itself and against the repo, and reports
  whatever doesn't hold together, each finding with its fix. It gives the same answer on every
  machine.

The file gives agents and new people the context the code can't. The check tells you when the
plan has lost track of the repo, so it stays worth reading.

| `check` verifies | `check` doesn't |
| --- | --- |
| The file's structure: sections, items, IDs, slugs and sub-lines | Run your tests, or say whether they pass |
| Every citation names an item that exists, by its current slug | Judge whether the prose is true, clear or wise |
| Every file a `held-by:` line points at exists, and holds the text it quotes | Compare the code with the intent |
| Every Map path exists, as the file or directory it claims, in exact case | Notice code that no Map part claims |
| The plan stays within its budgets | Write, fetch or start anything |

So when the report says a constraint is `linked`, it means its pointers resolve: the file is
there, with the quoted text in it. It never means the constraint is enforced. Your tests and your
review do that, and keyframes tells you when the plan has lost track of them.

keyframes isn't a spec for every feature, a project tracker, a code generator or a judge of prose.
Tasks, tickets and feature specs belong elsewhere. The plan holds what stays true while they come
and go.

## Before you start

You need Node 24 or later. There's nothing to install, since `npx` fetches keyframes when it runs:

```sh
npx @robmclarty/keyframes --help
```

The rest of this page writes `keyframes` for short. If you haven't installed it, type
`npx @robmclarty/keyframes` in its place. To pin the version a repo uses, so that everyone and CI
get the same answer from the same files, add `@robmclarty/keyframes` as a dev dependency and run
it through your package manager.

## Start the file

```sh
cd path/to/your-repo
keyframes init
```

`init` writes a starter `keyframes.md` at the root, titled with the directory's name. Every
section is there, each with a note and an example inside an HTML comment, so none of it counts
yet. It never overwrites a plan that's already there.

Then it prints a short snippet for your agents. You'll paste it in when you
[tell your agents](#tell-your-agents), and [agents.md](agents.md) carries it too.

Run `keyframes check`. On the fresh file it finds one thing: a `no-intent` warning, because
Intent is empty. That's your first prompt.

## Write the Intent

Intent is prose. Write it the way you'd explain the project to a new teammate, in a paragraph or
three, covering:

- why it exists, and who it's for;
- what good looks like, in terms you'd notice;
- what it deliberately isn't.

The last is easy to skip and worth writing: it's what stops a well-meaning teammate, or agent,
from growing the project into something else.

<!-- check: clean -->

```markdown
# inkwell

## Intent

Inkwell keeps one person's notes in step between a phone and a laptop, for someone who writes on
planes. Good looks like an edit that's never lost, even after a week offline. It isn't a team
wiki or a publishing tool.
```

## Add the items that matter most

You don't need every section, and you don't need many items. Start with what someone new, or an
agent, would get wrong without being told. In most projects that's:

- **two or three Constraints**: what must always be true, so that breaking it is a bug;
- **the Decisions people keep reopening**, each with a `because:` line;
- **the open Questions**, so nobody settles one by accident.

<!-- check: no-intent -->

```markdown
## Constraints

- **C1 (one-writer)**: Only the sync worker writes to the database.
  - because: two writers made the replay disagree with the live state.

## Decisions

- **D1 (sqlite)**: Each device keeps its notes in one SQLite file, which only the sync worker
  writes, per [C1 (one-writer)].
  - because: one file is easy to back up and to reason about.

## Questions

- **Q1 (merging)**: How should two edits to the same line merge?
```

- **The ID**, `C1`, is the section's letter and a number. Never reuse a number, even after you
  delete its item, so an old citation can't land on a new item.
- **The slug**, `one-writer`, is a short name in lowercase words joined by hyphens.
- **Sub-lines** sit two spaces in, written `- key: value`. `because:` goes on any item, and
  [format.md](format.md#items) lists the other four.
- **A citation** is an ID and slug in brackets, `[C1 (one-writer)]`. Cite items anywhere in the
  plan, and in commit messages and summaries. Rename a slug, and `check` lists every citation in
  the plan that still uses the old one.

When you're not sure where something goes, ask what it is:

| If it's | Put it in |
| --- | --- |
| Something that must always be true, so that breaking it is a bug | Constraints |
| A journey through the system that has to keep working | Scenarios |
| A choice between options that's been made | Decisions, with a `because:` |
| A value that settles judgment calls nothing else covers | Principles |
| How it should look, read or feel | Taste |
| One of the main parts, and where it lives | Map |
| Something nobody has decided yet | Questions |
| A possibility worth considering someday, not agreed | Ideas |

Agents treat each section differently, so the choice matters. A Constraint makes an agent stop
and ask, a Decision is settled, a Question waits for a person, and an Idea isn't built until
someone asks for it. [format.md](format.md#sections) has the full table.

## Point at the repo

Two kinds of sub-line tie the plan to files, and `check` follows both into the repo.

**`held-by:` says what holds a Constraint or a Scenario.** Point at the test, lint rule or config
entry that enforces it, and quote a name from inside that file, so the plan notices when it's
renamed or deleted:

<!-- check: no-intent -->

```markdown
## Constraints

- **C1 (one-writer)**: Only the sync worker writes to the database.
  - because: two writers made the replay disagree with the live state.
  - held-by: file:test/writes.test.ts#"only the sync worker writes"
- **C2 (no-text-in-logs)**: Logs never hold a note's text.
  - held-by: file:test/logs.test.ts (new)
- **C3 (small-payloads)**: A sync payload stays under 64 KiB.
  - held-by: review
```

- **`(new)`** marks a pointer whose target you haven't written yet. It's counted as `planned`, not
  an error, and once the file exists `check` says the marker can go.
- **`review`** means a person checks it. That's honest, and it's fine for plenty of constraints.
- **No `held-by:` at all** is fine too. `check` counts the item as `unlinked` and doesn't warn,
  since most constraints start that way.

**`paths:` says where a Map part lives.** Keep the Map to the main parts, seven or fewer, so
someone new can find their way and an agent knows where new code goes:

<!-- check: no-intent -->

```markdown
## Map

- **M1 (sync)**: The sync worker, the only part that writes notes.
  - paths: src/sync/
- **M2 (api)**: The HTTP API the phone talks to.
  - paths: src/api/handler.ts
```

Paths are relative to the repo root and use `/`. A directory ends in `/`. Names match with exact
case on every OS, so a path that works on your laptop works in CI. [format.md](format.md#pointers)
has the details of both kinds of sub-line.

## Run the check

Here's the whole plan so far. The template's comments and its empty sections are left out here.
If you leave them in, the empty sections show as zeros in the counts.

<!-- check: clean -->

```markdown
# inkwell

## Intent

Inkwell keeps one person's notes in step between a phone and a laptop, for someone who writes on
planes. Good looks like an edit that's never lost, even after a week offline. It isn't a team
wiki or a publishing tool.

## Map

- **M1 (sync)**: The sync worker, the only part that writes notes.
  - paths: src/sync/
- **M2 (api)**: The HTTP API the phone talks to.
  - paths: src/api/handler.ts

## Constraints

- **C1 (one-writer)**: Only the sync worker writes to the database.
  - because: two writers made the replay disagree with the live state.
  - held-by: file:test/writes.test.ts#"only the sync worker writes"
- **C2 (no-text-in-logs)**: Logs never hold a note's text.
  - held-by: file:test/logs.test.ts (new)
- **C3 (small-payloads)**: A sync payload stays under 64 KiB.
  - held-by: review

## Decisions

- **D1 (sqlite)**: Each device keeps its notes in one SQLite file, which only the sync worker
  writes, per [C1 (one-writer)].
  - because: one file is easy to back up and to reason about.

## Questions

- **Q1 (merging)**: How should two edits to the same line merge?
```

`keyframes check` prints:

```text
keyframes.md

intent        yes
map           2 parts · 2 paths
constraints   3 · 1 linked · 1 planned · 1 review
decisions     1 · 1 active
questions     1 · 1 open
words         183 of 2000

no findings
```

The counts come first: each section, what its items add up to, and the words against the budget.
Findings follow, if there are any. Each names its line, how much it matters, a code that never
changes, and a message that says how to fix it.

| Exit code | Means |
| --- | --- |
| 0 | No errors. Warnings and notes are allowed. |
| 1 | Errors, or any warning under `--strict` |
| 2 | No verdict: no plan, an unreadable one, a bad flag or directory, or an unexpected error |

Once a plan is clean, `--strict` keeps it that way, since warnings fail the run too. Notes never
fail a run. A note means `check` read a variant of a form fine, and it shows the usual form.

## Tell your agents

Agents learn about the plan from the snippet `init` printed. Paste it into the file your agents
already read at the start of a session: `AGENTS.md` for most agents, or `CLAUDE.md` for Claude
Code, which can pull in `AGENTS.md` with a line `@AGENTS.md`. [agents.md](agents.md#where-it-goes)
lists more, and shows the snippet in full. It's the same in every repo.

It asks an agent to:

- read the plan before it changes code;
- stop and ask before it crosses a Constraint, and leave Decisions, Questions and Ideas for
  people to change, settle or take up;
- cite the items it relied on, in its summary or commit message;
- propose changes to `keyframes.md` rather than make them;
- run `keyframes check` after it changes anything the plan points at.

The snippet is guidance, and an agent can ignore it. Citations are how you see it working:

```text
fix(sync): batch the worker's writes

Writes still go only through the sync worker, per [C1 (one-writer)].
```

If an agent's work touches a constraint and its summary cites nothing, check that the snippet is
in a file that agent actually reads.

## Keep it in step

A plan is worth reading only while it's true. `check` can't tell you whether it's true, but it
can tell you when it has lost track of the repo.

### Run it where changes land

- **After any edit to the plan**, by anyone.
- **After renaming or moving anything the plan points at**, such as a test that holds a
  constraint.
- **In CI**, so a change that breaks a pointer fails before it merges:

  ```sh
  npx @robmclarty/keyframes check --strict
  ```

  Pin the version there, as [Before you start](#before-you-start) says, so CI and your machine
  give the same answer.

### When check finds something

Say an agent tidies a test's name from "the worker is the only writer" to "only the sync worker
writes", and nobody touches the plan:

<!-- check: broken-pointer -->

```markdown
# inkwell

## Intent

Inkwell keeps one person's notes in step between a phone and a laptop.

## Constraints

- **C1 (one-writer)**: Only the sync worker writes to the database.
  - held-by: file:test/writes.test.ts#"the worker is the only writer"
```

```text
keyframes.md

intent        yes
constraints   1 · 1 broken
words         38 of 2000

keyframes.md:10  error  broken-pointer  file:test/writes.test.ts#"the worker is the only writer" doesn't contain that text; fix it, or add "(new)" if it's planned

1 error
```

The plan and the repo no longer agree, and a person decides which one is wrong:

- **The plan is stale.** The test still holds the constraint under its new name, so update the
  quoted text.
- **The code is wrong.** The change removed what held the constraint, so put it back.
- **The check isn't there yet.** Mark the pointer `(new)` until it is, or hold the item by
  `review` meanwhile.

There's always a legitimate way through. If the constraint itself no longer holds, that's a
change to the plan, and a person makes it.

### Change the plan

- **Add an item** with a number no item has used.
- **Replace a decision** by adding the new one and marking the old one `superseded-by: D2`. Keep
  the old one, so citations to it still resolve.
- **Settle a question or an idea** by recording a decision, and marking it `resolved-by: D3`.
- **Rename a slug** on the item, then run `check`. It lists every citation that still uses the
  old name.

The longer history, of how decisions changed and the debates behind them, belongs in a log
outside the plan, since the plan holds what's in force. [format.md](format.md#changing-the-plan)
has more.

## Using it well

- **Write the why.** A Decision without `because:` is a rule nobody can weigh when circumstances
  change, and `check` warns about one.
- **Keep it short.** Someone new should be able to read it in ten minutes. `check` warns past the
  [budgets](format.md#budgets): 2000 words for the file, 60 for an item, and a dozen or fewer
  items in most sections.
- **Keep constraints few and firm.** An agent honours a handful of standing rules better than a
  hundred.
- **Write only what's true now.** If the code already breaks something you'd like to be a
  constraint, it isn't one yet. Fix the code first, or write it as a Question.
- **People own it.** An agent can draft items, or a whole first plan from your README and notes,
  but a person reads and accepts every line. That's what makes the file worth trusting.

### In a project that already exists

You don't have to write it all at once. Good places to look:

- **Intent**: the opening of the README, and what you'd tell a new teammate on their first day.
- **Map**: the top-level directories. Name the main parts, not every folder.
- **Constraints**: the tests and lint rules that already enforce a rule, so you can point at
  them, and the corrections you've made in review more than once.
- **Decisions**: the choices people keep asking about.
- **Questions**: the arguments that are still open.

### When it outgrows one file

A plan that outgrows its budgets splits by scope instead of raising them, as this repo's own
[`keyframes.md`](../keyframes.md) decides. The root plan keeps the core that holds everywhere. A
part with reason to stand alone, such as a deep module, gets its own `keyframes.md` beside its
code, which says why it stands alone and adds to the root without overriding it.

`keyframes check packages/sync` checks a part's plan alone. It treats that folder as the repo
root, so the part's pointers and paths are relative to it. It can't cite the root plan yet: there,
a citation to a root item is a `broken-citation`, so name root items in plain text, without
brackets, for now.

## Where next

- [format.md](format.md) is the whole format: every section, sub-line, variant, budget and
  finding.
- [agents.md](agents.md) has the snippet, where it goes for each agent, and the JSON report for
  [harness authors](agents.md#for-harness-authors).
- [`keyframes.md`](../keyframes.md) is keyframes' own plan, checked with `--strict` on every
  change, so it's a worked example.
