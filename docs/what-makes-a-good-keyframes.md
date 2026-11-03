**What makes it a good plan:**

- **The Intent says what it isn't.** "Not a team wiki" is the line that stops an agent from adding sharing on its own. That's why sharing is an open question (Q2) and not a feature.
- **Every item would change what someone does.** No item restates what the code or README already says. Each one is something a newcomer or an agent would get wrong without being told.
- **The `because:` lines are specific.** "The CRDT merged a sentence into nonsense twice" lets a future reader weigh the decision. "It's better" wouldn't.
- **Items cite each other.** D3 rests on P2, D4 on C2, and C2 on P1. An agent can follow the reasoning, and renaming a slug flags every stale citation.
- **The `held-by:` lines are honest.**
  - C1, C2 and the S1/S2 scenarios point at real tests by name, so renaming or deleting a test breaks the check.
  - C3 names both a lint rule and `review`, because the rule can't catch everything.
  - C4's test is marked `(new)` because it isn't written yet.
  - C5 just says `review`.
  - None of them claims more coverage than exists.
- **It keeps its history short.** D1 stays, marked superseded, so old citations still resolve. Q1 points at the decision that settled it. The longer story belongs in a log, not here.
- **The Map is small.** It has five parts, and M5 is a concept with no paths yet, which is allowed.
- **The Taste items are concrete.** T1 quotes an actual error message rather than saying "errors should be friendly."
- **It's small.** At 715 of 2,000 words, it reads in five minutes, and every section is under its item budget.
