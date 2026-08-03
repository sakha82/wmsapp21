import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IDashboardOverview, IReminder, IUnpaidInvoice, IVehicleDetails, IVehicleHistoryCustomer, IVehicleHistorySummary, IWorkOrder, IWorkOrderIntentCandidate } from 'app/app.model';
import { LogService } from 'app/services/log.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { SharedService } from 'app/services/shared.service';
import { ReminderService } from 'app/services/reminder.service';
import { AiService } from 'app/services/ai.service';
import { CoreService } from 'app/services/core.service';
import { WorkOrderService } from 'app/services/workorder.service';
import { DashboardService } from 'app/services/dashboard.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { VoiceInputButtonComponent } from 'app/components/shared/voice-input-button/voice-input-button.component';
import { WorkOrderHandoffService } from 'app/services/workorder-handoff.service';
import { forkJoin, Subject, finalize, takeUntil } from 'rxjs';

interface VehicleDetailField {
  label: string;
  value: string;
}

/**
 * Dashboard: the primary entry point for creating a new booking/work order (2026-07-31 redesign, see
 * DashboardPage_Redesign.md), plus "Today's Workshop"/"AI-förslag"/"Sales this month"/"Unpaid invoices" (backed by
 * DashboardService.getOverview()/getUnpaidInvoices()) and Reminders. The chat interface has two modes: Registration
 * (plate-only, implemented) and Query (free-text, deliberately not implemented yet - the mode selector is built now
 * so it can be switched on later without redesigning this component). The Statistics page (revenue panel + raw
 * sales chart + unpaid-invoices table) was retired 2026-08-03: the revenue panel and unpaid-invoices table moved
 * here as their own widgets, and the raw sales chart was replaced by a month-over-month sales trend sentence folded
 * into AI-förslag (see DashboardService.GetOverview's PreviousMonthSale signal) - a raw multi-series chart wasn't
 * legible to the target audience (small workshop owners/mechanics), a plain-language reading is. Every "Dagens
 * verkstad" tile and AI-förslag suggestion with an actionUrl deep-links to the real filtered underlying data
 * (Invoice/Offer/WorkOrder list) rather than just displaying a number - "Kunder att kontakta" is the one
 * exception, since it's a union of 3 different sources with no single accurate filtered destination; its
 * breakdown is covered by the individual AI-förslag suggestions instead.
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
    TableModule,
    ProgressBarModule,
    InputNumberModule,
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

  // Today's Workshop / AI-förslag / Sales this month - single aggregate read, see DashboardService.getOverview()
  overview: IDashboardOverview | null = null;
  isLoadingOverview = false;

  // Unpaid invoices by customer - ported from the retired Statistics page
  unpaidInvoices: IUnpaidInvoice[] = [];
  isLoadingUnpaidInvoices = false;

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
    private readonly aiService: AiService,
    private readonly coreService: CoreService,
    private readonly workOrderService: WorkOrderService,
    private readonly workOrderHandoffService: WorkOrderHandoffService,
    private readonly dashboardService: DashboardService,
    private readonly messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadOverview();
    this.loadReminders();
    this.loadUnpaidInvoices();
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

  /**
   * Every non-empty Vehicle.cs field for the receptionist to see - only Make/Model/Year/Plate actually carry
   * over onto the work order (see DashboardPage_Redesign.md's "Vehicle→WorkOrder scope" decision); the rest is
   * reference information only, since WorkOrder has no columns for VIN/engine/tyres/etc.
   */
  get vehicleDetailFields(): VehicleDetailField[] {
    if (!this.vehicleInfo) return [];
    const v = this.vehicleInfo;
    const fields: [string, string | undefined | null][] = [
      [this.sharedService.T('vehicleMake'), v.make],
      [this.sharedService.T('vehicleModel'), v.model],
      [this.sharedService.T('vehicleYear'), v.year],
      [this.sharedService.T('fuelType'), v.fuelType],
      [this.sharedService.T('vehicleColor'), v.color],
      [this.sharedService.T('vehicleBodyType'), v.chassis],
      [this.sharedService.T('vehicleCategory'), v.vehicleType],
      [this.sharedService.T('vehicleVin'), v.vin],
      [this.sharedService.T('vehicleEngineCode'), v.engineCode],
      [this.sharedService.T('vehicleTransmission'), v.transmission],
      [this.sharedService.T('vehiclePower'), v.effect],
      [this.sharedService.T('vehicleHorsepower'), v.horsepower],
      [this.sharedService.T('vehicleDrivetrain'), v.driving],
      [this.sharedService.T('vehicleFrontTyre'), v.frontWheelDimension],
      [this.sharedService.T('vehicleBackTyre'), v.backWheelDimension],
      [this.sharedService.T('vehicleOilCapacityScraped'), v.oilCapacity],
      [this.sharedService.T('vehicleOilSpec'), v.oilSpecifications1],
      [this.sharedService.T('vehicleOilClassification'), v.oilClassification1],
      [this.sharedService.T('vehicleOilSpecAlt'), v.oilSpecifications2],
      [this.sharedService.T('vehicleOilClassificationAlt'), v.oilClassification2],
    ];
    return fields
      .filter(([, value]) => !!value)
      .map(([label, value]) => ({ label, value: value as string }));
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

  // ---- Today's Workshop / AI-förslag ----

  loadOverview(): void {
    this.isLoadingOverview = true;
    this.dashboardService.getOverview()
      .pipe(
        finalize(() => { this.isLoadingOverview = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => { this.overview = res; },
        error: (err) => {
          this.errorHandler.handleError(err, 'loadOverview', 'Failed to load dashboard overview.');
        }
      });
  }

  /** Navigates to a work order list filtered to a given status - used by the "I verkstaden"/"Klar för avhämtning" tiles. */
  goToWorkOrdersByStatus(status: string): void {
    this.router.navigate(['sv/workorder'], { queryParams: { workOrderStatus: status } });
  }

  /** Navigates to a work order list filtered to today's booking date - used by the "Anländer idag" tile. */
  goToWorkOrdersArrivingToday(): void {
    this.router.navigate(['sv/workorder'], { queryParams: { bookingDate: this.sharedService.getDateString(new Date()) } });
  }

  /** An AI-förslag suggestion's actionUrl is a plain relative path (e.g. "/sv/workorder") - navigate to it directly. */
  goToSuggestion(actionUrl: string): void {
    this.router.navigateByUrl(actionUrl);
  }

  /** Icon matching a suggestion's severity, for the AI-förslag card. */
  suggestionIcon(severity: string): string {
    switch (severity) {
      case 'danger': return 'pi pi-exclamation-circle';
      case 'warn': return 'pi pi-exclamation-triangle';
      case 'success': return 'pi pi-check-circle';
      default: return 'pi pi-info-circle';
    }
  }

  // ---- Sales this month (ported from the retired Statistics page) ----

  get monthlyTargetProgressPercentage(): number {
    const sale = this.overview?.currentMonth?.sale ?? 0;
    const target = this.overview?.currentMonth?.saleTarget ?? 0;
    return target > 0 ? Math.round(Math.min((sale / target) * 100, 100)) : 0;
  }

  get avgOrderValue(): number {
    const sale = this.overview?.currentMonth?.sale ?? 0;
    const orders = this.overview?.currentMonth?.orders ?? 0;
    return orders > 0 ? sale / orders : 0;
  }

  // ---- Unpaid invoices (ported from the retired Statistics page) ----

  private loadUnpaidInvoices(): void {
    this.isLoadingUnpaidInvoices = true;
    this.dashboardService.getUnpaidInvoices()
      .pipe(
        finalize(() => { this.isLoadingUnpaidInvoices = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => { this.unpaidInvoices = res; },
        error: (err) => {
          this.errorHandler.handleError(err, 'loadUnpaidInvoices', 'Failed to load unpaid invoices.');
        }
      });
  }

  /** Navigates to the Invoice list, pre-filtered to this customer's unpaid invoices. */
  goToUnpaidInvoices(invoice: IUnpaidInvoice): void {
    this.router.navigate(['/sv/invoice'], { queryParams: { type: 'unpaid', customerId: invoice.customerId } });
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
    this.aiService.parseReminderIntent(transcript)
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
