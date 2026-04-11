import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { IProduct, IInventory } from 'app/app.model';
import { SharedService } from 'app/services/shared.service';
import { ProductService } from 'app/services/product.service';
import { LogService } from 'app/services/log.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import {  firstValueFrom, switchMap, finalize, takeUntil, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IconFieldModule, InputIconModule, ProgressSpinnerModule, ButtonModule, SelectModule, CheckboxModule, TableModule, DialogModule, ToastModule, InputTextModule,InputNumberModule,MessageModule,TooltipModule,DatePickerModule,ConfirmDialogModule],
  styleUrl: './product-list.component.css',
  templateUrl: './product-list.component.html',
  providers: [ConfirmationService, MessageService],

})
export class ProductListComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  products: IProduct[] = [];
  product!: FormGroup;
  filters: FormGroup;
  inventoryForm!: FormGroup;
  uccessProductLabel: string = '';
  failProductLabel: string = '';
  latestProductId: number | null = null;
  loadingDelete: boolean = false;
  isLoading: boolean = true;
  showProductDialog = false;
  isInventoryChecked: boolean = false;
  includeBaseProducts: boolean = false;
  isSelingProductChecked: boolean = false;
  isNewObject: boolean = true;
  showInventoryDialog = false;
  selectedProduct: any = null;
  originalProductName: string = '';
  
  currentProductId: number = 0;
  hideDeletedProducts = true;
  constructor(
    private logger: LogService,
    public readonly sharedService: SharedService,
    private readonly fb: FormBuilder,
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private readonly route: ActivatedRoute,
  ) {

    this.filters = this.fb.group({
      category: null,
      inventory: false,
      sale: false,
      isActive: 1,
      includeBase:false
    });

    this.product = this.fb.group({
      productId: [0],
      category: [this.sharedService.getDefaultEnum('detailCategory').text, Validators.required],
      productName: ['', Validators.required],
      productDescription: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit: [this.sharedService.getDefaultEnum('productUnit').value, Validators.required],
      unitPrice: [0,Validators.required],
      vatPercentage: [this.sharedService.getDefaultEnum('vatPercentage').value]
    });

    this.inventoryForm = this.fb.group({
      inventoryDate: [new Date().toISOString().split('T')[0], Validators.required],
      inventoryQuantity: [0, Validators.required],
      inventoryNote: ['']
    });


  }
  ngOnInit() {
    this.isLoading = true;
    this.getProducts();
  }
  
  getProducts(): void {
    this.isLoading = true; 
    this.logger.info('getProducts called with filters:');
    this.logger.info(this.filters.value);
    this.productService.getProducts(this.filters)
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.logger.info('ompleted...');
          this.products = res;
          this.logger.info(this.products);
        },
        error: (err) => {
          this.logger.error(err);
        }
      });
  }
  getProduct(productId: number) {
    this.logger.info('Fetching product with ID:', productId);
    this.productService.getProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.logger.info('Product fetched successfully:', response);
          this.isNewObject = response.isNewObject;
          this.logger.info('New Object:', this.isNewObject);
          if(this.isNewObject)
          {
            this.product.patchValue({
              productId: response.data.productId,
              category: this.sharedService.getDefaultEnum('detailCategory').value,
              productName: '',
              productDescription: '',
              quantity: 1,
              unit: this.sharedService.getDefaultEnum('productUnit').value,
              unitPrice: 0,
              vatPercentage: this.sharedService.getDefaultEnum('vatPercentage').value,
              isUpdate: false
            });
            
          }
          else 
          {
            this.product.patchValue(response.data);
            this.product.patchValue({ vatPercentage: response.data.vatPercentage.toString(),isUpdate: true });
          }
          this.showProductDialog = true;
        },
        error: (err) => {
          this.logger.error(err);
        }
      });
    
  }

  deleteProduct(product: any) {
    const newStatus = product.isActive === 0;
    // Translation labels ke mutabiq messages
    const message = newStatus
      ? this.sharedService.T('enableProduct') + '?'
      : this.sharedService.T('disableProduct') + '?' ;

    this.confirmationService.confirm({
      message: message,
      header: this.sharedService.T('confirmation'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.sharedService.T('yes'),
      rejectLabel: this.sharedService.T('no'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.isLoading = true;

        this.productService.setProductStatus(this.sharedService.wmsId, product.productId, newStatus)
          .pipe(
            finalize(() => { this.isLoading = false; }),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (res) => {
              if (res) {
                this.messageService.add({ severity: 'success', summary: this.sharedService.T('success'), icon: 'pi pi-check-circle' });
                this.getProducts(); // List refresh karein
              }
            },
            error: (err) => {
              this.logger.error(err);
              this.messageService.add({ severity: 'error', summary: '', detail: this.sharedService.T('sentErrorMessage') });
            }
          });
      },
    });
  }
  async saveProduct() {
    this.product.markAllAsTouched();
    if (this.product.invalid) {
      return;
    }

    this.isLoading = true;
  
    this.logger.info('Printing:', this.product);

    const product: IProduct = this.product.value;
    this.logger.info('Submitting product form with values:', this.product);
    const currentProductName = product.productName.trim();

    try {
      if (
        (this.isNewObject && currentProductName.toLowerCase() !== this.originalProductName.toLowerCase())
      ) {

        const exists = await firstValueFrom(
          this.productService.isProductExists(this.sharedService.wmsId, currentProductName)
        );
        if (exists) {
          this.isLoading = false;
          this.messageService.add({
            severity: 'warn',
            summary: this.sharedService.T('duplicate'),
            detail: `"${currentProductName}" ${this.sharedService.T('alreadyExists')}`,
            life: 6000
          });
          return;
        }
      }
      const res: any = await firstValueFrom(
        this.productService.upsertProduct(product)
      );
      this.isLoading = false;
      if (res === true || res?.success === true || res?.productId) {
        this.messageService.add({ severity: 'success', summary: this.sharedService.T('success'), icon: 'pi pi-check-circle' });        this.getProducts();
        this.closeProductDialog();
      }

    } catch (error) {
      this.isLoading = false;
      this.logger.error('Form submission failed:', error);
    }
  }

  onChangeCategory(event: any) {
    const value = event?.value || '';
    this.filters.patchValue({ category: value });
    this.sharedService.updateFiltersInNavigation(this.filters);
    this.getProducts();
  }

  onClearCategory() {
    this.filters.patchValue({ category: '' });
    this.sharedService.updateFiltersInNavigation(this.filters);
    this.getProducts();
  }

  closeProductDialog() {
    this.showProductDialog = false;
  }

  onChangeInventoryChecked(event: any): void {
    const checked = event.checked;
    this.filters.patchValue({ inventory: checked });
    //this.filters.patchValue({ currentPage: 1 });
    this.sharedService.updateFiltersInNavigation(this.filters);
    this.getProducts();
  }
  onChangeSellingProduct(event: any): void {
    const checked = event.checked;
    this.filters.patchValue({ sale: checked });
    this.filters.patchValue({ currentPage: 1 });
    this.sharedService.updateFiltersInNavigation(this.filters);
    this.getProducts();
  }

  onChangeIncludeBaseProducts(event: any): void {
    
    this.includeBaseProducts = event.checked;
    this.filters.patchValue({ includeBase: this.includeBaseProducts });
    this.filters.patchValue({ currentPage: 1 });
    this.sharedService.updateFiltersInNavigation(this.filters);
    this.getProducts();
  }
  
  redirectToProductDetail(productId: number) {
    this.router.navigate(['sv/product/details', productId]);
  }


  HideDeletedProducts(event: any) {
    const checked = event.checked;
    this.filters.patchValue({
      isActive: checked ? 1 : ''
    });
    this.sharedService.updateFiltersInNavigation(this.filters);
    this.getProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
