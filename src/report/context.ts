import type { Context } from '../context/index.js';
import { itemJson } from './json.js';

/** An item as the context carries it. */
type Item = Context['items'][number];

/** The context JSON's version, apart from the report's. Within a version, fields are only ever added. */
const SCHEMA_VERSION = 1;

/** The headings the text prints, by section, in the order the items come. */
const HEADINGS: Readonly<Record<string, string>> = {
  principles: 'Principles',
  constraints: 'Constraints',
  scenarios: 'Scenarios',
  taste: 'Taste',
};

/** `text`'s lines after the first, each indented by `indent`. */
const indented = (text: string, indent: string): string => text.split('\n').join(`\n${indent}`);

/** An item's ID and slug in their usual form, as in `C1 (one-writer)`. */
const named = (item: Item): string => (item.slug === undefined ? item.id : `${item.id} (${item.slug})`);

/** An item and the sub-lines it has, in their usual form; a planned pointer keeps its `(new)`. */
const itemLines = (item: Item): string[] => {
  const pointers = item.heldBy?.map(({ pointer, result }) => (result === 'planned' ? `${pointer} (new)` : pointer));
  return [
    `- **${named(item)}**: ${indented(item.text, '  ')}`,
    ...(item.because === undefined ? [] : [`  - because: ${indented(item.because, '    ')}`]),
    ...(pointers === undefined ? [] : [`  - held-by: ${pointers.join(', ')}`]),
  ];
};

/**
 * Renders a context as markdown, ready to paste into a prompt: a `##` heading for each section
 * that has items, with its items beneath it, then a `## Paths` section when paths were given, one
 * line for each naming the parts it meets, or `none`. A plan with no such items and no paths
 * prints nothing at all.
 */
export const renderContextText = (context: Context): string => {
  const sections = Object.entries(HEADINGS).flatMap(([section, heading]) => {
    const items = context.items.filter((item) => item.section === section);
    return items.length === 0 ? [] : [[`## ${heading}`, '', ...items.flatMap(itemLines)].join('\n')];
  });
  const parts = new Map(context.parts.map((part) => [part.id, named(part)]));
  const paths = context.paths.map(
    ({ path, parts: met }) => `- ${path}: ${met.length === 0 ? 'none' : met.map((id) => parts.get(id) ?? id).join(', ')}`,
  );
  const all = [...sections, ...(paths.length === 0 ? [] : [['## Paths', '', ...paths].join('\n')])];
  return all.length === 0 ? '' : `${all.join('\n\n')}\n`;
};

/**
 * Renders a context as one JSON object, the shape `schema/context.schema.json` describes. Items and
 * parts are the report's items, under the same names in the same order, and a field an item
 * doesn't have is left out rather than written as null.
 */
export const renderContextJson = (context: Context): string => {
  const json = {
    schema_version: SCHEMA_VERSION,
    plan: context.plan,
    items: context.items.map(itemJson),
    paths: context.paths.map(({ path, parts }) => ({ path, parts })),
    parts: context.parts.map(itemJson),
    errors: context.errors,
    warnings: context.warnings,
  };
  return `${JSON.stringify(json, null, 2)}\n`;
};
