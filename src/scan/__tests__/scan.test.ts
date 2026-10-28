import { describe, expect, test } from 'vitest';

import { finding, scan, type Code, type LineKind, type Severity } from '../index.js';

/** A plan from its lines, each ending in a newline. */
const md = (...lines: string[]): string => lines.map((line) => `${line}\n`).join('');

/** Each line's number and kind: how the scanner read the plan, at a glance. */
const kinds = (source: string): [number, LineKind][] =>
  scan(source).lines.map((line) => [line.number, line.kind]);

/** Each `##` section's title and name, with the first and last line in it. */
const outline = (source: string) => {
  const { lines, sections } = scan(source);
  return sections.map((section) => {
    const numbers = lines.filter((line) => line.section === section).map((line) => line.number);
    return { title: section.title, name: section.name, from: numbers[0], to: numbers.at(-1) };
  });
};

describe('fences', () => {
  test('a backtick fence hides the headings and items in it', () => {
    const source = md(
      '## Intent',
      'Why it exists.',
      '```markdown',
      '## Constraints',
      '- **C1 (hidden)**: inside the fence',
      '```',
      'After the fence.',
    );
    expect(kinds(source)).toEqual([
      [1, 'heading'],
      [2, 'text'],
      [3, 'fence'],
      [4, 'code'],
      [5, 'code'],
      [6, 'fence'],
      [7, 'text'],
    ]);
    expect(outline(source)).toEqual([{ title: 'Intent', name: 'intent', from: 1, to: 7 }]);
    expect(scan(source).findings).toEqual([]);
  });

  test('a tilde fence hides its lines the same way, backtick fences in it included', () => {
    const source = md('## Intent', 'Why.', '~~~', '```', '## Constraints', '```', '~~~', 'After.');
    expect(kinds(source)).toEqual([
      [1, 'heading'],
      [2, 'text'],
      [3, 'fence'],
      [4, 'code'],
      [5, 'code'],
      [6, 'code'],
      [7, 'fence'],
      [8, 'text'],
    ]);
  });

  test('a long fence holds a shorter one, which neither opens nor closes anything', () => {
    const source = md(
      '## Intent',
      'Why.',
      '````markdown',
      '```ts',
      'const x = 1;',
      '```',
      '## Constraints',
      '````',
      'After.',
    );
    expect(kinds(source)).toEqual([
      [1, 'heading'],
      [2, 'text'],
      [3, 'fence'],
      [4, 'code'],
      [5, 'code'],
      [6, 'code'],
      [7, 'code'],
      [8, 'fence'],
      [9, 'text'],
    ]);
    expect(scan(source).findings).toEqual([]);
  });

  test('only a run of the same character, at least as long, with nothing after it, closes a fence', () => {
    expect(kinds(md('```', '```ts', '``', '~~~', '````', 'After.'))).toEqual([
      [1, 'fence'],
      [2, 'code'],
      [3, 'code'],
      [4, 'code'],
      [5, 'fence'],
      [6, 'text'],
    ]);
  });

  test('a fence indented under an item hides its lines too', () => {
    const source = md(
      '## Constraints',
      '- **C1 (one-writer)**: Only the sync worker writes.',
      '  ```yaml',
      '  - because: an example, not a sub-line',
      '  ```',
      '  - because: two writers disagreed.',
    );
    expect(kinds(source)).toEqual([
      [1, 'heading'],
      [2, 'text'],
      [3, 'fence'],
      [4, 'code'],
      [5, 'fence'],
      [6, 'text'],
    ]);
  });

  test('a closing fence indented four spaces past its opener is code', () => {
    expect(kinds(md('```', '    ```', '```'))).toEqual([
      [1, 'fence'],
      [2, 'code'],
      [3, 'fence'],
    ]);
  });

  test('backticks with more backticks after them on the line are inline code, not a fence', () => {
    const { lines } = scan(md('```js``` is inline code'));
    expect(lines.map((line) => [line.kind, line.prose])).toEqual([
      ['text', `${' '.repeat(8)} is inline code`],
    ]);
  });

  test('an unclosed fence runs to the end of the file, with unclosed-fence on its line', () => {
    const source = md('## Intent', 'Why.', '```ts', '## Constraints', '- **C1 (lost)**: reads as code');
    expect(kinds(source)).toEqual([
      [1, 'heading'],
      [2, 'text'],
      [3, 'fence'],
      [4, 'code'],
      [5, 'code'],
    ]);
    expect(outline(source)).toEqual([{ title: 'Intent', name: 'intent', from: 1, to: 5 }]);
    expect(scan(source).findings).toEqual([
      {
        line: 3,
        severity: 'warning',
        code: 'unclosed-fence',
        message:
          '"```ts" opens a fence that never closes, so the rest of the file reads as code; end it with a line of ```',
      },
    ]);
  });
});

