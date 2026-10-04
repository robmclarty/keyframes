# Changelog

## v0.1.1 — 2026-10-04

Initial release. The design and an enforced repository shape are in place. The `keyframes`
CLI itself isn't built yet; `docs/SPEC.md` is the plan for it.

### Added

- The design record: what keyframes is (`README.md`), a verified inventory of the surrounding tools, the revised design, the first-slice spec, where keyframes sits in the wider ecosystem, and verified references.
- The `@robmclarty/keyframes` package scaffold, gated by checkride (`pnpm check`), with a `/version` release config.

### Internal

- 19 ast-grep rules enforce the test layout (unit tests in `__tests__/`; `test/{integration,e2e,contract,helpers,fixtures}`) and the spec's shape constraints: functional only, Node builtins only in the core, and a read-only checker.
- Rule fixtures run in the gate (`rule-tests`), location rules are verified by scanning a real tree, and `test/` is type-checked (`typecheck-tests`).
