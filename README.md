# keyframes

*People set the keyframes. Everyone who works on the project, human or agent, works from them.*

## What is this?

In animation, the keyframes are the poses that define a motion, and everything between them is
drawn to fit. Every project has keyframes of its own: why it exists, what matters, what must
always hold, and how it should feel. They usually live in people's heads, chat threads and stale
READMEs, where new people piece them together slowly and agents never see them at all.

keyframes is one short markdown file, `keyframes.md`, where people write that intent down. Other
people can build on it and refine it, and agents can read it and be guided by it. A small CLI
keeps the file consistent and checks whatever can be checked, the same way every time.

## What goes in it

| Section | What it holds |
| --- | --- |
| **Intent** | Why this exists, who it's for, what good looks like, and what it isn't |
| **Principles** | The values that settle judgment calls |
| **Map** | The main parts, and where each one lives |
| **Constraints** | What must always be true |
| **Scenarios** | The journeys the system must support |
| **Decisions** | Choices made, and why |
| **Taste** | How it should look, read and feel |
| **Questions** | Questions that still need an answer |
| **Ideas** | Things worth considering someday |

Intent is prose. Everything else is a list of short items, each with an ID and a slug that other
items cite, as in `[C3 (one-writer)]`:

```markdown
- **C3 (one-writer)**: Only the sync worker writes to the database.
  - because: two writers made the replay disagree with the live state.
  - held-by: file:test/writes.test.ts#"only the sync worker writes"
```

## How it works

- **People own it.** An agent may draft an edit while a person approves it, but nothing edits the
  file unattended.
- **Agents read it.** A short snippet in `AGENTS.md`, or whatever file your agents read, tells
  them to read the plan before changing code, to stop before crossing a constraint, to leave
  questions and ideas to people, and to cite the items they relied on.
- **`keyframes check` keeps it honest.** It checks the file's structure, that every citation names
  a real item, and that every file the plan points at exists. It runs nothing, judges no prose and
  writes nothing, and it gives the same answer on every machine. It claims only what it checked: a
  pointer *resolves*; it's never *enforced*.

When `check` finds something, a person decides what's wrong: the plan, the code or the check.

```text
             write · refine                    read
   people ───────────────────► keyframes.md ──────────► agents
     ▲                              │                     │
     │                              │ read                │ write
     │                              ▼       files exist?  ▼
     │                       keyframes check ◄────────── code
     │                              │
     └──────── findings ◄───────────┘
```

## Status

Design stage. The prototype isn't built yet.

- [`docs/prototype.md`](docs/prototype.md) is the current plan: the prototype we build first,
  and the pilots that decide what comes next.
- [`docs/archive/`](docs/archive/) holds the first design and its research. It's historical
  reference, not current intent.
