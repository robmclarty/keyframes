# Spec: scoped plans

**Status:** a spec written 2026-11-04, for the build after the prototype. It says how a plan
splits by scope, which [`keyframes.md`](../keyframes.md) settled as D8 (grow-by-scope), in enough
detail to build from. Nothing here is in force until a person adds the items in
[Changes to the plan](#changes-to-the-plan). [`prototype.md`](prototype.md) stays the spec for
everything this one doesn't change.

## Frame

- **Problem:** A plan has budgets so that someone new can read it in ten minutes, and a project
  with more to say than fits in them has nowhere to put the rest. D8 says where: the root plan
  keeps the core that holds everywhere, and a part with reason to stand alone, such as a deep
  module or a package, gets its own plan beside its code. `check` doesn't read a split yet. A
  part's plan can be checked alone, where it can't cite the root, and nothing reads the two
  together.
- **Smallest thing that solves it:** A `keyframes.md` in a Map part's directory is that part's
  plan, read exactly like the root's, with the same sections, grammar, budgets and findings.
  `check` reads the plans the Map reaches, resolves citations up the chain and into parts by the
  part's slug, warns about a plan nobody reaches, and reports the tree in one run. A part checked
  alone finds the plans above it.
- **Done looks like:** a monorepo, or a project with deep modules, keeps one short root plan and a
  plan beside each part that earns one. `keyframes check` at the root checks them all, and
  `keyframes check packages/sync` checks one part with its root citations resolving. A product
  person reads the root plan and finds every part from its Map. An agent reads the root plan and
  the plans above the files it touches, and cites items in any of them.
- **Explicitly NOT doing:** a config file (D4 no-config); a plan that lives away from its part's
  directory; walking the whole tree for plans; a command that hands an agent a slice (I2
  scoped-slice, which the JSON report makes possible without giving); checking code or commits
  for citations (I3 code-citations); judging whether a part's item relaxes one above it, which is
  a person's call; a separate command to list the tree, since the report shows it.

## What holds

The build runs under the plan's constraints and principles as they stand. This spec leans on
these in particular:

- [C1 (read-only-check)] still holds: finding plans, strays and the chain above a directory is
  reading directory entries, nothing more.
- [C2 (byte-identical)] still holds: every walk is over sorted entries, and the directories above
  `dir` are part of what `check` reads, so a plan above that reaches `dir` changes the report by
  design, the same way on every machine.
- [C5 (stands-alone)] is why the search for strays is bounded by the Map rather than by an ignore
  file: no rule names a dependency folder, a package manifest or a version control system.
- [D8 (grow-by-scope)] and [D9 (log-apart)] are the shape: a part adds to the root without
  overriding it, and history stays in a log, not in any plan.
- [P4 (narrow-words)] is why the report says a part *reaches* a plan and a citation *resolves*,
  and never that one plan *governs* another.
- [P5 (easy-to-get-right)] and [P6 (constrain-not-block)] give one usual form for a citation into
  a part, a note for its variant, and a way through in every new finding.

## The format

### One plan, read one way

A `keyframes.md` is read the same way wherever it sits. The sections, items, sub-lines,
citations, pointers, variants, budgets and findings in [the prototype spec](prototype.md#the-format)
apply to every plan, root or part. Nothing in a plan's text says which it is. That comes from the
tree: a plan is a part when a plan above it reaches it, and a root otherwise, *because* a plan
that works the same alone and inside a tree is one format to learn, and a package that leaves for
its own repo takes a working plan with it.

A part may carry Principles of its own, which settle judgment calls inside it and nowhere else,
*because* a parser has reasons the rest of the product doesn't.

### Parts and their plans

- A Map part **reaches** a plan when one of its `paths:` is a directory that directly holds
  `keyframes.md`, found in any case the way the root is ([The file](prototype.md#the-file)).
  That plan is the part's, and the part's slug is the plan's name in citations.
- A part reaches at most one plan. Two of its paths each holding one is a `two-plans` error, on
  the part's line, *because* `[sync/C2 (…)]` has to mean one thing.
- A path marked `(new)` that exists is `built-not-new`, as today, and its plan is reached. A
  missing path is `broken-path` and reaches nothing. A path that's a file holds no plan.
- Two spellings of the plan side by side in a part's directory are a read problem, exit 2, as
  they are at the root: `check` never guesses which file is the plan.
- A plan's **parent** is the nearest plan above it that reaches it, and its **chain** is itself,
  its parent, and so on up to the root. When two plans reach one plan, which `path-overlap`
  already warns about, the nearer is its parent, and both names resolve.
- This is recursive. A part's plan has a Map of its own, with paths inside its directory, and
  each of those parts can reach a plan.

### Scope

- A plan's paths and pointers are relative to its directory, as every path is relative to the
  root today, and `..`, absolute paths and paths that resolve outside it stay errors. A part's
  plan can't point at files outside its directory, *because* a part that needs to is wider than
  its directory, and a part is its directory.
- A plan's items hold for work under its directory. The root's hold everywhere. So the plans that
  apply to a file are the plans above it: the root's, and each part's plan down the chain to the
  nearest one.

### What a part adds

A part's plan adds to the plans above it and overrides none of them. `check` can't read whether a
constraint in a part relaxes one above, so this is for people and agents, section by section:

| Section | In a part's plan |
| --- | --- |
| **Intent** | What the part is for, and why it stands alone. `no-intent` fires the same way; `check` can only see that it says something. |
| **Principles** | Judgment calls inside this part only. |
| **Map** | The part's own parts, with paths inside its directory. |
| **Constraints** | Hold inside this part, on top of every constraint above. A part never relaxes one. If it has to, the one above is written too wide: narrow it there, the way this repo's plan narrows "writes nothing" to everything but `src/init/`. |
| **Scenarios** | Journeys through this part. |
| **Decisions** | Settled for this part. A decision above is superseded above, never from a part. |
| **Taste** | Adds to the taste above. |
| **Questions**, **Ideas** | The part's own. |

An agent honours a handful of standing rules better than a hundred, and this is what keeps the
root a handful: everything that holds everywhere is in it, and nothing below can change that.

### Citations across plans

A citation is still `[C3 (one-writer)]`, outside code and comments, anywhere in a plan. What
changes is where it resolves.

- **A bare citation resolves up the chain.** `[C3 (one-writer)]` resolves in this plan, then its
  parent, and so on, to the first plan that has C3 with the slug `one-writer`. It never resolves
  downward. So a part cites the root's items exactly as the root does, *because* parts cite the
  root far more than anything else, and the root's items should read the same in every plan.
  - A part can have a C1 of its own and still cite the root's: the slug tells them apart.
    `[C1 (one-writer)]` in a part whose own C1 is `(ordered)` resolves to the root's C1.
  - When no plan on the chain has the ID, it's a `broken-citation`. When one or more have the ID
    and none has it with that slug, it's a `slug-mismatch`, and the message names each one's slug
    and plan.
  - The variant `[C3]` with no slug resolves to the nearest C3 on the chain, with its
    `alternate-form` note, as today.
- **A citation into a part names the part.** `[sync/C2 (one-writer)]` is C2 in the plan that the
  part `sync` reaches. The part is looked up by slug in this plan's Map, then its parent's, and
  so on up the chain, and the first Map that has it wins. C2 is then resolved in that plan only,
  not up its chain, *because* `sync/C2` says where to look. The name composes for a part's part:
  `[sync/queue/C1 (fifo)]` looks up `queue` in sync's Map alone.
  - From the root, `[sync/C2 (…)]` reaches a part of the root. From a sibling such as `scan`, the
    same citation resolves through the parent's Map, so siblings cite each other. From
    `sync/queue`, `[apply/C1 (…)]` finds `apply` in sync's Map.
  - A name no Map on the chain has, or a part that reaches no plan, is a `broken-citation`, and
    the message says which.
  - A plan citing its own item through its own name, `[sync/C1 (ordered)]` inside sync's plan,
    resolves with an `alternate-form` note: inside a plan, the usual form is bare.
  - Part names match in any case, as slugs do, and spacing variants read as today:
    `[sync/C2(one-writer)]`.
- **Direction.** A plan may cite anything on its chain, bare, and any part that a Map on its
  chain reaches, by name: parents, siblings, cousins and its own parts. No finding is about
  direction, *because* a citation is a reference, not a rule, and a root Idea that points at a
  part's decision is ordinary writing.

### References

`superseded-by:` and `resolved-by:` take an ID, as today, and now a part's name too:
`resolved-by: sync/D3`. They resolve exactly like citations, with one more rule: a reference never
names an item in a plan below the one it's in. That's a `bad-reference`, *because* a decision that
supersedes one above it would override it, and a question settled for a whole scope is settled in
that scope's plan. A sibling's decision is fine.

### Strays

A plan that no part reaches is a **stray**. `check` looks for strays where a forgotten part would
be: in the directories directly inside the plan's own directory; beside each part's path, which
means the directories directly inside its parent directory; and directly inside each part's path
that holds no plan itself. A stray there is an `orphan-plan` warning, on the Map heading, or on
line 1 when there's no Map, and its message names the plan and the part to add. When two plans'
searches find the same stray, the nearer reports it.

Hidden directories, whose names start with `.`, are skipped, *because* that's where every tool
keeps its state. A plan deeper than that in a directory no part names isn't seen, *because*
walking the whole tree would read other projects' plans in dependency folders, and the only ways
to tell those apart name a toolchain, which [C5 (stands-alone)] forbids. The Map is the index, and
the warning catches the near misses.

A stray isn't read. Its own parts, if it has any, wait until it's reached.

### Budgets

Every plan has the budgets in [the prototype spec](prototype.md#budgets), each for itself. One is
new:

| What | Budget |
| --- | --- |
| Plans below the root, along one chain | 2 |

A plan three below the root warns `over-budget` on its line 1, *because* an agent working there
reads four plans before it starts, and the split probably wants to be flatter. It's a starting
value, to tune.

## The tool

```text
keyframes init [dir]                        write a starter keyframes.md; refuse if one exists
keyframes check [dir] [--json] [--strict]   check the plan against itself, the repo and the plans above
keyframes --help | --version
```

`dir` is any directory with a plan, and defaults to the working directory.

### check

- **The chain above.** `check` looks in each directory above `dir`, in turn, for a plan with a
  part whose path, from that directory, is `dir`. The nearest such plan is the parent; from it,
  the same again, to the root. A plan above that doesn't reach `dir` is passed over. When none
  reaches it, the plan in `dir` is a root, and bare citations resolve in it alone.
- **What's checked.** The plan in `dir` and every plan it reaches, down the tree. The chain above
  is read, for citations and references, and not checked: its own run does that. A plan on the
  chain that can't be read is a read problem, exit 2.
- **Paths** in the output are relative to `dir`, and the chain above is named with `../`. Each
  plan's pointers and paths resolve against its own directory.
- **Exit codes** are unchanged, and count every plan checked: 0 for no errors, 1 for errors or
  any warning under `--strict`, 2 for a usage or read problem.
- **Determinism** is unchanged: parts in Map order, strays and the chain found over sorted
  directory entries, and the same tree gives the same bytes from any working directory.

### Findings

Two codes are new, and five grow:

| Code | Severity | When |
| --- | --- | --- |
| `two-plans` | error | Two of a part's paths each hold a plan |
| `orphan-plan` | warning | A plan directly below this one, or beside or directly below a part's path, that no part reaches |
| `broken-citation` | error | Also: a part name no Map on the chain has, or a part that reaches no plan |
| `slug-mismatch` | error | Also: plans on the chain have the ID, and none with that slug |
| `bad-reference` | error | Also: a reference to an item in a plan below this one |
| `over-budget` | warning | Also: a plan more than two below the root |
| `alternate-form` | note | Also: a plan citing its own item through its own name |

Every message still says what it found and how to get through:

```text
keyframes.md:22  error    two-plans        M3 (sync) reaches two plans, src/sync/keyframes.md and src/sync-next/keyframes.md; a part has one plan, so give the other directory its own part or keep one plan
keyframes.md:19  warning  orphan-plan      src/items/keyframes.md isn't reached by any part; add one with "paths: src/items/", or fold it into this plan
src/sync/keyframes.md:7  error    broken-citation  [C9 (one-writer)] cites C9, which no plan here or above has
src/sync/keyframes.md:7  error    broken-citation  [relay/C1 (blind)] names a part, relay, that no Map here or above has
src/sync/keyframes.md:7  error    broken-citation  [history/C1 (pruned)] cites M5 (history), which reaches no plan
src/sync/keyframes.md:7  error    slug-mismatch    [C1 (one-write)] cites C1, which is (ordered) here and (one-writer) in ../../keyframes.md
keyframes.md:40  error    bad-reference    resolved-by: sync/D3 names a decision below this plan; settle it here, or move the question to src/sync/keyframes.md
src/sync/queue/fifo/keyframes.md:1  warning  over-budget  this plan is 3 below the root, and the budget is 2; fold it into the plan above
src/sync/keyframes.md:9  note     alternate-form   [sync/C1 (ordered)] cites this plan's own item; the usual form inside a plan is bare: [C1 (ordered)]
```

### The report

The text report shows one block per plan: the checked plan first, then each part it reaches in
Map order, each followed by its own parts. A part's heading names its plan and the part that
reaches it, in the form a citation uses. Findings follow, each with its plan's path, in that plan
order, then by line, code and message, with notes last. The last line counts every plan's findings
together, and a clean run still ends with `no findings`.

For the [worked example](#a-worked-example) below, `keyframes check` at inkwell's root prints:

```text
keyframes.md

intent        yes
principles    3
map           5 parts · 4 paths · 1 plan
constraints   5 · 3 linked · 1 planned · 1 review
scenarios     3 · 2 linked · 1 review
decisions     4 · 3 active · 1 superseded
taste         3
questions     3 · 2 open · 1 resolved
ideas         2 · 2 open
words         715 of 2000

src/sync/keyframes.md · M3 (sync)

intent        yes
principles    1
map           2 parts · 2 paths
constraints   2 · 1 linked · 1 review
decisions     1 · 1 active
questions     1 · 1 open
words         189 of 2000

no findings
```

A nested part's heading carries its whole name: `src/sync/queue/keyframes.md · sync/M1 (queue)`.
Checked from the part, `keyframes check src/sync` prints the part's block alone, with a `parent`
row first and the chain named with `../`:

```text
keyframes.md

parent        ../../keyframes.md · M3 (sync)
intent        yes
principles    1
map           2 parts · 2 paths
constraints   2 · 1 linked · 1 review
decisions     1 · 1 active
questions     1 · 1 open
words         189 of 2000

no findings
```

The JSON report keeps every top-level field with its meaning, so a reader of today's report sees
the checked plan as before, and adds:

- `parent`, when the checked plan is a part: the plan that reaches it and the part that does,
  `{ "plan": "../../keyframes.md", "id": "M3", "slug": "sync" }`.
- `part`, when the checked plan is a part: its name from the root, such as `"sync"` or
  `"sync/queue"`.
- `parts`: every plan below, in report order. Each has `plan`, its path from `dir`; `part`, its
  name from the checked plan; `parent`, as above, relative to `dir`; and then the same fields as
  the top level: `intent`, `sections`, `words`, `items`, `findings`, `errors`, `warnings` and
  `notes`.
- `total`: `errors`, `warnings` and `notes` over the whole run. The exit code follows this.
- On a Map item, `plan`: the path of the plan it reaches, when it reaches one. In `sections.map`,
  `plans`: how many parts reach one.
- The two new codes in the finding enum.

`schema_version` stays 1, since fields are only added. A harness that wants the items that apply
to a file takes the top-level `items` and those of each entry in `parts` whose directory holds the
file; a part's directory is its `plan` without the file name. Abridged, for the same run:

```json
{
  "schema_version": 1,
  "plan": "keyframes.md",
  "intent": true,
  "sections": { "map": { "items": 5, "paths": 4, "planned": 0, "broken": 0, "plans": 1 } },
  "words": { "count": 715, "budget": 2000 },
  "items": [
    {
      "id": "M3",
      "slug": "sync",
      "section": "map",
      "line": 25,
      "text": "The sync worker, the only part that writes the store.",
      "paths": [{ "path": "src/sync/", "result": "resolved" }],
      "plan": "src/sync/keyframes.md"
    }
  ],
  "findings": [],
  "errors": 0,
  "warnings": 0,
  "notes": 0,
  "parts": [
    {
      "plan": "src/sync/keyframes.md",
      "part": "sync",
      "parent": { "plan": "keyframes.md", "id": "M3", "slug": "sync" },
      "intent": true,
      "sections": { "principles": { "items": 1 } },
      "words": { "count": 189, "budget": 2000 },
      "items": [],
      "findings": [],
      "errors": 0,
      "warnings": 0,
      "notes": 0
    }
  ],
  "total": { "errors": 0, "warnings": 0, "notes": 0 }
}
```

### init

`init [dir]` writes the same template wherever it runs, titled with the directory's name, and
`check` on a fresh template still reports exactly `no-intent` (C4 fresh-template). What it prints
afterwards depends on what's above:

- No plan above: the agent snippet, as today.
- A plan above reaches `dir`: one line, since the project above already has the snippet.
  `Wrote src/sync/keyframes.md, the plan of M3 (sync) in ../../keyframes.md.`
- A plan above, and none reaches `dir`: the part to add, with the next free M number and the
  path from that plan's directory:

```text
Wrote src/sync/keyframes.md. No part in ../../keyframes.md reaches it yet; add one to its Map:

- **M6 (sync)**: …
  - paths: src/sync/
```

### The snippet

Two lines of the snippet change, and the rest stays word for word. The first line gains a sentence:

```markdown
This project's intent is in `keyframes.md`. Read it before you change code. A folder's own
`keyframes.md` adds to it for the work in that folder, so read every plan above the files you touch.
```

And the citation line names a part:

```markdown
- When your work relies on an item, cite it as `[C3 (slug)]`, or as `[sync/C3 (slug)]` for an item
  in a part's plan, named from the root.
```

## A worked example

[inkwell's plan](inkwell_keyframes.md) has a Map part, M3 (sync), at `src/sync/`. This is the
plan `src/sync/keyframes.md` would hold:

```markdown
# sync

## Intent

The sync worker is the only part of inkwell that writes the store [C1 (one-writer)] and the
only part that talks to the relay [C2 (relay-is-blind)]. It stands alone because its rules are
about ordering and retries, which matter to nobody outside this directory.

## Principles

- **P1 (log-wins)**: When the live state and the replayed log disagree, the log wins.
  - because: the log is what every other device has already seen.

## Map

- **M1 (queue)**: Changes waiting to go out, in the order they were made.
  - paths: queue/
- **M2 (apply)**: Applying changes that arrive to the store.
  - paths: apply/

## Constraints

- **C1 (ordered)**: Changes from one device apply in the order they were made.
  - held-by: file:test/order.test.ts#"in order"
- **C2 (idempotent)**: Applying the same change twice changes nothing.
  - held-by: review

## Decisions

- **D1 (retry-backoff)**: A failed send waits twice as long each time, up to a minute, per
  [P3 (boring-tech)].
  - because: the relay fell over when every device retried at once.

## Questions

- **Q1 (batching)**: Should small changes share one payload, under [C5 (small-payloads)]?
```

What resolves where:

- `[C1 (one-writer)]` and `[C2 (relay-is-blind)]` in the Intent resolve to the root's C1 and C2,
  although this plan has a C1 and a C2 of its own: the slugs differ, so the chain is searched.
- `[P3 (boring-tech)]` and `[C5 (small-payloads)]` resolve to the root, which is the only plan on
  the chain with them.
- From the root, `[sync/D1 (retry-backoff)]` cites this plan's decision, and `[sync/queue/…]`
  would cite the queue's plan once `src/sync/queue/keyframes.md` exists and M1 reaches it.
- From a sibling, say a plan at `src/editor/` that M1 (editor) reaches, `[sync/C1 (ordered)]`
  resolves through the root's Map.
- The part's pointer `file:test/order.test.ts` is `src/sync/test/order.test.ts` from the root,
  and `queue/` is `src/sync/queue/`.
- The root's Q3 (history-depth) can't be `resolved-by: sync/D1`: that's a reference below the
  root, and `bad-reference` says to settle it in the root or move the question down.

If someone adds `src/store/keyframes.md` without a part for it, the root's M2 (store) already
names `src/store/`, so it's reached. If they add `src/relay/keyframes.md` instead, the root's
check warns `orphan-plan`, since `src/relay/` sits beside the parts' paths, and names the part to
add.

## Build constraints

Unchanged from [the prototype spec](prototype.md#build-constraints): the check stays read-only,
the package has no runtime dependencies, `check(plan, repo)` stays pure over a small read-only
repo interface, and the layout rules in `rules/` hold. One thing to watch: the disk repo today
refuses paths outside its root. The CLI finds the chain above `dir` with plain directory reads,
then roots the disk view at the topmost plan it found, so `check` sees one tree and no path ever
escapes a repo view. In tests, in-memory repos hold whole trees, as they do now.

## Steps

Each step names the section its done-when is measured against. A person does step 1; the rest
build in order, and each lands green under `pnpm check`.

1. docs(plan): settle the decisions in `keyframes.md`, **done when:** a person has added the items
   in [Changes to the plan](#changes-to-the-plan), as proposed or as they edited them, and
   `keyframes check --strict` is green
2. feat(repo): reach plans and find strays, **done when:** in an in-memory tree and a real one, a
   part path holding a plan is reached in any case, two plans in one part is `two-plans`, a stray
   directly below the plan, beside a part path or directly below one that holds no plan is
   `orphan-plan` with the message above, a hidden directory is skipped, a deeper stray isn't seen
   and a test says so, and a stray found by two plans is reported by the nearer
   ([Parts and their plans](#parts-and-their-plans), [Strays](#strays))
   - seam: `src/check/plan.ts`, `src/repo/`
3. feat(cite): resolve citations and references across plans, **done when:** a bare citation
   resolves up the chain by ID and slug, and never down; `[sync/C2 (slug)]` resolves through the
   nearest Map that has the part, in that plan only; a name no Map has and a part with no plan are
   `broken-citation` with the messages above; `slug-mismatch` names every plan's slug on the chain;
   references resolve the same and a reference below is `bad-reference`; the self-name variant and
   the spacing variants note `alternate-form`; and each has a fixture
   ([Citations across plans](#citations-across-plans), [References](#references))
   - seam: `src/cite/`, `src/check/`
4. feat(check): check a tree, **done when:** `check` takes a chain and a subtree, checks each plan
   with paths relative to its own directory, warns `over-budget` on line 1 of a plan more than two
   below the root, counts `plans` for the Map, sums every plan's findings into a total that drives
   the exit code, and `test/integration/determinism.test.ts` shows a two-level tree byte-identical
   from two working directories ([Scope](#scope), [Budgets](#budgets), [check](#check))
   - seam: `src/check/`
5. feat(report): render a tree as text and JSON, **done when:** golden tests pass for a two-level
   tree and for a part checked alone, in both renderers; the JSON validates against the schema,
   which gains `parent`, `part`, `parts`, `total`, the Map item's `plan`, the Map count's `plans`
   and the two codes, at `schema_version` 1; and a test reads a tree's report through today's
   fields only and sees the checked plan unchanged ([The report](#the-report))
   - seam: `src/report/`, `schema/report.schema.json`
6. feat(cli): check a part from its directory, **done when:** `check packages/sync` finds the
   chain above with plain directory reads, roots the disk view at the topmost plan, reports
   `parent`, resolves root citations, and prints paths relative to `packages/sync`; with no plan
   above that reaches it, the plan is a root and a citation it can't resolve says so; and `--help`
   says what `dir` is ([check](#check))
   - seam: `src/cli.ts`, `src/repo/disk.ts`
7. feat(init): say what a new part needs, **done when:** the snippet's two lines read as above,
   word for word the same in `src/init/snippet.ts`, the prototype spec's Appendix B,
   `docs/agents.md` and `AGENTS.md`, which the docs tests already hold; `init` under a plan that
   reaches the directory prints the one line, and under one that doesn't prints the part to add;
   and `check` on a fresh template still reports exactly `no-intent` ([init](#init),
   [The snippet](#the-snippet))
   - seam: `src/init/`, `src/cli.ts`
8. docs(format): write scoped plans for people, **done when:** `docs/format.md` has a section on
   parts, citations into them and strays, with the findings table and variants table extended;
   `docs/getting-started.md`'s "When it outgrows one file" walks the inkwell split and no longer
   says a part can't cite the root; `docs/agents.md` says what an agent reads for a file; the
   prototype spec's findings and variants tables match `check`, as their tests require; and
   `test/integration/docs.test.ts` checks a tree example, with its report pinned
9. test(e2e): hold the split-plan scenario, **done when:** `test/e2e/split-plan.test.ts` has a
   test titled "split plan" that runs the bin on a plan over its budgets, moves one part's items
   into a plan beside its code, names the part in the Map, cites the root from it, and gets a clean
   `check` with the budget warning gone; and S4 in `keyframes.md` loses its `(new)` marker

## Changes to the plan

For a person to add to [`keyframes.md`](../keyframes.md). IDs continue from the plan as it stands
on 2026-11-04.

```markdown
- **D11 (map-is-the-index)**: A part's plan is the `keyframes.md` in that part's path, and
  `check` reads the plans the Map reaches. It looks for a stray plan only directly below the
  plan, and beside and directly below the parts' paths.
  - because: the Map is where people already say what the parts are, and walking the whole tree
    would read other projects' plans in dependency folders, which nothing can tell apart without
    naming a toolchain.
- **D12 (cite-by-part)**: A bare citation resolves in its plan or the nearest above, by ID and
  slug. A citation into a part carries the part's slug, `[sync/C2 (one-writer)]`, looked up in
  the nearest Map that has it, so siblings cite each other.
  - because: parts cite the root far more than anything else, and the root's items should read
    the same in every plan.
- **D13 (parts-add)**: A part's items hold inside its directory and add to the plans above it. A
  reference never names an item below its plan.
  - because: an agent has to be able to trust the root alone, everywhere.
- **D14 (one-plan-one-way)**: Every plan is read the same way, root or part: the same sections,
  grammar, budgets and findings, and a part may carry Principles of its own.
  - because: one format to learn, and a package that leaves takes a working plan with it.
```

```markdown
- **S4 (split-plan)**: A plan grows past its budgets. Someone moves one part's items into a plan
  beside its code, names the part in the Map, cites the root from it, and `check` passes with the
  budget warning gone and nothing lost.
  - held-by: file:test/e2e/split-plan.test.ts#"split plan" (new)
```

```markdown
- **Q4 (wide-part)**: Does a part whose paths span several directories ever need a plan of its
  own, and where would it live?
- **Q5 (stray-walk)**: Should `check` look for strays across the whole tree, once use shows how
  often a near miss hides deeper than one level?
```

## Open questions

- **Shadowing.** The same ID and slug in a part and in a plan above it resolve to the nearer,
  with no finding. If use shows parts restating root items, a `shadowed-item` warning is the
  fix, and it's cheap to add then.
- **The depth budget.** Two below the root is a guess at where reading four plans starts to
  cost more than the split saves.
- **A long report.** A root with many parts prints a block for each. T2 (quiet-when-fine) may
  want one line per clean part instead. Starting with a block each, since a block is what a plan
  is, and a clean block is short.
