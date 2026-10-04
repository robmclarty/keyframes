# keyframes

*People draw the keyframes, machines draw the in-betweens, and a check confirms the two still agree.*

## What is this?

Animators draw the key poses and let assistants draw the frames in between. keyframes does the
same for software. You write a short plan of the system: what it's for, its main parts, and the
rules it must never break. AI writes the code in between. A checker then tells you mechanically
whether the code still matches the plan, so you review the plan instead of every line.

## How it works

keyframes is a short plan in plain markdown that people keep at the root of a repository. It holds
the system's intent, a map of its main parts and how they depend on one another, the
constraints that must always hold, the journeys it must support, the decisions made and why, and
the style to follow. It is written at the level of keyframes, not code: sparse enough to read in a
few minutes, and precise enough for an AI to generate the code in between.

People own it. AI can help draft changes while someone is there to approve them, but nothing
edits it unattended. Any agent or harness that respects keyframes reads the plan before it
changes code, cites the items it acts on, and stops rather than quietly overriding one.

The `keyframes check` command compares the plan with the repository:

- every constraint must point at a real, deterministic enforcer (a lint rule, a test or a check);
- the code's actual dependency graph must match the map;
- anything not built yet is reported as planned, not as a failure.

The check judges no prose and writes no files. It reports what is held, planned, drifted, or held
only by review, and your existing gate decides what blocks. When something goes red, a person
decides which is wrong: the plan, the code, or the check.

## Architecture

```text
           edit                         read
   you ───────────► keyframes/ ─────────────────────► agents & harnesses
    ▲               intent · map                      the contract:
    │               constraints · scenarios           read · cite · defer · gate
    │               decisions · taste                         │
    │                   │ read                                │ write
    │                   │                                     ▼
    │                   │                                   code
    │                   │                                     │ scan (TS first)
    │                   ▼                                     ▼
    │            keyframes check ◄─┬── file edges (JSON) ── extractor
    │                   │          └── rules · tests · config
    │                   │ report: held · planned · drifted · review-only
    │                   ▼
    └──── triage ◄── your gate (checkride · CI · pre-commit)
```

## Status

Design stage.

- [`docs/inventory.md`](docs/inventory.md) records what the existing tools actually do, verified
  against their source.
- [`docs/SPEC.md`](docs/SPEC.md) is the spec for the first slice: the format, the binding check,
  the contract and the shape gauge.
- [`docs/keyframe-development.md`](docs/keyframe-development.md) is the design argument, with
  every change from the original draft marked.
- [`docs/ecosystem.md`](docs/ecosystem.md) places keyframes among existing practice: what it
  adopts, and where and why it differs.
- [`docs/references.md`](docs/references.md) lists the outside sources, each verified, with what
  it supports.
