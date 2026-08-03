import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ICustomer, IEnums, IInvoice, IInvoiceDetailPrompt } from 'app/app.model';
import { InvoiceService } from 'app/services/invoice.service';
import { SharedService } from 'app/services/shared.service';
import { CoreService } from 'app/services/core.service';
import { LogService } from 'app/services/log.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { showValidationErrorToast } from 'app/validators/model-validators';
import { WorkshopService } from 'app/services/workshop.service';
import { MenuItem, MessageService, SortEvent } from 'primeng/api';
import { finalize, takeUntil, catchError, Subject } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { TableModule } from 'primeng/table';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { AiService } from 'app/services/ai.service';
import { CustomerService } from 'app/services/customer.service';
import { TextareaModule } from 'primeng/textarea';
import { WorkOrderService } from 'app/services/workorder.service';



@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    AutoCompleteModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    IconFieldModule,
    InputIconModule,
    InputGroupModule,
    InputGroupAddonModule,
    ProgressSpinnerModule,
    GenericLoaderComponent,
    TableModule,
    DragDropModule,
    SplitButtonModule,
    TooltipModule,
    CheckboxModule,
    TextareaModule
  ],
  templateUrl: './invoice-crud.component.html',
  styleUrl: './invoice-crud.component.css',
  providers: [MessageService]
})

export class InvoiceCrudComponent implements OnInit, OnDestroy {

  invoice: FormGroup;
  details: any = new FormArray([])

  templates: MenuItem[] = [];

  createInvoice: boolean = true;
  isNewObject: boolean = true;
  errorOnCustomer: boolean = false;
  isSpinnerLoading: boolean = false;
  isVehicleLookupLoading: boolean = false;

  // default 0 means incmoms
  priceMode: number = 0;

  defaultCustomerId: number | null = null;
  defaultCustomerName: string | null = null;
  customerType: string = '';
  unitOptions: IEnums[] = [];
  isLoading: boolean = false;
  selectedContext: IEnums[] | null = null;

  selectedCustomerName: any = null;
  customers: ICustomer[] = [];
  private destroy$ = new Subject<void>();

  constructor(private logger: LogService,
    private readonly errorHandler: ErrorHandlerService,
    public readonly sharedService: SharedService,
    private readonly coreService: CoreService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly invoiceService: InvoiceService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private workshopService: WorkshopService,
    private messageService: MessageService,
    private aiService: AiService,
    private readonly customerService: CustomerService,
    private readonly workOrderService: WorkOrderService,
  ) {
    this.invoice = this.fb.group({
      // invoiceId: '',
      // customerId: [null, Validators.required],
      invoiceId: [null, [Validators.min(1)]],
      customerId: [null, [Validators.required, Validators.min(1)]],
      // invoiceDate: '', //new Date().toISOString().split('T')[0],
      invoiceDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      vehiclePlate: '',
      vehicleMileage: null,
      vehicleManufacturer: '',
      vehicleModel: '',
      vehicleYear: [null, [Validators.pattern(/^\d{4}$/)]],
      // creditDays: 0,
        creditDays: [0, [Validators.min(0)]],

      // dueDate: '',
      yourRef: '',
      // paymentType: this.sharedService.getDefaultEnum('paymentType').value,
      paymentType: [
        this.sharedService.getDefaultEnum('paymentType')?.value,
        Validators.required
      ],
      currency: 'kr',
      deliveryDate: '',
      deliveryTime: '',
      // price: 0.00,
      // vat: 0.00,
      price: [0.00, [Validators.min(0)]],
      vat: [0.00, [Validators.min(0)]],
      // adjustment: 0.00,
      adjustment: [
        0.00,
        [
          Validators.min(-0.99),
          Validators.max(0.99),
          Validators.pattern(/^-?\d+(\.\d{1,2})?$/)
        ]
      ],
      priceIncVat: 0.00,
      isSent: false,
      isPaid: false
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {

    this.unitOptions = [{
      country: '',
      lang: '',
      key: '',
      value: '',
      index: 0,
      isdefault: false,
      text: '-',
      sverity: ''
    }, ...this.sharedService.getEnums('productUnit')];

    const param: any = this.route.snapshot.params;

    if (param.invoiceId && (Number(param.invoiceId) > 0 && param.duplicate == 'false'))
      this.createInvoice = false;

    this.logger.info(param.offerId, param.workOrderId, param.customerId, param.invoiceId, param.duplicate);

    this.isLoading = true;
    this.invoiceService
      .getInvoice(param.offerId, param.workOrderId, param.customerId, param.invoiceId, param.duplicate)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          this.logger.info('invoice-fetched', response);
          this.defaultCustomerId = response.data.customerId;
          this.defaultCustomerName = response.data.customerName;
          this.selectedCustomerName = response.data.customerName;
          this.priceMode = response.data.priceMode;
          this.isNewObject = response.isNewObject;
          this.loadInvoiceToEdit(response.data, 'g.editinvoice');
          this.updateDueDate();
        },
        error: (err) => {
          this.errorHandler.handleError(err, 'ngOnInit', 'Failed to load invoice.');
        }
      });
  }
  trackByFn(index: number, detail: AbstractControl | null | undefined): number {
    if (detail && detail.get('rowIndex')) {
      return detail.get('rowIndex')?.value ?? index;
    }
    return index;
  }
  getFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
  loadInvoiceToEdit(response: any, key: string) {
    if (response.details) {
      response.details.forEach((detail: any) => {
        detail.isProductValid = true;
        detail.isUnitPriceValid = true;
      });

      this.invoice.patchValue(response);
      response.details.forEach((element: any) => {
        element.vatPercentage = element.vatPercentage.toString();
        this.details.push(this.fb.group(element));
      });
    }
    else {
      this.invoice.patchValue(response);
      this.addDetailRow(false);
    }

  }

