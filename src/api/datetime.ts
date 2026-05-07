/**
 * Otper's DateTime scalar expects `YYYY-MM-DD HH:MM:SS` (24-hour, UTC),
 * not ISO-8601 with milliseconds and trailing `Z`. Sending `toISOString()`
 * output triggers a `Trailing data` validation error from the GraphQL layer.
 */
export function toOtperDateTime(d: Date = new Date()): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}