describe('comments', () => {
  test('a multi-line comment hides the headings, items and fences in it, blank lines and all', () => {
    const source = md(
      '## Intent',
      'Why it exists.',
      '<!--',
      '## Constraints',
      '',
      '- **C1 (hidden)**: commented out',
      '```ts',
      '-->',
      'Still the Intent.',
    );
    expect(kinds(source)).toEqual([
      [1, 'heading'],
      [2, 'text'],
      [3, 'blank'],
      [4, 'blank'],
      [5, 'blank'],
      [6, 'blank'],
      [7, 'blank'],
      [8, 'blank'],
      [9, 'text'],
    ]);
    expect(outline(source)).toEqual([{ title: 'Intent', name: 'intent', from: 1, to: 9 }]);
    expect(scan(source).findings).toEqual([]);
  });

  test('a comment within a line is blanked to spaces, and the text around it stays', () => {
    const [line] = scan(md('Before <!-- a note --> after.')).lines;
    expect(line?.text).toBe(`Before ${' '.repeat(15)} after.`);
  });

  test('a comment that starts mid-line runs onto the next lines, up to its -->', () => {
    const { lines, sections } = scan(md('Before <!-- runs', '## Constraints', 'on --> after.'));
    expect(lines.map((line) => [line.kind, line.text])).toEqual([
      ['text', `Before ${' '.repeat(9)}`],
      ['blank', ' '.repeat(14)],
      ['text', `${' '.repeat(6)} after.`],
    ]);
    expect(sections).toEqual([]);
  });

  test('a <!-- mid-line that meets a blank line before any --> is plain text', () => {
    const source = md(
      'Write <!-- to start a comment.',
      '',
      '## Constraints',
      '- **C1 (seen)**: still read',
      'and -->',
    );
    expect(kinds(source)).toEqual([
      [1, 'text'],
      [2, 'blank'],
      [3, 'heading'],
      [4, 'text'],
      [5, 'text'],
    ]);
    expect(scan(source).lines[0]?.text).toBe('Write <!-- to start a comment.');
    expect(scan(md('The plan ends <!-- mid-thought')).lines[0]?.text).toBe(
      'The plan ends <!-- mid-thought',
    );
  });

  test('a comment that starts a line and never closes hides the rest of the file, with unclosed-comment', () => {
    const source = md('## Intent', 'Why.', '<!-- left open', '', '## Constraints');
    expect(kinds(source)).toEqual([
      [1, 'heading'],
      [2, 'text'],
      [3, 'blank'],
      [4, 'blank'],
      [5, 'blank'],
    ]);
    expect(scan(source).findings).toEqual([
      {
        line: 3,
        severity: 'warning',
        code: 'unclosed-comment',
        message: '"<!--" opens a comment that never closes, so the rest of the file is hidden; end it with "-->"',
      },
    ]);
  });

  test('unclosed-comment falls on the line of the comment left open, not on one that closed', () => {
    const source = md('## Intent', '<!-- a note', 'that closes -->', 'Why.', '', '<!-- one left open');
    expect(scan(source).findings.map(({ line, code }) => [line, code])).toEqual([[6, 'unclosed-comment']]);
    expect(scan(md('## Intent', 'Why.', '<!-- one --> <!-- left open')).findings).toEqual([]);
  });

  test('a <!-- inside inline code is code, not a comment', () => {
    const source = md('Use `<!--` to hide a note.', '## Constraints');
    expect(kinds(source)).toEqual([
      [1, 'text'],
      [2, 'heading'],
    ]);
    const [line] = scan(source).lines;
    expect(line?.text).toBe('Use `<!--` to hide a note.');
    expect(line?.prose).toBe(`Use ${' '.repeat(6)} to hide a note.`);
  });

  test('a backtick inside a comment is comment, not the start of code', () => {
    const [line] = scan(md('<!-- a ` --> b `c`')).lines;
    expect(line?.text).toBe(`${' '.repeat(12)} b \`c\``);
    expect(line?.prose).toBe(`${' '.repeat(13)}b${' '.repeat(4)}`);
  });

  test('a template of headings and comments reads as empty sections, with only no-intent', () => {
    const source = md(
      '# my-project',
      '',
      '<!--',
      'keyframes.md holds the intent behind this project.',
      '-->',
      '',
      '## Intent',
      '',
      '<!--',
      'Why does this exist, and who is it for?',
      '-->',
      '',
      '## Principles',
      '',
      '<!--',
      'For example:',
      '',
      '- **P1 (no-lost-work)**: Losing work is worse than being slow.',
      '  - because: people forgive a spinner.',
      '-->',
    );
    expect(outline(source)).toEqual([
      { title: 'Intent', name: 'intent', from: 7, to: 12 },
      { title: 'Principles', name: 'principles', from: 13, to: 20 },
    ]);
    const { lines, findings } = scan(source);
    expect(lines.filter((line) => line.kind === 'text')).toEqual([]);
    expect(findings.map(({ line, code }) => [line, code])).toEqual([[7, 'no-intent']]);
  });
});