  updateDueDate() {
    const invoiceCreditDays = Math.max(0, Number(this.invoice.get('creditDays')?.value) || 0);
    let newDate = new Date();
    if (this.invoice.get('invoiceDate')?.value !== '')
      newDate = new Date(this.invoice.get('invoiceDate')?.value);
    newDate.setDate(newDate.getDate() + invoiceCreditDays);
    this.invoice.patchValue({ dueDate: newDate.toISOString().split('T')[0] });
  }

  // customer selection
  onChangeCustomer($event: any) {
    this.invoice.patchValue({
      customerId: $event.customerId,
      customerName: $event.customerName,
      creditDays: Math.max(0, Number($event.invoiceCreditDays) || 0),
    });
    this.updateDueDate();
    this.errorOnCustomer = false;
  }

  onCreditDaysKeydown(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
      event.preventDefault();
    }
  }

  onChangeCreditDaysFromEvent(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onChangeCreditDays(value === '' ? 0 : Number(value));
  }

  onChangeCreditDays(value: number | null | undefined) {
    const creditDays = Math.max(0, Number(value ?? 0));
    this.invoice.patchValue({ creditDays });
    this.updateDueDate();
  }

  onSelectInvoiceDate(selectedInvoiceDate: Date) {
    this.logger.info('New Value');
    this.logger.info(this.sharedService.getDateString(selectedInvoiceDate));
    this.invoice.patchValue({ invoiceDate: this.sharedService.getDateString(selectedInvoiceDate) });
    this.updateDueDate();
  }

  // vehicle plate selection
  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
  }

  lookupVehicle(): void {
    const registrationNumber = this.invoice.get('vehiclePlate')?.value;
    if (!registrationNumber) {
      return;
    }
    this.isVehicleLookupLoading = true;
    this.coreService.getVehicle(registrationNumber)
      .pipe(
        finalize(() => { this.isVehicleLookupLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (vehicle) => {
          this.invoice.patchValue({
            vehicleManufacturer: vehicle.make,
            vehicleModel: vehicle.model,
            vehicleYear: vehicle.year ? Number(vehicle.year) : null,
          });
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
  }

  // invoice-detail
  addDetailRow(isTextRow: boolean) {
    const detailRow = this.fb.group({
      invoiceId: this.invoice.get('invoiceId')?.value,
      rowIndex: this.details.controls.length,
      category: this.sharedService.getDefaultEnum('detailCategory').value, //'part', 
      productId: [null],
      product: '',
      isProductValid: true,
      description: '',
      quantity: 1,
      unit: '',//this.sharedService.getDefaultEnum('productUnit').value,//this.defaultProductUnit,
      unitPrice: null,
      isUnitPriceValid: true,
      vatPercentage: this.sharedService.getDefaultEnum('vatPercentage').value, //this.defaultVatPercentage,
      discountPercentage: null,
      price: 0.00,
      vat: 0.00,
      priceIncVat: 0.00,
      textContent: undefined,
      isTextRow: isTextRow
    });
    this.details.push(detailRow);
  }

  updateDetailRow(detail: any) {
    if (Number(detail.get('unitPrice').value) > 0)
      detail.patchValue({ isUnitPriceValid: true });

    const quantity = Number(detail.get('quantity').value) < 0 ? 0 : Number(detail.get('quantity').value);
    const discountPercentage = Number(detail.get('discountPercentage').value) / 100;
    const vatPercentage = Number(detail.get('vatPercentage').value) / 100;

    this.logger.info('vatPercentage==' + vatPercentage);

    let unitPrice = 0.00;
    //if(this.priceMode == 1 || (this.priceMode == 2 && (this.customerType == 'company' || this.customerType == '' )))              
    if (this.priceMode == 1)
      unitPrice = Number(detail.get('unitPrice').value);

    //if(this.priceMode == 0 || (this.priceMode == 2 && (this.customerType == 'private' )))        
    if (this.priceMode == 0)
      unitPrice = Math.round((Number(detail.get('unitPrice').value) / (1 + vatPercentage)) * 100) / 100;

    unitPrice = unitPrice < 0 ? 0 : unitPrice;
    const totalPrice = Math.round(quantity * unitPrice * 100) / 100;
    const totalDiscount = Math.round(totalPrice * discountPercentage * 100) / 100;
    const price = (Math.round((totalPrice - totalDiscount) * 100) / 100);
    const vat = (Math.round(Number(price) * vatPercentage * 100) / 100).toFixed(2);

    this.logger.info('vat==' + vat);

    const priceIncVat = (Math.round((Number(price) + Number(vat)) * 100) / 100).toFixed(2);

    //this.logger.info('quantity=' + quantity + '\nunitprice=' + unitPrice + '\ndiscount=' + discountPercentage + '\nvat=' + vatPercentage+'\ntotalprice=' + totalPrice + '\nprice=' + price + '\ntotaldiscount=' + totalDiscount +'\nvat'+ vat + '\npriceincVat' + priceIncVat);
    detail.patchValue({ price: price, vat: vat, priceIncVat: priceIncVat, vatPercentage: detail.get('vatPercentage').value.toString() });
    this.logger.info('detail patched with new values');
    this.logger.info(detail.value);

    this.updateInvoice();
  }

  removeDetailRow(rowIndex: number) {
    this.details.removeAt(rowIndex);
    this.details.controls.forEach((item: any, rowIndex: number) => {
      item.patchValue({ rowIndex: rowIndex });
    });
    this.updateInvoice();
  }

  updateInvoice(): void {

    var price = this.details.controls.reduce((sum: number, item: any) => {
      const price = Number(item?.get('price').value) || 0; // Ensure it's a number
      return sum + price;
    }, 0);
    price = (Math.round(price * 100) / 100).toFixed(2);
    var vat = this.details.controls.reduce((sum: number, item: any) => {
      const price = Number(item?.get('vat').value) || 0; // Ensure it's a number
      this.logger.info('price==' + price);
      return sum + price;
    }, 0);

    vat = (Math.round(vat * 100) / 100).toFixed(2);

    let priceIncVat = Math.round((Number(price) + Number(vat)) * 100) / 100;
    let decimalPart = Number(priceIncVat.toFixed(2).toString().split(".")[1]);
    let adjustment = '';
    if (decimalPart >= 50 && decimalPart <= 99) {
      adjustment = ((100 - decimalPart) / 100).toFixed(2);
    }
    else {
      adjustment = ((decimalPart / 100) * -1).toFixed(2);
    }
    priceIncVat = priceIncVat + Number(adjustment);
    // I have commented below code to avoid negative adjustment issue
    // let originalSign = priceIncVat < 0 ? -1 : 1;
    // priceIncVat = Math.abs(priceIncVat) + Number(adjustment);
    // priceIncVat = priceIncVat * originalSign;

    this.invoice.patchValue({ price: price, vat: vat, adjustment: adjustment, priceIncVat: priceIncVat });
  }

  onChangeVat(detail: any) {
    //this.logger.info(e.target.value);
    this.logger.info(detail.value.vatPercentage);

    detail.patchValue({ vatPercentage: detail.value.vatPercentage })
    this.updateDetailRow(detail);
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.details.controls, event.previousIndex, event.currentIndex);
      this.details.controls.forEach((item: any, index: number) => {
        item.patchValue({ rowIndex: index });
      });
      this.updateInvoice();
    }
  }

  onDragStart(event: any, detail: any) {
    detail.isDragging = true;
  }

  onDragEnd(event: any, detail: any) {
    detail.isDragging = false;
  }


  onEnter(event: any): void {
    // const keyboardEvent = event as KeyboardEvent;
    event.preventDefault();
  }
  onFormSubmit() {
    this.errorOnCustomer = false;
    var invoice: IInvoice = this.invoice.value;
    if (this.invoice.invalid || !invoice.customerId) {
      this.invoice.markAllAsTouched();
      showValidationErrorToast(
        this.messageService,
        (key) => this.sharedService.T(key)
      );

      return;
    }
    invoice.details = [];

    for (const detail of this.details.controls) {
      const isProductValid = detail.get('product')?.value || detail.get('isTextRow') ? true : false;
      const isUnitPriceValid = detail.get('unitPrice')?.value || detail.get('isTextRow') ? true : false;
      detail.patchValue({ isProductValid: isProductValid, isUnitPriceValid: isUnitPriceValid });
      invoice.details.push(detail.value);
    }

    const invalidDetails = this.details.controls.filter(
      (detail: AbstractControl) => detail.get('isProductValid')?.value === false || detail.get('isUnitPriceValid')?.value === false
    );

    this.logger.info('invoide', invoice);

    if (invalidDetails.length > 0) {
      this.invoice.markAllAsTouched();
      showValidationErrorToast(
        this.messageService,
        (key) => this.sharedService.T(key),
        'checkProductRows'
      );
      return;
    }

    this.isLoading = true;
    this.logger.info('Submitting invoice:', invoice);
    (this.isNewObject
      ? this.invoiceService.createInvoice(invoice)
      : this.invoiceService.updateInvoice(invoice)
    )
      .pipe(
        catchError((err) => {
          this.isLoading = false;
          console.log(err);
          throw err;
        })
      )
      .subscribe((res: any) => {
        this.isLoading = false;

        // create-invoice returns the new InvoiceId (a number); update-invoice returns true —
        // neither has a `.data.invoiceId` shape, so use the real created id on create rather
        // than the form's stale placeholder invoiceId.
        const savedInvoiceId = this.isNewObject && typeof res === 'number' ? res : invoice.invoiceId;
        this.router.navigate([`sv/invoice/details/${savedInvoiceId}`]);
      });
  }
  onCancelForm() {
    this.location.back();
  }

  redirectToInvoiceDetailComponent() {
    this.router.navigate(['/details', this.invoice.get('invoiceId')]);
  }
  GenerateInvoiceDescription(event: any, selectedCategory: IEnums, index: number) {
    this.selectedContext = [selectedCategory];
    let selectectContextValue = '';
    if (this.selectedContext) {
      selectectContextValue = this.selectedContext[0].value;
    }
    const items: IInvoiceDetailPrompt[] = this.details.controls.map((item: any) => ({
      type: item.get('category')?.value,
      name: item.get('product')?.value,
      description: item.get('description')?.value,
      quantity: item.get('quantity')?.value,
      unit: item.get('unit')?.value,
    }));
    this.logger.info('GenerateInvoiceDescription', { index });
    const textareaControl = this.details.controls[index].get('textContent');
    this.isLoading = true;
    this.aiService
      .generateInvoiceDescription({context: selectectContextValue,items:items})
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
            textareaControl.setValue(res.text);
            this.logger.info('GenerateInvoiceDescription success', { index });
            this.messageService.add({
              severity: 'success',
              summary: this.sharedService.T('success'),
              icon: 'pi pi-check-circle'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              detail: this.sharedService.T('errorMessage'),
            });
          }
        },
        error: (err) => {
          this.errorHandler.handleError(err, 'GenerateInvoiceDescription', 'Failed to generate description.');
        }
      });
  }

  // customer-input
  filterCustomer(event: any) {
    let query = event.query;
    this.customerService
      .getCustomerByPrefix(query)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.customers = res;
            this.logger.info('filterCustomer success', { customerCount: this.customers.length });
          }
        },
        error: (err) => {
          this.errorHandler.handleError(err, 'filterCustomer', 'Failed to load customers.');
        }
      });
  }

  onSelect(event: any) {
    this.invoice.patchValue({
      customerId: event.value.customerId,
      customerName: event.value.customerName,
    });
    this.selectedCustomerName = event.value.customerName;
  }
  onUnselectCustomer() {
    this.invoice.patchValue({
      customerId: null,
      customerName: null,
    });
    this.selectedCustomerName = null;
  }
}


