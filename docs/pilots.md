# Pilots

This is the record of the prototype's pilots: what each pilot repo showed for the four hypotheses
in [What the prototype tests](prototype.md#what-the-prototype-tests), and the call they lead to.
The spec's [Pilots](prototype.md#pilots) section is the protocol, and this file holds what
happened.

**Status, 2026-10-23: no pilot has run.** Every result below is empty, and the closing call waits
on all three repos.

## Before the first pilot

- **Publish the package.** npm has no `@robmclarty/keyframes` yet, so
  `npx @robmclarty/keyframes init` fails for a pilot owner. Publish a 0.x, then run
  `npx @robmclarty/keyframes --version` from an empty directory.
- **Name the repos and their second readers.** Together the three cover the spec's mix: at least
  one isn't TypeScript, at least one has a second regular contributor, and at least one gets a
  real share of its code from agents. The build's lean is two of your own agent-heavy TypeScript
  tools and one non-TypeScript repo from someone else.
- **Pick the two H3 models**, and use the same two in every repo, so the runs compare.

| Pilot | Repo | Owner | Language | Second reader | Second contributor | Share from agents |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |

| H3 arm | Model | Harness |
| --- | --- | --- |
| Frontier | | |
| Local, small built-in prompt | | |

## Results

One line per measure, filled in as each pilot finishes. The spec's
[What the prototype tests](prototype.md#what-the-prototype-tests) says what a miss changes.

| Measure | Target | Pilot 1 | Pilot 2 | Pilot 3 |
| --- | --- | --- | --- | --- |
| H1: time to a first plan | Under 45 minutes | | | |
| H2: time to read it cold | Under 10 minutes | | | |
| H2: the edit passes `check` first time | Yes | | | |
| H3: constraints crossed, with the plan against without | Fewer with it | | | |
| H3: asked before crossing, with the plan against without | More often with it | | | |
| H4: findings the owner calls useful | At least 80% | | | |

## Pilot 1

Not run.

## Pilot 2

Not run.

## Pilot 3

Not run.

## The record for one pilot

Copy this under the pilot's heading when it starts, and fill it in as you go.

```markdown
### H1: expressible

- **Time to a first plan**, from `init`, reading nothing but the template:
- **Sections used:**
- **Sections skipped:**
- **Wanted to say and couldn't place:**
- **Variants `check` noted** (each `alternate-form` line):

### H2: shareable

- **Time to read it cold:**
- **The project, in the reader's three sentences:**
- **The owner's rating of that explanation**, and why:
- **The reader's edit:** what it changed, whether `check` passed first time, and whether its
  diff reads clearly.

### H3: guiding

| Task | Items it touches | What crossing one would look like |
| --- | --- | --- |
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |

One row per run: four tasks, with and without the plan and the snippet, on both models. Repeat a
condition when it's cheap to.

| Task | Model | Plan | Items cited | Constraints crossed | Asked first | Followed the taste | Tokens added |
| --- | --- | --- | --- | --- | --- | --- | --- |

- **Unattended agent**, if the repo has one: its task, and whether it stopped and flagged the
  crossing, with the plan and without.
- **Direction:** what the runs suggest, in a sentence.

### H4: checkable

Every finding `check` reported during the pilot, notes included, triaged by the owner as useful,
noise or wrong.

| Line | Code | Triage | Why |
| --- | --- | --- | --- |

- **Useful:** <n> of <m>
```

## What to watch for

The build left these for the pilots to answer:

- **Should an unlinked constraint warn?** The spec's lean is no, until H4's data says otherwise.
- **Does any plan hit the 2000-word budget?** A folder of files waits until splitting is clearly
  better than cutting.
- **Does markup count as words?** `- **C3 (one-writer)**:` costs three words of the budget now.
- **Does anyone write a heading as a line of text over `---`?** `check` reads only `##` headings,
  so that heading isn't a section.
- **Does anyone write an item line with no bullet, or with its bullet one to three spaces in?**
  Either reads as prose, with no finding.
- **Does anyone want letters beyond ASCII in a slug?** `(café)` is `malformed-item` today.
- **Does a `./` in a path need a note?** It reads silently, unlike every other variant.
- **Do item-line notes read well?** They show a generic `- **C3 (one-writer)**: …`, not the
  item's own ID and slug.
- **Does anyone leave a comment unclosed?** It hides the rest of the plan with no finding.

## The closing call

Once all three pilots are in, mark each line keep, change or cut, with the reason in a clause.
Then choose what to build next.

### Sections

| Section | Call | Why |
| --- | --- | --- |
| Intent | | |
| Principles | | |
| Map | | |
| Constraints | | |
| Scenarios | | |
| Decisions | | |
| Taste | | |
| Questions | | |
| Ideas | | |

### Pointer forms

| Form | Call | Why |
| --- | --- | --- |
| `review` | | |
| `file:<path>` | | |
| `file:<path>#"<text>"` | | |
| `(new)` | | |

### Variants

| Form | Call | Why |
| --- | --- | --- |
| Plan file | | |
| Heading | | |
| Item line | | |
| ID | | |
| Slug | | |
| Sub-line | | |
| Citation | | |
| Reference | | |

### Findings

| Code | Severity | Call | Why |
| --- | --- | --- | --- |
| `duplicate-section` | error | | |
| `malformed-item` | error | | |
| `wrong-letter` | error | | |
| `duplicate-id` | error | | |
| `duplicate-key` | error | | |
| `broken-citation` | error | | |
| `slug-mismatch` | error | | |
| `bad-pointer` | error | | |
| `broken-pointer` | error | | |
| `broken-path` | error | | |
| `bad-reference` | error | | |
| `file-too-large` | error | | |
| `no-intent` | warning | | |
| `not-an-item` | warning | | |
| `item-outside-section` | warning | | |
| `missing-slug` | warning | | |
| `unknown-key` | warning | | |
| `key-not-allowed` | warning | | |
| `missing-because` | warning | | |
| `built-not-new` | warning | | |
| `planned-text-missing` | warning | | |
| `path-overlap` | warning | | |
| `over-budget` | warning | | |
| `unclosed-fence` | warning | | |
| `alternate-form` | note | | |

### Budgets

The spec calls these starting values, for the pilots to tune.

| What | Starting value | Call | Why |
| --- | --- | --- | --- |
| The whole file, outside code and comments | 2000 words | | |
| One item's text | 60 words | | |
| Principles, and Map parts | 7 each | | |
| Constraints, and Taste | 12 each | | |
| Scenarios, open Questions, and open Ideas | 10 each | | |
| Active Decisions | 20 | | |

### What to build next

The spec's candidates:

- checking the Map against the code;
- a formatter that puts the file in one canonical form;
- scanning code and commits for citations;
- giving agents a scoped slice of the plan;
- something the pilots surface.

**Choice:** not made.
