# Note: decisions that decay, and the contract with lookouts

**Status:** a note written 2026-11-11, from a conversation about the part of building software
that never stays done. Nothing here is in force; it proposes one key for the format and the
items at the end, numbered to land after [`scoped-plans.md`](scoped-plans.md) and before
[`user-plan-and-runciter.md`](user-plan-and-runciter.md). The runciter side is
`runciter/code/runciter/docs/specs/runciter-lookouts-and-routines.md`.

## Frame

- **Problem:** Some Decisions are true only for as long as the world agrees. "CSRF protection
  comes from `csrf-csrf`" is a pin and a line in `package.json` today, and a deterministic check
  holds the pin. What nothing holds is the question behind it: is this still the right answer to
  the problem, is the library still patched, has something better or built-in arrived? A person
  keeps that in the back of their head until they forget it, and the forgotten one is the
  dependency that goes stale.
- **Smallest thing that solves it:** Let a person mark, in the plan and in plain words, that a
  Decision or Constraint *decays*, and what in the world could make it wrong. A separate, formal
  file (`lookouts.yaml`, owned by runciter) assigns a standing agent, a **lookout**, to each one.
  The plan stays prose for people; the lookout file stays machine-shaped for tools; the contract
  between them is item IDs and the JSON report `check` already prints.
- **Done looks like:** a person writes `watch:` under a Decision and moves on. A tool notices the
  Decision has no lookout and drafts one. When the person later changes or supersedes the
  Decision, the lookout that guarded it is flagged for amendment or stand-down, and nobody has to
  remember that it existed.

## What holds

- **People own the plan** (P1, people-own-it). No lookout writes `keyframes.md`. A lookout
  may *propose* an edit, as a case file a person accepts; the edit is then the person's.
- **`check` runs nothing and reads only the plan** (C1, read-only-check, and D16 below). It
  doesn't open `lookouts.yaml`. The cross-check lives in the tool that owns the lookouts, which
  reads `keyframes check --json`.
- **IDs are forever.** A deleted item's ID is never reused, so a lookout citing `D4` can't end up
  guarding a different decision. This convention, already in the format, is what makes the
  contract safe without a lock file.

## The proposal: one key, `watch`

A sixth sub-line key, allowed on Decisions and Constraints. The format docs count the keys
("There are five keys" in [`format.md`](format.md), and the `unknown-key` message's "one of the
five"), so both change with it.

| Key | Goes on | What it holds |
| --- | --- | --- |
| `watch` | Decisions and Constraints | What in the world could make this wrong, in plain words |

```markdown
- **D4 (csrf-via-lib)**: CSRF protection comes from `csrf-csrf`, not our own code.
  - because: a maintained library has had more eyes on token handling than we can give it.
  - watch: advisories against it; a Fastify built-in that makes it redundant; SameSite alone
    becoming enough for our browsers.
```

- **It's prose.** `check` judges no prose, so it checks only that the key is on the right kind of
  item (`key-not-allowed` otherwise) and isn't empty.
- **It's the systems-language handle.** It says what the problem is sensitive to, never which
  feed to poll or how often. Those are the lookout's business, in YAML.
- **It counts, and doesn't nag** (D5). The report counts watched items the way it counts
  unlinked ones: `watched: 3`.

The `--json` report already carries every item with its sub-lines, so `watch` appears there with
no schema change beyond allowing the key. That JSON (`schema/report.schema.json`) is the formal
side of the contract: runciter never parses `keyframes.md` itself.

## The contract, both directions

`lookouts.yaml` cites plan items by ID; the plan never cites lookouts. One direction, one writer
on each side.

| Situation | Who sees it | What happens |
| --- | --- | --- |
| An item has `watch:` and no lookout guards it | `runciter lookout check` | Finding `unguarded` (error under `--strict`); the Tower offers a drafted lookout |
| A lookout guards an ID the plan doesn't have | `runciter lookout check` | Finding `dangling-guard`; the lookout is offered for stand-down |
| A lookout guards an item that's `superseded-by:` | `runciter lookout check` | Finding `guard-superseded`; offered: re-point to the new item, or stand down |
| A guarded item's text or `watch:` changed since the lookout last read it | runciter, on reload | The lookout's brief is redrafted from the new text as a case file |
| A lookout's research concludes the Decision itself is wrong | the lookout | A case file proposing a plan edit (supersede D4 with a new Decision); a person writes it |

The third and fourth rows are the "push down": a person edits the plan in systems language and
the lookouts follow. Runciter detects "changed since last read" by hashing the item's text and
sub-lines from the JSON report and storing the hash with the lookout's last sweep.

## Why not YAML for the plan too

The question came up: lookouts are formal, so should keyframes be? No. The plan's job is to be
read and refined by people, and its grammar is already small enough that `check` gives the same
answer everywhere. What people found hard was *typing* the formal half, the feeds, cadences and
remits, and that half is now YAML with a JSON Schema, written mostly by tools (`runciter lookout
add`, the Tower's form, drafts from `unguarded` findings). The plan gains one plain-words key.

## Items proposed for `keyframes.md`

- **D15 (watch-key)**: A `watch:` sub-line on a Decision or Constraint says, in plain words, what
  in the world could make it wrong. `check` checks only where it goes and counts it.
  - because: decisions that depend on the outside world decay, and the person who made one is
    the only one who knows what it's sensitive to.
- **D16 (one-way-contract)**: Tools read plans and act on their items by ID, through
  `check --json`; no tool writes a plan, the plan never cites the tools, and `check` never reads
  their files.
  - because: the plan is what people set, and an agent that could edit it could edit what binds
    it; one writer per side keeps both checkable alone, and IDs are never reused.
- **Q6 (watch-on-scenarios)**: Should `watch:` be allowed on Scenarios ("users on iOS Safari can
  sign in")? Lean: not yet; a Scenario that decays is usually held by a Constraint that can carry
  it.

These numbers continue after [`scoped-plans.md`](scoped-plans.md)'s D11–D14, S4, Q4 and Q5,
which land first. D16 merges this note's one-way contract with
[`user-plan-and-runciter.md`](user-plan-and-runciter.md)'s readers-not-writers, which said the same
thing; that note cites D16 rather than proposing its own. If the order changes, renumber whichever
lands later.