describe('inline code', () => {
  test('prose blanks code spans, while text keeps them', () => {
    const [line] = scan(md('See `[C1 (x)]` and ``a ` b``.')).lines;
    expect(line?.text).toBe('See `[C1 (x)]` and ``a ` b``.');
    expect(line?.prose).toBe(`See ${' '.repeat(10)} and ${' '.repeat(9)}.`);
  });

  test('a backtick run with no run of the same length on its line is plain text', () => {
    const [line] = scan(md('Two `` then one ` here.')).lines;
    expect(line?.prose).toBe('Two `` then one ` here.');
  });
});

describe('line endings, BOM and tabs', () => {
  test('CRLF reads as LF, with the same line numbers', () => {
    const lf = md('## Intent', 'Why.', '```', '## Constraint', '```', '## Constraint');
    const crlf = lf.replaceAll('\n', '\r\n');
    expect(scan(crlf)).toEqual(scan(lf));
    expect(kinds(crlf)).toEqual([
      [1, 'heading'],
      [2, 'text'],
      [3, 'fence'],
      [4, 'code'],
      [5, 'fence'],
      [6, 'heading'],
    ]);
    expect(scan(crlf).lines.some((line) => line.text.includes('\r'))).toBe(false);
  });

  test('a BOM is stripped, so the first line can still be a heading', () => {
    const plain = md('## Intent', 'Why.');
    expect(scan(`\uFEFF${plain}`)).toEqual(scan(plain));
    expect(outline(`\uFEFF${plain}`)).toEqual([{ title: 'Intent', name: 'intent', from: 1, to: 2 }]);
  });

  test('each leading tab expands to four spaces, and tabs later in a line stay', () => {
    const { lines } = scan(
      md(
        '## Constraints',
        '- **C1 (one-writer)**: Only one writer.',
        '\t- because:\ttwo writers disagreed.',
        ' \t\tdeeper',
      ),
    );
    expect(lines.map((line) => line.text)).toEqual([
      '## Constraints',
      '- **C1 (one-writer)**: Only one writer.',
      '    - because:\ttwo writers disagreed.',
      `${' '.repeat(9)}deeper`,
    ]);
  });

  test('the last line needs no newline, and an empty plan has no lines', () => {
    expect(kinds('## Intent\nWhy.')).toEqual([
      [1, 'heading'],
      [2, 'text'],
    ]);
    expect(scan('').lines).toEqual([]);
  });
});

describe('thematic breaks', () => {
  test.each(['* * *', '***', '---', '- - -', '___', '   * * *', '* * * * *'])(
    '%j is a thematic break, not a bullet',
    (line) => {
      expect(kinds(md(line))).toEqual([[1, 'break']]);
    },
  );

  test.each(['* item', '--', '    * * *', '* * x', '-*-'])('%j is text', (line) => {
    expect(kinds(md(line))).toEqual([[1, 'text']]);
  });
});

