# keyframes and storyboard

**Status:** a comparison written 2026-11-02, after storyboard's first live interview redrafted
this repo's plan from its owner's memory. It records where the seam between the two tools is and
why, and what reading an existing codebase would ask of each. Nothing here is in force;
[`keyframes.md`](../keyframes.md) is, and a change to it goes through a person.

## Two tools, one seam

**In one line: keyframes reads the tree, storyboard reads the prose, and a person writes the why.**

keyframes is a format and a checker. storyboard is an interviewer and a drafter. They meet at
`keyframes.md`: storyboard writes one, and keyframes checks it.

| | keyframes | storyboard |
| --- | --- | --- |
| The verb | **check**: is this plan consistent with itself and with this tree? | **ask, read, draft**: what plan would describe this work? |
| Models | None. `check` runs no LLM, by the [spec's](prototype.md#principles) design | A local model classifies intake; a frontier model asks and drafts |
| Writes | Only `init`, and only a starter plan (C1 read-only-check) | Session files under `.storyboard/`, a staged draft, and on accept the plan |
| Processes | None | Starts the `claude` CLI through fascicle |
| Runtime dependencies | None (C3 no-runtime-deps) | fascicle, zod and keyframes itself |
| What makes it trustworthy | The same plan and tree give the same report on every machine (P3 same-answer-everywhere, C2 byte-identical) | A person corrects every chunk and signs the result; nothing is written unattended |
| Outputs | A report, as text or JSON | `keyframes.md`, and later a spec, design tokens and an architecture page for the rest of the toolchain |

## Why not one project

Merging them would put fascicle and zod in the published `check`, make it start processes and
call models, and break C1, C3 and P3 in one move. Those three are what make a check worth having:
a report nobody can reproduce stops being read. storyboard's outputs are also wider than this
format. `keyframes.md` is one of its artifacts, beside the spec plumbbob plans from and the prompt
and criteria volley runs.

A monorepo with two packages would keep the constraint boundary while sharing a tree, but the two
have different gates, different module rules and different dependency profiles, and separate
repos with a version dependency already work. There's no gain to pay that cost for.

## Where they touch

The overlap is a client relationship, not a duplication. storyboard depends on
`@robmclarty/keyframes`, runs its bin on every draft, carries this format's budgets in its intent
lens's rubric, and lands each lens's slots in this format's sections. That's the right direction
of dependency: storyboard learns the format from keyframes, and keyframes knows nothing of
storyboard, as C5 (stands-alone) asks.

One piece is duplicated. storyboard's emitter knows the item grammar, `- **C3 (slug)**: …` with
its sub-lines, so a format change has to land twice. The fix is this plan's I1 (formatter): a
canonical serializer from items to markdown is pure and deterministic, so it fits inside
keyframes' constraints, and storyboard's draft-as-data would call it and stop owning grammar.
It's an idea, not agreed.

## What would muddy them

Neither tool judges code against intent, and that's the line to watch. keyframes' Intent says it
isn't "a judge of prose", and the spec rules out LLMs in `check`. storyboard's job ends when a
person accepts a draft. The first live interview drafted keyframes as "a product lint that checks
the team's understanding of intent against what has been built", which is a third tool that
doesn't exist. Whether a model can judge code against a plan reliably is what the
[pilots' H3](pilots.md) measures. Where such a judge would live is a question for after that data,
not before.

**A rule of thumb for any new feature:** if it must give the same answer on every machine with no
model, it's keyframes. If it proposes, asks, reads a repo and guesses, or judges, it's storyboard.

## Reading an existing codebase

Can keyframes read an existing project and produce a first `keyframes.md` to iterate on? Half of
it, and the half that matters most for a start.

The nine sections split by where their truth lives, and so does the work of reading them:

| Lives in | What's there | Who can read it |
| --- | --- | --- |
| The tree | Map parts and their paths; `held-by:` candidates (test files, rule files, gate entries); Scenario candidates (end-to-end tests); docs that look like decision logs | Deterministic code, with a source on every line |
| The prose | The README's opening, decision records, comments in code | A model, or a person |
| The owner's head | Why it exists, who it's for, what's unsettled, and the `because:` on each decision | A person, asked |

**The inventory is keyframes' half.** Everything in the first row is a read of paths and names:
which directories sit under the root, which files look like tests, which markdown files hold
items shaped like decisions, what the README's first paragraph says. It's read-only, needs no
model, gives the same answer on every machine, and names its sources. It's the reading `check`
already does for pointers, turned on the tree instead of the plan, and it's the reader Q3
(map-vs-code) would need anyway. In P4's narrow words it's an inventory, never a judgment:
"`src/` has seven directories" and "README.md opens with …", not "this project is for X".

**The judgment is storyboard's half, or a person's.** Turning the inventory into Intent prose,
deciding which of a log's hundred decisions are core, placing an item as part or log, and writing
the question the owner still has to answer all need a model or a person, and both get things
wrong in ways a second run can't reproduce. That's the side of the seam storyboard sits on, and
its existing-projects mode is built for it. The one thing storyboard should stop doing is reading
the tree itself: it should take keyframes' inventory and read only the prose.

**A shape that keeps every constraint.** One reader in the repo module, exposed two ways:

- A read-only command, call it `keyframes survey [dir] --json` for now, that prints the inventory
  with a source on every line, in the spirit of `check --json`. storyboard reads this.
- `keyframes init` from that inventory: the starter plan with the tree's facts as comments beside
  each section, the way the template carries examples: the directories under the root beside the
  Map, the test and rule files beside Constraints and Scenarios, the README's opening beside
  Intent. Nothing becomes an item until a person uncomments it, so the inventory yields
  candidates, never a Map: grouping three directories into one part, and staying under seven, is
  judgment. It writes, so it lives in `src/init/`. `check` on it reports exactly one finding,
  `no-intent`, the way C4 asks of a fresh template, and a pre-filled plan can be incomplete but
  never wrong.

It holds C1 (only `init` writes, and nothing starts a process or opens the network), C3 (Node
builtins), D4 (no config: the heuristics are names and paths) and P3 (the same tree gives the
same inventory). C5 needs care: an inventory that recognised one test runner's titles or one lint
tool's rule ids would name a toolchain. Names and paths are enough for a first plan: a pointer to
a test file resolves without `#"text"`, and the person or storyboard adds the text later.

**What it refines in the plan.** I7 (brownfield-split) says reading an existing project and
drafting its split belongs outside the checker. The split still does: placing items is judgment.
The inventory drafts and places nothing, so it can come inside. That's a change to an Idea, which
a person made on 2026-11-02; the item is below.

**When.** I6 says drafting waits until after the pilots, because a drafted plan would muddy H1:
can an owner write a plan from the template alone? A pre-filled `init` would muddy it the same
way. So build it after the pilots' closing call, or keep it out of the pilot repos, the rule
storyboard already follows.

**In [`keyframes.md`](../keyframes.md) since 2026-11-02:**

```markdown
- **I8 (tree-inventory)**: A read-only inventory of a tree, every line sourced: the directories
  under the root, files that look like tests or rules, docs that look like logs, README's opening.
  `init` could write it as comments beside each section, so `check` reports `no-intent`. It
  inventories, never judges, so it stays inside the checker, where the split in
  [I7 (brownfield-split)] doesn't.
```
