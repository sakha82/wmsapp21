import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IReminder, IVehicleDetails, IVehicleHistoryCustomer, IVehicleHistorySummary, IWorkOrder, IWorkOrderIntentCandidate } from 'app/app.model';
import { LogService } from 'app/services/log.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { SharedService } from 'app/services/shared.service';
import { ReminderService } from 'app/services/reminder.service';
import { CoreService } from 'app/services/core.service';
import { WorkOrderService } from 'app/services/workorder.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { VoiceInputButtonComponent } from 'app/components/shared/voice-input-button/voice-input-button.component';
import { WorkOrderHandoffService } from 'app/services/workorder-handoff.service';
import { forkJoin, Subject, finalize, takeUntil } from 'rxjs';

interface AiSuggestion {
  icon: string;
  text: string;
}

/**
 * Dashboard rebuilt as the primary entry point for creating a new booking/work order (2026-07-31 redesign, see
 * DashboardPage_Redesign.md). The chat interface has two modes: Registration (plate-only, implemented) and Query
 * (free-text, deliberately not implemented yet - the mode selector is built now so it can be switched on later
 * without redesigning this component). Today's Workshop and AI Suggestions show placeholder/dummy data until
 * their backend integration is scoped; Reminders is fully live. The Statistics/top-customers/top-manufacturers/
 * unpaid-invoices/waiting-offers content that used to live here moved to StatisticsListComponent in an earlier
 * pass and stays there.
 */
@Component({
  selector: 'app-dashboard-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    ToastModule,
    TagModule,
    InputTextModule,
    TooltipModule,
    GenericLoaderComponent,
    VoiceInputButtonComponent,
  ],
  templateUrl: './dashboard-list.component.html',
  styleUrl: './dashboard-list.component.css',
  providers: [MessageService]
})
export class DashboardListComponent implements OnInit, OnDestroy {
  @ViewChild('plateInputEl') plateInputEl?: ElementRef<HTMLInputElement>;

  private destroy$ = new Subject<void>();
  /** Session-scoped so navigating away (e.g. to start a booking) and back via the browser Back button restores the last lookup instead of resetting to a blank plate. Cleared on changePlate() or a fresh submit. */
  private readonly lookupStateStorageKey = 'wms.dashboard.lastLookup';

  /** Registration Mode is the only functional mode today - Query Mode is visible but disabled, see class doc. */
  mode: 'registration' | 'query' = 'registration';

  // Registration workflow
  plateInput = '';
  isLookingUpVehicle = false;
  hasSearched = false;
  lookupFailed = false;
  vehicleInfo: IVehicleDetails | null = null;
  vehicleHistory: IVehicleHistorySummary | null = null;
  selectedCustomer: IVehicleHistoryCustomer | null = null;
  existingWorkOrders: IWorkOrder[] = [];
  isLoadingWorkOrders = false;

  // Today's Workshop / AI Suggestions - dummy data, backend integration deferred (see class doc)
  readonly todayWorkshopDummy = { arrivingToday: 6, inWorkshop: 4, readyForPickup: 3, customersToContact: 2 };
  aiSuggestionsDummy: AiSuggestion[] = [];

  // Reminders (fully functional)
  reminders: IReminder[] = [];
  isLoadingReminders = false;
  isReminderSubmitting = false;
  reminderText = '';
  /** More than one employee matched the name mentioned - the receptionist must pick one before the reminder is created. */
  reminderEmployeeCandidates: IWorkOrderIntentCandidate[] = [];
  private pendingReminderText = '';

  constructor(
    private readonly router: Router,
    private readonly logger: LogService,
    private readonly errorHandler: ErrorHandlerService,
    public readonly sharedService: SharedService,
    private readonly reminderService: ReminderService,
    private readonly coreService: CoreService,
    private readonly workOrderService: WorkOrderService,
    private readonly workOrderHandoffService: WorkOrderHandoffService,
    private readonly messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.aiSuggestionsDummy = [
      { icon: 'pi pi-info-circle', text: this.sharedService.T('aiSuggestionDummyReturning') },
      { icon: 'pi pi-user-minus', text: this.sharedService.T('aiSuggestionDummyMechanic') },
      { icon: 'pi pi-exclamation-circle', text: this.sharedService.T('aiSuggestionDummyInvoices') },
    ];
    this.loadReminders();
    this.restoreLookupState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return this.sharedService.T('goodMorning');
    if (hour < 18) return this.sharedService.T('goodAfternoon');
    return this.sharedService.T('goodEvening');
  }

