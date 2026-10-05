# keyframes in the wider ecosystem

> **Archived 2026-10-04.** Historical reference, not current intent. The current plan is
> [`docs/prototype.md`](../prototype.md); see [this folder's README](README.md) for why.

This is where keyframes sits among existing practice: what it adopts, where it departs, and why.
Sources are in [`references.md`](references.md), cited here by name. Your own tools are covered
in §9 and in full in [`inventory.md`](inventory.md). Written 2026-10-04.

## Position

Three frames from existing work place keyframes precisely:

- **In Böckeler's taxonomy** ([Böckeler 2025](references.md#bockeler-2025)), keyframes is
  **spec-anchored**: "the spec is kept even after the task is complete, to continue using it for
  evolution and maintenance." It is anchored at the level of the *system*, not one spec per
  feature, and it is deliberately *not* spec-as-source. The code stays the source.
- **In her harness terms** ([Böckeler 2026](references.md#bockeler-2026)), keyframes is a
  **guide** in which every constraint must be paired with a **computational sensor**
  ("deterministic and fast… tests, linters, type checkers, structural analysis"), or labeled
  `review` and counted.
- **In software-engineering terms**, keyframes is a **reflexion model**
  ([Murphy et al. 1995](references.md#murphy-1995)) plus a **traceability index of fitness
  functions** ([Ford et al.](references.md#ford-fitness), [Gotel & Finkelstein](references.md#gotel-1994)),
  written in plain markdown for people.

Placed on two axes, who writes the intent and how it is enforced:

| | Read by the LLM only | Judged by an LLM | Checked deterministically |
| --- | --- | --- | --- |
| **Human-written** | AGENTS.md, CLAUDE.md, Cursor rules, Kiro steering | | ArchUnit, dependency-cruiser, import-linter, Nx, fallow boundaries (rules live in tool config or code) · **keyframes** (rules live in a human plan) |
| **AI-drafted, human-approved** | | Spec Kit, Kiro specs, BMAD | OpenSpec (checks the spec's own structure, not the code) · Tessl's tile (links and tests, plus LLM drift checks) · ContextCov (the AI compiles the checks) |
| **AI-maintained** | | | Spec Growth Engine (agents update specs in the same commit) |

keyframes occupies the human-written, deterministically checked cell. It does so with a plan
people read rather than tool configuration people write. That's the combination we didn't find
elsewhere (see §11 for how strong that claim is).

## 1. Spec-driven AI development

| Tool | What it is | keyframes adopts | keyframes differs, and why |
| --- | --- | --- | --- |
| **GitHub Spec Kit** ([spec-kit](references.md#spec-kit)) | Per-feature `spec.md`, `plan.md` and `tasks.md`, drafted by AI. A standing `constitution.md` becomes gates the LLM must pass or justify. | One standing file of project principles. It maps onto Constraints and Taste. | The constitution is LLM-judged; keyframes requires every constraint to name what holds it. Spec Kit's artifacts are AI-generated and large: [Eberhardt](references.md#eberhardt-2025) counted 2,577 and 2,262 lines of markdown for two features. keyframes is small and standing, under budgets. |
| **AWS Kiro** ([kiro](references.md#kiro)) | Requirements in EARS ([EARS](references.md#ears)), plus design and tasks. Steering files in `.kiro/steering/`, and hooks that run shell commands or agents. Property-based tests derived from requirements. | `structure.md` with file-match globs is the nearest analogue to the Map. Linking a requirement to an executable check is the same idea as `held-by:`. | Kiro's checks are written by an LLM, and its requirements analysis uses LLMs plus solvers. keyframes points at enforcers people already committed and only checks that they exist. Kiro's specs are mostly per-feature (Böckeler). |
| **Tessl** ([tessl](references.md#tessl)) | `.spec.md` files with `targets` and inline `[@test]` links, a link checker, and generated code marked "DO NOT EDIT". | Its link checker on test references is the closest prior art for `held-by:` existence checking. | Tessl aims at spec-as-source, where code is regenerated. keyframes keeps code as the source. Tessl judges drift with an LLM; the keyframes gate has none. |
| **OpenSpec** ([openspec](references.md#openspec)) | A standing `openspec/specs/` folder, with change proposals merged back as deltas. `openspec validate --strict` is deterministic. | A standing spec with a CI-friendly deterministic CLI. | Its validation checks the specs against themselves. keyframes checks the plan against the code. |
| **BMAD** ([bmad](references.md#bmad)) | AI personas (PM, architect, developer and others) produce a PRD, architecture doc and story files. | | A role-play pipeline that produces large AI-written documents is the review overload the critiques describe (§10). |
| **Spec Growth Engine** ([Grabowski 2026](references.md#spec-growth-engine)) | A spec graph with a drift gate that blocks merges on "orphan code" and "undeclared dependency (code imports across a spec boundary without a declared edge)". | **The closest prior art.** Its orphan code is our strays, and its undeclared dependency is our undeclared edge. Drift as a blocking condition. | "The AI agent updates the affected spec in the same commit." keyframes' first principle is the opposite: people commit the plan, and unattended tools never write it. It has one SPEC.md per node; keyframes is one plan, with a ≤7-concept budget. Its implementation isn't public. |
| **ContextCov** ([Sharma 2026](references.md#contextcov)) | Compiles AGENTS.md-style instructions into AST checks, shell shims and architecture validators. "88.3% constraint compliance (vs. 67.0% and 50.3%)" for the prompt-only and reflection baselines. | Its evidence: **executable constraints beat constraints that are only read**. | The AI writes the enforcers. In keyframes, people name them. ContextCov uses an LLM as judge for semantic rules; keyframes labels those `review` and never gates on them. |

## 2. Steering files

**AGENTS.md** ([agents-md](references.md#agents-md)), **Claude Code memory**
([claude-memory](references.md#claude-memory)) and **Cursor rules** ([cursor-rules](references.md#cursor-rules))
are standing, human-written markdown that agents read.

- **Adopts.** These files are the contract's *read* seam. An AGENTS.md stanza points agents at
  `keyframes.md`, and every major harness reads AGENTS.md, so integration needs no tool changes
  (principle K4). Path-scoped rules (`paths:`, `globs:`) are precedent for binding concepts to
  paths.
- **Differs.** These files are context, and the vendors say so: "Claude treats them as context,
  not enforced configuration" ([claude-memory](references.md#claude-memory)). The evidence says
  constraints that are only read decay:
  - agents lose 27.28 points of assertion pass rate as structural requirements accumulate
    ([Constraint Decay](references.md#constraint-decay));
  - prompt-only compliance is 67.0%, against 88.3% when the constraints are executable
    ([ContextCov](references.md#contextcov)).

  keyframes exists to put a sensor behind each guide.

## 3. Architecture conformance

This is the field keyframes belongs to most, and it is thirty years old.

- **Reflexion models** ([Murphy et al. 1995](references.md#murphy-1995)).
  - **Adopts** the method whole. An engineer writes a high-level model and a mapping to source; a
    tool computes convergences, divergences ("arcs not predicted by the high-level model") and
    absences ("arcs predicted by the high-level model" but missing). keyframes' map gauge is
    that classification. The path bindings are the mapping.
  - **Differs** in three ways:
    - Reflexion models are exploratory and ignore unmapped code. keyframes runs as a gate and
      reports strays.
    - In the paper's figures a dotted line marks an absence, while a keyframes map uses dotted
      lines for runtime calls, so keyframes' report must not reuse dotted lines for absences.
    - Reporting absences means a solid edge predicts a dependency rather than permitting one
      ([SPEC D13](SPEC.md#d13)), and keyframes adopts that meaning.
- **The conformance literature** ([Passos et al. 2010](references.md#passos-2010)) compares
  dependency matrices, query languages and reflexion models. One finding it cites shapes
  keyframes directly: "discovering a violation doesn't necessarily lead to its removal, which
  reinforces the importance of supporting continuous conformance checking." That's why the check
  runs in the gate rather than as an occasional audit.
- **Industrial tools**, each a possible `held-by:` target or extractor:

  | Tool | What it does | What keyframes takes | Its limit |
  | --- | --- | --- | --- |
  | **ArchUnit** ([archunit](references.md#archunit)) | Checks Java code against rules and "can derive rules straight from PlantUML diagrams" | The closest industrial match: code checked against a diagram | Java only; the rules live in test code |
  | **dependency-cruiser** ([dependency-cruiser](references.md#dependency-cruiser)) | Allowed and forbidden rules, folder-level collapse, orphan detection, JSON | A strong candidate JS/TS extractor behind the seam | — |
  | **import-linter** ([import-linter](references.md#import-linter)) | Python contracts | A natural Python enforcer | Prohibits only, so it can't report absences |
  | **Nx module boundaries** ([nx-boundaries](references.md#nx-boundaries)) | Tags and dependency constraints | Concepts as tags, edges as constraints | Lives in lint config |
  | **fallow boundaries** ([inventory](inventory.md#fallow-external-tool-v3220-in-checkridefascicle-v2130-in-ridgeline)) | Declared zones and allow-rules | — | Prohibits only |

  What keyframes adds is the layer above them: one human-readable, language-free map with a
  seven-concept budget, a planned state for unbuilt work, and absences.
- **Brownfield adoption** is an open lesson. ArchUnit's `FreezingArchRule` and checkride's
  baseline both grandfather existing violations and fail only new ones. keyframes will likely
  need the same when a map is drawn over an old codebase (design §11).

## 4. Fitness functions and traceability

- **Fitness functions** ([Ford et al.](references.md#ford-fitness)): "any mechanism that provides
  an objective integrity assessment of some architectural characteristic(s)."
  - **Adopts.** Every `held-by:` target is a fitness function, and keyframes is their *index*. The
    word "objective" is why no LLM judgment can gate.
  - **Differs.** keyframes writes no fitness functions. It refuses to let a constraint exist
    without naming one, or admitting it has none (`review`).
- **Traceability** ([Gotel & Finkelstein 1994](references.md#gotel-1994)): following "the life of
  a requirement, in both a forwards and backwards direction."
  - **Adopts.** `held-by:` is a deliberately minimal trace link: one hop, constraint to enforcer.
    Its existence is checked on every run.
  - **Differs.** There's no lifecycle tracing, and a link that exists isn't proof the enforcer is
    adequate.
- **Mutation testing** ([DeMillo et al. 1978](references.md#demillo-1978), [Stryker](references.md#stryker))
  tests whether tests catch faults. It's the deferred evidence that an enforcer really bites.
  Stryker already records which test killed each mutant.

## 5. Architecture documentation

- **C4 and Structurizr** ([Brown](references.md#c4-structurizr)).
  - **Adopts** "diagrams as code" and the idea of views over one model. C4 also names the gap:
    diagramming tools "can't provide any assistance or validation of your diagrams." keyframes is
    that validation.
  - **Differs.** There's no separate modeling language. The Mermaid view *is* the model, bound to
    paths, at most seven nodes per view.
- **Mermaid on GitHub** ([mermaid](references.md#mermaid), [GitHub](references.md#github-mermaid))
  is why the map needs no tool to be seen (principle K2). Mermaid's own pitch, "Doc-Rot is a
  Catch-22 that Mermaid helps to solve", is half the story. Rendering stops the picture going
  stale as a file; only a check stops it going stale as a *claim*.
- **Architecture decision records** ([Nygard 2011](references.md#nygard-2011), [MADR](references.md#madr)).
  - **Adopts** the append-only rule: "If a decision is reversed, we will keep the old one around,
    but mark it as superseded."
  - **Differs.** One line per decision, with its *because*, in one panel, rather than a file per
    decision. That's the sizing rule your plumbbob decision log already follows.
- **Living documentation** ([Adzic 2011](references.md#adzic-2011),
  [Martraire 2019](references.md#martraire-2019), [Gherkin](references.md#cucumber)).
  - **Adopts.** Scenarios stay true because tests hold them.
  - **Differs.** The scenario prose *points at* a test rather than executing through step
    definitions. That keeps the plan language-free and avoids glue code.

## 6. Approved snapshots vs authored intent

Approval and snapshot testing ([ApprovalTests](references.md#approvaltests),
[Jest](references.md#jest-snapshots)) commit what the code *does*, and a person approves changes.
Every existing diagram test in your repos is this kind: volley's and fascicle's flow-header
tests.

- **Differs.** keyframes is authored first. A snapshot can only say the code *changed*. A
  keyframe can say it drifted from what was *meant*, including dependencies that should exist and
  don't (absences), which a snapshot can't express.
- **Adopts** the review discipline: "the snapshot artifact should be committed alongside code
  changes, and reviewed." The keyframes diff is reviewed the same way.

## 7. Formal methods and the generative lineage

- **Lightweight formal methods** ([Jackson, *Software Abstractions*](references.md#jackson-abstractions);
  [Newcombe et al. 2015](references.md#newcombe-2015)).
  - **Differs, for now.** No formal semantics, no model checking. AWS names the gap keyframes
    narrows structurally ("How do we know that the executable code correctly implements the
    verified design?… we do not know"), and it narrows it only for structure.
  - [Kleppmann](references.md#kleppmann-2025) predicts AI will make proofs mainstream, and that
    "the challenge will move to correctly defining the specification". keyframes is a step on
    that path, not the destination.
- **Concept design** ([Meng & Jackson 2025](references.md#meng-jackson-2025), [Jackson 2021](references.md#jackson-2021)).
  - **Adopts** the concept as the unit of design, and the aim of legibility.
  - **Defers** the synchronization DSL. Your own sketches aren't event graphs, and the only edge
    that can be checked today is a static dependency (design §4).
- **Model-driven architecture and CASE tools** ([OMG MDA](references.md#omg-mda),
  [Whittle et al. 2014](references.md#whittle-2014), [Iivari 1996](references.md#iivari-1996)).
  - **Differs, deliberately.** The practice survey found developers "rarely use it to generate
    whole systems", called generation "a red herring", and tied adoption to social and
    organizational factors. keyframes generates nothing and keeps the plan incomplete by budget.
- **Design by Contract** ([Meyer 1992](references.md#meyer-1992)).
  - **Adopts** constraints as explicit obligations.
  - **Differs** in level: system-wide, with external enforcers rather than in-code assertions.
- **Modularity** ([Parnas 1972](references.md#parnas-1972), [Ousterhout](references.md#ousterhout)).
  A concept is Parnas's "responsibility assignment". The seven-concept budget pushes toward few,
  deep concepts.
- **Infrastructure as code** ([Terraform plan](references.md#terraform-plan)).
  - **Adopts** declared versus actual, reported read-only, with CI exit codes.
  - **Differs** in that keyframes never "applies". Either the plan or the code may be the wrong
    side, and a person decides.
- **Literate programming** ([Knuth 1984](references.md#knuth-1984)).
  - **Adopts** writing for people first.
  - **Differs** in keeping the plan and the code as separate artifacts, linked by checks rather
    than woven together.

## 8. Comprehension: why the human writes the plan

The process depends on a person holding the theory of the system
([Naur 1985](references.md#naur-1985)), and automation erodes the skills it leaves to that person
([Bainbridge 1983](references.md#bainbridge-1983)).

- **Shen & Tamkin's trial** ([2026](references.md#anthropic-2026)): AI-assisted learners scored
  50% against 67% for hand-coders, with the largest gap on debugging. The learners who used AI to
  "build comprehension" kept their mastery.
- **Litt** ([2026](references.md#litt-2026)) separates understanding *to verify* from
  understanding *to participate*.

keyframes' answer is division of labor:

- gauges carry *verification*;
- *authoring* the keyframes keeps people participating (principle K1);
- the plan is the "thin public signal" written back on purpose
  ([Acemoglu et al. 2026](references.md#acemoglu-2026)).

## 9. Your own tools

From [`inventory.md`](inventory.md). keyframes changes none of them, and integration is
configuration and prose.

| Tool | Relationship |
| --- | --- |
| **checkride** | The gate. keyframes runs as a custom check (`.check/keyframes.json`), with no change to checkride's source or contract. |
| **plumbbob** | Optional, and plumbbob's own later build: a `keyframes` setting; intents cite standing IDs; the `constraints` row is *measured* from the report (D82's "measured beats attested"); `finish` reminds rather than copies (D29). |
| **fallow** | One possible extractor (DOT output), plus an optional mirror *printed* for a person to commit. Never generated. |
| **volley, night-shift** | Unattended renderers. `keyframes.md` goes in `gate_paths`, so the plan is never written unattended. A dry-build kind is a later night-shift build. |
| **ridgeline** | Can read the plan's constraints and taste through its existing `--constraints` and `--taste` flags. It has no deterministic gate, so it can't absorb keyframes reds by itself. |
| **runciter** | The first read-only pilot. It runs ridgeline and gates on `pnpm check`, which includes keyframes through checkride. |
| **atis** | Not integrated. An intent view conflicts with atis §10 ("not an architecture-diagram product") and with P3. |
| **fascicle** | Untouched. Its `describe` and flow DSL remain candidate extractors for fascicle apps. Its bench and regression own fuzzy outcomes. |
| **agent-tools `ast-grep-rules`** | Its `/audit` (conventions → rules) is the same move at the level of lint rules, and its rule ids are `held-by:` targets. |

## 10. The critiques of spec-driven development, and the answers

| Critique | Source | keyframes' answer |
| --- | --- | --- |
| **Waterfall again; one workflow for every size** | [Zaninotto](references.md#zaninotto-2025); Böckeler ("sledgehammer to crack a nut") | Not a per-feature workflow. One standing plan, starting as one file. |
| **Review overload** | Böckeler: "I'd rather review code than all these markdown files"; [Eberhardt](references.md#eberhardt-2025) measured 3.5 hours of review | Budgets: seven concepts per view, one line per item, at most twenty taste lines. A typical keyframes diff is a few lines. |
| **False sense of control** | Böckeler: the agent "ultimately not follow all the instructions"; [Constraint Decay](references.md#constraint-decay) | The gate doesn't trust the agent. Constraints are held by computational sensors or visibly labeled `review`. |
| **Specs go stale** | [Thoughtworks Radar](references.md#thoughtworks-radar); [Spec Growth Engine](references.md#spec-growth-engine) | The map and every `held-by:` are checked on each run, and stale `(new)` markers warn. |
| **Spec-as-source is "inflexibility *and* non-determinism"** | Böckeler | keyframes is spec-anchored; the code remains the source. |

**Residual risk, stated plainly:** Intent, Decisions and Taste are prose, and no gate checks
them. They can drift. The design limits that by keeping them short and putting everything
load-bearing into the checked sections. It doesn't eliminate it.

## 11. What is actually new

We found no tool that combines all five of these:

1. a standing, **human-written**, plain-markdown plan, which unattended tools never write;
2. every constraint **declaring what holds it** (an enforcer, `review`, or `(new)`), with the
   enforcer's existence checked;
3. a **reflexion-model check** of the plan's map against the code, including absences and strays,
   through a language-neutral extractor seam;
4. a **planned** state, so the plan works before the code exists;
5. **no LLM in the gate, no writes, and no changes to other tools** to integrate.

The nearest neighbors each have some of these:

- **Spec Growth Engine** has the graph gate, but AI agents maintain its specs and the
  implementation isn't public.
- **Tessl** checks its spec-to-test links, but judges drift with an LLM and aims at spec-as-source.
- **ContextCov** has executable constraints, but the AI writes them.
- **ArchUnit** checks code against a diagram, but it's Java-only and its rules live in code.

**How strong this claim is:** it rests on a web search on 2026-10-04 and on the sources above.
"Not found" is not "doesn't exist". The defensible claim is the *combination*. Each ingredient
has precedent, and this document cites it.
