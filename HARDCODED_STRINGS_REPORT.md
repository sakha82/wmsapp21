# Hardcoded English Text Strings - Translation Audit Report

## Summary
This report identifies hardcoded English text strings across TypeScript component files that are not wrapped in translation service calls (`this.sharedService.T()`). These strings need to be extracted and added to the translation system for multilingual support.

---

## Findings by Component

### 1. **offer-crud.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 541 | `'Error'` | summary property in messageService.add() | Offer Create/Edit Dialog | Error message header |
| 541 | `'Please fill required fields'` | detail property in messageService.add() | Offer Create/Edit Dialog | Validation error message |
| 563 | `'Error'` | summary property in messageService.add() | Offer Create/Edit Dialog | Error message header |
| 563 | `'Please check product rows — missing product or unit price'` | detail property in messageService.add() | Offer Create/Edit Dialog | Validation error for product details |

---

### 2. **workorder-crud.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 304 | `'Error'` | summary property in messageService.add() | Failed Service Hours Load | Error message header |
| 304 | `'Failed to retrieve service hours'` | detail property in messageService.add() | Service Hours Load Error | Technical error message |
| 653 | `'Validation Error'` | summary property in messageService.add() | Customer Contact Validation | Validation error header |
| 657 | `'Please provide either Telephone or Email.'` | detail property in messageService.add() | Customer Contact Validation | Form validation message |
| 668 | `'Email Validation Error'` (implied) | Email validation error context | Customer Validation | Email format validation |
| 671 | `'Please enter a valid email address (e.g. user@example.com).'` | detail property in messageService.add() | Customer Email Validation | Email format validation message |
| 703 | `'Duplicate Customer'` | summary property in messageService.add() | Duplicate Check | Duplicate error header |
| 703 | `'This customer name already exists.'` | detail property in messageService.add() | Duplicate Check | Duplicate customer error message |
| 724 | `'Invalid DigitalWorkshop Id'` | summary property in messageService.add() | Digital Service Validation | Invalid ID header |
| 724 | `'Please provide a valid DigitalWorkshop Id.'` | detail property in messageService.add() | Digital Service Validation | Invalid ID message |
| 758 | `'Error'` | summary property in messageService.add() | Customer Save Error | Error message header |
| 758 | `'Something went wrong while saving the customer!'` | detail property in messageService.add() | Customer Save Error | Generic error message |

---

### 3. **workorder-list.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 187 | `'Error'` | summary property in messageService.add() | Work Order Status Update Error | Error message header |
| 187 | `'Failed to retrieve service hours'` | detail property in messageService.add() | Service Hours Retrieval Failure | Technical error message |

---

### 4. **workorder-detail.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 152 | `'Error'` | summary property in messageService.add() | File List Load Error | Error message header |
| 152 | `'Failed to load file list'` | detail property in messageService.add() | File List Load Failure | Technical error message |
| 253 | `'Upload Confirmation'` | header property in confirmationService.confirm() | File Upload Dialog | Confirmation dialog header |
| 254 | `'Are you sure you want to upload ${file.name}?'` | message property in confirmationService.confirm() | File Upload Dialog | Confirmation message with dynamic file name |
| 284 | `'Error'` | summary property in messageService.add() | Upload Failure | Error message header |
| 284 | `'Upload process failed'` | detail property in messageService.add() | Upload Failure | Technical error message |
| 295 | `'Warning'` | summary property in messageService.add() | File Selection Warning | Warning message header |
| 295 | `'Please select a file to upload'` | detail property in messageService.add() | File Selection Warning | User guidance message |

---

### 5. **offer-list.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 349 | `'Error'` | summary property in messageService.add() | Offer Type Change Error | Error message header |
| 362 | `'Failed to fetch offer details'` | detail property - passed through T() but appears hardcoded | Offer Fetch Error | Technical error message |
| 376 | `'Error'` | summary property in messageService.add() | Offer Update Status Error | Error message header |
| 376 | `'Failed to update status'` | detail property - passed through T() | Offer Status Update Failure | Technical error message |

---

