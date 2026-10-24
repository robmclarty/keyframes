# Report: keyframes prototype

## What shipped

All 19 steps landed across nine ranges, from 2026-10-23 to 2026-10-24. Steps 1 and 2 had landed before the build began. The [Log](build-log.md#log) holds every step and every stop as approved.

- **The checker.** `keyframes check` reads `keyframes.md` with a line parser (steps 5 to 7). It resolves citations, references, pointers and Map paths against a read-only, exact-case view of the repo (step 8). It also counts each section, applies the budgets, and renders a text or a JSON report whose shape `schema/report.schema.json` describes (step 9). Exit codes are 0, 1 and 2, `--strict` turns any warning into a failure, and an unexpected error prints one line and exits 2.
- **The starter.** `keyframes init` writes the template and prints the agent snippet. `docs/format.md` and `docs/agents.md` teach the format and the snippet, and a test checks every example plan they show (step 10).
- **The dogfood.** This repo has its own `keyframes.md`, checked by a strict `keyframes` slot in its gate (step 11). Two end-to-end tests hold its first-plan and second-editor scenarios (step 14). `AGENTS.md` carries the snippet word for word (step 15), and `CLAUDE.md` imports `AGENTS.md`, so Claude Code reads it too (step 18).
- **The release and the pilots.** The package packs clean through `prepack` and runs through `npx` from an empty directory (step 13). It ships no pnpm engine (step 16), and the snippet's check runs as `npx @robmclarty/keyframes check` (step 19). `docs/pilots.md` is the blank record the three pilots fill in (step 12).

The gate ran green at every landing, and its suite is at 386 tests.

## Decisions and why

Two moves on the plan shaped how the build ran:

- **D8 (spec-stays-live)**: `docs/prototype.md` stayed the living spec, and the plan cited its sections rather than copying them. So every call a step made that the spec had left open went back into the spec (ranges 2 to 4), not into the plan.
- **D15 (split-when-due)**: steps 6 and 9 were to be split just before they were built. Step 9 was split. Step 6 was built whole, because its shape turned out to review in one pass, and range 2's stop recorded that departure.

The calls that shaped the format and the tool:

- **D9 (easy-to-get-right)** and **D10 (errors-for-unclear)**: every form has one usual form, and the common variants read the same with an `alternate-form` note that never fails a run. Errors are only for what's unclear or broken. **D19 (prose-stays-prose)** narrowed that further, so ordinary prose that looks like an item, a sub-line or a citation stays prose.
- **D13 (crash-exits-2)**: 1 means only that the plan has errors, and any unexpected error is one line with exit 2.
- **D16 (local-proof)**: cross-OS behavior was proven with in-memory repos and this case-insensitive disk. A CI matrix waits until a pilot runs on Linux or Windows.
- **D17 (any-case-plan)**: `check` finds `KEYFRAMES.md` too, with a note. `init` still writes `keyframes.md`.

The calls that got it ready for the pilots:

- **D14 (npm-for-pilots)**: pilots install a public 0.x with `npx`, which is why step 13 exists. It also led to **D21 (snippet-runs-npx)**, because a bare `keyframes check` isn't on a pilot's PATH, and `npx keyframes` would fetch an unrelated package.
- **D18 (recruit-early)**: the pilot repos and readers get lined up during the build, because recruiting takes the longest.
- **D20 (claude-imports-agents)**: `CLAUDE.md` imports `AGENTS.md`, because Claude Code reads only `CLAUDE.md` and doesn't follow a markdown link.

On 2026-10-23 the pilots moved out of this build and into the next one, because they run on people's time over weeks and nothing in the code waits on them. Step 12 became the record they fill in, and steps 14 to 16 closed the loose ends.

## Parked & harvested

18 parked, 18 harvested: 10 blockers, 8 tangents, no pivots.

- **Blockers folded into steps that were still to come**: the CLI help's exit-2 line (P1) and the spec's pointer at the step that settles the item shape (P3) went into step 9's split. The spec's full list of variants (P10) went into step 10. The missing e2e tests (P13), the snippet missing from `AGENTS.md` (P14) and the shipped pnpm engine (P15) became steps 14 to 16. I6 cut off mid-sentence (P16), the missing `@AGENTS.md` import (P17) and the snippet's `keyframes check` that pilots can't run (P18) became steps 17 to 19.
- **Tangents that were done anyway**: step 6 widened the scan barrel (P5), and step 15 fixed the stale README lines (P2).
- **Tangents deferred**: P4, P6, P7, P8, P9, P11 and P12, below.

## Final status

Done. All 19 steps are checkpointed, the gate is green, and no question is open.

Three things remain, and all of them are outside the repo:

- **Publish.** `v0.2.0` is tagged, but npm has no `@robmclarty/keyframes` yet, so nothing has reached a pilot. The patch this build ends on (`/version patch`, then `npm publish` with your OTP) will be the first version on npm, and the snippet it prints already ends in the `npx` check.
- **Run the pilots.** Three repos, each with a named second reader (D18 (recruit-early)), filling in `docs/pilots.md`.
- **Make the closing call** in `docs/pilots.md`, which is the next build's first decision.

## Deferred tangents

Six of these are already in `docs/pilots.md` under "What to watch for", so the pilots will answer them:

- An unclosed comment hides the rest of the plan with no finding (P6).
- A setext heading (a line of text over `---`) isn't read as a section (P7).
- An item line with no bullet, or with its bullet one to three spaces in, reads as prose with no finding (P8).
- A slug with letters beyond ASCII, like `(café)`, is `malformed-item` (P9).
- A `./` or a doubled `/` in a path reads silently with no `alternate-form` note (P11).
- Item-line notes show a generic `- **C3 (one-writer)**: …` rather than the item's own ID and slug (P12).

One isn't in the pilot record:

- The spec's Appendix C draft still marks `src/cli.ts`, `src/init/` and `bin/keyframes.js` as `(new)`, though they all exist now (P4). The committed `keyframes.md` is correct, so only the historical draft in the spec is stale.

## Checkpoints

- baseline 789f1bce7dcb4d7f92b2fe70b00d43219a3e04f4
- plan 9b687ce65944a654f7115a8d37766bdda900a179
- step 3 73e60e84616ef3d872050d6bb0a74406a15e9fe4
- step 4 43b15e90f4de8cc7bae2a8e860ed991c6ac6e439
- step 5 9ead7bfb9edca0c5fbea9e16d763be594c8840a1
- step 6 6398818f149b715728c8d698b3ec0b5e666a2df7
- step 7 64bde75d8ab6d49e4eebca9449daf03be76e079a
- step 8 1434dfce91440ffb6f085a0f2a552f5017f47762
- step 9 724989eceae4ecf78c9aa5ce4c2e4e77c499479d
- step 10 9c761b56f924d47d0cb038c08ed09c421c7c7c92
- step 11 f33be3963710f34caa7b495aec5f26005e05694c
- step 13 fdc91301fe7f35cd16990b868c75b7f9c6117120
- step 12 8ff42cab9cf6a18ef1d74c9d9a93c5b4b266132a
- step 14 65e4ac8d5bec869ca76f1927bb2a4c5c51fc1c66
- step 15 8fd4857c616d64b8400de53928e65c04b1b9151a
- step 16 151071eeec69344f314f826a03c7fde7ca191b34
- step 17 4c4e3a50d5077208fda9d2cda9ffc42e50f4c725
- step 18 99e5f56dc60311434aebadaaa2ae95eb7deb44f5
- step 19 fbfbb999d35885fe8cc7603bd364b7f6613ad69c

## Stats

| step | red checks | drift warnings | reverts | wall-clock |
| ---- | ---------- | -------------- | ------- | ---------- |
| 3 | 0 | 0 | 0 | 2m |
| 4 | 0 | 0 | 0 | 4m |
| 5 | 0 | 0 | 0 | 9m |
| 6 | 0 | 1 | 0 | 8m |
| 7 | 0 | 1 | 0 | 3m |
| 8 | 0 | 0 | 0 | 5m |
| 9 | 0 | 1 | 0 | 22m |
| 10 | 0 | 1 | 0 | <1m |
| 11 | 0 | 0 | 0 | 6m |
| 12 | 0 | 0 | 0 | 648m |
| 13 | 1 | 0 | 0 | 565m |
| 14 | 0 | 1 | 0 | 6m |
| 15 | 0 | 0 | 0 | 3m |
| 16 | 0 | 0 | 0 | 1m |
| 17 | 0 | 0 | 0 | <1m |
| 18 | 0 | 0 | 0 | <1m |
| 19 | 0 | 0 | 0 | 2m |
| **total** | 1 | 5 | 0 | 1286m |
