import { readFileSync } from 'node:fs';

import { describe, expect, test } from 'vitest';

import { check, type Report } from '../../src/check/index.js';
import { SNIPPET, template } from '../../src/init/index.js';
import { memoryRepo } from '../../src/repo/index.js';
import { renderText } from '../../src/report/index.js';
import { finding, type Code } from '../../src/scan/index.js';

// The docs written for people, and the spec they're written from. Every markdown block in the docs
// is either the agent snippet, word for word, or an example plan with a comment above it saying
// what `check` finds in it, such as `<!-- check: clean -->` or `<!-- check: no-intent, 2
// alternate-form -->`. A text block that starts with `keyframes.md` is a report, and must be what
// `check` prints for the example plan above it.
const DOCS = ['format.md', 'agents.md'] as const;

// The files the examples point at. A pointer an example marks `(new)`, or shows broken, is
// deliberately missing.
const REPO = {
  'src/sync/worker.ts': '',
  'src/api/handler.ts': '',
  'test/writes.test.ts': "test('only the sync worker writes', () => {});\n",
};

/** A fenced block in a markdown file: its first line, its language, its body, and the comment above it. */
type Fence = {
  readonly line: number;
  readonly lang: string;
  readonly body: string;
  /** The nearest line above the fence that isn't blank. */
  readonly above: string;
};

/** A doc's text, from docs/. */
const doc = (name: string): string => readFileSync(new URL(`../../docs/${name}`, import.meta.url), 'utf8');

/** Every fenced block in a markdown file, at any indent, in order. */
const fences = (text: string): Fence[] => {
  const lines = text.split('\n');
  const found: Fence[] = [];
  for (let at = 0; at < lines.length; at += 1) {
    const open = /^( *)(`{3,}|~{3,})(\w*)/.exec(lines[at] ?? '');
    if (open === null) {
      continue;
    }
    const [, indent = '', marker = '', lang = ''] = open;
    const close = lines.findIndex(
      (line, index) =>
        index > at && line.startsWith(indent) && line.trim().startsWith(marker) && /^[`~]+$/.test(line.trim()),
    );
    const above = lines.slice(0, at).findLast((line) => line.trim() !== '') ?? '';
    const body = lines.slice(at + 1, close).map((line) => line.slice(indent.length));
    found.push({ line: at + 1, lang, body: `${body.join('\n')}\n`, above: above.trim() });
    at = close;
  }
  return found;
};

/** The codes a `<!-- check: … -->` comment names, each as many times as its count says, sorted. */
const expected = (comment: string): string[] => {
  const said = /^<!-- check: (.+) -->$/.exec(comment)?.[1];
  if (said === undefined) {
    throw new Error(`no "<!-- check: … -->" comment above this example, but "${comment}"`);
  }
  if (said === 'clean') {
    return [];
  }
  return said
    .split(', ')
    .flatMap((each) => {
      const [, count = '1', code = ''] = /^(?:(\d+) )?([a-z-]+)$/.exec(each) ?? [];
      return Array.from({ length: Number(count) }, () => code);
    })
    .toSorted();
};

/** The report `check` gives an example plan, against the files the examples point at. */
const checked = (body: string): Report =>
  check({ name: 'keyframes.md', text: body }, memoryRepo({ ...REPO, 'keyframes.md': body }));

/** The example plans in a doc: every markdown block but the snippet. */
const examples = (name: string): Fence[] =>
  fences(doc(name)).filter((fence) => fence.lang === 'markdown' && fence.body !== SNIPPET);

/** A table's rows under `heading` in a markdown file, each split into its trimmed cells, header rows dropped. */
const table = (text: string, heading: string): string[][] => {
  const start = text.indexOf(`\n${heading}\n`);
  const rows = text
    .slice(start)
    .split('\n')
    .slice(1)
    .filter((line) => line.startsWith('|'));
  const end = rows.findIndex((row, index) => index > 1 && !row.startsWith('|'));
  return rows
    .slice(2, end === -1 ? undefined : end)
    .map((row) => row.slice(1, -1).split(' | ').map((cell) => cell.trim()));
};

/** The rows of the first table after `heading`, up to the first line that isn't one. */
const firstTable = (text: string, heading: string): string[][] => {
  const lines = text.slice(text.indexOf(`\n${heading}\n`) + 1).split('\n');
  const start = lines.findIndex((line) => line.startsWith('|'));
  const end = lines.findIndex((line, index) => index > start && !line.startsWith('|'));
  return lines.slice(start + 2, end).map((row) => row.slice(1, -1).split(' | ').map((cell) => cell.trim()));
};

