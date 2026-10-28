# Pilots

This is the record of the prototype's pilots: what each pilot repo showed for the four hypotheses
in [What the prototype tests](prototype.md#what-the-prototype-tests), and the call they lead to.
The spec's [Pilots](prototype.md#pilots) section is the protocol,
[`pilot-playbook.md`](pilot-playbook.md) is the order to run it in, and this file holds what
happened.

**Status, 2026-10-27: no pilot has run.** Version 0.3.0 is on npm, and the repos, the second
reader and both H3 arms are chosen. Every result below is empty, and the closing call waits on all
three repos.

## Before the first pilot

- **Publish the package.** Done: `@robmclarty/keyframes@0.3.0` is on npm, and
  `npx @robmclarty/keyframes --version` prints `0.3.0` from an empty directory.
- **Name the repos and their second readers.** Done, below. The spec asks for one repo with a
  second regular contributor, but none of the owner's repos has one, so a single reader, not named
  here, reads all three without contributing to them. bbc isn't TypeScript, and all three get most
  of their code from agents.
- **Pick the two H3 models.** Done, below, and the same two run in every repo.

Every repo in use gets a plan too, as the playbook's wide tier: storium, volley, runciter,
checkride and plumbbob, beside the three below. plumbbob is also the first trial of splitting a
plan by scope.

| Pilot | Repo | Owner | Language | Second reader | Second contributor | Share from agents |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | bbc | Rob | Odin | One reader, not named | None | Most, by the owner's account |
| 2 | fascicle | Rob | TypeScript | One reader, not named | None | Most, by the owner's account |
| 3 | atis | Rob | TypeScript | One reader, not named | None | Most, by the owner's account |

| H3 arm | Model | Harness |
| --- | --- | --- |
| Frontier | Claude Opus 5.5 | Claude Code |
| Local, small built-in prompt | qwen3.8:27b-32k, on Ollama 0.34.2 on a Mac mini | pi 0.66.1, with an agent folder of its own |

**Why pi for the local arm.** Measured on 2026-10-27 against that model, both harnesses load
`AGENTS.md`, but their first requests differ:

- **pi** sends 3,498 tokens, which the model reads in 29 seconds.
- **opencode** sends 18,625 tokens, which take 172 seconds. Most of it is a list of every
  installed skill, and a to-do tool.

The `-32k` variant is plain `qwen3.8:27b` with its context pinned at 32,768 tokens, where the plain
model takes the server's default. pi runs from a folder of its own (`PI_CODING_AGENT_DIR`) that
holds only this `models.json`, so no installed skills join its prompt:

```json
{
  "providers": {
    "mini": {
      "baseUrl": "http://<the mini>:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "compat": { "supportsDeveloperRole": false, "supportsReasoningEffort": false },
      "models": [{ "id": "qwen3.8:27b-32k", "contextWindow": 32768 }]
    }
  }
}
```

Each run is a fresh session: `pi --no-session --provider mini --model qwen3.8:27b-32k`.

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

## Wide tier

The five other repos in use keep only the record's H1 and H4 parts: copy those two parts of the
template below under each repo's heading as its plan starts. plumbbob's entry also holds the split
trial's scores, as its
[protocol](https://github.com/robmclarty/plumbbob/blob/main/docs/keyframes-split-trial.md) says.

### storium

Not run.

### volley

Not run.

### runciter

Not run.

### checkride

Not run.

### plumbbob

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
- **Does anyone write the new variants?** Before the pilots, `check` learned to read an
  underlined heading, an item line with no bullet or with its bullet one to three spaces in, a
  slug beyond ASCII, and a `./` or doubled slash in a path. Each variant earns an
  `alternate-form` note, so H1's variants line shows whether anyone writes it.
- **Does anyone leave a comment unclosed?** It hides the rest of the plan, and now it's
  `unclosed-comment`. H4 shows whether that warning is worth its place.
- **Do item-line notes read well?** They show the usual form with the item's own letter, such as
  `- **C<n> (<slug>)**: …`, so one habit groups onto one line of the report.

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
| Path | | |

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
| `unclosed-comment` | warning | | |
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
