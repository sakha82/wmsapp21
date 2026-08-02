import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IWorkOrder, ICustomer, IDailyCalendar, IEnum, ICustomerTag, IEmployee, IVehicleType, IVehicleHistorySummary, IVehicleHistoryCustomer, IVehicleDetails, IServiceCategory } from 'app/app.model';
import { WorkshopService } from 'app/services/workshop.service';
import { EmployeeService } from 'app/services/employee.service';
import { WorkOrderService } from 'app/services/workorder.service';
import { SharedService } from 'app/services/shared.service';
import { CoreService } from 'app/services/core.service';
import { LogService } from 'app/services/log.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { BookingService } from 'app/services/booking.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, switchMap, finalize, takeUntil } from 'rxjs/operators';
import { SelectChangeEvent } from 'primeng/select';
import { CustomerService } from 'app/services/customer.service';
import { Popover } from 'primeng/popover';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TabsModule } from 'primeng/tabs';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { PopoverModule } from 'primeng/popover';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { emailOrTelephoneRequiredValidator } from 'app/validators/validator';
import {
  collectWorkOrderValidationFieldLabels,
  isWorkOrderFieldInvalid,
  isWorkOrderFormValid,
  WorkOrderRequiredField,
} from 'app/validators/workorder-validation';
import { isFormControlInvalid, showValidationErrorToast } from 'app/validators/model-validators';
import { DigitalServiceService } from 'app/services/digitalservice.service';
import { PickListModule } from 'primeng/picklist';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { VoiceInputButtonComponent } from 'app/components/shared/voice-input-button/voice-input-button.component';
import { IWorkOrderHandoff, WorkOrderHandoffService } from 'app/services/workorder-handoff.service';
import { buildVehicleDetailFields } from 'app/utils/vehicle-detail-fields.util';

@Component({
  selector: 'app-order-crud',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    InputTextModule,
    AutoCompleteModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    TabsModule,
    CheckboxModule,
    PanelModule,
    DialogModule,
    MessageModule,
    ToastModule,
    ConfirmDialogModule,
    FileUploadModule,
    PopoverModule,
    TagModule,
    MultiSelectModule,
    TextareaModule,
    TooltipModule,
    PickListModule,
    GenericLoaderComponent,
    VoiceInputButtonComponent
  ],
  templateUrl: './workorder-crud.component.html',
  styleUrls: ['./workorder-crud.component.css'],
  providers: [MessageService, ConfirmationService]
})

export class WorkOrderCrudComponent implements OnInit, OnDestroy {
  @ViewChild('nextInput') nextInput!: ElementRef;
  @ViewChild('customerPopup') customerPopup!: Popover;
  private destroy$ = new Subject<void>();
  uploadedFiles: any[] = [];
  customers: ICustomer[] = [];
  showSpinner: boolean = false;
  showCustomerSpinner:boolean = false;
  duplicateCustomerName: boolean = false;
  isVehicleLookupLoading: boolean = false;

  /** Form control names auto-filled from a deterministic vehicle-history DB fact or the Dashboard handoff (not an AI guess) - shown with a lighter "known" badge until edited. */
  knownFields = new Set<string>();
  isVehicleHistoryLoading: boolean = false;
  vehicleHistory: IVehicleHistorySummary | null = null;
  /** True once a plate lookup has resolved (success or failure) or the record already had a plate on load - gates the progressive-disclosure reveal of the rest of the form for new work orders. */
  hasResolvedVehicle: boolean = false;
  /** Scraped vehicle reference data (VIN, engine code, tyres, oil spec, etc.) shown as a single readonly line - see vehicleDetailsLine. Not persisted onto WorkOrder itself. */
  vehicleDetails: IVehicleDetails | null = null;

