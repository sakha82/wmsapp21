/** Generates a check-in payload for a given (already-existing) employee. */
export interface TimesheetFormData {
  employeeName: string;
  timeIn: string;
  timeOut: string;
  comments: string;
}

export function buildTimesheet(employeeName: string, overrides: Partial<TimesheetFormData> = {}): TimesheetFormData {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  return {
    employeeName,
    timeIn: '08:00',
    timeOut: '',
    comments: `E2E checkin ${unique}`,
    ...overrides,
  };
}
