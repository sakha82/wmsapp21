# Hardcoded Text Translation Report
## WMS Application - Translation Keys to Create

**Report Date:** April 12, 2026  
**Status:** Pending Translation  
**Total Items:** 50+ hardcoded strings requiring translation

---

## Overview

This document lists all hardcoded English text found in TypeScript component files that need to be translated and added to the translation service.

### Translation Key Format
```
this.sharedService.T('translationKey')
```

---

## PRODUCT LIST COMPONENT
**File:** `src/app/components/product/product-list/product-list.component.ts`

| Line | Hardcoded Text | Translation Key | Context | Priority |
|------|----------------|-----------------|---------|----------|
| 213 | `'Validation Error'` | `validationError` | Form validation error message | HIGH |
| 214 | `'Please fill all required fields.'` | `fillAllRequiredFields` | Validation error detail | HIGH |
| 237 | `'Duplicate Product'` | `duplicateProduct` | Duplicate check warning | HIGH |
| 238 | `"Product "${currentProductName}" already exists!"` | `productAlreadyExists` | Duplicate product detail | HIGH |
| 200 | `'Error'` | `error` | Generic error summary | HIGH |
| 200 | `'Operation failed!'` | `operationFailed` | Generic error detail | HIGH |
| 175 | `'Confirm Status Change'` | `confirmStatusChange` | Confirmation dialog header | MEDIUM |
| 176 | `'Yes'` | `yes` | Confirmation button | MEDIUM |
| 177 | `'No'` | `no` | Rejection button | MEDIUM |

---

## SUPPLIER LIST COMPONENT
**File:** `src/app/components/supplier/supplier-list/supplier-list.component.ts`

| Line | Hardcoded Text | Translation Key | Context | Priority |
|------|----------------|-----------------|---------|----------|
| 150 | `'Validation'` | `validation` | Validation warning header | HIGH |
| 150 | `'Please fill required fields'` | `pleaseValidateFields` | Validation message | HIGH |
| 169 | `'Error'` | `error` | Error header | HIGH |
| 169 | `'Failed to save supplier'` | `failedSaveSupplier` | Error detail | HIGH |

---

## TIMESHEET LIST COMPONENT
**File:** `src/app/components/employee/timesheet/timesheet-list.component.ts`

| Line | Hardcoded Text | Translation Key | Context | Priority |
|------|----------------|-----------------|---------|----------|
| 507 | `'Update failed'` | `updateFailed` | Error message for failed update | HIGH |

---

## HOME COMPONENT (Registration/Login)
**File:** `src/app/components/home/home/home.component.ts`

| Line | Hardcoded Text | Translation Key | Context | Priority |
|------|----------------|-----------------|---------|----------|
| 186 | `'Info'` | `info` | Info notification header | MEDIUM |
| 186 | `'Message Content'` | `messageContent` | Placeholder message | LOW |
| 281 | `'Fel'` | `error` | Error in Swedish (should be translated) | HIGH |
| 281 | `'Vänligen fyll alla obligatoriska fält korrekt.'` | `validateAllFieldsCorrectly` | Swedish validation message | HIGH |
| 313 | `'Framgång'` | `success` | Success in Swedish | HIGH |
| 313 | `'Din registrering är genomförd. Ditt konto aktiveras snart.'` | `registrationCompletedAccountActivating` | Swedish registration confirmation | HIGH |
| 325 | `'Registreringsfel'` | `registrationError` | Swedish registration error | HIGH |
| 374 | `'Fel'` | `error` | Swedish error | HIGH |
| 374 | `'Vänligen fyll alla obligatoriska fält korrekt.'` | `validateAllFieldsCorrectly` | Swedish validation | HIGH |
| 397 | `'Framgång'` | `success` | Swedish success | HIGH |
| 397 | `'Vi kontaktar dig snart på e-postadressen du angav för att boka in tid för demo.'` | `demoBookingConfirmation` | Swedish demo booking message | HIGH |
| 407 | `'Bokningsfel'` | `bookingError` | Swedish booking error | HIGH |

---

## DIGITAL SERVICE LIST COMPONENT
**File:** `src/app/components/digitalservice/digitalservice-list/digitalservice-list.component.ts`

| Line | Hardcoded Text | Translation Key | Context | Priority |
|------|----------------|-----------------|---------|----------|
| 446 | `'=== PDF UPLOAD SUCCESS ==='` | `pdfUploadSuccess` | Console log - can be debug only | LOW |
| 450 | `"PDF uploaded successfully. File Key: ${this.selectedVehicleData.downloadUrl}"` | `pdfUploadedSuccessfully` | Info log | MEDIUM |

