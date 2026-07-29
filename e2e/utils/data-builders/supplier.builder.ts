/** Generates unique-per-run supplier form values. Only supplierName is required by the form. */
export interface SupplierFormData {
  supplierName: string;
  supplierAddress: string;
  supplierTelephone: string;
}

export function buildSupplier(overrides: Partial<SupplierFormData> = {}): SupplierFormData {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  return {
    supplierName: `E2E Supplier ${unique}`,
    supplierAddress: `${Math.floor(Math.random() * 999)} E2E Street`,
    supplierTelephone: `070${Math.floor(Math.random() * 10_000_000)}`,
    ...overrides,
  };
}
