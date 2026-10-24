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
  - paths: src/scan/, src/items/, src/cite/
- **M2 (repo)**: A read-only, exact-case view of the repo for pointers and paths.
  - paths: src/repo/
- **M3 (check)**: Turns a parsed plan and a repo view into findings and counts.
  - paths: src/check/
- **M4 (report)**: Renders the result as text or JSON.
  - paths: src/report/, schema/report.schema.json
- **M5 (cli)**: Commands, flags, exit codes and the starter template.
  - paths: src/cli.ts, src/init/, bin/keyframes.js

## Constraints

- **C1 (read-only-check)**: `check` writes nothing, opens no network connection and starts no
  process.
  - held-by: file:rules/writes-only-in-init.yml#"id: writes-only-in-init",
    file:rules/no-network.yml#"id: no-network",
    file:rules/no-subprocess.yml#"id: no-subprocess"
- **C2 (byte-identical)**: The same plan and tree give byte-identical output on any OS, from any
  working directory.
  - held-by: file:test/integration/determinism.test.ts#"byte-identical"
- **C3 (no-runtime-deps)**: The published package has no runtime dependencies.
  - held-by: review
- **C4 (fresh-template)**: `check` on a fresh template reports exactly one finding, `no-intent`.
  - held-by: `file:src/init/__tests__/init.test.ts#"fresh template"`
- **C5 (stands-alone)**: No format rule names a language, toolchain or product.

## Scenarios

- **S1 (first-plan)**: Someone runs `init`, writes a little intent and a few items, runs `check`,
  and gets either a clean report or a finding that says exactly how to fix it.
  - held-by: file:test/e2e/first-plan.test.ts#"first plan"
- **S2 (second-editor)**: A second person replaces a decision, marks the old one superseded,
  cites the new one elsewhere, and `check` passes.
  - held-by: file:test/e2e/second-editor.test.ts#"second editor"
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
