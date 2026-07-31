import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IWorkOrder, ISupplier, ICustomer, IDailyCalendar, IEnum, IWOPurchase, IProduct, ICustomerType, ICustomerTag, IEmployee, IVehicleType, IVehicleHistorySummary, IVehicleHistoryCustomer, IVehicleDetails } from 'app/app.model';
import { WorkshopService } from 'app/services/workshop.service';
import { EmployeeService } from 'app/services/employee.service';
import { WorkOrderService } from 'app/services/workorder.service';
import { SharedService } from 'app/services/shared.service';
import { CoreService } from 'app/services/core.service';
import { LogService } from 'app/services/log.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { SupplierService } from 'app/services/supplier.service';
import { BookingService } from 'app/services/booking.service';
import { ProductService } from 'app/services/product.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, map, switchMap, tap, finalize, takeUntil } from 'rxjs/operators';
import { SelectChangeEvent } from 'primeng/select';
import { CustomerService } from 'app/services/customer.service';
import { Popover } from 'primeng/popover';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
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
  isWorkOrderServicesMissing,
  isWorkOrderFormValid,
  WorkOrderRequiredField,
} from 'app/validators/workorder-validation';
import { isFormControlInvalid, showValidationErrorToast } from 'app/validators/model-validators';
import { DigitalServiceService } from 'app/services/digitalservice.service';
import { PickListModule } from 'primeng/picklist';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { VoiceInputButtonComponent } from 'app/components/shared/voice-input-button/voice-input-button.component';
import { IWorkOrderHandoff, WorkOrderHandoffService } from 'app/services/workorder-handoff.service';
import { parseOilCapacity, parseOilType } from 'app/utils/vehicle-oil.util';
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

  products: IProduct[] = [];
  selectedProduct:FormGroup;
  selectedProducts: IProduct[] = [];
  

  employees: IEmployee[] = [];
  dayBookings: IDailyCalendar[] = [];
  vehicles: string[] = [];
  times: string[] = [];
  paymentType: IEnum[] = [];
  workOrderStatus: IEnum[] = [];
  workOrder: FormGroup;
  oilTypes: string[] = ['5W30', '0W20', '5W40', '0W30', '10W30', '10W40'];
  isCreate: boolean = true;
  isNewObject: boolean = true;
  suppliers: ISupplier[] = [];
  //products: any[] = [];
  selectedCustomerName: any = null;
  formSubmitted = false;


  /*** */

  woPurchases: IWOPurchase[] = [];
  newWOPurchase: IWOPurchase = {
    woPurchaseId: 0,
    supplierName: '',
    purchaseReference: '',
    purchaseNote: ''
  }
  customer: FormGroup;
  creditDays: number[] = [0, 7, 14, 21, 30];
  customerTypes: ICustomerType[] = [];
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
    private readonly supplierService: SupplierService,
    private readonly bookingService: BookingService,
    private readonly productService: ProductService,
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
      oilType: '5W30',
      oilCapacity: null,
      workOrderDate: ['', Validators.required],
      vehiclePlate: [null, Validators.required],
      vehicleMileage: null,
      vehicleManufacturer: [null, Validators.required],
      vehicleModel: [null],
      vehicleYear: null,
      paymentType: [this.sharedService.getDefaultEnum('paymentType')?.value, Validators.required],
      workOrderStatus: [this.sharedService.getDefaultEnum('workOrderStatus')?.value, Validators.required],
      description: null,
      bookingDate: null,
      bookingTime: null,
      employeeId: [null, [Validators.required, Validators.min(1)]],
      offerId: null,
      createdVia: [null],
      createdByName: [null],
    });

    this.customer = this.fb.group({
      customerId: [0, Validators.required],
      customerName: ['', Validators.required],
      customerType: [],
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

  this.selectedProduct = this.fb.group({
    productId:0,
    productName:['',Validators.required],
    productDescription:'',
    quantity:1.0  
  });

  }
  ngOnInit() {
    const param: any = this.route.snapshot.params;
    this.loadCustomerTypes();
    this.loadCustomerTags();
  
    this.workOrderService
      .getWorkOrder(param.offerId, param.customerId, param.workOrderId, param.isDuplicate)
      .pipe(
        catchError((err) => {
          throw err; // Handle the error
        }),
        switchMap((response: any) => {
          if (response.data) {
            this.logger.info('WorkOrder Loaded', response.data);
            return this.productService.getProductsByCategory('labour').pipe(
              tap((response: IProduct[]) => {
                this.products = response;
                this.products.sort((a, b) => {  
                  if (a.productName && b.productName) {
                     return a.productName.localeCompare(b.productName, undefined, { sensitivity: 'base' });
                  }
                  return 0;
                });
              }),
              map(() => response)
            );
          }
          return of(null);
        })
      )
      .pipe(finalize(() => { }))
      .subscribe((response: any) => {
        if (response.data) {
          if (param.bookingDate)
            response.data.bookingDate = param.bookingDate;
          if (param.bookingTime)
            response.data.bookingTime = param.bookingTime;
          this.woPurchases = response.data.woPurchases || [];

          this.logger.info('WO Purchases', this.woPurchases);
          this.logger.info('WO Services', response.data.woServices);
          
          response.data.woServices.forEach((s: any) => {
            const matchingProduct = this.products.find(product => product.productId === s.productId);
            if (matchingProduct) {
              this.selectedProducts.push(matchingProduct);
            }
          });
          
          this.selectedCustomerName = response.data.customerName;
          this.isNewObject = response.isNewObject;
          this.hasResolvedVehicle = !!response.data.vehiclePlate;
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

  loadCustomerTypes() {
    this.workshopService
      .getCustomerTypes()
      .pipe(
        finalize(() => {
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.customerTypes = response;
            this.logger.info('Customer Types', this.customerTypes);

            if (!(this.customer.get('customerType') && Number(this.customer.get('customerType')) > 0))
              this.customer.patchValue({ 'customerType': this.customerTypes[0].customerTypeId });
          }
        },
        error: (err) => {
          this.logger.error('loadCustomerTypes error', err);
        }
      });
  }
  onChangeCustomerType(event: SelectChangeEvent) {
    this.customer.patchValue({ customerType: event.value });
  }
  onChangeCustomerTag(event: SelectChangeEvent) {
    this.customer.patchValue({ customerTag: event.value });
  }

  getSuppliers() {
    this.supplierService
      .getAllSuppliers()
      .pipe(
        finalize(() => {
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.suppliers = res;
            this.logger.info('Printing Suppliers', this.suppliers);
          }
        },
        error: (err) => {
          this.logger.error('getSuppliers error', err);
        }
      });
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
          const patch: Record<string, unknown> = {
            vehicleManufacturer: vehicle.make,
            vehicleModel: vehicle.model,
            vehicleYear: vehicle.year ? Number(vehicle.year) : null,
          };
          const oilType = parseOilType(vehicle.oilClassification1, this.oilTypes);
          if (oilType) patch['oilType'] = oilType;
          const oilCapacity = parseOilCapacity(vehicle.oilCapacity);
          if (oilCapacity !== null) patch['oilCapacity'] = oilCapacity;
          this.workOrder.patchValue(patch);
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
   * receptionist doesn't repeat it here - see WorkOrderHandoffService. Oil fields are a best-effort parse of
   * Vehicle.cs's free-text scraped data (DashboardPage_Redesign.md's "Oil field auto-fill" decision) - the
   * receptionist should still glance at them, not treated as gospel.
   */
  private applyHandoff(handoff: IWorkOrderHandoff): void {
    const vehicle = handoff.vehicleInfo;
    const patch: Record<string, unknown> = {
      vehiclePlate: handoff.vehiclePlate,
      vehicleManufacturer: vehicle.make || null,
      vehicleModel: vehicle.model || null,
      vehicleYear: vehicle.year ? Number(vehicle.year) : null,
    };

    const oilType = parseOilType(vehicle.oilClassification1, this.oilTypes);
    if (oilType) patch['oilType'] = oilType;
    const oilCapacity = parseOilCapacity(vehicle.oilCapacity);
    if (oilCapacity !== null) patch['oilCapacity'] = oilCapacity;

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

  filterSuppliers(event: any): void {
    this.supplierService
      .getSuppliersByprefix(event.query.toUpperCase())
      .pipe(
        finalize(() => {
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.suppliers = res;
            this.logger.info('Printing Suppliers', this.suppliers);
          }
        },
        error: (err) => {
          this.logger.error('filterSuppliers error', err);
        }
      });
  }

    getProducts(event: AutoCompleteCompleteEvent) {
    let query = event.query;
    const make = this.workOrder.get('vehicleManufacturer')?.value;
    const model = this.workOrder.get('vehicleModel')?.value;
    const year = this.workOrder.get('vehicleYear')?.value;
    
    this.productService.getProductsByprefix('labour',query,make,model,year)
      .pipe(
        finalize(() => { }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.products = response
            .sort((a: any, b: any) => a.productName.localeCompare(b.productName));
          this.logger.info(this.products);
        },
        error: (err) => {
          this.logger.error('Error loading products', err);
        }
      });
  }
  resetServiceProduct() {
    this.selectedProduct.reset({ productId: 0, productName: '', productDescription: '', quantity: 1 });
  }

  onSelectProduct(event: any) {
    const selectedProduct = event.value as IProduct;
    this.selectedProduct.patchValue({
      productId: selectedProduct.productId,
      productName: selectedProduct.productName,
      productDescription: selectedProduct.productDescription,
      quantity: selectedProduct.quantity
    });
  }

  registerManualProduct(productName: string, productDescription: string, autoAdd: boolean = false) {
    // First, get the next ProductId from the service (it's an Observable)
    this.coreService.getNextId('Product').pipe(
      switchMap((productId: number) => {
        // Now that we have the productId, create the product object
        const newProduct: any = {
          productId: productId,
          productName: productName,
          productDescription: productDescription,
          quantity: this.selectedProduct.get('quantity')?.value || 1,
          unit: 'hour',
          isBaseProduct: false,
          category: 'labour'
        };
        
        this.logger.info('Calling createProduct for a new manual/labour line:', productId, 'productName:', productName);

        // Always a brand-new ad-hoc labour line — never an edit of an existing product.
        // Note: create-product ignores/reassigns ProductId server-side (see ProductController's
        // doc comment), so this pre-fetched id is only used for the optimistic local push below,
        // not what actually gets persisted.
        return this.productService.createProduct(newProduct).pipe(
          map((response) => ({ response, newProduct }))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result: any) => {
        const { response, newProduct } = result;

        {
          // Reaching here means the HTTP call succeeded — createProduct returns the new
          // ProductId (a number), not true/{success:true}.
          this.selectedProduct.patchValue({
            productId: newProduct.productId,
            productName: newProduct.productName,
            productDescription: newProduct.productDescription,
            quantity: newProduct.quantity
          });
          // Add the new product to products list
          this.products.push(newProduct);
          
          // Always add the new product to selectedProducts
          this.selectedProducts.push(newProduct);
          this.sumServiceDuration();
          
          // reset form
          if (autoAdd) {
            this.resetServiceProduct();
          }
          
          this.messageService.add({
            severity: 'success',
            summary: this.sharedService.T('success'),
            icon: 'pi pi-check-circle',
            life: 3000
          });
          
          this.logger.info('Manual product registered successfully', newProduct);
        }
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: this.sharedService.T('error'),
          detail: this.sharedService.T('errorMessage'),
          life: 3000
        });
        this.selectedProduct.reset({ productId: 0, productName: '',productDescription:'', quantity: 1 });
      }
    });
  }
  saveProduct() {
    this.logger.info('Saving product:', this.selectedProduct.value);
    const productId = this.selectedProduct.get('productId')?.value;
    const productName = this.selectedProduct.get('productName')?.value;
    const productDescription = this.selectedProduct.get('productDescription')?.value;
    // Check if product has a valid productId
    if (!productId || productId === 0) {
      // No productId means user entered it manually without selecting from dropdown
      if (!productName || !productName.trim()) {
        return; // User didn't enter anything
      }
      this.logger.info('confirming...:');
      // Trigger manual product entry workflow with confirmation
      this.confirmationService.confirm({
        message: `${this.sharedService.T('confirmCreateService')}`,
        header: this.sharedService.T('confirmation'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.registerManualProduct(productName, productDescription, true); // Pass true to auto-add after registration
        },
        reject: () => {
          // Reset the form on rejection
          this.selectedProduct.reset({ productId: 0, productName: '', productDescription: '', quantity: 1 });
        }
      });
    } else {
      // Product has valid ID, add it to the list
      this.selectedProducts.push(this.selectedProduct.value);
      this.sumServiceDuration();
      this.resetServiceProduct();
    }
  }
  removeWOService(index: number) {
    if (index >= 0 && index < this.selectedProducts.length) {
      const removedService = this.selectedProducts[index];
      this.selectedProducts.splice(index, 1);

      // Add back to available products
      this.products.push(removedService);
      this.products.sort((a, b) => {
        if (a.productName && b.productName) {
          return a.productName.localeCompare(b.productName, undefined, { sensitivity: 'base' });
        }
        return 0;
      });

      // Recalculate duration
      this.sumServiceDuration();

      this.logger.info('Service removed', this.selectedProducts);
    }
  }
  
  sumServiceDuration(){
    let hoursSum = 0;
    this.selectedProducts.forEach(element => {
      hoursSum += element.quantity || 0;
    });
    // Round to 1 decimal place
    hoursSum = Math.round(hoursSum * 10) / 10;
    this.workOrder.patchValue({ serviceDuration: hoursSum });

  }

  
  onSelectCalendarDate() {
    const bookingDate = this.workOrder.get('bookingDate')?.value;
    if (bookingDate) {
      this.workOrder.patchValue({ workOrderDate: bookingDate });
    }
    this.getBookings(bookingDate);
  }

  saveWOPurchase() {
    const newPurchase = { ...this.newWOPurchase, woPurchaseId: this.woPurchases.length + 1 };
    this.woPurchases.push(newPurchase);
    this.newWOPurchase = { woPurchaseId: 0, supplierName: '', purchaseReference: '', purchaseNote: '' };
  }
  removeWOPurchase(woPurchase: any): void {

    this.logger.info('WO Purchases', this.woPurchases);
    this.logger.info('Received Purchases', woPurchase);
    this.woPurchases = this.woPurchases.filter(purchase => purchase.woPurchaseId !== woPurchase.woPurchaseId);

    this.logger.info('Remaining WO Purchases', this.woPurchases);

    this.woPurchases.forEach((order, index) => {
      order.woPurchaseId = index + 1; // Reassign index starting from 1
    });
  }
  isFieldInvalid(controlName: WorkOrderRequiredField): boolean {
    return isWorkOrderFieldInvalid(this.workOrder, controlName, this.formSubmitted);
  }

  isControlInvalid(controlName: string): boolean {
    return isFormControlInvalid(this.workOrder, controlName, this.formSubmitted);
  }

  showServicesError(): boolean {
    return isWorkOrderServicesMissing(this.selectedProducts, this.formSubmitted);
  }

  private showWorkOrderValidationMessages(): void {
    const missingLabels = collectWorkOrderValidationFieldLabels(
      this.workOrder,
      this.selectedProducts,
      (key) => this.sharedService.T(key)
    );

    if (missingLabels.length === 0) {
      return;
    }

    if (this.selectedProducts.length === 0) {
      showValidationErrorToast(
        this.messageService,
        (key) => this.sharedService.T(key),
        'servicesRequired',
        6000
      );
    }

    const formMissing = missingLabels.filter(
      (label) => label !== this.sharedService.T('service')
    );
    if (formMissing.length > 0) {
      showValidationErrorToast(
        this.messageService,
        (key) => this.sharedService.T(key),
        'fillRequiredFieldsCorrectly',
        6000
      );
    }
  }

  saveWorkOrder() {
    this.formSubmitted = true;

    const bookingDate = this.workOrder.get('bookingDate')?.value;
    if (!this.workOrder.get('workOrderDate')?.value && bookingDate) {
      this.workOrder.patchValue({ workOrderDate: bookingDate });
    }

    this.workOrder.markAllAsTouched();

    if (!isWorkOrderFormValid(this.workOrder, this.selectedProducts)) {
      this.showWorkOrderValidationMessages();
      this.showSpinner = false;
      return;
    }

    this.showSpinner = true;
    this.knownFields.clear();
    this.logger.info(this.selectedProducts);

    var submittedWorkOrder: IWorkOrder = this.workOrder.value;
    submittedWorkOrder.woPurchases = [];
    this.woPurchases.forEach(p =>
      submittedWorkOrder.woPurchases.push({
        woPurchaseId: p.woPurchaseId,
        supplierName: p.supplierName,
        purchaseReference: p.purchaseReference,
        purchaseNote: p.purchaseNote
      }
      ));


    submittedWorkOrder.woServices = [];
    let i = 1; // Initialize the index to start from 1
    this.selectedProducts.forEach(s => {
      submittedWorkOrder.woServices.push({
        index: i,
        productId: s.productId,
        productName: s.productName,
        productDescription: s.productDescription,
        category: s.category,
        quantity: s.quantity
      });
      i++;
    });

    
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
                  this.loadCustomerTypes();
                  this.customer.patchValue({
                    customerId: res.data.customerId,
                    customerName: '',
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

