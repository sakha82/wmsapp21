/** Generates unique-per-run product form values. Category/unit/vat/quantity/price all keep their form defaults - only productName is required. */
export interface ProductFormData {
  productName: string;
  productDescription: string;
}

export function buildProduct(overrides: Partial<ProductFormData> = {}): ProductFormData {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  return {
    productName: `E2E Product ${unique}`,
    productDescription: `E2E test product ${unique}`,
    ...overrides,
  };
}
