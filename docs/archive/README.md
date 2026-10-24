# Archive

These documents are historical reference, not current intent. They record the first design of
keyframes, from 2026-10-02 to 2026-10-04: a checker that held a codebase to a plan, shaped
around a specific set of existing tools.

On 2026-10-04 the concept was reframed. keyframes is now first a way for people to express a
project's intent so that other people can build on it and agents can be guided by it. The
deterministic checks still matter, but they come after that. It also stands alone and isn't tied
to any earlier project. This repo's plan is now [`keyframes.md`](../../keyframes.md), and
[`docs/prototype.md`](../prototype.md) is the spec the prototype was built to.

| Document | What it was |
| --- | --- |
| [`SPEC.md`](SPEC.md) | The first-slice spec: the format, the binding check and the shape gauge. Superseded by the prototype spec. |
| [`keyframe-development.md`](keyframe-development.md) | The design argument, revised from an earlier draft. |
| [`inventory.md`](inventory.md) | What the surrounding tools actually did, verified against their source. |
| [`ecosystem.md`](ecosystem.md) | Where the first design sat among existing practice. |
| [`references.md`](references.md) | The outside sources, each verified. |

The research is still useful as background: the evidence that intent and code drift apart, prior
art in architecture conformance and spec-driven development, and the sources. Where these
documents and the prototype spec disagree, the prototype spec wins.