  // ---- Mode selector ----

  setMode(mode: 'registration' | 'query'): void {
    if (mode === 'query') return; // not implemented yet - see class doc
    this.mode = mode;
  }

  // ---- Registration workflow ----

  onPlateInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    input.value = sanitized;
    this.plateInput = sanitized;
  }

  onPlateSubmit(): void {
    const plate = this.plateInput.trim();
    if (!plate || this.isLookingUpVehicle) return;

    this.resetLookupState();
    this.isLookingUpVehicle = true;

    forkJoin({
      vehicle: this.coreService.getVehicle(plate),
      history: this.workOrderService.getVehicleHistory(plate),
    })
      .pipe(
        finalize(() => { this.isLookingUpVehicle = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ vehicle, history }) => {
          this.hasSearched = true;
          this.vehicleInfo = vehicle;
          this.vehicleHistory = history;

          if (history.distinctCustomers.length === 1) {
            this.selectCustomer(history.distinctCustomers[0]);
          }
          this.persistLookupState();
        },
        error: (err) => {
          this.logger.error('Vehicle lookup error', err);
          this.hasSearched = true;
          this.lookupFailed = true;
          this.messageService.add({
            severity: 'error',
            summary: this.sharedService.T('error'),
            detail: this.sharedService.T('vehicleLookupFailed'),
            life: 4000
          });
          this.persistLookupState();
        }
      });
  }

  /** Vehicle history showed more than one distinct customer for this plate, or the AI resolved a single match automatically - either way, the receptionist ends up with one selected customer before booking. */
  selectCustomer(customer: IVehicleHistoryCustomer): void {
    this.selectedCustomer = customer;
    this.loadWorkOrdersForCustomer(customer.customerId);
    this.persistLookupState();
  }

  private loadWorkOrdersForCustomer(customerId: number): void {
    this.isLoadingWorkOrders = true;
    const plate = this.plateInput.trim().toUpperCase();
    this.workOrderService.getWorkOrdersByCustomerId(customerId)
      .pipe(
        finalize(() => { this.isLoadingWorkOrders = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (workOrders) => {
          this.existingWorkOrders = workOrders
            .filter((w) => (w.vehiclePlate || '').toUpperCase() === plate)
            .sort((a, b) => (a.workOrderDate < b.workOrderDate ? 1 : -1));
        },
        error: (err) => {
          this.logger.error('getWorkOrdersByCustomerId error', err);
        }
      });
  }

  /** Starts a new booking for the looked-up plate/customer - hands the whole lookup off to the Create Work Order page (WorkOrderHandoffService) so the receptionist never repeats it. Per DashboardPage_Redesign.md's "Next Step", that page's own form is still the actual booking UI for now. */
  startBooking(): void {
    if (this.vehicleInfo && this.vehicleHistory) {
      this.workOrderHandoffService.setPending({
        vehiclePlate: this.plateInput.trim().toUpperCase(),
        vehicleInfo: this.vehicleInfo,
        vehicleHistory: this.vehicleHistory,
        customer: this.selectedCustomer || undefined,
      });
    }
    const matrixParams = this.selectedCustomer ? { customerId: this.selectedCustomer.customerId } : {};
    this.router.navigate(['sv/workorder/crud', matrixParams]);
  }

  changePlate(): void {
    this.plateInput = '';
    this.resetLookupState();
    sessionStorage.removeItem(this.lookupStateStorageKey);
    setTimeout(() => this.plateInputEl?.nativeElement.focus());
  }

  private resetLookupState(): void {
    this.hasSearched = false;
    this.lookupFailed = false;
    this.vehicleInfo = null;
    this.vehicleHistory = null;
    this.selectedCustomer = null;
    this.existingWorkOrders = [];
  }

  /** Saves the current plate lookup so a browser Back navigation (e.g. from Create Work Order) restores it instead of showing a blank Dashboard. */
  private persistLookupState(): void {
    const state = {
      plateInput: this.plateInput,
      hasSearched: this.hasSearched,
      lookupFailed: this.lookupFailed,
      vehicleInfo: this.vehicleInfo,
      vehicleHistory: this.vehicleHistory,
      selectedCustomer: this.selectedCustomer,
    };
    sessionStorage.setItem(this.lookupStateStorageKey, JSON.stringify(state));
  }

  private restoreLookupState(): void {
    const raw = sessionStorage.getItem(this.lookupStateStorageKey);
    if (!raw) return;
    try {
      const state = JSON.parse(raw);
      this.plateInput = state.plateInput || '';
      this.hasSearched = !!state.hasSearched;
      this.lookupFailed = !!state.lookupFailed;
      this.vehicleInfo = state.vehicleInfo || null;
      this.vehicleHistory = state.vehicleHistory || null;
      this.selectedCustomer = state.selectedCustomer || null;
      if (this.selectedCustomer) {
        this.loadWorkOrdersForCustomer(this.selectedCustomer.customerId);
      }
    } catch (err) {
      this.logger.error('restoreLookupState error', err);
      sessionStorage.removeItem(this.lookupStateStorageKey);
    }
  }

  goToWorkOrderDetails(workOrder: IWorkOrder): void {
    this.router.navigate(['sv/workorder/details', workOrder.workOrderId]);
  }

  // ---- Reminders ----

  private loadReminders(): void {
    this.isLoadingReminders = true;
    this.reminderService.getReminders('Open')
      .pipe(
        finalize(() => { this.isLoadingReminders = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => { this.reminders = res.objectList; },
        error: (err) => {
          this.errorHandler.handleError(err, 'loadReminders', 'Failed to load reminders.');
        }
      });
  }

  /** Typing skips straight to parsing - same pipeline the voice button uses. */
  onReminderTextSubmit(): void {
    const text = this.reminderText.trim();
    if (!text || this.isReminderSubmitting) return;
    this.reminderText = '';
    this.submitReminderTranscript(text);
  }

  onReminderVoiceTranscribed(transcript: string): void {
    this.submitReminderTranscript(transcript);
  }

  private submitReminderTranscript(transcript: string): void {
    this.isReminderSubmitting = true;
    this.reminderEmployeeCandidates = [];
    this.reminderService.parseReminderIntent(transcript)
      .pipe(
        finalize(() => { this.isReminderSubmitting = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (result) => {
          if (result.employeeCandidates?.length) {
            this.pendingReminderText = result.text;
            this.reminderEmployeeCandidates = result.employeeCandidates;
          } else {
            this.createReminder(result.text, result.assignedToEmployeeId);
          }
        },
        error: (err) => {
          this.logger.error('parseReminderIntent error', err);
          this.messageService.add({
            severity: 'error',
            summary: this.sharedService.T('error'),
            detail: this.sharedService.T('aiAssistFailed'),
            life: 4000
          });
        }
      });
  }

  /** Reminder's transcript matched more than one employee - the receptionist picked one. */
  resolveReminderCandidate(candidate: IWorkOrderIntentCandidate): void {
    this.createReminder(this.pendingReminderText, candidate.id);
    this.reminderEmployeeCandidates = [];
  }

  private createReminder(text: string, assignedToEmployeeId?: number): void {
    this.reminderService.createReminder(text, assignedToEmployeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reminder) => {
          this.reminders = [reminder, ...this.reminders];
        },
        error: (err) => {
          this.errorHandler.handleError(err, 'createReminder', 'Failed to create reminder.');
        }
      });
  }

  /** One-tap resolve - removes it from the list immediately (optimistic) and it stays gone on reload. */
  resolveReminder(reminder: IReminder): void {
    this.reminders = this.reminders.filter((r) => r.reminderId !== reminder.reminderId);
    this.reminderService.resolveReminder(reminder.reminderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => {
          this.errorHandler.handleError(err, 'resolveReminder', 'Failed to resolve reminder.');
          this.reminders = [reminder, ...this.reminders];
        }
      });
  }
}
