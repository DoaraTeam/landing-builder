// Immutable nested-path set that only copies objects along the touched
// path — unlike JSON.parse(JSON.stringify(config)), it doesn't walk/clone
// the entire object (including untouched arrays like testimonials/features
// or embedded base64 images) on every single field edit.
export function setNestedValue(
  obj: Record<string, unknown>,
  keys: string[],
  value: unknown
): Record<string, unknown> {
  const [head, ...rest] = keys;
  if (rest.length === 0) {
    return { ...obj, [head]: value };
  }
  const nested = (obj[head] as Record<string, unknown>) ?? {};
  return { ...obj, [head]: setNestedValue(nested, rest, value) };
}