### 6. **setting-crud.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 232 | `'Invalid Email'` | summary property in messageService.add() | Workshop Email Validation | Email validation error header |
| 232 | `'Please enter a valid email format (e.g., name@example.com).'` | detail property in messageService.add() | Email Format Validation | Email format instruction |
| 258 | `'Workshop updated successfully!'` | detail property in messageService.add() | Workshop Update Success | Success message (English in Swedish UI) |
| 337 | `'Upload Error'` | summary property in messageService.add() | Logo Upload Failure | Upload error header |
| 337 | `'Failed to upload image. Please try again.'` | detail property in messageService.add() | Logo Upload Failure | Error recovery message |
| 372 | `'Default Tag Error'` | summary property in messageService.add() | Customer Tag Validation | Tag error header |
| 372 | `'A default tag already exists. Only one default tag allowed.'` | detail property in messageService.add() | Default Tag Constraint | Business rule validation message |
| 417 | `'Save Failed'` | summary property in messageService.add() | Tag Save Failure | Failure error header |
| 417 | `'Unable to save tag. Please try again.'` | detail property in messageService.add() | Tag Save Failure | Error recovery message |
| 507 | `'Default Type Error'` | summary property in messageService.add() | Customer Type Validation | Type error header |
| 507 | `'A default Type already exists. Only one default Type allowed.'` | detail property in messageService.add() | Default Type Constraint | Business rule validation message |
| 742 | `'Confirm Deletion'` | header property in confirmationService.confirm() | Product Template Deletion | Confirmation dialog header |
| 1061 | `'Are you sure you want to delete this sales target?'` | message property in confirmationService.confirm() | Sales Target Deletion | Confirmation message |
| 1062 | `'Confirm Deletion'` | header property in confirmationService.confirm() | Sales Target Deletion | Confirmation dialog header |

---

### 7. **customer-crud.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 276 | `'Validation Error'` | summary property in messageService.add() | Contact Info Validation | Validation error header |
| 276 | `'Please provide either Telephone or Email.'` | detail property in messageService.add() | Contact Info Validation | Form validation message |
| 290 | `'Validation Error'` | summary property in messageService.add() | Email Format Validation | Validation error header |
| 290 | `'Please enter a valid email address (e.g. user@example.com).'` | detail property in messageService.add() | Email Format Validation | Email format instruction |
| 304 | `'Validation Error'` | summary property in messageService.add() | Digital Workshop Validation | Validation error header |
| 304 | `'Please enter a valid Digital Workshop (e.g. workshop@example.com).'` | detail property in messageService.add() | Digital Workshop Validation | Digital Workshop format instruction |
| 321 | `'Error'` | summary property in messageService.add() | Digital Service ID Validation | Error message header |
| 321 | `'The Digital Service ID is not valid.'` | detail property in messageService.add() | Digital Service ID Validation | Invalid ID error message |
| 332 | `'Error'` | summary property in messageService.add() | Digital Service ID Check Error | Error message header |
| 332 | `'Could not validate Digital Service ID. Please try again.'` | detail property in messageService.add() | Digital Service Validation Failure | Error recovery message |
| 345 | `'Validation Error'` | summary property in messageService.add() | Form Validation | Validation error header |
| 345 | `'Please fill all required fields.'` | detail property in messageService.add() | Form Validation | Form validation message |
| 369 | `'Duplicate Customer'` | summary property in messageService.add() | Duplicate Name Check | Duplicate error header |
| 369 | `'This customer name already exists.'` | detail property in messageService.add() | Duplicate Name Check | Duplicate error message |
| 414 | `'Unexpected Response'` | summary property in messageService.add() | Save Response Error | Unexpected response header |
| 414 | `'Server did not confirm save operation.'` | detail property in messageService.add() | Save Confirmation Failure | Error message |
| 424 | `'Error'` | summary property in messageService.add() | Customer Save Error | Error message header |
| 424 | `'Failed to save customer. Please try again later.'` | detail property in messageService.add() | Customer Save Failure | Error recovery message |

---

### 8. **product-list.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 190 | Contains reference to translation key | Product enable/disable confirmation | Product Enable/Disable | Uses translation service correctly |

---

### 9. **product-detail.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 143 | `'Validation Error'` | summary property in messageService.add() | Product Form Validation | Validation error header |
| 143 | `'Please fill all required fields.'` | detail property in messageService.add() | Product Form Validation | Form validation message |
| 163 | `'Error'` | summary property in messageService.add() | Product Update Error | Error message header |
| 163 | `'Failed to update product!'` | detail property in messageService.add() | Product Update Failure | Technical error message |
| 309 | `'Error'` | summary property in messageService.add() | Inventory Save Error | Error message header |
| 309 | `'Failed to save inventory'` | detail property in messageService.add() | Inventory Save Failure | Technical error message |

