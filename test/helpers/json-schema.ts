// A small JSON Schema validator for the schemas in schema/, reading only the keywords they use.

/** The JSON Schema keywords the shipped schemas use. */
export type Schema = {
  readonly $schema?: string;
  readonly $defs?: Readonly<Record<string, Schema>>;
  readonly $ref?: string;
  readonly title?: string;
  readonly description?: string;
  readonly type?: string;
  readonly required?: readonly string[];
  readonly properties?: Readonly<Record<string, Schema>>;
  readonly items?: Schema;
  readonly const?: unknown;
  readonly enum?: readonly unknown[];
  readonly minimum?: number;
  readonly pattern?: string;
};

// The keywords the validator below reads. It refuses any other, so the schema can't lean on a
// keyword that would be silently skipped here.
const KEYWORDS = new Set([
  '$schema',
  '$defs',
  '$ref',
  'title',
  'description',
  'type',
  'required',
  'properties',
  'items',
  'const',
  'enum',
  'minimum',
  'pattern',
]);

/** Whether `value` is a JSON object: not null and not an array. */
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Each JSON Schema type the validator reads, and how to tell a value is one.
const TYPES: Readonly<Record<string, (value: unknown) => boolean>> = {
  object: isObject,
  array: Array.isArray,
  string: (value) => typeof value === 'string',
  boolean: (value) => typeof value === 'boolean',
  integer: Number.isInteger,
};

/** The schema a local `$ref` such as `#/$defs/item` points at, in `root`. */
const resolveRef = (ref: string, root: Schema): Schema => {
  const name = /^#\/\$defs\/(\w+)$/.exec(ref)?.[1];
  const target = name === undefined ? undefined : root.$defs?.[name];
  if (target === undefined) {
    throw new Error(`the schema's ${ref} points at nothing`);
  }
  return target;
};

/** Errors from an object's keys: required ones missing, and any its schema doesn't declare. */
const objectErrors = (value: Record<string, unknown>, schema: Schema, at: string, root: Schema): string[] => [
  ...(schema.required ?? []).filter((key) => !Object.hasOwn(value, key)).map((key) => `${at} is missing ${key}`),
  ...Object.entries(value).flatMap(([key, each]) => {
    const property = schema.properties?.[key];
    // Stricter than JSON Schema on purpose: a key the schema doesn't declare fails, so a field the
    // report writes can't go undescribed. The shipped schema stays open for its readers.
    return property === undefined ? [`${at}.${key} isn't in the schema`] : validate(each, property, root, `${at}.${key}`);
  }),
];

/**
 * Every way `value` breaks `schema`, as paths and reasons; empty when it validates. A `$ref` points
 * into `root`'s `$defs`, and `root` is `schema` itself unless a nested call passes it on.
 */
export const validate = (value: unknown, schema: Schema, root: Schema = schema, at = '$'): string[] => {
  const unknown = Object.keys(schema).filter((key) => !KEYWORDS.has(key));
  if (unknown.length > 0) {
    throw new Error(`the schema uses ${unknown.join(', ')} at ${at}, which this validator doesn't read`);
  }
  if (schema.$ref !== undefined) {
    return validate(value, resolveRef(schema.$ref, root), root, at);
  }
  const type = schema.type === undefined ? undefined : TYPES[schema.type];
  if (schema.type !== undefined && type === undefined) {
    throw new Error(`the schema's type ${schema.type} at ${at} isn't one this validator reads`);
  }
  if (type !== undefined && !type(value)) {
    return [`${at} isn't ${String(schema.type)}`];
  }
  const errors: string[] = [];
  if ('const' in schema && value !== schema.const) {
    errors.push(`${at} isn't ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum !== undefined && !schema.enum.includes(value)) {
    errors.push(`${at} is ${JSON.stringify(value)}, which isn't one of ${schema.enum.join(', ')}`);
  }
  if (schema.minimum !== undefined && typeof value === 'number' && value < schema.minimum) {
    errors.push(`${at} is below ${String(schema.minimum)}`);
  }
  if (schema.pattern !== undefined && typeof value === 'string' && !new RegExp(schema.pattern, 'u').test(value)) {
    errors.push(`${at} doesn't match ${schema.pattern}`);
  }
  if (isObject(value)) {
    errors.push(...objectErrors(value, schema, at, root));
  }
  const { items } = schema;
  if (Array.isArray(value) && items !== undefined) {
    errors.push(...value.flatMap((each, index) => validate(each, items, root, `${at}[${String(index)}]`)));
  }
  return errors;
};
