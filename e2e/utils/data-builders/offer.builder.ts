/** Generates unique-per-run offer form values. Details are filled separately (text-only row, no product data needed). */
export interface OfferFormData {
  validFrom: string;
  vehiclePlate: string;
  detailText: string;
}

export function buildOffer(overrides: Partial<OfferFormData> = {}): OfferFormData {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  const today = new Date().toISOString().slice(0, 10);
  return {
    validFrom: today,
    vehiclePlate: `E2E${Math.floor(Math.random() * 1000)}`,
    detailText: `E2E Test Offer Line ${unique}`,
    ...overrides,
  };
}
