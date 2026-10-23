# lamplight

## Intent

Lamplight keeps one person's notes in step between a phone and a laptop, offline first, for
someone who writes on planes. Good looks like an edit that is never lost. It isn't a team wiki.

## Principles

- **P1 (local-first)**: The device holds the truth; the server only relays.
- **P2 (boring-storage)**: Pick the storage nobody has to think about.

## Map

- **M1 (sync)**: The sync worker, the only writer.
  - paths: src/sync/
- **M2 (api)**: The HTTP API the phone talks to.
  - paths: src/api/handler.ts, src/api/routes.ts (new)
- **M3 (history)**: How a note's history is drawn; a concept for now.

## Constraints

- **C1 (one-writer)**: Only the sync worker writes to the database.
  - because: two writers made the replay disagree with the live state.
  - held-by: file:test/writes.test.ts#"only the sync worker writes"
- **C2 (no-text-in-logs)**: Logs never hold a note's text.
  - held-by: file:test/logs.test.ts (new)
- **C3 (small-payloads)**: A sync payload stays under 64 KiB.
  - held-by: review
- **C4 (utf8)**: Notes are UTF-8 everywhere, per [P2 (boring-storage)].

## Scenarios

- **S1 (offline-edit)**: Someone edits on a plane, lands, and sees the edit on the laptop.
  - held-by: file:test/offline.test.ts#"edits made offline sync on reconnect", review

## Decisions

- **D1 (postgres)**: Each device keeps its notes in Postgres.
  - because: it was what we knew.
  - superseded-by: D2
- **D2 (one-database)**: Each device keeps its notes in one SQLite file.
  - because: one file is easy to back up and to reason about, per [P2 (boring-storage)].
- **D3 (disk-encryption)**: Notes rely on the device's disk encryption.
  - because: a second layer of keys is one more thing to lose.

## Taste

- **T1 (quiet)**: Messages are short, and never cheerful.

## Questions

- **Q1 (merging)**: How should two edits to one line merge?
- **Q2 (encryption)**: Should notes be encrypted at rest?
  - resolved-by: D3

## Ideas

- **I1 (web-viewer)**: A read-only web view of one note, for sharing.
