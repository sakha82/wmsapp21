import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IPager } from 'app/app.model';
import { SharedService } from 'app/services/shared.service';
import { SupplierService } from 'app/services/supplier.service';
import { LogService } from 'app/services/log.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { catchError, debounceTime, distinctUntilChanged, finalize, takeUntil, Subject } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    TableModule,
    PaginatorModule,
    DialogModule,
    TextareaModule
  ],
  templateUrl: './supplier-list.component.html',
  providers: [ConfirmationService, MessageService],
})
export class SupplierListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  suppliers: any[] = [];
  supplierForm!: FormGroup;
  filters: FormGroup;
  
  showSupplierDialog = false;
  isNewObject: boolean = true;
  latestSupplierId: number | null = null;
  sortField = 'supplierId';
  sortOrder = -1;

  constructor(
    private logger: LogService,
    public readonly sharedService: SharedService,
    private readonly fb: FormBuilder,
    private supplierService: SupplierService,
    private messageService: MessageService,
    private readonly route: ActivatedRoute,

  ) {
    this.filters = this.fb.group({
      supplierName: ['', Validators.required],
      sortBy: this.sortField,
      sortDir: this.sortOrder
    });

    this.initSupplierForm();
  }

  ngOnInit() {
    this.getSuppliers();
  }

  initSupplierForm() {
    this.supplierForm = this.fb.group({
      supplierId: [0],
      supplierName: ['', Validators.required],
      supplierAddress: [''],
      supplierTelephone: [''],
      supplierExtraInfo: ['']
    });
  }

  getSuppliers(): void {
    this.supplierService.getAllSuppliers()
      .pipe(
        finalize(() => { }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
            this.suppliers = response;
        },
        error: (err) => {
          this.logger.error(err);
        }
      });
  }

  supplierCrud(supplierId: number) {
    this.supplierService.getSupplier(supplierId)
      .pipe(
        finalize(() => { }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          this.showSupplierDialog = true;
          this.isNewObject = (supplierId === 0);
          let data;
          if (Array.isArray(response) && response.length > 0) {
            data = response[0];
          } else {
            data = response.data || response;
          }

          if (data) {
            this.supplierForm.patchValue({
              supplierId: data.supplierId,
              supplierName: data.supplierName,
              supplierAddress: data.supplierAddress,
              supplierTelephone: data.supplierTelephone,
              supplierExtraInfo: data.supplierExtraInfo
            });
          }
        },
        error: (err) => {
          this.logger.error('Error fetching supplier:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not fetch supplier data'
          });
        }
      });
  }

  onFormSubmit() {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please fill required fields' });
      return;
    }
    const formValues = this.supplierForm.getRawValue();
    this.supplierService.upsertSupplier(formValues)
      .pipe(
        finalize(() => { }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.messageService.add({ severity: 'success', summary: this.sharedService.T('success'), icon: 'pi pi-check-circle' });
            this.showSupplierDialog = false;
            this.getSuppliers();
          }
        },
        error: (err) => {
          this.logger.error('Error saving supplier:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save supplier' });
        }
      });
  }


  closeSupplierDialog() {
    this.showSupplierDialog = false;
  }

  getf(field: string) { return this.supplierForm.get(field); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}