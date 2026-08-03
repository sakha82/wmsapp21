import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ICustomer, IEnums, IInvoiceDetailPrompt, IOffer } from 'app/app.model';
import { CustomerService } from 'app/services/customer.service';
import { SharedService } from 'app/services/shared.service';
import { CoreService } from 'app/services/core.service';
import { OfferService } from 'app/services/offer.service';
import { LogService } from 'app/services/log.service';
import { WorkshopService } from 'app/services/workshop.service';
import { MenuItem, MessageService,ConfirmationService } from 'primeng/api';
import { catchError, finalize, takeUntil, Subject } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { AiService } from 'app/services/ai.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { adjustmentValidator, isFormControlInvalid, showValidationErrorToast } from 'app/validators/model-validators';

@Component({
  selector: 'app-create-offer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ProgressSpinnerModule,
    GenericLoaderComponent,
    DragDropModule,
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
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule,
    TextareaModule,
    TooltipModule,
    MessageModule,
    DialogModule,
    SplitButtonModule
  ], templateUrl: './offer-crud.component.html',
  styleUrl: './offer-crud.component.css',
  providers: [MessageService, ConfirmationService]
})

export class OfferCrudComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  offer: FormGroup;
  details: any = new FormArray([])

  templates: MenuItem[] = [];

  isNewObject: boolean = true;
  createOffer: boolean = true;
  errorOnCustomer: boolean = false;
  isSpinnerLoading: boolean = false;
  isVehicleLookupLoading: boolean = false;
  isLoading: boolean = true
  priceMode: number = 0;
  defaultCustomerId: number | null = null;
  defaultCustomerName: string | null = null;
  customerType: string = '';
  unitOptions: IEnums[] = [];
  selectedContext: IEnums[] | null = null;
  // added flag to mirror workOrder logic
  submitted: boolean = false;
  selectedCustomerName: any = null;
  customers: ICustomer[] = [];
  constructor(private logger: LogService,
    public readonly sharedService: SharedService,
    private readonly coreService: CoreService,
    private router: Router,
    private readonly fb: FormBuilder,
    private customerService: CustomerService,
    private readonly offerService: OfferService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private messageService: MessageService,
    private workshopService: WorkshopService,
    private aiService: AiService,) {

    this.offer = this.fb.group({
      offerId: '',
      customerId: [null, [Validators.required, Validators.min(1)]],
      offerDate: [new Date().toISOString().split('T')[0], Validators.required],
      vehiclePlate: [null, Validators.required],
      vehicleMileage: 0,
      vehicleManufacturer: '',
      vehicleModel: '',
      vehicleYear: [null, [Validators.pattern(/^\d{4}$/)]],
      validDays: [10, [Validators.min(0)]],
      validFrom: [new Date().toISOString().split('T')[0], Validators.required],
      validTill: [new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0], Validators.required],
      yourRef: '',
      paymentType: [this.sharedService.getDefaultEnum('paymentType').value, Validators.required],
      price: [0.0, [Validators.min(0)]],
      vat: [0.0, [Validators.min(0)]],
      adjustment: [0.0, [adjustmentValidator()]],
      priceIncVat: 0.00,
      isSent: false,
      isAccepted: false,
      isRejected: false,
      offerType: this.sharedService.getDefaultEnum('offerType').value,
    });
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
    if (param.offerId && (Number(param.offerId) > 0 && param.duplicate == 'false'))
      this.createOffer = false;

    this.logger.info(param.offerId, param.customerId, param.duplicate);
    this.isLoading = true;
    this.offerService
      .getOffer(param.offerId, param.customerId, param.duplicate)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          this.defaultCustomerId = response.data.customerId;
          this.defaultCustomerName = response.data.customerName;
          this.priceMode = response.data.priceMode;
          this.isNewObject = response.isNewObject;
          this.loadOfferToEdit(response.data, 'editinvoice');
        },
        error: (err) => {
          this.logger.error('ngOnInit getOffer error', err);
        }
      });
  }
  trackByFn(index: number, detail: AbstractControl | null | undefined): number {
    if (detail && detail.get('rowIndex')) {
      return detail.get('rowIndex')?.value ?? index;
    }
    return index; // Fallback to index if detail or rowIndex is undefined
  }
  getFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  loadOfferToEdit(response: any, key: string) {
    if (response.details) {
      response.details.forEach((detail: any) => {
        detail.isProductValid = true;
        detail.isUnitPriceValid = true;
      });
      this.offer.patchValue(response);
      response.details.forEach((element: any) => {
        element.vatPercentage = element.vatPercentage.toString();
        this.details.push(this.fb.group(element));
      });
    }
    else {
      this.offer.patchValue(response);
      this.addDetailRow(false);
    }

  }

  onDragStart(event: any, detail: any) {
    detail.isDragging = true;
  }

  onDragEnd(event: any, detail: any) {
    detail.isDragging = false;
  }

  onChangeCustomer($event: any) {
    this.logger.info($event);
    this.offer.patchValue({ customerId: $event.customerId, customerName: $event.customerName });
    // clear customer error flag when a customer is selected
    this.errorOnCustomer = false;
  }

  updateValidTillDate() {
    const days = Math.max(0, Number(this.offer.get('validDays')?.value) || 0);
    if (days !== Number(this.offer.get('validDays')?.value)) {
      this.offer.patchValue({ validDays: days });
    }
    let newDate = new Date(this.offer.get('validFrom')?.value);
    newDate.setDate(newDate.getDate() + days);
    this.offer.patchValue({
      validTill: newDate.toISOString().split('T')[0]
    });
  }

  onValidDaysKeydown(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+') {
      event.preventDefault();
    }
  }

  isOfferControlInvalid(fieldName: string): boolean {
    return isFormControlInvalid(this.offer, fieldName, this.submitted || this.errorOnCustomer);
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
  }

  lookupVehicle(): void {
    const registrationNumber = this.offer.get('vehiclePlate')?.value;
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
          this.offer.patchValue({
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

  addDetailRow(isTextRow: boolean) {
    const detailRow = this.fb.group({
      offerId: this.offer.get('offerId')?.value,
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


  // Here we are getting complete detailrow to update
  updateDetailRow(detail: any) {
    if (Number(detail.get('unitPrice').value) > 0)
      detail.patchValue({ isUnitPriceValid: true });

    const quantity = Number(detail.get('quantity').value) < 0 ? 0 : Number(detail.get('quantity').value);
    const discountPercentage = Number(detail.get('discountPercentage').value) / 100;
    const vatPercentage = Number(detail.get('vatPercentage').value) / 100;

    this.logger.info('vatPercentage==' + vatPercentage);

    let unitPrice = 0.00;
    if (this.priceMode == 1)
      unitPrice = Number(detail.get('unitPrice').value);

    if (this.priceMode == 0)
      unitPrice = Math.round((Number(detail.get('unitPrice').value) / (1 + vatPercentage)) * 100) / 100;

    unitPrice = unitPrice < 0 ? 0 : unitPrice;
    const totalPrice = Math.round(quantity * unitPrice * 100) / 100;
    const totalDiscount = Math.round(totalPrice * discountPercentage * 100) / 100;
    const price = (Math.round((totalPrice - totalDiscount) * 100) / 100);
    const vat = (Math.round(Number(price) * vatPercentage * 100) / 100).toFixed(2);

    this.logger.info('vat==' + vat);

    const priceIncVat = (Math.round((Number(price) + Number(vat)) * 100) / 100).toFixed(2);

    detail.patchValue({ price: price, vat: vat, priceIncVat: priceIncVat, vatPercentage: detail.get('vatPercentage').value.toString() });
    this.logger.info('detail patched with new values');
    this.logger.info(detail.value);

    this.updateOffer();
  }

  removeDetailRow(rowIndex: number) {
    this.details.removeAt(rowIndex);
    this.details.controls.forEach((item: any, rowIndex: number) => {
      item.patchValue({ rowIndex: rowIndex });
    });
    this.updateOffer();
  }

  updateOffer(): void {

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


    this.offer.patchValue({ price: price, vat: vat, adjustment: adjustment, priceIncVat: priceIncVat });
  }



  onChangeVat(detail: any) {
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
      this.updateOffer();
    }
  }

  onEnter(event: any): void {
    const keyboardEvent = event as KeyboardEvent;
    event.preventDefault();  // Prevents form submission
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
    this.logger.info('index=' + index);
    const textareaControl = this.details.controls[index].get('textContent');
    this.aiService
      .generateInvoiceDescription({ context: selectectContextValue, items: items })
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
            this.messageService.add({
              severity: 'success',
              summary: this.sharedService.T('success'),
              icon: 'pi pi-check-circle'
            });
          }
          else {
            this.messageService.add({
              severity: 'error',
              detail: this.sharedService.T('errorMessage'),
            });
          }
        },
        error: (err) => {
          this.logger.error('GenerateInvoiceDescription error', err);
        }
      });
  }
  onFormSubmit() {
    this.isLoading = true;
    this.errorOnCustomer = false;
    this.submitted = true;

    if (this.offer.invalid || !this.offer.get('customerId')?.value) {
      this.offer.markAllAsTouched();
      this.errorOnCustomer = true;
      showValidationErrorToast(
        this.messageService,
        (key) => this.sharedService.T(key)
      );
      this.isLoading = false;
      return;
    }

    var offer: IOffer = this.offer.value;
    offer.details = [];

    for (const detail of this.details.controls) {
      const isProductValid = detail.get('product')?.value || detail.get('isTextRow') ? true : false;
      const isUnitPriceValid = detail.get('unitPrice')?.value || detail.get('isTextRow') ? true : false;
      detail.patchValue({ isProductValid: isProductValid, isUnitPriceValid: isUnitPriceValid });
      offer.details.push(detail.value);
    }

    // details-level validation: show error + stop
    const invalidDetails = this.details.controls.filter(
      (detail: AbstractControl) => detail.get('isProductValid')?.value === false || detail.get('isUnitPriceValid')?.value === false
    );

    if (invalidDetails.length > 0) {
      this.offer.markAllAsTouched();
      showValidationErrorToast(
        this.messageService,
        (key) => this.sharedService.T(key),
        'checkProductRows',
        3500
      );
      this.isLoading = false;
      return;
    }
    (this.isNewObject
      ? this.offerService.createOffer(offer)
      : this.offerService.updateOffer(offer)
    )
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          // create-offer returns the new OfferId (a number); update-offer returns true — use
          // the real created id on create rather than the form's stale placeholder offerId.
          const savedOfferId = this.isNewObject && typeof res === 'number' ? res : offer.offerId;
          this.router.navigate([`sv/offer/details/${savedOfferId}`]);
        },
        error: (err) => {
          this.logger.error('onFormSubmit error', err);
        }
      });
  }

  onCancelForm() {
    this.location.back();
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
          }
        },
        error: (err) => {
          this.logger.error('filterCustomer error', err);
        }
      });
  }

  onSelect(event: any) {
    this.offer.patchValue({
      customerId: event.value.customerId,
      customerName: event.value.customerName,
    });
    this.selectedCustomerName = event.value.customerName;
  }
  onUnselectCustomer() {
    this.offer.patchValue({
      customerId: null,
      customerName: null,
    });
    this.selectedCustomerName = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}    
