import type { Report } from '../check/index.js';

/** The JSON report's version. Within a version, fields are only ever added. */
const SCHEMA_VERSION = 1;

/** An item as the JSON report carries it: keys in a fixed order, sub-line keys with underscores. */
const itemJson = (item: Report['items'][number]): Readonly<Record<string, unknown>> => ({
  id: item.id,
  slug: item.slug,
  section: item.section,
  line: item.line,
  text: item.text,
  because: item.because,
  paths: item.paths,
  held_by: item.heldBy,
  status: item.status,
  superseded_by: item.supersededBy,
  resolved_by: item.resolvedBy,
});

/**
 * Renders a report as one JSON object, the shape `schema/report.schema.json` describes. Keys come
 * in a fixed order, and a field an item doesn't have is left out rather than written as null.
 */
export const renderJson = (report: Report): string => {
  const json = {
    schema_version: SCHEMA_VERSION,
    plan: report.plan,
    intent: report.intent,
    sections: Object.fromEntries(
      report.sections.map(({ name, items, breakdown }) => [name, { items, ...Object.fromEntries(breakdown) }]),
    ),
    words: { count: report.words.count, budget: report.words.budget },
    items: report.items.map(itemJson),
    findings: report.findings.map(({ line, severity, code, message }) => ({ line, severity, code, message })),
    errors: report.errors,
    warnings: report.warnings,
    notes: report.notes,
  };
  return `${JSON.stringify(json, null, 2)}\n`;
};
