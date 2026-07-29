/** Generates unique-per-run employee form values so parallel/repeated test runs don't collide. */
export interface EmployeeFormData {
  fullName: string;
  personNumber: string;
  hireDate: string;
  email: string;
  telephone: string;
  street: string;
}

export function buildEmployee(overrides: Partial<EmployeeFormData> = {}): EmployeeFormData {
  const unique = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  // personNumber must be exactly 12 digits (see employee-crud.component.ts's onFormSubmit check).
  const personNumber = `19900101${unique}`.slice(0, 12).padEnd(12, '0');
  return {
    fullName: `E2E Test Employee ${unique}`,
    personNumber,
    hireDate: '2024-01-15',
    email: `e2e.employee.${unique}@example.com`,
    telephone: '0701234567',
    street: `${unique} E2E Street`,
    ...overrides,
  };
}
