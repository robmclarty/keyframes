# Keyframes for agents

Agents learn about `keyframes.md` from a short snippet that you paste into the file they already
read. `keyframes init` prints it after it writes a starter plan, and it's the same in every repo:

```markdown
## Keyframes

This project's intent is in `keyframes.md`. Read it before you change code.

- **Constraints (C)** must always hold. If a change would break one, stop and ask.
- **Scenarios (S)** must keep working.
- **Decisions (D)** are settled. Don't reverse one without asking.
- **Questions (Q)** are open. Raise them; don't settle them on your own.
- **Ideas (I)** aren't agreed yet. Don't build one unless a person asks.
- **Principles (P)** decide judgment calls the plan doesn't cover.
- **Taste (T)** is preference. Follow it unless you have a reason, and say what the reason was.
- **Map (M)** says where things live. Put new code in the part it belongs to.
- When your work relies on an item, cite it as `[C3 (slug)]` in your summary or commit message.
- Don't edit `keyframes.md` unless a person asks you to. If it looks wrong or incomplete, say so
  and propose the change.
- After changing anything the plan points at, run `keyframes check`.
```

The snippet is guidance, and an agent can ignore it. It names no tool, so it works with any agent
that reads instructions from a file.

## Where it goes

Paste it into whichever file your agents read at the start of a session. These are some common
ones, as examples rather than integrations. Agents change what they read, so their own docs have
the final word.

| Agent | Where the snippet goes |
| --- | --- |
| Codex, Cursor, Amp, and many others | `AGENTS.md` at the repo root |
| Claude Code | `CLAUDE.md`, or a line `@AGENTS.md` in it that pulls in `AGENTS.md` |
| Gemini CLI | `GEMINI.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Aider | A conventions file you load with `--read`, such as `CONVENTIONS.md` |

With several agents in one repo, paste it once into `AGENTS.md`, and point the other files at it.

## What it asks of agents

- **Read the plan first**, and treat each section the way the
  [format's table](format.md#sections) says: a Constraint is a hard limit, a Decision is settled,
  a Question is open, an Idea isn't agreed.
- **Cite the items they relied on**, the way the plan cites them, in their summary or commit
  message:

  ```text
  fix(sync): batch the worker's writes

  Writes still go only through the sync worker, per [C1 (one-writer)].
  ```

- **Leave the plan to people.** An agent proposes a change to `keyframes.md` when it looks wrong
  or incomplete, and a person decides.
- **Run `keyframes check`** after changing anything the plan points at, such as a test that holds
  a constraint.

## For harness authors

`keyframes check --json` prints the whole plan as one JSON object: every item with its text, its
sub-lines and what each pointer and path resolved to, beside the counts and findings. Its shape is
[`schema/report.schema.json`](../schema/report.schema.json). A harness can hand an agent just the
items that touch its work, without parsing markdown, and keyframes needs to know nothing about the
harness.
