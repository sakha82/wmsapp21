/**
 * Best-effort parsing of scraped Vehicle.cs oil fields (free text, e.g. "4.5-5.0 l", "5W-30") onto WorkOrder's
 * own oil fields (a decimal OilCapacity, and OilType from a fixed dropdown) - never a clean 1:1 match, so this
 * stays a guess the receptionist can correct, not a guarantee. See DashboardPage_Redesign.md's "Oil field
 * auto-fill" decision.
 */

/** Extracts the first number found in a scraped capacity string (e.g. "4.5-5.0 l" -> 4.5). Returns null if nothing parses. */
export function parseOilCapacity(raw?: string | null): number | null {
  if (!raw) return null;
  const match = raw.replace(',', '.').match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

/** Matches a scraped oil classification (e.g. "5W-30") against the fixed WorkOrder oilType dropdown (e.g. "5W30") by stripping non-alphanumeric characters. Returns null if nothing matches. */
export function parseOilType(raw: string | null | undefined, options: readonly string[]): string | null {
  if (!raw) return null;
  const normalized = raw.toUpperCase().replace(/[^0-9A-Z]/g, '');
  return options.find((option) => option.toUpperCase().replace(/[^0-9A-Z]/g, '') === normalized) || null;
}