/** The fence that follows `heading` in a markdown file. */
const fenceAfter = (text: string, heading: string): Fence | undefined => {
  const line = text.split('\n').indexOf(heading) + 1;
  return fences(text).find((fence) => fence.line > line);
};

const SPEC = doc('prototype.md');

describe('the example plans in the docs', () => {
  const cases = DOCS.flatMap((name) =>
    examples(name).map((fence) => [`docs/${name}:${String(fence.line)}`, fence] as const),
  );

  test('there are some, and every markdown block in the docs is one of them or the snippet', () => {
    expect(cases.length).toBeGreaterThan(5);
    for (const name of DOCS) {
      const markdown = fences(doc(name)).filter((fence) => fence.lang === 'markdown');
      for (const fence of markdown.filter((each) => each.body !== SNIPPET)) {
        expect(fence.above, `docs/${name}:${String(fence.line)}`).toMatch(/^<!-- check: .+ -->$/);
      }
    }
  });

  test.each(cases)('%s checks the way the comment above it says', (_, fence) => {
    const report = checked(fence.body);
    expect(report.findings.map(({ code }) => code).toSorted()).toEqual(expected(fence.above));
  });

  test.each(DOCS)('every report in docs/%s is what check prints for the example plan above it', (name) => {
    let plan: Fence | undefined;
    let reports = 0;
    for (const fence of fences(doc(name))) {
      if (fence.lang === 'markdown') {
        plan = fence;
      } else if (fence.lang === 'text' && fence.body.startsWith('keyframes.md\n')) {
        expect(plan, `docs/${name}:${String(fence.line)} has no example plan above it`).toBeDefined();
        expect(fence.body).toBe(renderText(checked(plan?.body ?? '')));
        reports += 1;
      }
    }
    expect(reports).toBe(name === 'format.md' ? 3 : 0);
  });
});

describe('the docs and the spec agree with init', () => {
  test('docs/agents.md shows the snippet init prints, word for word', () => {
    expect(fences(doc('agents.md')).filter((fence) => fence.body === SNIPPET)).toHaveLength(1);
  });

  test("this repo's AGENTS.md carries the snippet init prints, word for word, as a block of its own", () => {
    const agents = readFileSync(new URL('../../AGENTS.md', import.meta.url), 'utf8');
    expect(agents).toContain(`\n\n${SNIPPET}\n`);
  });

  test("the spec's Appendix A is the template init writes, and its Appendix B the snippet init prints", () => {
    expect(fenceAfter(SPEC, '## Appendix A: the template')?.body).toBe(template('<directory name>'));
    expect(fenceAfter(SPEC, '## Appendix B: the agent snippet')?.body).toBe(SNIPPET);
  });
});

describe("this repo's CLAUDE.md", () => {
  test('pulls in AGENTS.md with an @AGENTS.md line, since Claude Code follows no markdown link', () => {
    const claude = readFileSync(new URL('../../CLAUDE.md', import.meta.url), 'utf8');
    expect(claude.split('\n')).toContain('@AGENTS.md');
  });
});

describe('docs/format.md and the spec agree', () => {
  test('on the sections, and the variants check reads, row for row', () => {
    const format = doc('format.md');
    expect(firstTable(format, '## Sections')).toEqual(firstTable(SPEC, '### The file'));
    expect(firstTable(format, '## Other ways to write it')).toEqual(firstTable(SPEC, '### Variants'));
    expect(firstTable(SPEC, '### Variants').map(([form]) => form)).toEqual([
      'Plan file',
      'Heading',
      'Item line',
      'ID',
      'Slug',
      'Sub-line',
      'Citation',
      'Reference',
      'Path',
    ]);
  });

  test('on every finding code, in order, with the severity check gives it', () => {
    const codes = (text: string, heading: string): string[][] =>
      table(text, heading).map(([code = '', severity = '']) => [code.replaceAll('`', ''), severity]);
    const format = codes(doc('format.md'), '### Findings');
    expect(format).toHaveLength(26);
    expect(format).toEqual(codes(SPEC, '### Findings'));
    for (const [code = '', severity] of format) {
      expect(finding(code as Code, 1, '').severity).toBe(severity);
    }
  });
});
