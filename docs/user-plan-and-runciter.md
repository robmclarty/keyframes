# Note: the plan above the root, and runciter as a reader

**Status:** a note written 2026-11-08, from a conversation about how a long-horizon builder
should remember what every agent must follow across all of a person's projects. Nothing here
is in force; it proposes items for [`keyframes.md`](../keyframes.md) at the end, and it assumes
[`scoped-plans.md`](scoped-plans.md), which settles how plans chain. Its items are numbered to
land after that spec's and after [`lookouts-contract.md`](lookouts-contract.md)'s. It isn't ready
to accept while the first open question below, on P3 and C2, stands. The runciter side is its
`docs/specs/runciter-memory-tiers-and-night-shift.md`.

## Frame

- **Problem:** A person who runs agents across many repos has things they want every agent to
  hold: principles ("report, don't refuse"), constraints ("no secrets in a committed file"),
  taste ("named exports, no classes"). Today each repo's `keyframes.md` repeats them or
  leaves them out, and a tool that runs agents across repos (runciter) has no one place to
  read them. The same person asks for "settings for runciter's agents to follow", and the
  thing they are describing is intent, which already has a format.
- **Smallest thing that solves it:** One more plan at the top of the chain
  [`scoped-plans.md`](scoped-plans.md) already describes. A `keyframes.md` at a user path is
  the plan above every repo root. A root plan cites up into it the way a part plan cites up
  into the root; `check` resolves the chain one level higher; nothing overrides anything
  (D8, grow-by-scope, applies upward as it applies downward).
- **Done looks like:** a person writes their standing rules once. Every repo's `check` sees
  them, every citation into them resolves, and a tool that builds a context for an agent
  reads the user's Principles and Constraints first, then the repo's, then the part's.

## What holds

- **D8 (grow-by-scope)** gives the rule: a plan below adds to the plan above and does not
  override it. The user's plan is the top; a repo's root adds to it. A repo whose root
  contradicts the user's plan has a finding, as a part contradicting its root does.
- **The chain is found, never configured** (D4, no-config, for as long as it holds). The user
  plan's path is a convention, with one environment variable to move it.
- **Budgets hold at every level.** The user's plan is short for the same reason the root is:
  an agent honours a handful of standing rules better than a hundred.
- **People write it; tools read it.** No tool writes the user's plan, and runciter least of
  all.

## The format

**Where.** `$XDG_CONFIG_HOME/keyframes/keyframes.md`, falling back to
`~/.config/keyframes/keyframes.md`; `KEYFRAMES_USER_PLAN` names another path. A repo with
no user plan above it checks exactly as today.

**What goes in it.** The same sections, grammar and budgets. In practice Principles,
Constraints and Taste carry most of it; a Map is unusual at this level (there is no code to
point at) and is allowed to be absent, which the grammar already permits for a part.
Decisions are allowed and rare: "I use pnpm" is a Decision with a because, and a repo that
cites it need not re-decide.

**Citations.** A root plan cites the user's items with the scoped form the scoped-plans spec
gives a part for the root, with the user plan's slug fixed as `user`: `[user:C2 (no-secrets)]`.
A part cites it the same way through its root. The user's plan cites nothing; it is the top.

**Scope and strays.** A user Constraint with a `held-by:` pointer resolves the pointer against
the repo being checked, so `held-by: file: rules/no-secrets.yml` means "this repo has that
rule". A repo without it is a finding against the repo, named with the user item's ID, and
the fix is to add the rule or to say in the root why the constraint does not apply here (a
`waived-by:` on the root's side is the open question below).

**Conflicts.** A root item whose statement negates a user item is a finding; `check` can only
see the obvious cases (the same `held-by:` pointer asserted and denied, a slug reused with a
different statement), and that is enough. The rest is a person's reading.

## The tool

- **`check`** reads the user plan when present, resolves `user:` citations, reports it as the
  top of the tree in one run, and gives a repo with no user plan the report it gets today.
  `check --no-user` ignores it, for a repo checked on a machine that is not its owner's.
- **`init --user`** writes the user plan from the template, with the snippet for a root plan's
  citation form.
- **`context [path]`** (new, small) prints the Principles and Constraints that apply to a path,
  resolved up the chain: user, root, parts. This is the one call a tool like runciter needs
  to fill a context section, and it keeps the chain resolution in keyframes rather than in
  every reader.

## Runciter as a reader

Runciter's note proposes three uses, each a read:

1. **A `keyframes` section in every run's context pack**, ahead of lessons: the Principles and
   Constraints that `keyframes context <seam paths>` returns. Intent outranks learning.
2. **`keyframes check --strict` inside its verify**, so a run's change is checked against the
   plan with everything else.
3. **The root Map's parts as the scheduler's contract paths**, so a step whose seam reaches a
   shared part is treated as a barrier.

None writes the plan. The `context` verb above is the only thing keyframes adds for them,
and it is useful without runciter: an agent's harness can print it into a prompt directly.

## Changes to the plan

To add to [`keyframes.md`](../keyframes.md) when this is accepted. The IDs continue after
[`scoped-plans.md`](scoped-plans.md) (D11–D14, S4, Q4, Q5) and
[`lookouts-contract.md`](lookouts-contract.md) (D15, D16, Q6). This note's readers-not-writers
Decision is folded into that note's D16 (one-way-contract), which says the same thing, so it isn't
proposed again here; this note relies on [D16 (one-way-contract)].

- **D17 (user-plan)**: A `keyframes.md` at the user's config path is the plan above every repo
  root; a root cites it as `[user:ID (slug)]`; it adds to nothing and nothing overrides it.
  - because: standing rules a person holds across repos are intent, and intent has a format.
- **Q7 (waived-by)**: How does a repo say a user constraint does not apply to it, so that a
  missing `held-by:` is not a finding? Lean: `waived-by:` on the root item that cites it, with
  a reason, counted in the report (D5, counts-not-nags).
- **I9 (context-verb)**: `keyframes context <path>` prints the items that apply to a path,
  resolved up the chain, for harnesses that build an agent's context.

I9 doesn't depend on the user plan; it resolves a scoped chain just as well, so it can be added
as an Idea on its own before the rest of this note is settled.

## Open questions

- **How a plan read from the user's home squares with P3 (same-answer-everywhere) and C2
  (byte-identical).** With the user plan read by default, the same repo gives one report on its
  owner's machine and another in CI or on a collaborator's, and a root that cites `[user:C2]`
  fails `check` everywhere but the owner's machine. `--no-user` turns it off but leaves the
  default unreproducible. No lean yet; options include reading it only under an opt-in
  `--user`, or treating an unresolved `user:` citation as counted rather than broken when no
  user plan is present. A person decides this before the note goes further.
- **Whether `user:` fits the citation form scoped plans settles.** The scoped-plans spec
  cites into a part with a slash, `[sync/C2 (one-writer)]`, and cites up into the root bare; this
  note's `[user:C2 (no-secrets)]` uses a colon, so the two forms would differ. No lean yet.
- Whether the user plan should be allowed a Map at all. Lean: no; a Map at this level would
  point at repos, and the tool that knows the repos is not keyframes.
- Whether `user:` is the right fixed slug, or the plan should declare its own. Lean: fixed;
  there is one, and a name invites a second.
- What `check` does when the user plan itself fails its budgets. Lean: the same findings,
  reported at the top of the tree, failing the run the same way.