  employees: IEmployee[] = [];
  dayBookings: IDailyCalendar[] = [];
  vehicles: string[] = [];
  times: string[] = [];
  paymentType: IEnum[] = [];
  workOrderStatus: IEnum[] = [];
  workOrder: FormGroup;
  serviceCategories: IServiceCategory[] = [];
  isCreate: boolean = true;
  isNewObject: boolean = true;
  selectedCustomerName: any = null;
  formSubmitted = false;

  customer: FormGroup;
  creditDays: number[] = [0, 7, 14, 21, 30];
  customerTags: ICustomerTag[] = [];

  /**
   * Progressive disclosure: a brand-new work order only shows the plate + AI-assist input until the plate has
   * been resolved (lookup attempted, or the record already arrived with a plate - duplicate/from-offer/from-
   * customer/edit). Existing records (edit) always show the full form immediately.
   */
  get showFullForm(): boolean {
    return !this.isNewObject || this.hasResolvedVehicle;
  }

  /** Single-line readonly summary of scraped vehicle reference data (VIN, engine, tyres, oil spec, etc.) - empty string hides the row. */
  get vehicleDetailsLine(): string {
    if (!this.vehicleDetails) return '';
    return buildVehicleDetailFields(this.vehicleDetails, (key) => this.sharedService.T(key))
      .map((field) => `${field.label}: ${field.value}`)
      .join('  •  ');
  }

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private logger: LogService,
    public readonly sharedService: SharedService,
    private readonly coreService: CoreService,
    private router: Router,
    private readonly fb: FormBuilder,
    private readonly workOrderService: WorkOrderService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly workshopService: WorkshopService,
    private readonly employeeService: EmployeeService,
    private readonly bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private readonly customerService: CustomerService,
    private readonly workOrderHandoffService: WorkOrderHandoffService,

  ) {

    this.workOrder = this.fb.group({
      workOrderId: null,
      customerId: [null, [Validators.required, Validators.min(1)]],
      customerName: [null],
      customerTelephone: '',
      customerEmail: ['', [Validators.email]],
      serviceDuration: [null],
      workOrderDate: ['', Validators.required],
      vehiclePlate: [null, Validators.required],
      vehicleMileage: null,
      paymentType: [this.sharedService.getDefaultEnum('paymentType')?.value, Validators.required],
      workOrderStatus: [this.sharedService.getDefaultEnum('workOrderStatus')?.value, Validators.required],
      description: null,
      bookingDate: null,
      bookingTime: null,
      employeeId: [null, [Validators.required, Validators.min(1)]],
      offerId: null,
      serviceCategoryIds: [[]],
    });

    this.customer = this.fb.group({
      customerId: [0, Validators.required],
      customerName: ['', Validators.required],
      customerType: [this.sharedService.getDefaultEnum('customerType')?.value],
      customerTag: [],
      organizationNo: [],
      vatId: [],
      invoiceCreditDays: [0],
      isCreditAllowed: [true],
      telephone: [],
      email: ['', [Validators.email]],
      digitalServiceId: ['', [Validators.email]],
    },
    {
      validators: [emailOrTelephoneRequiredValidator]  
    }
  );

  }
  ngOnInit() {
    const param: any = this.route.snapshot.params;
    this.loadCustomerTags();
    this.loadServiceCategories();

    this.workOrderService
      .getWorkOrder(param.offerId, param.customerId, param.workOrderId, param.isDuplicate)
      .pipe(
        catchError((err) => {
          throw err; // Handle the error
        }),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response.data) {
          if (param.bookingDate)
            response.data.bookingDate = param.bookingDate;
          if (param.bookingTime)
            response.data.bookingTime = param.bookingTime;

          this.selectedCustomerName = response.data.customerName;
          this.isNewObject = response.isNewObject;
          this.hasResolvedVehicle = !!response.data.vehiclePlate;
          this.vehicleDetails = response.data.vehicle || null;
          this.workOrder.patchValue(response.data);
          this.logger.info('WORKORDERS-0', response.data);
          this.logger.info('WORKORDERS', this.workOrder.value);

          if (response.isNewObject) {
            const handoff = this.workOrderHandoffService.consumePending();
            if (handoff) {
              this.applyHandoff(handoff);
            }
          }

          if (this.isNewObject && !this.workOrder.get('bookingDate')?.value) {
            this.workOrder.patchValue({ bookingDate: this.getStockholmNow().date });
          }

          this.getAllEmployees();
          this.getBookings(this.workOrder.get('bookingDate')?.value || this.getStockholmNow().date);
        }
        this.cdr.detectChanges();
      });
      
      
  }

  loadCustomerTags() {
    this.workshopService
      .getCustomerTags()
      .pipe(
        finalize(() => {
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.customerTags = response;
            this.logger.info('Customer Tags', this.customerTags);
            if (!(this.customer.get('customerTag') && Number(this.customer.get('customerTag')) > 0))
              this.customer.patchValue({ 'customerTag': this.customerTags[0].customerTagId });
          }
        },
        error: (err) => {
          this.logger.error('loadCustomerTags error', err);
        }
      });
  }

  loadServiceCategories() {
    this.coreService
      .getServiceCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.serviceCategories = response;
          }
        },
        error: (err) => {
          this.logger.error('loadServiceCategories error', err);
        }
      });
  }

  onChangeCustomerType(event: SelectChangeEvent) {
    this.customer.patchValue({ customerType: event.value });
  }
  onChangeCustomerTag(event: SelectChangeEvent) {
    this.customer.patchValue({ customerTag: event.value });
  }


  getAllEmployees() {
    this.employeeService
      .getAllEmployees()
      .pipe(
        finalize(() => {
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.employees = res;
            this.logger.info('Printing Employees', this.employees);
            if (this.isNewObject && !this.workOrder.get('employeeId')?.value && this.employees.length) {
              this.workOrder.patchValue({ employeeId: this.employees[0].employeeId });
            }
          }
        },
        error: (err) => {
          this.logger.error('getAllEmployees error', err);
        }
      });
  }

  getBookings(bookingDate: string) {
    this.bookingService
      .getDayBookings(bookingDate)
      .pipe(
        finalize(() => {
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.logger.info(res);
          this.dayBookings = res;
          if (this.isNewObject && !this.workOrder.get('bookingTime')?.value && this.dayBookings.length) {
            const targetTime = this.computeNextHalfHourSlot();
            const nextSlot = this.dayBookings.find((b) => b.cTime >= targetTime) || this.dayBookings[0];
            this.workOrder.patchValue({ bookingTime: nextSlot.cTime });
          }
        },
        error: (err) => {
          this.logger.error('getBookings error', err);
        }
      });
  }

  /** Current date/time in Europe/Stockholm, independent of the browser's own timezone. */
  private getStockholmNow(): { date: string; hour: number; minute: number } {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date());
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
    return {
      date: `${get('year')}-${get('month')}-${get('day')}`,
      hour: Number(get('hour')),
      minute: Number(get('minute')),
    };
  }

  /** Next upcoming half-hour booking window in Sweden time, e.g. 14:12 -> "14:30", 14:31 -> "15:00". */
  private computeNextHalfHourSlot(): string {
    const { hour, minute } = this.getStockholmNow();
    let h = hour;
    let m = minute === 0 ? 0 : minute <= 30 ? 30 : 60;
    if (m === 60) {
      m = 0;
      h = (h + 1) % 24;
    }
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  onChangeCustomer($event: any) {
    this.workOrder.patchValue({
      customerId: $event.customerId,
      customerName: $event.customerName,
      customerTelephone: $event.telephone || $event.customerTelephone,  // Map both possibilities
      customerEmail: $event.email || $event.customerEmail,              // Map both possibilities
    });
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizedValue = input.value.replace(/[^A-Z0-9]/gi, ''); // Remove invalid characters
    input.value = sanitizedValue.toUpperCase(); // Convert to uppercase
    this.workOrder.get('vehiclePlate')?.setValue(sanitizedValue); // Update
  }

  lookupVehicle(): void {
    const registrationNumber = this.workOrder.get('vehiclePlate')?.value;
    if (!registrationNumber) {
      return;
    }
    this.isVehicleLookupLoading = true;
    this.coreService.getVehicle(registrationNumber)
      .pipe(
        finalize(() => { this.isVehicleLookupLoading = false; this.hasResolvedVehicle = true; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (vehicle) => {
          this.vehicleDetails = vehicle;
        },
        error: (err) => {
          this.logger.error('lookupVehicle error', err);
          this.messageService.add({
            severity: 'error',
            summary: this.sharedService.T('error'),
            detail: this.sharedService.T('vehicleLookupFailed'),
            life: 3000
          });
        }
      });

    this.fetchVehicleHistory(registrationNumber);
  }

  /** Lets the receptionist skip straight to the full form without a plate lookup (e.g. plate unreadable/unknown yet). */
  skipVehicleLookup(): void {
    this.hasResolvedVehicle = true;
  }

  /**
   * Applies the plate/vehicle/customer lookup already done on the Dashboard's Registration-mode chat, so the
   * receptionist doesn't repeat it here - see WorkOrderHandoffService. Vehicle attribute fields (make/model/
   * year/oil info) are read-only from the Vehicle record itself, not copied onto the work order.
   */
  private applyHandoff(handoff: IWorkOrderHandoff): void {
    const vehicle = handoff.vehicleInfo;
    const patch: Record<string, unknown> = {
      vehiclePlate: handoff.vehiclePlate,
    };

    if (handoff.customer) {
      patch['customerId'] = handoff.customer.customerId;
      patch['customerName'] = handoff.customer.customerName;
      patch['customerTelephone'] = handoff.customer.customerTelephone || '';
      patch['customerEmail'] = handoff.customer.customerEmail || '';
      this.selectedCustomerName = handoff.customer.customerName;
      this.knownFields.add('customerId');
    }

    this.workOrder.patchValue(patch);
    this.vehicleHistory = handoff.vehicleHistory;
    this.vehicleDetails = vehicle;
    this.hasResolvedVehicle = true;
  }

  /**
   * First-visit vs. returning-vehicle lookup, run alongside (not instead of) the make/model/year scrape lookup.
   * A plate is not a reliable 1:1 proxy for a customer, so more than one distinct customer on file means the
   * receptionist is asked which one this visit is for rather than the form guessing.
   */
  private fetchVehicleHistory(vehiclePlate: string): void {
    this.isVehicleHistoryLoading = true;
    this.vehicleHistory = null;
    this.workOrderService.getVehicleHistory(vehiclePlate)
      .pipe(
        finalize(() => { this.isVehicleHistoryLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (history) => {
          this.vehicleHistory = history;
          if (history.distinctCustomers.length === 1) {
            this.applyKnownCustomer(history.distinctCustomers[0]);
          }
        },
        error: (err) => {
          this.logger.error('fetchVehicleHistory error', err);
        }
      });
  }

  private applyKnownCustomer(customer: IVehicleHistoryCustomer): void {
    this.workOrder.patchValue({
      customerId: customer.customerId,
      customerName: customer.customerName,
      customerTelephone: customer.customerTelephone || '',
      customerEmail: customer.customerEmail || '',
    });
    this.selectedCustomerName = customer.customerName;
    this.knownFields.add('customerId');
  }

  isKnownFact(field: string): boolean {
    return this.knownFields.has(field);
  }

  /** Called on manual edit of a known-fact field (vehicle-history match or Dashboard handoff) so its "Known" badge only shows until the human touches it. */
  clearKnownFact(field: string): void {
    this.knownFields.delete(field);
  }

  /** Voice dictation into the description field - appended as-is to whatever's already there. */
  onDescriptionTranscribed(transcript: string): void {
    const current = this.workOrder.get('description')?.value || '';
    const next = current ? `${current} ${transcript}` : transcript;
    this.workOrder.patchValue({ description: next });
  }

  onSelectCalendarDate() {
    const bookingDate = this.workOrder.get('bookingDate')?.value;
    if (bookingDate) {
      this.workOrder.patchValue({ workOrderDate: bookingDate });
    }
    this.getBookings(bookingDate);
  }

  isFieldInvalid(controlName: WorkOrderRequiredField): boolean {
    return isWorkOrderFieldInvalid(this.workOrder, controlName, this.formSubmitted);
  }

  isControlInvalid(controlName: string): boolean {
    return isFormControlInvalid(this.workOrder, controlName, this.formSubmitted);
  }

  private showWorkOrderValidationMessages(): void {
    const missingLabels = collectWorkOrderValidationFieldLabels(
      this.workOrder,
      (key) => this.sharedService.T(key)
    );

    if (missingLabels.length === 0) {
      return;
    }

    showValidationErrorToast(
      this.messageService,
      (key) => this.sharedService.T(key),
      'fillRequiredFieldsCorrectly',
      6000
    );
  }

  saveWorkOrder() {
    this.formSubmitted = true;

    const bookingDate = this.workOrder.get('bookingDate')?.value;
    if (!this.workOrder.get('workOrderDate')?.value && bookingDate) {
      this.workOrder.patchValue({ workOrderDate: bookingDate });
    }

    this.workOrder.markAllAsTouched();

    if (!isWorkOrderFormValid(this.workOrder)) {
      this.showWorkOrderValidationMessages();
      this.showSpinner = false;
      return;
    }

    this.showSpinner = true;
    this.knownFields.clear();

    var submittedWorkOrder: IWorkOrder = this.workOrder.value;

    (this.isNewObject
      ? this.workOrderService.createWorkOrder(submittedWorkOrder)
      : this.workOrderService.updateWorkOrder(submittedWorkOrder)
    )
      .pipe(
        finalize(() => {
          this.showSpinner = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          // create-workorder returns the new WorkOrderId (a number); update-workorder returns
          // true — use the real created id on create rather than the form's stale placeholder.
          const savedWorkOrderId = this.isNewObject && typeof res === 'number'
            ? res
            : this.workOrder.get('workOrderId')?.value;
          this.router.navigate(['sv/workorder/details', savedWorkOrderId]);
        },
        error: (err) => {
          this.logger.error('onFormSubmit error', err);
        }
      });
  }


  onCancelForm() {
    this.location.back();
  }
  openCustomerDialog(event: Event) {
    this.showCustomerSpinner = false;
    this.customerService
      .getCustomer(undefined)
      .pipe(
        finalize(() => {
          // loading state is not set here since this is just filtering
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
                  this.loadCustomerTags();
                  this.customer.patchValue({
                    customerId: res.data.customerId,
                    customerName: '',
                    customerType: this.sharedService.getDefaultEnum('customerType')?.value,
                    organizationNo:'',
                    vatId: '',
                    invoiceCreditDays: 0 ,
                    telephone: '',
                    email: '',
                    digitalServiceId: '',
                  });
                  this.customerPopup.toggle(event);
          }
        },
        error: (err) => {
          this.logger.error('filterCustomer error', err);
        }
      });
  }

 
  saveCustomer() {
    this.showCustomerSpinner = true; 
    this.customer.markAllAsTouched();
    if (this.customer.get('invoiceCreditDays')?.value == 0)
        this.customer.patchValue({ isCreditAllowed: false});
 
 if (this.customer.invalid) {
  Object.keys(this.customer.controls).forEach((key) => {
    const controlErrors = this.customer.get(key)?.errors;
    if (controlErrors) {
      console.log(`Control: ${key}, Errors:`, controlErrors);
    }
  });
}
    
    if (this.customer.invalid) {
        if (this.customer.hasError('contactRequired')) {
          this.messageService.add({
            severity: 'warn',
            summary: this.sharedService.T('error'),
            detail: this.sharedService.T('contactRequired'),
            life: 4000
          });
          this.showCustomerSpinner = false;
          return;
        }
     
    const emailCtrl = this.customer.get('email');
    if (emailCtrl?.hasError('email')) {
      this.messageService.add({
        severity: 'warn',
        summary: this.sharedService.T('error'),
        detail: this.sharedService.T('invalidEmail'),
        life: 4000
      });
      this.showCustomerSpinner = false;
      return;
    }
  }
    // Run async validations and save if valid
    this.runAsyncValidationsAndSave();
    return;
  
    
  }
  runAsyncValidationsAndSave(): void {
  
  const name = this.customer.get('customerName')?.value?.trim();
  const digitalId = this.customer.get('digitalWorkshopId')?.value?.trim(); 
  this.customerService.isCustomerExists(name).pipe(
    takeUntil(this.destroy$),
    // 1) Duplicate customer name
    switchMap((exists: boolean) => {
      if (exists) {
        this.showCustomerSpinner = false;
        this.duplicateCustomerName = true;
        this.messageService.add({
          severity: 'error',
          summary: this.sharedService.T('error'),
          detail: this.sharedService.T('duplicateCustomerName'),
          life: 4000,
        });
        // Stop the chain – do not continue to next steps
        return EMPTY;
      }
      return of(true);
    }),

    // 3) If digitalWorkshopId is invalid, stop; otherwise call saveCustomer
    switchMap((isValidId: boolean) => {
      if (!isValidId) {
        this.showCustomerSpinner = false;
        this.messageService.add({
          severity: 'error',
          summary: this.sharedService.T('error'),
          detail: this.sharedService.T('invalidDigitalWorkshopId'),
          life: 4000,
        });
        return EMPTY;
      }

      return this.customerService.saveCustomer(this.customer.value);
    }),

    finalize(() => {
      this.showCustomerSpinner = false;
    })
  ).subscribe({
    next: (res: any) => {
          // Reaching here means the HTTP call succeeded — createCustomer returns the new
          // CustomerId (a number), updateCustomer returns true; gating on res === true
          // silently treated a successful create as an error.
          const newCustomerId = typeof res === 'number' ? res : this.customer.get('customerId')?.value;
          this.workOrder.patchValue({
            customerId: newCustomerId,
            customerName: this.customer.get('customerName')?.value,
            customerTelephone: this.customer.get('telephone')?.value,
            customerEmail: this.customer.get('email')?.value
          });
          this.selectedCustomerName = this.customer.get('customerName')?.value;
          this.messageService.add({
            severity: 'success',
            summary: this.sharedService.T('success'),
            icon: 'pi pi-check-circle',
            life: 6000
          });
          this.customerPopup.hide();
    },
    error: (err) => {
      this.logger.error('saveCustomer pipeline error', err);
    }
  });
}

filterCustomer(event: any) {
    let query = event.query;
    this.customerService
      .getCustomerByPrefix(query)
      .pipe(
        finalize(() => {
          // loading state is not set here since this is just filtering
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.customers = res;
          }
        },
        error: (err) => {
          this.logger.error('filterCustomer error', err);
        }
      });
  }

  onSelect(event: any) {
    this.workOrder.patchValue({
      customerId: event.value.customerId,
      customerName: event.value.customerName,
      customerTelephone: event.value.telephone,
      customerEmail: event.value.email,
    });
    this.selectedCustomerName = event.value.customerName;
  }

  onUnselectCustomer() {
    this.workOrder.patchValue({
      customerId: null,
      customerName: null,
      customerTelephone: '',
      customerEmail: '',
    });
    this.selectedCustomerName = null;
  }

  onCancelCreateCustomer() {
    this.customerPopup.hide();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