describe('sections', () => {
  test('### headings group lines inside their section', () => {
    const source = md(
      '## Constraints',
      '### Storage',
      '- **C1 (one-writer)**: Only the sync worker writes.',
      '### Network',
      '- **C2 (no-egress)**: Nothing calls out.',
      '## Taste',
      '- **T1 (calm-errors)**: Errors are calm.',
    );
    expect(outline(source)).toEqual([
      { title: 'Constraints', name: 'constraints', from: 1, to: 5 },
      { title: 'Taste', name: 'taste', from: 6, to: 7 },
    ]);
  });

  test('a # heading closes the section, and the lines after it are in none', () => {
    const { lines } = scan(
      md('# keyframes', 'Intro.', '## Intent', 'Why.', '# Appendix', 'Notes.', '## Taste', 'Calm.'),
    );
    expect(lines.map((line) => [line.number, line.section?.title])).toEqual([
      [1, undefined],
      [2, undefined],
      [3, 'Intent'],
      [4, 'Intent'],
      [5, undefined],
      [6, undefined],
      [7, 'Taste'],
      [8, 'Taste'],
    ]);
  });

  test('heading text matches in any case, trimmed and without closing hashes, with no note', () => {
    const { sections, findings } = scan(
      md('##   CONSTRAINTS  ', '## decisions ##', '## Intent <!-- why it exists -->', 'Why.'),
    );
    expect(sections.map(({ name, title }) => [name, title])).toEqual([
      ['constraints', 'CONSTRAINTS'],
      ['decisions', 'decisions'],
      ['intent', 'Intent'],
    ]);
    expect(findings).toEqual([]);
  });

  test('a singular heading is its section, with an alternate-form note on its line', () => {
    const source = md('## Intent', 'Why.', '## Constraint', '- **C1 (one-writer)**: Only one writer.');
    expect(outline(source)).toEqual([
      { title: 'Intent', name: 'intent', from: 1, to: 2 },
      { title: 'Constraint', name: 'constraints', from: 3, to: 4 },
    ]);
    expect(scan(source).findings).toEqual([
      {
        line: 3,
        severity: 'note',
        code: 'alternate-form',
        message: '"## Constraint" reads fine; the usual form is "## Constraints"',
      },
    ]);
  });

  test('any other ## heading is free prose, with no name', () => {
    const { sections, findings } = scan(
      md('## Intent', 'Why.', '## Notes', 'Anything.', '## Intents', '## ##'),
    );
    expect(sections.map(({ name, title }) => [name, title])).toEqual([
      ['intent', 'Intent'],
      [undefined, 'Notes'],
      [undefined, 'Intents'],
      [undefined, ''],
    ]);
    expect(findings).toEqual([]);
  });

  test('a heading starts at column 0, with one to six hashes and then a space', () => {
    expect(kinds(md('## Intent', ' ## Constraints', '##Constraints', '####### Seven', '###### Six'))).toEqual([
      [1, 'heading'],
      [2, 'text'],
      [3, 'text'],
      [4, 'text'],
      [5, 'heading'],
    ]);
  });
});

describe('setext headings', () => {
  test('a line of text with a line of - under it is a ## heading, and with = under it a # heading', () => {
    const source = md(
      '## Intent',
      'Why.',
      '',
      'Constraints',
      '---',
      '- **C1 (one-writer)**: Only one writer.',
      '',
      'Appendix',
      '===',
      'After.',
    );
    expect(kinds(source)).toEqual([
      [1, 'heading'],
      [2, 'text'],
      [3, 'blank'],
      [4, 'heading'],
      [5, 'underline'],
      [6, 'text'],
      [7, 'blank'],
      [8, 'heading'],
      [9, 'underline'],
      [10, 'text'],
    ]);
    expect(outline(source)).toEqual([
      { title: 'Intent', name: 'intent', from: 1, to: 3 },
      { title: 'Constraints', name: 'constraints', from: 4, to: 7 },
    ]);
  });

  test('an underline can be one character long, up to three spaces in, with spaces after it', () => {
    expect(kinds(md('Notes', '-', '', 'Glossary', '   ===  '))).toEqual([
      [1, 'heading'],
      [2, 'underline'],
      [3, 'blank'],
      [4, 'heading'],
      [5, 'underline'],
    ]);
  });

  test('an underlined section heading is a variant with a note, and an underlined free-prose one has none', () => {
    const source = md('## Intent', 'Why.', '', 'Constraint', '----------', '', 'Notes', '---');
    expect(scan(source).findings).toEqual([
      {
        line: 4,
        severity: 'note',
        code: 'alternate-form',
        message: '"Constraint" reads fine; the usual form is "## Constraints"',
      },
      {
        line: 4,
        severity: 'note',
        code: 'alternate-form',
        message: '"Constraint" with a line of "-" under it reads fine; the usual form is "## Constraints"',
      },
    ]);
  });

  test('duplicate-section quotes an underlined heading as it is written', () => {
    const { findings } = scan(md('## Intent', 'Why.', '## Constraints', '', 'Constraints', '---'));
    expect(findings.map(({ code, message }) => [code, message])).toEqual([
      [
        'duplicate-section',
        '"Constraints" repeats the section from line 3; merge them under one "## Constraints"',
      ],
      [
        'alternate-form',
        '"Constraints" with a line of "-" under it reads fine; the usual form is "## Constraints"',
      ],
    ]);
  });

  test.each([
    ['a list item', ['- item', '---'], [[1, 'text'], [2, 'break']]],
    ['the second line of a paragraph', ['First line', 'second line', '---'], [[1, 'text'], [2, 'text'], [3, 'break']]],
    ['indented text', ['  Indented', '---'], [[1, 'text'], [2, 'break']]],
    ['a blank line', ['', '---'], [[1, 'blank'], [2, 'break']]],
    ['a heading', ['## Notes', '---'], [[1, 'heading'], [2, 'break']]],
    ['a comment', ['<!--', 'Constraints', '---', '-->'], [[1, 'blank'], [2, 'blank'], [3, 'blank'], [4, 'blank']]],
  ])('a line of - under %s underlines nothing', (_, lines, expected) => {
    expect(kinds(md(...lines))).toEqual(expected);
  });
});

