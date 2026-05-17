import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IVehicleType } from 'app/app.model';
import { AiService } from 'app/services/ai.service';
import { LogService } from 'app/services/log.service';
import { SharedService } from 'app/services/shared.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Popover, PopoverModule } from 'primeng/popover';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-create-vehicle-model-popover',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PopoverModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
  ],
  templateUrl: './create-vehicle-model-popover.component.html',
})
export class CreateVehicleModelPopoverComponent implements OnDestroy {
  @ViewChild('modelPopover') modelPopover!: Popover;
  @Input({ required: true }) parentForm!: FormGroup;
  @Output() modelsUpdated = new EventEmitter<string[]>();

  newModelForm: FormGroup;
  createModelError = '';
  isCreatingModel = false;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    public readonly sharedService: SharedService,
    private readonly aiService: AiService,
    private readonly messageService: MessageService,
    private readonly logger: LogService
  ) {
    this.newModelForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
    });
  }

  openPopover(event: Event): void {
    this.createModelError = '';
    this.newModelForm.reset({
      make: this.parentForm.get('vehicleManufacturer')?.value ?? '',
      model: '',
    });
    this.modelPopover.toggle(event);
  }

  createModel(): void {
    this.createModelError = '';
    this.newModelForm.markAllAsTouched();

    const make = (this.newModelForm.get('make')?.value ?? '').toString().trim();
    const model = (this.newModelForm.get('model')?.value ?? '').toString().trim();

    if (!make || !model) {
      this.createModelError = this.sharedService.T('requiredFields');
      return;
    }

    const vehicleType: IVehicleType = {
      wmsId: this.sharedService.wmsId,
      make,
      model,
      year: Number(this.parentForm.get('vehicleYear')?.value) || 0,
      category: '',
      segment: '',
      fuelType: '',
      isPremium: 0,
    };

    this.isCreatingModel = true;
    this.aiService
      .createVehicleModel(vehicleType)
      .pipe(
        finalize(() => {
          this.isCreatingModel = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (success: boolean) => {
          if (success) {
            const models = this.sharedService.registerVehicleModel(vehicleType);
            this.parentForm.patchValue({
              vehicleManufacturer: make,
              vehicleModel: model,
            });
            this.modelsUpdated.emit(models);
            this.modelPopover.hide();
            this.messageService.add({
              severity: 'success',
              summary: this.sharedService.T('success'),
              detail: this.sharedService.T('modelCreatedSuccessfully'),
              life: 4000,
            });
            return;
          }
          this.createModelError = this.sharedService.T('createModelFailed');
        },
        error: (err: unknown) => {
          this.logger.error('createVehicleModel error', err);
          this.createModelError = this.sharedService.T('createModelFailed');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