---

### 10. **supplier-list.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 141 | `'Error'` | summary property in messageService.add() | Supplier Data Fetch Error | Error message header |
| 141 | `'Could not fetch supplier data'` | detail property in messageService.add() | Data Retrieval Failure | Technical error message |
| 150 | `'Validation'` | summary property in messageService.add() | Form Validation | Validation error header |
| 150 | `'Please fill required fields'` | detail property in messageService.add() | Form Validation | Form validation message |
| 169 | `'Error'` | summary property in messageService.add() | Supplier Save Error | Error message header |
| 169 | `'Failed to save supplier'` | detail property in messageService.add() | Supplier Save Failure | Technical error message |

---

### 11. **booking-list.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 425 | `'Missing work order id.'` | detail property in messageService.add() | Booking Retrieval Error | Error message - missing critical data |
| 598 | `'Are you sure you want to this Booking?'` | message property in confirmationService.confirm() | Booking Deletion Confirmation | Confirmation message (grammatical error: "this" should be removed) |

---

### 12. **home.component.ts** (Swedish Text - Not English)
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 186 | `'Info'`, `'Message Content'` | messageService.add() demo toast | Home Component Demo | Generic demo message |
| 281 | `'Fel'`, `'Vänligen fyll alla obligatoriska fält korrekt.'` | Swedish text | Home Signup Error | Swedish language hardcoded |
| 313 | `'Framgång'`, `'Din registrering är genomförd. Ditt konto aktiveras snart.'` | Swedish text | Home Signup Success | Swedish language hardcoded |
| 374 | `'Fel'`, `'Vänligen fyll alla obligatoriska fält korrekt.'` | Swedish text | Home Demo Error | Swedish language hardcoded |
| 397 | `'Framgång'`, `'Vi kontaktar dig snart på e-postadressen du angav för att boka in tid för demo.'` | Swedish text | Home Demo Success | Swedish language hardcoded |

---

### 13. **timesheet-list.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 507 | `'Update failed'` | detail property in messageService.add() | Timesheet Update Error | Technical error message |

---

### 14. **customer-detail.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 260 | `'Are you sure you want to this Booking?'` | message property in confirmationService.confirm() | Booking Deletion Confirmation | Confirmation message (grammatical error) |

---

### 15. **digitalservice-detail.component.ts**
| Line | Hardcoded Text | Context | Component | Issue |
|------|---|---|---|---|
| 98 | `'Unable to load PDF'` | detail property in messageService.add() | PDF Load Error | Technical error message |

---

## Console Log Messages (Low Priority - Debug Only)

These are typically developer debug messages and may not need translation, but should be reviewed:

| File | Line | Message | Purpose |
|------|------|---------|---------|
| workorder-detail.component.ts | 243 | `'File upload event:'` | Debug logging |
| home.component.ts | 356 | `'Open login modal'` | Debug logging |
| digitalservice-list.component.ts | 429-433 | Upload request debugging | Debug logging |
| digitalservice-list.component.ts | 446-449, 470 | PDF upload process logging | Debug logging |

---

## Summary Statistics

- **Total Files with Hardcoded Strings**: 15
- **Total Hardcoded Text Instances**: 85+
- **High Priority (User-Facing)**: 75+ instances
- **Low Priority (Debug/Logging)**: 10+ instances
- **Components Needing Translation Service Wrapping**: 
  - messageService.add() calls
  - confirmationService.confirm() calls
  - Critical error messages

## Recommendations

1. **Extract all strings** to translation files (trans.json)
2. **Create translation keys** for each unique string
3. **Wrap strings** with `this.sharedService.T('translation-key')`
4. **Priority**: Start with user-facing messages (form validation, errors, confirmations)
5. **Note**: Swedish hardcoded text in home.component.ts indicates mixed-language UI - evaluate whether these should be translatable
6. **Grammar Fix**: Fix "Are you sure you want to this Booking?" (remove "to")

## File Examples for Refactoring

### Before (Hardcoded):
```typescript
this.messageService.add({ 
  severity: 'error', 
  summary: 'Error', 
  detail: 'Please fill required fields' 
});
```

### After (Translated):
```typescript
this.messageService.add({ 
  severity: 'error', 
  summary: this.sharedService.T('error'), 
  detail: this.sharedService.T('validation.fillRequired') 
});
```

---

*Report Generated: April 2026*
*Workspace: c:\angular\wmsapp21*
