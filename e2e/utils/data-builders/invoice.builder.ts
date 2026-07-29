/** Generates unique-per-run invoice form values. Details are filled separately (text-only row, no product data needed). */
export interface InvoiceFormData {
  invoiceDate: string;
  vehiclePlate: string;
  detailText: string;
}

export function buildInvoice(overrides: Partial<InvoiceFormData> = {}): InvoiceFormData {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  const today = new Date().toISOString().slice(0, 10);
  return {
    invoiceDate: today,
    vehiclePlate: `E2E${Math.floor(Math.random() * 1000)}`,
    detailText: `E2E Test Invoice Line ${unique}`,
    ...overrides,
  };
}
