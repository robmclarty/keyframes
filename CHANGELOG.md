# Changelog

## v0.3.0 — 2026-10-27

The first version published to npm (v0.2.0 was tagged but never reached it), so `npx @robmclarty/keyframes` runs it in any repo. `check` reads more of what people write, and the pilots have a record and a playbook.

### Added

- `check` reads more variants, each with an `alternate-form` note that shows the usual form: a section heading underlined with a line of `-`, an item line with no bullet (written as a paragraph) or with its bullet one to three spaces in, a slug in any script such as `(café-crème)`, and a `./` or doubled slash in a path.
- A comment that starts a line and never closes is now the `unclosed-comment` warning, since it hides the rest of the plan.
- `docs/pilots.md` is the record the pilots fill in, and `docs/pilot-playbook.md` is the order to run them in, with the evidence each one collects for the next build.

### Changed

- Item-line notes show the usual form with the item's own letter, such as `- **C<n> (<slug>)**: …`, so one habit across many items still groups onto one line of the report.
- Slugs compare in Unicode's NFC form, and the report schema's slug pattern accepts any script.

### Fixed

- The agent snippet's last line now runs `npx @robmclarty/keyframes check`, which works where `keyframes` isn't installed.
- The published package names no pnpm engine, so installing it with npm or yarn gives no engine warning.

### Internal

- CI runs the full gate on Linux and macOS at Node 24 and 26. A pushed `vX.Y.Z` tag packs the package in a job with no publish rights, publishes it from a separate approval-gated job through npm trusted publishing, and turns this changelog's section into a GitHub Release.
- End-to-end tests hold the first-plan and second-editor scenarios, so this repo's plan marks both linked.
- This repo's `AGENTS.md` carries the keyframes snippet, `CLAUDE.md` imports it, and the plan's I6 is finished.
- The prototype build is finished; its record is in `.plumbbob/builds/2026-10-08-keyframes-prototype/`.

## v0.2.0 — 2026-10-23

The first working `keyframes` CLI, and the first release published to npm, so `npx @robmclarty/keyframes` runs it in any repo.

### Added

- `keyframes check [dir]` reads `keyframes.md` (found in any case) and reports what it can check: sections, ID'd items and their sub-lines, citations and references, `held-by:` pointers, and Map paths, read against the repo with exact case.
- Findings, counts and budgets come in a text report or, with `--json`, a report carrying every item with its text, sub-lines and results, described by the shipped `schema/report.schema.json`.
- Exit codes: 0 for no errors, 1 for errors (or any warning under `--strict`), and 2 for a usage or read problem or an unexpected error, which prints one line.
- Common variants of each form read exactly like the usual form, with an `alternate-form` note that never fails a run, and case never matters.
- `keyframes init [dir]` writes a starter `keyframes.md`, and refuses if one exists.
- `docs/format.md` describes the format for people, and `docs/agents.md` gives the agent snippet and where it goes.

### Changed

- The design is reframed around a prototype: `docs/prototype.md` is the living spec, and the first design moved to `docs/archive/`.

### Internal

- This repo has its own `keyframes.md`, checked with `keyframes check --strict` as a slot in the gate.
- A `prepack` script deletes `dist/` and rebuilds it before every pack, and the package publishes publicly.
- The build plan and its record live in `.plumbbob/builds/2026-10-08-keyframes-prototype/`.

## v0.1.1 — 2026-10-04

Initial release. The design and an enforced repository shape are in place. The `keyframes`
CLI itself isn't built yet; `docs/SPEC.md` is the plan for it.

### Added

- The design record: what keyframes is (`README.md`), a verified inventory of the surrounding tools, the revised design, the first-slice spec, where keyframes sits in the wider ecosystem, and verified references.
- The `@robmclarty/keyframes` package scaffold, gated by checkride (`pnpm check`), with a `/version` release config.

### Internal

- 19 ast-grep rules enforce the test layout (unit tests in `__tests__/`; `test/{integration,e2e,contract,helpers,fixtures}`) and the spec's shape constraints: functional only, Node builtins only in the core, and a read-only checker.
- Rule fixtures run in the gate (`rule-tests`), location rules are verified by scanning a real tree, and `test/` is type-checked (`typecheck-tests`).