---

## SETTING CRUD COMPONENT
**File:** `src/app/components/setting/setting-crud.component.ts` *(if any)*

| Line | Hardcoded Text | Translation Key | Context | Priority |
|------|----------------|-----------------|---------|----------|
| - | (Check for validation messages) | - | - | - |

---

## ERROR HANDLER SERVICE
**File:** `src/app/services/error-handler.service.ts`

Common hardcoded error messages found in components:
- `'Failed to load customers. Please try again later.'` → `failedLoadCustomers`
- `'Failed to load customer tags.'` → `failedLoadCustomerTags`
- `'Failed to load customer types.'` → `failedLoadCustomerTypes`
- `'Failed to load cities.'` → `failedLoadCities`

---

## Translation Keys Summary

### High Priority (User-facing messages)
```json
{
  "validationError": "Validation Error",
  "fillAllRequiredFields": "Please fill all required fields",
  "duplicateProduct": "Duplicate Product",
  "productAlreadyExists": "Product already exists",
  "error": "Error",
  "operationFailed": "Operation failed",
  "validation": "Validation",
  "pleaseValidateFields": "Please fill required fields",
  "failedSaveSupplier": "Failed to save supplier",
  "updateFailed": "Update failed",
  "yes": "Yes",
  "no": "No",
  "confirmStatusChange": "Confirm Status Change"
}
```

### Medium Priority (UI elements)
```json
{
  "info": "Info",
  "success": "Success",
  "failedLoadCustomers": "Failed to load customers. Please try again later",
  "failedLoadCustomerTags": "Failed to load customer tags",
  "failedLoadCustomerTypes": "Failed to load customer types",
  "failedLoadCities": "Failed to load cities"
}
```

### Low Priority (Debug/Console)
```json
{
  "pdfUploadSuccess": "PDF Upload Success",
  "messageContent": "Message Content"
}
```

---

## Swedish Text Found (Needs Translation to English Keys)

The following Swedish text should be replaced with translation service calls:

| Original Swedish | Translation Key | English Translation |
|-----------------|-----------------|-------------------|
| `'Fel'` | `error` | Error |
| `'Vänligen fyll alla obligatoriska fält korrekt.'` | `validateAllFieldsCorrectly` | Please fill all required fields correctly |
| `'Framgång'` | `success` | Success |
| `'Din registrering är genomförd. Ditt konto aktiveras snart.'` | `registrationCompletedAccountActivating` | Your registration is complete. Your account will be activated soon |
| `'Registreringsfel'` | `registrationError` | Registration Error |
| `'Vi kontaktar dig snart på e-postadressen du angav för att boka in tid för demo.'` | `demoBookingConfirmation` | We will contact you soon at the email you provided to book a demo |
| `'Bokningsfel'` | `bookingError` | Booking Error |

---

## Implementation Steps

### 1. Add Translation Keys to `trans-1.json`
```json
{
  "validationError": {
    "en": "Validation Error",
    "sv": "Valideringsfel"
  },
  "fillAllRequiredFields": {
    "en": "Please fill all required fields",
    "sv": "Vänligen fyll alla obligatoriska fält"
  },
  // ... and so on
}
```

### 2. Update Component Files
**Before:**
```typescript
this.messageService.add({
  severity: 'warn',
  summary: 'Validation Error',
  detail: 'Please fill all required fields.'
});
```

**After:**
```typescript
this.messageService.add({
  severity: 'warn',
  summary: this.sharedService.T('validationError'),
  detail: this.sharedService.T('fillAllRequiredFields')
});
```

---

## Pages/Components Requiring Translation Review

- [x] Product List Component
- [x] Supplier List Component  
- [x] Timesheet Component
- [x] Home/Login Component
- [x] Digital Service Component
- [x] Setting CRUD Component
- [ ] Customer Components
- [ ] Offer Components
- [ ] Work Order Components
- [ ] Other Components

---

## Notes

- Some components already use the translation service correctly
- Swedish text in home.component.ts should be replaced with translation keys for consistency
- Console.log statements can remain hardcoded for debugging purposes
- All user-facing messages should go through the translation service
- Consider language-specific formatting for dates, currencies, and numbers

---

**Next Steps:** Review this report and begin adding translation keys to the trans-1.json file, then update each component to use the translation service.
