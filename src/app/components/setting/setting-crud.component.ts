import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ICustomerTag, IWorkshop, ISelect, IPager, IWorkShopService, IEnums } from 'app/app.model';
import { SharedService } from 'app/services/shared.service';
import { CoreService } from 'app/services/core.service';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { LogService } from 'app/services/log.service';
import { WorkshopService } from 'app/services/workshop.service';
import { CustomerService } from 'app/services/customer.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { catchError, Observable, finalize, takeUntil, Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule,
    SelectButtonModule,
    ImageModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    ToastModule,
    MessageModule,
    ConfirmDialogModule,
    TableModule,
    InputNumberModule,
     TooltipModule,
     CheckboxModule,
     DatePickerModule,
     RadioButtonModule,
     GenericLoaderComponent
  ],
  templateUrl: './setting-crud.component.html',
  styleUrl: './setting-crud.component.css',
  providers: [ConfirmationService, MessageService],
})
export class SettingCrudComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  langCode: string = 'en';
  
  palettes = [
  { label: 'Professional Blue', value: 'blue', color: '#3b82f6' },     // Default
  { label: 'Modern Indigo',     value: 'indigo', color: '#4f46e5' },
  { label: 'Industrial Teal',   value: 'teal', color: '#0d9488' },
  { label: 'Minimal Slate',     value: 'slate', color: '#64748b' },
  { label: 'Fresh Emerald',     value: 'emerald', color: '#10b981' },
  { label: 'Deep Red',          value: 'red', color: '#b91c1c' }       // Muted red (not alert red)
];


 selectedPriceMode:any = '';
 selectedInvoiceTemplate:any = '';
 selectedSaleYear:string = new Date().getFullYear().toString();
 isSpinnerLoading: boolean = false;
 workshop: FormGroup;
 workshopServiceForm: FormGroup;
  saleTarget: FormGroup;
  salesList: any[] = [];
  isEditMode: boolean = false;
  
  latestServiceId: string = '';
  editingService: IWorkShopService | null = null;
  isLoading: boolean = false;

  customerTags: ICustomerTag[] = [];
  fTaxOptions = [
    { label: 'Ja', value: true },
    { label: 'Nej', value: false }
  ];
  //priceModeOptions: IEnums[] = [];
  unitOptions: IEnums[] = [];
  newCustomerTag: ICustomerTag = {
    wmsId: '',
    customerTagId: 0,
    customerTagName: '',
    customerCount: 0,
    isDefault: false
  };

  isTagEditing: boolean = false;
  editingTagIndex: number | null = null;
  imageUrl: string = '';
  fileKey: string = '';
  invoiceTemplates:any[] = [{value: 'basic', name: 'Basic Template' }, {value: 'modern', name: 'Modern Template'}];
  selectedTemplateCardIndex: number = -1;

  constructor(
    private logger: LogService,
    public readonly sharedService: SharedService,
    private readonly coreService: CoreService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private readonly fb: FormBuilder,
    private readonly workshopService: WorkshopService,
    private readonly customerService: CustomerService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.workshop = this.fb.group({
      workshopName: [],
      registrationId: [],
      vatId: [],
      workshopStreet: [],
      workshopPostNo: [],
      workshopCity: [],
      workshopCountry: [],
      telephone: [],
      email: ['', [Validators.email]],
      bankgiro: '',
      swish: '',
      bic: '',
      iban: '',
      hourlyRate:'',
      
      isFskat: [false],
      defaultLang: '',
      defaultTheme: ''
    });

    this.workshopServiceForm = this.fb.group({
      serviceName: ['', Validators.required],
      serviceHours: [1, [Validators.required, Validators.min(0)]],
    });

    this.saleTarget = this.fb.group({
      wmsId: this.sharedService.wmsId,
      datePeriod: [null, Validators.required],
      turnover: [0, [Validators.required, Validators.min(1)]]
    });

  }

  ngOnInit(){
   
    // adding default option to unit dropdown
    this.unitOptions = [{country: '',lang: '',key: '',value: '',index: 0,isdefault: false,text: '-',sverity: ''}, ...this.sharedService.getEnums('productUnit')];
    this.workshopService
      .getWorkshop()
      .pipe(
        finalize(() => {}),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (!response) return;
          this.logger.info(response);
          if (typeof response.isFskat === 'string') {
            response.isFskat = response.isFskat === 'true';
          }
          this.workshop.patchValue(response);
          this.selectedPriceMode = this.sharedService.getEnumByValue('priceMode', response.priceMode);
          this.selectedInvoiceTemplate = this.invoiceTemplates.find(template => template.value === response.defaultInvoiceTemplate);
          this.logger.info('priceMode and Template:', this.selectedPriceMode, this.selectedInvoiceTemplate);
        },
        error: (err) => {
          this.logger.error('Error loading workshop:', err);
        }
      });
      

    this.loadCustomerTags();
    this.loadLogo();
    this.loadSaleTargets(this.selectedSaleYear);
  }

  // Company Tab 
   saveWorkshopSettings() 
  {
    if (this.workshop.invalid) {
      const emailControl = this.workshop.get('email');
      if (emailControl?.hasError('email')) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Invalid Email',
          detail: 'Please enter a valid email format (e.g., name@example.com).',
          life: 4000,
        });
      }
      this.workshop.markAllAsTouched();
      return;
    }

    const editedWorkshop: IWorkshop = this.workshop.value;
    editedWorkshop.priceMode = Number(this.selectedPriceMode.value); 
    editedWorkshop.defaultInvoiceTemplate = this.selectedInvoiceTemplate.value;

    editedWorkshop.isFskat = this.workshop.get('isFskat')?.value === true;
    this.workshopService
    .updateWorkshop(editedWorkshop)
    .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
           this.messageService.add({
        severity: 'success',
        summary: this.sharedService.T('success'),
        icon: 'pi pi-check-circle',
        detail: 'Workshop updated successfully!',
      });
      this.router.navigate(['sv/setting']);
        sessionStorage.setItem('HourlyRate', this.workshop.get('hourlyRate')?.value.toString());  
        }
        },
        error: (err) => {
          this.logger.error('Error updating workshop:', err);
        }
      });
    
  }

  loadLogo() {
    this.isLoading = true;
    this.workshopService.listFiles()
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (files) => {
          if (files?.length) {
            this.fileKey = files[0].key;
            this.showFile(this.fileKey);
          }
        },
        error: (err) => {
          this.logger.error('Error loading logo:', err);
        }
      });
  }
  showFile(key: string) {
    this.workshopService.downloadFile(key)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imageUrl = e.target.result;
          };
          reader.readAsDataURL(blob);
        },
        error: (err) => {
          this.logger.error('Error downloading file:', err);
        }
      });
  }
  downloadFile(key: string) {
    this.logger.log('Downloading file with key:', key);
    this.coreService.downloadFile(key);
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => this.imageUrl = e.target.result;
    reader.readAsDataURL(file);
    this.isLoading = true;
    this.workshopService.uploadFile(file)
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          this.messageService.add({
            severity: 'success',
            summary: this.sharedService.T('success'),
            icon: 'pi pi-check-circle',
            life: 4000
          });
          if (response?.key) this.fileKey = response.key;
        },
        error: (err) => {
          this.logger.error('File upload failed:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Upload Error',
            detail: 'Failed to upload image. Please try again.',
            life: 5000
          });
        }
      });
  }

  // Customer Tab
  loadCustomerTags() {
    this.customerService
      .getCustomerTags()
      .pipe(
        finalize(() => {}),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response)
            this.customerTags = response;
        },
        error: (err) => {
          this.logger.error('Error loading customer tags:', err);
        }
      });
  }
  saveCustomerTag(): void {

    const alreadyDefault = this.customerTags.some((t, i) =>
      t.isDefault && (!this.isTagEditing || i !== this.editingTagIndex)
    );

    if (this.newCustomerTag.isDefault && alreadyDefault) {
      this.messageService.add({
        severity: 'error',
        summary: 'Default Tag Error',
        detail: 'A default tag already exists. Only one default tag allowed.',
        life: 3000
      });
      return;
    }

    if (this.newCustomerTag.customerTagName.trim()) {

      let isUpdate = false;

      if (this.isTagEditing && this.editingTagIndex !== null) {
        isUpdate = true;
        this.customerTags[this.editingTagIndex] = { ...this.newCustomerTag };
        this.isTagEditing = false;
        this.editingTagIndex = null;
      } else {
        this.newCustomerTag.customerTagId = 0;
      }

      this.isLoading = true;

      this.customerService
        .saveCustomerTag(this.newCustomerTag)
        .pipe(
          finalize(() => { this.isLoading = false; }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (response: any) => {
            if (response) {
              this.loadCustomerTags();
              this.messageService.add({
                severity: 'success',
                summary: this.sharedService.T('success'),
                icon: 'pi pi-check-circle',
                life: 2000
              });
            }
            this.resetCustomerTag();
          },
          error: (err) => {
            this.logger.error('Error saving tag:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Save Failed',
              detail: 'Unable to save tag. Please try again.',
              life: 3000
            });
          }
        });
    }
  }

  editCustomerTag(index: number): void {
    const tag = this.customerTags[index];
    this.newCustomerTag = { ...tag };
    this.isTagEditing = true;
    this.editingTagIndex = index;
  }

  resetCustomerTag(): void {
    this.newCustomerTag = {
      wmsId: '',
      customerTagId: 0,
      customerTagName: '',
      customerCount: 0,
      isDefault: false
    };
    this.isTagEditing = false;
    this.editingTagIndex = null;
  }
  removeCustomerTag(index: number): void {
    const tag = this.customerTags[index];
    if (tag.customerCount > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Cannot Delete Tag',
        detail: `This tag is used by ${tag.customerCount} customers.`,
        life: 3000
      });
      return;
    }
    this.isLoading = true;
    this.customerService
      .deleteCustomerTag(tag.customerTagId)
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.customerTags.splice(index, 1);
          if (this.isTagEditing && this.editingTagIndex === index) {
            this.resetCustomerTag();
          }
          this.messageService.add({
            severity: 'success',
            summary: this.sharedService.T('success'),
            icon: 'pi pi-check-circle',
            life: 2000
          });
        },
        error: (err) => {
          this.logger.error('Error deleting tag:', err);
        }
      });
  }

  // workorder Tab
  get isCreateMode(): boolean {
    return !this.editingService;
  }

  // Sale Target Tab
  loadSaleTargets(saleYear:string) {
  this.isLoading = true;
  this.workshopService.getSaleTarget(saleYear)
    .pipe(
      finalize(() => { this.isLoading = false; }),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (res: any) => {
        this.salesList = res.objectList || [];
      },
      error: (err) => {
        this.logger.error('Sales load fail:', err);
      }
    });
}
onSaleTargetYearChange(event: any){
  this.logger.info(event.value);
  this.selectedSaleYear = event.value;
  this.loadSaleTargets(this.selectedSaleYear);

}

