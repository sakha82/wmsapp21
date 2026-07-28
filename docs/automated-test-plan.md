Your role is to act as a Senior QA Automation Engineer and Software Architect.

The application is already stable and working correctly. We are now introducing an automated End-to-End (E2E) testing framework using Playwright.

## Goal

Design and implement a maintainable Playwright test framework that can grow with the application over time.

## Technology

- Playwright
- TypeScript
- Page Object Model (POM)
- Easy to extend
- Easy to maintain
- Suitable for a solo developer

## Project Requirements

Create a dedicated Test module inside the project.

The framework must allow:

- Running all tests.
- Running a single module independently.
- Running a single test file independently.
- Easy addition of future modules.

Use a clean folder structure following Playwright best practices.

## Module 1 – Customer

The first module to automate is the Customer module.

The test suite should cover the complete customer lifecycle.

### Customer List

Test:

- Page loads successfully.
- Grid loads data correctly.
- No JavaScript errors.
- Pagination works.
- Sorting works.
- Every filter works individually.
- Multiple filters work together.
- Clear Filter works.
- Search returns expected results.
- Empty search behaves correctly.
- Loading indicators disappear correctly.
- No duplicate records appear.

### Customer Details

Open a customer and verify:

- Customer information is displayed correctly.
- Address information.
- Contact information.
- Vehicle information (if applicable).
- Work Orders tab.
- Invoices tab.
- Offers tab.
- Related data loads correctly.
- Navigation between tabs works.
- No console errors.

### Create Customer

Test:

- Open Create screen.
- Verify every field.
- Required field validation.
- Max length validation.
- Invalid input validation.
- Email validation.
- Phone validation.
- Save button.
- Cancel button.
- Successful creation.
- Duplicate customer handling.
- Error handling.

### Edit Customer

Test:

- Update customer.
- Verify saved values.
- Cancel edit.
- Validation.
- Refresh after save.

### Delete Customer

If supported:

- Delete.
- Confirmation dialog.
- Cancel delete.
- Verify customer removed.

## UI Quality Tests

The framework should also detect UI quality issues.

Capture and report:

- Missing translations.
- Missing localisation keys.
- Empty labels.
- Empty buttons.
- Missing button text.
- Broken icons.
- Broken images.
- Missing tooltips.
- Console errors.
- Network request failures.
- 404 resources.
- Accessibility issues where practical.

## Assertions

Every test should contain meaningful assertions.

Never click through the application without verifying the expected behaviour.

## Reporting

Generate:

- HTML report
- Screenshots on failure
- Video on failure
- Trace on failure

## Framework Requirements

Use:

- Page Object Model
- Reusable helper methods
- Test utilities
- Fixtures
- Shared login
- Test data builders where appropriate

Avoid duplicated code.

## Future Modules

The framework must be designed so additional modules can easily be added, for example:

- Dashboard
- Vehicles
- Work Orders
- Offers
- Invoices
- Products
- Employees
- Timesheets
- Workshop Settings
- Authentication

## Deliverables

Before writing code:

1. Analyse the existing project structure.
2. Recommend the best Playwright folder structure.
3. Explain the proposed architecture.
4. Create an implementation plan.
5. Identify any prerequisites or improvements needed.

Only after the architecture is approved should implementation begin.

Think critically and suggest improvements wherever you believe the framework can be made more maintainable, reliable or scalable while keeping it simple for a solo developer.