/** Generates unique-per-run customer form values so parallel/repeated test runs don't collide. */
export interface CustomerFormData {
  customerName: string;
  email: string;
  telephone: string;
  organizationNo: string;
  customerAddress: string;
}

export function buildCustomer(overrides: Partial<CustomerFormData> = {}): CustomerFormData {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  return {
    customerName: `E2E Test Customer ${unique}`,
    email: `e2e.customer.${unique}@example.com`,
    telephone: '0701234567',
    // organizationNo is capped at 20 chars in the DB (see Validators/CustomerValidator.cs) —
    // "E2E" + unique must fit within that.
    organizationNo: `E2E${unique}`.slice(0, 20),
    customerAddress: `${unique} E2E Street`,
    ...overrides,
  };
}
