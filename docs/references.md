# References

These are the outside sources behind the keyframes design, each verified on the web on
2026-10-04. Every entry says what it supports in the argument, and where the claim had to be
narrowed. The design docs cite these entries by anchor.

**Status:**

| Mark | Meaning |
| --- | --- |
| ✔ | We loaded the source and read the quoted passage. |
| ◐ | The source exists, but the claim we can make is narrower than first assumed (see the caveat). |
| ○ | Metadata only. The DOI or publisher record is confirmed, but the full text was paywalled, or a passage is quoted from a secondary source. |

---

## Corrections to the draft's citations

The 2026-10-02 draft cited several sources loosely. Corrected:

| Draft said | Correction |
| --- | --- |
| Anthropic's study: "17% lower on comprehension" | The groups scored **50% vs 67%** on a quiz covering conceptual understanding, code reading and debugging. That is a 17-*point* gap, about 25% relative. Anthropic's post itself says "17% lower" ([anthropic-2026](#anthropic-2026)). |
| The "Deutsch limit" as the reason legibility stops "around a few dozen primitives" | It is **folklore**: a remark recalled second-hand in a 1998 newsgroup FAQ, not a finding ([deutsch-limit](#deutsch-limit)). The seven-concept budget now rests on atis's attention budget and the runciter pilot. |
| Litt's talk, linked to a speaker page | Cite the **essay and video** instead. The event's year is labeled inconsistently across ai.engineer pages ([litt-2026](#litt-2026)). |
| Alloy as "lightweight formal methods" | The phrase is **Jackson's, from *Software Abstractions***, not the Alloy site ([jackson-abstractions](#jackson-abstractions)). |
| CASE and MDA "stalled" | The surveys say MDE survives in parts of systems and in DSLs, and that adoption turns on **social and organizational** factors. "Stalled *as whole-system generation*" is supportable; "stalled" alone isn't ([whittle-2014](#whittle-2014)). |
| C4 model vs views at `c4model.com` | The model-vs-views passage is on **`c4model.com/tooling`** ([c4-structurizr](#c4-structurizr)). |

---

## 1. The thesis: intent, comprehension, and why humans stay in the loop

- <a id="meng-jackson-2025"></a>**Meng & Jackson 2025.** ✔ Eagon Meng and Daniel Jackson, "What You
  See Is What It Does: A Structural Pattern for Legible Software," *Onward! '25* (SPLASH 2025),
  pp. 178–193. [DOI 10.1145/3759429.3762628](https://doi.org/10.1145/3759429.3762628) ·
  [arXiv 2508.14511](https://arxiv.org/abs/2508.14511) ·
  [MIT EECS news, 12 Nov 2025](https://www.eecs.mit.edu/mit-researchers-propose-a-new-model-for-legible-modular-software/)
  - *Supports:* building software from "concepts and synchronizations: fully independent services
    and event-based rules that mediate between them", in a DSL that "LLMs can reliably generate".
    This is the influence behind keyframes' *concepts*.
  - *Caveat:* keyframes keeps the concept and defers the synchronization DSL (design §4).
- <a id="jackson-2021"></a>**Jackson 2021.** ✔ Daniel Jackson, *The Essence of Software: Why
  Concepts Matter for Great Design*, Princeton University Press, 2021.
  [Publisher](https://press.princeton.edu/books/hardcover/9780691225388/the-essence-of-software)
  - *Supports:* "A software system should be viewed as a collection of interacting concepts."
- <a id="jackson-abstractions"></a>**Jackson, *Software Abstractions*.** ✔ Daniel Jackson, *Software
  Abstractions: Logic, Language, and Analysis*, MIT Press, 2006; revised 2011/2016.
  [Alloy book page](https://alloytools.org/book.html) · [Alloy](https://alloytools.org/)
  - *Supports:* "lightweight formal methods", Jackson's phrase for small, checkable design
    models. This is the deferred design-simulation path.
- <a id="kleppmann-2025"></a>**Kleppmann 2025.** ✔ Martin Kleppmann, "Prediction: AI will make formal
  verification go mainstream," blog, 8 Dec 2025.
  [Kleppmann's post](https://martin.kleppmann.com/2025/12/08/ai-formal-verification.html)
  - *Supports:* "rather than having humans review AI-generated code, I'd much rather have the AI
    prove to me that the code it has generated is correct", and "the challenge will move to
    correctly defining the specification." The human's job moves to the spec, which is the
    keyframes thesis.
  - *Caveat:* he argues for proofs. keyframes checks structure and bindings, which is a far
    weaker guarantee.
- <a id="anthropic-2026"></a>**Shen & Tamkin 2026.** ✔ Judy Hanwen Shen and Alex Tamkin (Anthropic),
  "How AI assistance impacts the formation of coding skills," 29 Jan 2026.
  [Post](https://www.anthropic.com/research/AI-assistance-coding-skills) · paper "How AI Impacts
  Skill Formation," [arXiv 2601.20245](https://arxiv.org/abs/2601.20245)
  - *Supports:* a randomized controlled trial (n = 52, mostly junior engineers, learning the Trio
    library). The AI group averaged 50% on the quiz against 67% for hand-coders. "The largest gap
    in scores between the two groups was on debugging questions." Those who "showed stronger
    mastery used AI assistance not just to produce code but to build comprehension". This backs
    principle K1: people *author* the keyframes rather than only approving them.
  - *Caveat:* a small sample, one library, and an immediate quiz.
- <a id="litt-2026"></a>**Litt 2026.** ✔ Geoffrey Litt, "Understanding is the new bottleneck,"
  essay, July 2026, from his AI Engineer talk.
  [Essay](https://www.geoffreylitt.com/2026/07/02/understanding-is-the-new-bottleneck.html) ·
  [Video](https://www.youtube.com/watch?v=WkBPX-oDMnA) ·
  [Talk page](https://ai.engineer/talks/understanding-is-the-new-bottleneck)
  - *Supports:* understanding *to verify* ("We check the agent's work") vs understanding *to
    participate* ("be an active participant in the creative process"). Gauges automate the
    first, and authoring keyframes preserves the second.
  - *Caveat:* ai.engineer metadata labels the event both 2025 and 2026. The essay says July 2026.
- <a id="naur-1985"></a>**Naur 1985.** ✔ Peter Naur, "Programming as theory building,"
  *Microprocessing and Microprogramming* 15(5): 253–261, 1985.
  [DOI](https://doi.org/10.1016/0165-6074(85)90032-8) · [free reprint](https://pages.cs.wisc.edu/~remzi/Naur.pdf)
  - *Supports:* programming as forming "a theory, of the matters at hand". Nobody holds the
    theory of code they didn't write, so review moves to the keyframes diff.
- <a id="bainbridge-1983"></a>**Bainbridge 1983.** ✔ Lisanne Bainbridge, "Ironies of automation,"
  *Automatica* 19(6): 775–779, 1983. [DOI](https://doi.org/10.1016/0005-1098(83)90046-8) ·
  [free copy](https://ckrybus.com/static/papers/Bainbridge_1983_Automatica.pdf)
  - *Supports:* automation "still leaves the operator to do the tasks which the designer cannot
    think how to automate", and "physical skills deteriorate when they are not used". This is
    the comprehension-erosion risk.
- <a id="brooks-1987"></a>**Brooks 1987.** ✔ Frederick P. Brooks Jr., "No Silver Bullet: Essence and
  Accidents of Software Engineering," *Computer* 20(4): 10–19, 1987 (UNC TR86-020, 1986).
  [DOI](https://doi.org/10.1109/MC.1987.1663532) · [free TR](https://www.cs.unc.edu/techreports/86-020.pdf)
  - *Supports:* "The complexity of software is an essential property, not an accidental one."
    Specs don't remove essential complexity; they move it. Hence the human validates the
    keyframes.
- <a id="dijkstra-ewd667"></a>**Dijkstra, EWD667.** ✔ E. W. Dijkstra, "On the foolishness of 'natural
  language programming'," EWD667, published in *Program Construction*, LNCS 69, 1979.
  [Transcription](https://www.cs.utexas.edu/~EWD/transcriptions/EWD06xx/EWD667.html)
  - *Supports:* "The virtue of formal texts is that their manipulations… need to satisfy only a
    few simple rules." It is why the parts of keyframes that gate are the small formal parts
    (IDs, pointers, edges), never the prose.
- <a id="acemoglu-2026"></a>**Acemoglu, Kong & Ozdaglar 2026.** ✔ "AI, Human Cognition and Knowledge
  Collapse," NBER Working Paper 34910, Feb 2026. [NBER w34910](https://www.nber.org/papers/w34910)
  - *Supports:* human effort produces "a 'thin' public signal that accumulates into the
    community's stock of general knowledge"; agentic AI substitutes for that effort, and the
    economy can "tip into a knowledge-collapse steady state". A standing, human-written plan is
    a small piece of that public signal, written back on purpose.

## 2. Design and checking precedents

- <a id="murphy-1995"></a>**Murphy, Notkin & Sullivan 1995.** ✔ "Software Reflexion Models: Bridging the
  Gap between Source and High-Level Models," *Proc. 3rd ACM SIGSOFT FSE*, 1995, pp. 18–28;
  extended in *IEEE TSE* 27(4), 2001. [Paper page](https://www.cs.ubc.ca/~murphy/papers/rm/fse95.html) ·
  [PDF](https://www.cs.ubc.ca/~murphy/papers/rm/reflexion_model_fse95.pdf) ·
  [DOI](https://doi.org/10.1145/222132.222136) · [TSE DOI](https://doi.org/10.1109/32.917525)
  - *Supports:* the shape gauge. An engineer writes a high-level model and a mapping to source; a
    tool reports "*convergences*, where the source model agrees with the high-level model",
    "*divergences*, where the source model includes arcs not predicted by the high-level model",
    and "*absences*, where the source model does not include arcs predicted by the high-level
    model."
  - *Caveat:* reflexion models are exploratory, and unmapped code is ignored. keyframes runs as a
    gate and reports strays. In the paper's figures a dotted line marks an absence, so
    keyframes' report must not reuse dotted lines (they mean "talks to at runtime").
- <a id="passos-2010"></a>**Passos et al. 2010.** ✔ Passos, Terra, Valente, Diniz and Mendonça,
  "Static Architecture-Conformance Checking: An Illustrative Overview," *IEEE Software* 27(5),
  2010. [DOI](https://doi.org/10.1109/MS.2009.117) ·
  [author PDF](https://homepages.dcc.ufmg.br/~mtov/pub/2010_ieeesw.pdf)
  - *Supports:* conformance checking (dependency matrices, query languages, reflexion models)
    as an established field. A cited finding: "discovering a violation doesn't necessarily lead
    to its removal, which reinforces the importance of supporting continuous conformance
    checking." This is why keyframes runs in the gate.
- <a id="ford-fitness"></a>**Ford, Parsons, Kua (& Sadalage).** ◐ *Building Evolutionary Architectures*,
  O'Reilly, 2017; 2nd ed. 2022. [Site](https://evolutionaryarchitecture.com/) ·
  [InfoQ on fitness functions](https://www.infoq.com/articles/fitness-functions-architecture/)
  - *Supports:* "An architectural fitness function is any mechanism that provides an objective
    integrity assessment of some architectural characteristic(s)." Each `held-by:` target is a
    fitness function, and keyframes is their index.
  - *Caveat:* this is the second edition's wording, quoted by InfoQ. The first edition's wording
    is unverified.
- <a id="c4-structurizr"></a>**Brown, C4 and Structurizr.** ✔ Simon Brown.
  [c4model.com/tooling](https://c4model.com/tooling) · [Structurizr docs](https://docs.structurizr.com/) ·
  ["Diagrams as code 2.0"](https://dev.to/simonbrown/diagrams-as-code-2-0-82k)
  - *Supports:* "a non-visual model… and then creating different views (that become diagrams)
    on top of that model", and that plain diagramming tools "can't provide any assistance or
    validation of your diagrams." keyframes supplies that validation.
- <a id="newcombe-2015"></a>**Newcombe et al. 2015.** ✔ Newcombe, Rath, Zhang, Munteanu, Brooker and
  Deardeuff, "How Amazon Web Services Uses Formal Methods," *CACM* 58(4): 66–73, 2015.
  [DOI](https://doi.org/10.1145/2699417)
  - *Supports:* "conventional design documents consist of prose, static diagrams, and perhaps
    pseudo-code in an ad hoc untestable language." It also admits the gap keyframes addresses
    structurally: "How do we know that the executable code correctly implements the verified
    design?… we do not know."
- <a id="foundationdb-sim"></a>**FoundationDB simulation.** ✔ Zhou et al., "FoundationDB: A Distributed
  Unbundled Transactional Key Value Store," *SIGMOD '21*,
  [DOI 10.1145/3448016.3457559](https://doi.org/10.1145/3448016.3457559) ·
  [testing docs](https://apple.github.io/foundationdb/testing.html) ·
  [Wilson, Strange Loop 2014](https://www.youtube.com/watch?v=4fFDFbi3toc)
  - *Supports:* "a *deterministic* simulation of an entire FoundationDB cluster within a
    single-threaded process." This is the far end of the deferred paths gauge.
- <a id="tigerbeetle-vopr"></a>**TigerBeetle VOPR.** ✔
  [VOPR docs](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/internals/vopr.md) ·
  [Safety](https://docs.tigerbeetle.com/concepts/safety/)
  - *Supports:* "our name for our deterministic simulator". It fakes the clock, network and disk,
    and injects faults.
- <a id="deutsch-limit"></a>**The Deutsch limit.** ◐ comp.lang.visual FAQ (ed. David McIntyre; entry by
  Fred Lakin), 1998. [FAQ](http://www.faqs.org/faqs/visual-lang/faq/) ·
  [Wikipedia](https://en.wikipedia.org/wiki/Deutsch_limit)
  - *Says:* "Deutsch said something like: '…you can't have more than 50 visual primitives on the
    screen at the same time.'"
  - *Caveat:* a second-hand recollection of a remark at an undated talk. It is folklore, not
    evidence, so keyframes doesn't rest the budget on it.
- <a id="omg-mda"></a>**OMG Model Driven Architecture.** ✔ [MDA](https://www.omg.org/mda/) ·
  [MDA Guide v1.0.1](https://www.omg.org/news/meetings/workshops/UML_2003_Manual/00-2_MDA_Guide_v1.0.1.pdf)
  ("in 2001 OMG adopted… the Model Driven Architecture")
- <a id="whittle-2014"></a>**Whittle, Hutchinson & Rouncefield 2014.** ✔ "The State of Practice in
  Model-Driven Engineering," *IEEE Software* 31(3), 2014.
  [DOI](https://doi.org/10.1109/MS.2013.65) ·
  [free](https://eprints.lancs.ac.uk/id/eprint/69765/1/SO_SW_2012_12_0188.R1_Whittle.pdf)
  - *Supports:* a survey of 450 practitioners plus 22 interviews. Developers "rarely use it to
    generate whole systems", adoption "largely depends on social and organizational factors",
    and code generation is "a red herring." keyframes doesn't generate; it keeps the plan
    deliberately incomplete.
- <a id="hutchinson-2011"></a>**Hutchinson, Rouncefield & Whittle 2011.** ○ "Model-driven engineering
  practices in industry," *ICSE '11*, pp. 633–642.
  [DOI](https://doi.org/10.1145/1985793.1985882)
- <a id="iivari-1996"></a>**Iivari 1996.** ○ "Why are CASE tools not used?" *CACM* 39(10), 1996.
  [DOI](https://doi.org/10.1145/236156.236183)

## 3. Practices keyframes adopts or departs from

Enforcement and conformance tools:

- <a id="archunit"></a>**ArchUnit.** ✔ [archunit.org](https://www.archunit.org/) ·
  [user guide](https://www.archunit.org/userguide/html/000_Index.html)
  - It checks Java code against rules, and "can derive rules straight from PlantUML diagrams". This
    is the closest industrial match to checking code against a diagram. `FreezingArchRule`
    grandfathers existing violations.
- <a id="dependency-cruiser"></a>**dependency-cruiser.** ✔ [repo](https://github.com/sverweij/dependency-cruiser) ·
  [rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)
  - Allowed and forbidden dependency rules, `--collapse` to folder level, orphan detection, and
    JSON output. A strong candidate JS/TS extractor.
- <a id="import-linter"></a>**import-linter.** ✔ [docs](https://import-linter.readthedocs.io/en/stable/contract_types/)
  - Python "contracts": forbidden, independence and layers. A natural `held-by:` target in Python.
    It only prohibits, so it reports no absences.
- <a id="nx-boundaries"></a>**Nx enforce-module-boundaries.** ✔
  [docs](https://nx.dev/docs/features/enforce-module-boundaries)
  - Project tags plus `depConstraints`. Concepts as tags, edges as constraints, in ESLint config.
- <a id="ast-grep"></a>**ast-grep** ✔ ([site](https://ast-grep.github.io/)) and
  <a id="semgrep"></a>**Semgrep** ✔ ([rules](https://docs.semgrep.dev/writing-rules/overview))
  - Conventions as deterministic, polyglot rules. These are `rule:` pointer targets.
- <a id="demillo-1978"></a>**DeMillo, Lipton & Sayward 1978.** ○ "Hints on Test Data Selection," *IEEE
  Computer* 11(4), 1978. [DOI](https://doi.org/10.1109/C-M.1978.218136).
  <a id="stryker"></a>**Stryker** ✔ [stryker-mutator.io](https://stryker-mutator.io/)
  - Mutation testing tests the tests. It is the deferred evidence that a `held-by:` enforcer
    actually bites.
- <a id="terraform-plan"></a>**Terraform plan and drift detection.** ✔
  [plan](https://developer.hashicorp.com/terraform/cli/commands/plan) ·
  [drift detection](https://developer.hashicorp.com/terraform/tutorials/cloud/drift-detection)
  - Declared versus actual, reported read-only before change, with CI exit codes. Unlike
    Terraform, keyframes never "applies": either side may be wrong.

Decisions, specifications and documentation:

- <a id="nygard-2011"></a>**Nygard 2011.** ✔ Michael Nygard, "Documenting Architecture Decisions,"
  15 Nov 2011. [Post](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
  <a id="madr"></a>**MADR** ✔ [adr.github.io/madr](https://adr.github.io/madr/)
  - "If a decision is reversed, we will keep the old one around, but mark it as superseded." This
    is the append-only Decisions section.
- <a id="adzic-2011"></a>**Adzic 2011.** ✔ Gojko Adzic, *Specification by Example*, Manning, 2011.
  [Publisher](https://www.manning.com/books/specification-by-example) ·
  <a id="cucumber"></a>[Gherkin reference](https://cucumber.io/docs/gherkin/reference/)
  - Executable specifications and living documentation. keyframes scenarios point at tests
    rather than executing prose.
- <a id="martraire-2019"></a>**Martraire 2019.** ✔ Cyrille Martraire, *Living Documentation*,
  Addison-Wesley, 2019.
  [Publisher](https://www.informit.com/store/living-documentation-continuous-knowledge-sharing-by-9780134689326)
- <a id="approvaltests"></a>**Approval and snapshot testing.** ✔ [ApprovalTests](https://approvaltests.com/) ·
  <a id="jest-snapshots"></a>[Jest snapshots](https://jestjs.io/docs/snapshot-testing)
  - "The snapshot artifact should be committed alongside code changes, and reviewed." This is
    the *approved-snapshot* alternative. keyframes is authored first instead.
- <a id="gotel-1994"></a>**Gotel & Finkelstein 1994.** ○ "An Analysis of the Requirements Traceability
  Problem," *ICRE 1994*. [DOI](https://doi.org/10.1109/ICRE.1994.292398)
  - Traceability as the "ability to describe and follow the life of a requirement", quoted via
    [Ravichandar et al.](https://arxiv.org/pdf/cs/0703012). `held-by:` is a one-hop trace link.
- <a id="meyer-1992"></a>**Meyer 1992.** ✔ Bertrand Meyer, "Applying 'Design by Contract'," *IEEE
  Computer* 25(10), 1992. [Author PDF](https://se.inf.ethz.ch/~meyer/publications/computer/contract.pdf)
- <a id="parnas-1972"></a>**Parnas 1972.** ✔ "On the Criteria To Be Used in Decomposing Systems into
  Modules," *CACM* 15(12), 1972. [DOI](https://doi.org/10.1145/361598.361623) ·
  [text](https://teaching.csse.uwa.edu.au/units/CITS4401/readings/parnasmodules.htm)
  - A "'module' is considered to be a responsibility assignment." This is what a keyframes
    concept is.
- <a id="ousterhout"></a>**Ousterhout.** ◐ John Ousterhout, *A Philosophy of Software Design*, 2018;
  2nd ed. 2021. [Book page](https://web.stanford.edu/~ouster/cgi-bin/book.php)
  - Deep modules. Quoted via secondary notes.
- <a id="knuth-1984"></a>**Knuth 1984.** ○ "Literate Programming," *The Computer Journal* 27(2), 1984.
  [DOI](https://doi.org/10.1093/comjnl/27.2.97)
- <a id="mermaid"></a>**Mermaid** ✔ [mermaid.js.org](https://mermaid.js.org/intro/) and
  <a id="github-mermaid"></a>**GitHub's native rendering** ✔
  [announcement, 14 Feb 2022](https://github.blog/developer-skills/github/include-diagrams-markdown-files-mermaid/) ·
  [docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams)
  - The map renders where people already read markdown, with no tool (principle K2).

## 4. Spec-driven AI development (2025–2026)

- <a id="spec-kit"></a>**GitHub Spec Kit.** ✔
  [Announcement, Sep 2025](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/) ·
  [repo](https://github.com/github/spec-kit) ·
  [spec-driven.md](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- <a id="kiro"></a>**AWS Kiro.** ✔ [specs](https://kiro.dev/docs/specs/) · [steering](https://kiro.dev/docs/steering/) ·
  [hooks](https://kiro.dev/docs/hooks/) · [property-based testing](https://kiro.dev/blog/property-based-testing/) ·
  [requirements analysis](https://kiro.dev/blog/deep-spec-analysis/)
- <a id="ears"></a>**EARS.** ✔ Mavin, Wilkinson, Harwood and Novak, "Easy Approach to Requirements
  Syntax (EARS)," *RE '09*, 2009. [Mavin's page](https://alistairmavin.com/ears/) ·
  [Manchester record](https://research.manchester.ac.uk/en/publications/easy-approach-to-requirements-syntax-ears/)
- <a id="tessl"></a>**Tessl.** ✔ [launch post](https://tessl.io/blog/tessl-launches-spec-driven-framework-and-registry) ·
  [SDD tile](https://github.com/tesslio/spec-driven-development-tile)
- <a id="bockeler-2025"></a>**Böckeler 2025.** ✔ Birgitta Böckeler, "Understanding Spec-Driven-Development:
  Kiro, spec-kit, and Tessl," martinfowler.com, 15 Oct 2025.
  [Article](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
  - It is the source of the spec-first / spec-anchored / spec-as-source taxonomy. Two lines
    matter to us: "I'd rather review code than all these markdown files", and "I frequently saw
    the agent ultimately not follow all the instructions."
- <a id="bockeler-2026"></a>**Böckeler 2026.** ✔ "Harness engineering for coding agent users,"
  martinfowler.com, 2 Apr 2026. [Article](https://martinfowler.com/articles/harness-engineering.html)
  - Guides (feedforward) vs sensors (feedback), and *computational* controls ("deterministic and
    fast… tests, linters, type checkers, structural analysis") vs *inferential* ones (LLM as
    judge).
- <a id="agents-md"></a>**AGENTS.md.** ✔ [agents.md](https://agents.md/) ·
  [Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- <a id="claude-memory"></a>**Claude Code memory.** ✔ [docs](https://code.claude.com/docs/en/memory)
  - "Claude treats them as context, not enforced configuration."
- <a id="cursor-rules"></a>**Cursor rules.** ✔ [docs](https://cursor.com/docs/context/rules)
- <a id="bmad"></a>**BMAD Method.** ✔ [repo](https://github.com/bmad-code-org/BMAD-METHOD).
  <a id="openspec"></a>**OpenSpec** ✔ [repo](https://github.com/Fission-AI/OpenSpec)
- <a id="spec-growth-engine"></a>**Grabowski 2026.** ✔ Hartwig Grabowski, "The Spec Growth Engine:
  Spec-Anchored, Code-Coupled, Drift-Enforced Architecture for AI-Assisted Software
  Development," arXiv 2606.27045, Jun 2026. [Abstract](https://arxiv.org/abs/2606.27045) ·
  [HTML](https://arxiv.org/html/2606.27045)
  - The closest prior art. Its drift gate blocks on "Orphan code (a source file with no spec
    owner); Undeclared dependency (code imports across a spec boundary without a declared
    edge)".
  - *Differs:* "the AI agent updates the affected spec in the same commit", and the
    implementation isn't public.
- <a id="contextcov"></a>**Sharma 2026.** ✔ Reshabh K Sharma, "ContextCov: Deriving and Enforcing
  Executable Constraints from Agent Instruction Files," arXiv 2603.00822, 2026.
  [Abstract](https://arxiv.org/abs/2603.00822)
  - It compiles AGENTS.md-style instructions into AST checks, shell shims and architecture
    validators: "88.3% constraint compliance (vs. 67.0% and 50.3%)" for prompt-only and
    reflection baselines. This is evidence that executable constraints beat constraints that
    are only read.
- <a id="constraint-decay"></a>**Dente, Satriani & Papotti 2026.** ✔ "Constraint Decay: The Fragility
  of LLM Agents in Backend Code Generation," arXiv 2605.06445, May 2026.
  [Abstract](https://arxiv.org/abs/2605.06445)
  - "As structural requirements accumulate, agent performance exhibits a substantial decline."
    Configurations "lose 27.28 points on average in assertion pass rates" from baseline to fully
    specified tasks. This is evidence against constraints that agents only read.
- <a id="fiberplane-drift"></a>**fiberplane/drift** ✔ ([repo](https://github.com/fiberplane/drift)) and
  <a id="mick-drift"></a>**mick-gsk/drift** ✔ ([repo](https://github.com/mick-gsk/drift))
  - Doc-to-code staleness and observed boundary erosion.
- <a id="openai-harness"></a>**OpenAI, "Harness engineering."** ○
  [post](https://openai.com/index/harness-engineering/) (403 on fetch; corroborated by Böckeler
  2026 and search results). Layered architecture enforced by custom linters and structural
  tests, with a short AGENTS.md as the map.
- <a id="tsarch"></a>**Steyer, tsarch for AI agents.** ✔
  [post](https://www.angulararchitects.io/en/blog/architecture-beyond-layers-tsarch-for-ai-agents/)

Critiques of spec-driven development:

- <a id="zaninotto-2025"></a>**Zaninotto 2025.** ✔ "Spec-Driven Development: The Waterfall Strikes
  Back," 12 Nov 2025.
  [Post](https://marmelab.com/blog/2025/11/12/spec-driven-development-waterfall-strikes-back.html)
- <a id="eberhardt-2025"></a>**Eberhardt 2025.** ✔ "Putting Spec Kit through its paces," Scott Logic,
  26 Nov 2025.
  [Post](https://blog.scottlogic.com/2025/11/26/putting-spec-kit-through-its-paces-radical-idea-or-reinvented-waterfall.html)
  - 2,577 and 2,262 lines of markdown for two features. 33.5 agent minutes plus 3.5 hours of
    review, against 8 minutes plus about 24 iterating.
- <a id="thoughtworks-radar"></a>**Thoughtworks Technology Radar, "Spec-driven development".** ◐
  "Assess", Nov 2025.
  [Entry](https://www.thoughtworks.com/radar/techniques/spec-driven-development)
  - *Caveat:* the volume number (33 or 34) is uncertain.
