# inkwell

## Intent

Inkwell keeps one person's notes in step between their phone and their laptop. It's for someone
who writes where the signal is bad, on planes, trains and in the cabin, and who has lost work to
a sync tool that guessed wrong.

- **For:** one person, with two or three devices.
- **Good looks like:** an edit is never lost, even after a week offline, and nobody sees a merge
  dialog they didn't ask for.
- **Not:** a team wiki, a publishing tool or a place to keep files.

## Principles

- **P1 (local-first)**: The device holds the truth; the server only relays.
  - because: a note written on a plane has to be safe before anything syncs.
- **P2 (never-lose-a-word)**: When keeping data and keeping things tidy conflict, keep the data.
  - because: people forgive a duplicate note; they don't forgive a missing one.
- **P3 (boring-tech)**: Prefer the well-known tool to the clever one.
  - because: one person maintains this, on weekends.

## Map

- **M1 (editor)**: The editing surface, shared by the phone and desktop apps.
  - paths: src/editor/
- **M2 (store)**: The on-device store: one SQLite file and the code that reads it.
  - paths: src/store/
- **M3 (sync)**: The sync worker, the only part that writes the store.
  - paths: src/sync/
- **M4 (relay)**: The server that passes changes between devices, and can read none of them.
  - paths: server/relay/
- **M5 (history)**: A note's past versions, browsable and restorable. Designed, not built.

## Constraints

- **C1 (one-writer)**: Only the sync worker writes to the store.
  - because: two writers made the replay disagree with the live state.
  - held-by: file:test/store/writers.test.ts#"only the sync worker writes"
- **C2 (relay-is-blind)**: The relay only ever sees encrypted changes, never a note's text, per
  [P1 (local-first)].
  - held-by: file:server/relay/test/payload.test.ts#"rejects plaintext"
- **C3 (no-text-in-logs)**: No log, crash report or metric holds a note's text or title.
  - held-by: file:rules/no-note-in-logs.yml#"id: no-note-in-logs", review
- **C4 (offline-forever)**: Every feature works with no network. Only sync waits for one.
  - held-by: file:test/e2e/airplane.test.ts (new)
- **C5 (small-payloads)**: One sync payload stays under 64 KiB.
  - held-by: review

## Scenarios

- **S1 (offline-week)**: Someone writes on their laptop for a week with no signal, opens their
  phone at home, and sees every edit within a minute, with no prompt.
  - held-by: file:test/e2e/offline-week.test.ts#"offline week"
- **S2 (same-line)**: Two devices edit the same paragraph offline. Both versions survive, side by
  side, and the person picks one whenever they like.
  - held-by: file:test/e2e/conflict.test.ts#"both versions survive"
- **S3 (new-device)**: Someone signs in on a new laptop and has every note, without exporting
  anything.
  - held-by: review

## Decisions

- **D1 (crdt)**: Merge concurrent edits with a CRDT.
  - because: it promised merges with no conflicts.
  - superseded-by: D3
- **D2 (sqlite)**: Each device keeps its notes in one SQLite file.
  - because: one file is easy to back up and to reason about, per [P3 (boring-tech)].
- **D3 (keep-both)**: When two edits conflict, keep both versions and let the person choose, per
  [P2 (never-lose-a-word)].
  - because: the CRDT merged a sentence into nonsense twice in testing, and nobody could tell
    which edit had won.
- **D4 (device-keys)**: Each device holds its own key, and a new device gets one by scanning a
  code on an old one.
  - because: [C2 (relay-is-blind)] needs keys the relay never sees, and a key derived from a
    password is one weak password away from plaintext.

## Taste

- **T1 (calm-errors)**: Errors are calm and specific, and say what happens next: "Saved on this
  phone. It'll sync when you're back online."
- **T2 (no-nudges)**: No badges, streaks or reminders. The app stays quiet until someone opens it.
- **T3 (text-first)**: The note's text is the biggest thing on screen, and everything else gets
  out of its way.

## Questions

- **Q1 (merging)**: How should two edits to the same line merge?
  - resolved-by: D3
- **Q2 (sharing)**: Should one note be shareable with another person, or is that a different
  product?
- **Q3 (history-depth)**: How far back should history go before old versions are pruned?

## Ideas

- **I1 (dark-mode)**: A dark theme that follows the system setting.
- **I2 (export)**: Export every note as a folder of markdown files, for anyone who wants to leave.
