/**
 * Generates unique-per-run digital-service form values. `userId` deliberately isn't randomized -
 * validateDigitalService() checks it against a real ASP.NET Identity user in the 'appuser' role
 * via UserService.isValidAppUser(), so it must be a real seeded appuser account
 * ("test@gmail.com", confirmed present in this dev DB) rather than a random string.
 * nextServiceDate/nextServiceVehicleMileage are deliberately omitted - the component's own
 * valueChanges subscriptions derive them from serviceDate (+1 year) and vehicleMileage
 * (+10,000 km) automatically.
 */
export interface DigitalServiceFormData {
  userId: string;
  vehiclePlate: string;
  vehicleManufacturer: string;
  vehicleModel: string;
  vehicleYear: string;
  serviceDate: string;
  vehicleMileage: string;
}

export function buildDigitalService(overrides: Partial<DigitalServiceFormData> = {}): DigitalServiceFormData {
  const unique = Math.floor(Math.random() * 10_000);
  const today = new Date().toISOString().slice(0, 10);
  return {
    userId: 'test@gmail.com',
    // Higher entropy than a 3-digit suffix: this dev DB accumulates E2E-created vehicles across
    // every run (see DECISIONS.md's "accept accumulation" policy), and vehiclePlate has a 10-char
    // maxlength in the form (and a real varchar(10) DB column) - a 6-digit suffix keeps the total
    // under that limit while making a collision with an existing plate practically impossible.
    vehiclePlate: `E2E${Math.floor(100_000 + Math.random() * 900_000)}`,
    vehicleManufacturer: `E2E Make ${unique}`,
    vehicleModel: `E2E Model ${unique}`,
    vehicleYear: '2020',
    serviceDate: today,
    vehicleMileage: '10000',
    ...overrides,
  };
}