describe('section findings', () => {
  test('duplicate-section names the line where the section first appeared', () => {
    const source = md(
      '## Intent',
      'Why.',
      '## Decisions',
      '- **D1 (sqlite)**: One SQLite file.',
      '## Taste',
      '## DECISIONS',
      '- **D2 (wal)**: Write-ahead logging.',
    );
    expect(scan(source).findings).toEqual([
      {
        line: 6,
        severity: 'error',
        code: 'duplicate-section',
        message: '"## DECISIONS" repeats the section from line 3; merge them under one "## Decisions"',
      },
    ]);
    expect(outline(source).map(({ name, from }) => [name, from])).toEqual([
      ['intent', 1],
      ['decisions', 3],
      ['taste', 5],
      ['decisions', 6],
    ]);
  });

  test('a singular repeat is both duplicate-section and an alternate-form note', () => {
    const { findings } = scan(md('## Intent', 'Why.', '## Decisions', '## Decision'));
    expect(findings.map(({ line, code }) => [line, code])).toEqual([
      [4, 'duplicate-section'],
      [4, 'alternate-form'],
    ]);
  });

  test('no-intent falls on line 1 when there is no Intent section', () => {
    expect(scan(md('# keyframes', '## Constraints')).findings).toEqual([
      {
        line: 1,
        severity: 'warning',
        code: 'no-intent',
        message: `there's no "## Intent"; add one that says why this project exists and who it's for`,
      },
    ]);
  });

  test('no-intent falls on the heading when Intent has no text outside code and comments', () => {
    const source = md(
      '## Intent',
      '<!-- Why does this exist? -->',
      '### Why',
      '```',
      'code',
      '```',
      '---',
      '## Taste',
    );
    expect(scan(source).findings).toEqual([
      {
        line: 1,
        severity: 'warning',
        code: 'no-intent',
        message: `"## Intent" is empty; say why this project exists and who it's for`,
      },
    ]);
  });

  test('a line of text in any Intent section is enough', () => {
    const { findings } = scan(md('## Intent', '## Intent', 'Why.'));
    expect(findings.map(({ code }) => code)).toEqual(['duplicate-section']);
  });

  test('an empty plan is no-intent, on line 1', () => {
    expect(scan('').findings.map(({ line, code }) => [line, code])).toEqual([[1, 'no-intent']]);
  });
});

describe('finding', () => {
  // The spec's Findings table, by severity.
  const TABLE: readonly (readonly [Severity, readonly Code[]])[] = [
    [
      'error',
      [
        'duplicate-section',
        'malformed-item',
        'wrong-letter',
        'duplicate-id',
        'duplicate-key',
        'broken-citation',
        'slug-mismatch',
        'bad-pointer',
        'broken-pointer',
        'broken-path',
        'bad-reference',
        'file-too-large',
      ],
    ],
    [
      'warning',
      [
        'no-intent',
        'not-an-item',
        'item-outside-section',
        'missing-slug',
        'unknown-key',
        'key-not-allowed',
        'missing-because',
        'built-not-new',
        'planned-text-missing',
        'path-overlap',
        'over-budget',
        'unclosed-fence',
        'unclosed-comment',
      ],
    ],
    ['note', ['alternate-form']],
  ];

  test.each(TABLE)('every %s code carries that severity', (severity, codes) => {
    expect(codes.map((code) => finding(code, 1, '').severity)).toEqual(codes.map(() => severity));
  });
});