saveSaleTarget() {
  if (this.saleTarget.invalid) return;
  this.isLoading = true;
  const selectedDate = this.saleTarget.value.datePeriod as Date;
  const payload = {
    wmsId: this.sharedService.wmsId,
    saleYear: selectedDate.getFullYear(),
    saleMonth: selectedDate.getMonth() + 1,
    turnover: this.saleTarget.value.turnover
  };

  this.workshopService.insertSale(payload)
    .pipe(
      finalize(() => { this.isLoading = false; }),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: () => {
        this.loadSaleTargets(this.selectedSaleYear);
        this.saleTarget.reset({ turnover: 0 });
      },
      error: (err) => {
        this.logger.error('Error saving sale target:', err);
      }
    });
}
deleteSaleTarget(sale: any) {
  this.confirmationService.confirm({
    message: 'Are you sure you want to delete this sales target?',
    header: 'Confirm Deletion',
    accept: () => {
      this.isLoading = true;
      this.workshopService.deleteSale(sale.wmsId, sale.saleYear, sale.saleMonth)
        .pipe(
          finalize(() => { this.isLoading = false; }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: this.sharedService.T('success'), icon: 'pi pi-check-circle' });
            this.loadSaleTargets(this.selectedSaleYear);
          },
          error: (err) => {
            this.logger.error('Error deleting sale target:', err);
          }
        });
    }
  });
}

onTemplateCardHover(index: number, isHovering: boolean): void {
  this.selectedTemplateCardIndex = isHovering ? index : -1;
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

}
