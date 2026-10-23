# lamplight

## Intent

<!-- Why this exists, who it's for, what good looks like. -->

## Principles

* **P1 (local-first)**: The device holds the truth; the server only relays.
* **P2 (boring-storage)**: Pick the storage nobody has to think about.
* **P3 (small-steps)**: Ship the smallest change that works.
- **P4 (quiet-failures)**: Fail where a person will see it, and nowhere else.
  - held-by: review
- **P5 (one-way)**: Data flows from the device to the server, never back.
- **P6 (readable)**: Code is read more than it's written.
- **P7 (no-magic)**: Nothing happens that a reader can't find.
- **P8 (offline)**: Every feature works on a plane.

## Map

- **M1 (api)**: The HTTP API the phone talks to.
  - paths: src/api/
- **M2 (handler)**: The one request handler.
  - paths: src/api/handler.ts
- **M3 (jobs)**: Background jobs.
  - paths: src/jobs/

## Constraint

- **C1 (one-writer)**: Only the sync worker writes to the database.
  - held-by: file:test/writes.test.ts#"only the sync worker writes"
- **C1 (no-text-in-logs)**: Logs never hold a note's text.
- **C2 (small-payloads)**: A sync payload stays small.
  - because: phones are slow.
  - because: networks are slower.
- **C3 (tested)**: The worker has a test.
  - held-by: file:test/worker.test.ts
- **C4 (handler)**: The handler exists.
  - held-by: file:src/api/handler.ts (new)
- **C5 (later)**: Writes are batched.
  - held-by: file:test/writes.test.ts#"batches writes" (new)
- **C6 (pointer)**: Requests are signed.
  - held-by: test:signing
- **C7 model**: Reads never block writes.
- **P9 (misplaced)**: This principle sits under Constraints.
- **C8 (bad slug!)**: This slug can't be read.
- **C9 (why)**: Every write is logged.
  - why: so a replay can find it.

## Scenarios

- **S1 (offline-edit)**: Someone edits on a plane and lands, and the laptop has the edit, as [C1 (one-writer)] and [D1 (sqlite-only)] promise, with [Q9 (gone)] still open. The sync worker sends the edit the moment the phone sees a network, the laptop merges it, and the person never has to think about which device saw the change first, or whether any edit made in the air was lost along the way.

## Decisions

- **D1 (one-database)**: Each device keeps its notes in one SQLite file.
- **D2 (postgres)**: The server used Postgres.
  - because: it was what we knew.
  - superseded-by: C1

## Taste

- **T1**: Messages are short.

## Notes

- **T2 (stray)**: An item under a free-prose heading.

## Taste

- **T3 (calm)**: Never cheerful.

```text
an unclosed fence
