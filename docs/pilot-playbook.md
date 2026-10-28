# Pilot playbook

How to run the pilots, step by step. The spec's [Pilots](prototype.md#pilots) section is the
protocol, and [`pilots.md`](pilots.md) is where the results go. This page is the order to do it in,
and what to collect along the way so the closing call can rank the next build on evidence.

## The shape: wide and deep

- **Wide: every repo you're working in.** Write a plan in each one and work as usual. That's
  cheap, about 45 minutes a repo, and it's where H1 (expressible) and H4 (checkable) get most of
  their data, and where agents show whether they cite items (S3) without being asked.
- **Deep: three repos.** Only these get the expensive measures: a cold read by a second person
  (H2) and the paired agent runs (H3), which take 16 runs a repo.

The three deep repos need, between them, one that isn't TypeScript, one large enough to press on
the budget, and one changing fast enough that the agent tasks are real work. The spec also asks
for one with a second regular contributor. If none of yours has one, say so in the record: H2
still runs, with a reader who doesn't contribute.

## Before you start

1. **Publish**, then run `npx @robmclarty/keyframes --version` from an empty directory.
2. **Fill in the tables** at the top of `pilots.md`: the three deep repos, a second reader for
   each, and the two H3 models with their harnesses.
3. **Choose the H3 harnesses.** Each must load the repo's `AGENTS.md` (Claude Code loads it
   through `CLAUDE.md`'s `@AGENTS.md` line). The local one should have a small built-in prompt.
   Use the same two in every repo.

## In each repo

1. **Write the plan (H1).** `npx @robmclarty/keyframes init`, then write it, timed, reading
   nothing but the template. Note the sections you skipped and anything you couldn't place. Paste
   the snippet into `AGENTS.md`, and commit both.
2. **Check it, and triage everything (H4).** Run `npx @robmclarty/keyframes check`. Mark every
   finding, notes included, useful, noise or wrong, with a reason. For each Constraint `check`
   counts as unlinked, also note whether a warning there would have helped: that's Q2's answer.
3. **Work as usual.** When an agent cites an item, or crosses a constraint without asking, write
   one line in the record. Run `check` after every plan edit, and triage anything new.

The wide repos stop there. The deep three go on:

1. **Cold read (H2).** The reader reads the plan, timed, explains the project in three sentences,
   makes one edit of their choice, and runs `check`. You rate the explanation.
2. **Paired runs (H3).** Pick four real tasks from the backlog, at least two of which touch a
   constraint or a decision. For the runs without the plan, use a worktree with `keyframes.md`
   deleted and the snippet taken out of `AGENTS.md`. Run every task in a fresh session in both
   worktrees, on both models, and fill one row per run. If an unattended runner such as
   night-shift fits the repo, give it one task too, with the plan and without.

## Evidence for the next build

Collect these as you go. Each one costs minutes, and each answers whether a candidate is worth
building.

| Candidate | Collect | It's worth building if |
| --- | --- | --- |
| Checking the Map against the code | At the start and the end, list the top-level directories no part claims, and every move or rename that left the Map stale. Note which ones `broken-path` already caught. | Drift happens, and `broken-path` misses most of it |
| A formatter | For every plan edit, yours, an agent's or the reader's, count the diff lines that change only form: wrapping, bullets, spacing. Note the `alternate-form` notes that pile up. | Form-only lines make up a real share of plan diffs |
| Citations in code and commits | At the end, search each repo's commits and comments: `git log --grep='\[[A-Z][0-9]* ('` and `git grep -n '\[[A-Z][0-9]* ('`. Count the citations, and the ones a rename broke. | Agents cite outside the chat, and some of those citations go stale |
| A scoped slice of the plan | Record each plan's word count, and the tokens H3 says the plan added. Note any local run that stalled reading the plan before it started work. | A plan nears the budget, or the plan's tokens visibly slow the local model |
| Something the pilots surface | Keep one running list of anything you wanted from `keyframes` and didn't have. | It shows up in more than one repo |
| A skill that teaches agents the format (I4) | Each time an agent edits `keyframes.md`, note whether `check` passed first time, and what it got wrong. | Agents' plan edits keep failing `check`, even with its messages to go on |

**Splitting by scope gets its first trial in plumbbob.** This repo's plan settles that a plan
which outgrows its budgets splits by scope, and keeps its history in a log (D8 and D9), but
`check` doesn't read a split yet. plumbbob's `docs/decisions.md` holds over a hundred decisions,
so:

1. Write plumbbob's root plan by hand, keeping only the core that holds everywhere. Leave the rest
   in `docs/decisions.md`, which stays the log.
2. Have an agent draft the same split from `docs/decisions.md`, and compare its core with yours.
   That says whether a drafted split (I7) can be trusted.
3. If a part wants a plan of its own, write it beside its code and check it alone with
   `npx @robmclarty/keyframes check <its folder>`. Note what that can't do yet, such as citing the
   root plan. Those notes are the design for scoped plans.

## Close

When all three deep pilots are in, fill in `pilots.md`'s results and its closing call: keep,
change or cut each section, pointer form, variant and finding, then rank the candidates above by
what the evidence showed. Remember that you wrote the format, so your H1 times are a floor, not a
newcomer's. If someone else writes a plan from `init` during the pilots, record their time beside
yours.
