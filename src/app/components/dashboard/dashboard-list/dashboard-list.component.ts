import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IOutStandingBalance, IReminder, ITodayWorkshopSummary, IWorkOrderIntentCandidate } from 'app/app.model';
import { LogService } from 'app/services/log.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { SharedService } from 'app/services/shared.service';
import { DashboardService } from 'app/services/dashboard.service';
import { ReminderService } from 'app/services/reminder.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { AiAssistInputComponent } from 'app/components/shared/ai-assist-input/ai-assist-input.component';
import { VoiceInputButtonComponent } from 'app/components/shared/voice-input-button/voice-input-button.component';
import { Subject, finalize, takeUntil } from 'rxjs';

interface AiSuggestion {
  icon: string;
  text: string;
}

/**
 * Dashboard rebuilt as an AI workspace (Initiative 4's "New Dashboard" revamp, 2026-07-30). The sales charts/
 * top-customers/top-manufacturers/unpaid-invoices-table/waiting-offers-table/month-metrics content that used to
 * live here moved verbatim to statistics-list - see StatisticsListComponent. The Reminders section (Initiative
 * 4's Intelligent Reminders, added 2026-07-30) is capture + list + resolve only - "intelligent" reminders (the
 * AI reading/acting on open reminders) is an explicit future direction, not built here.
 */
@Component({
  selector: 'app-dashboard-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    TagModule,
    InputTextModule,
    TooltipModule,
    GenericLoaderComponent,
    AiAssistInputComponent,
    VoiceInputButtonComponent,
  ],
  templateUrl: './dashboard-list.component.html',
  styleUrl: './dashboard-list.component.css',
  providers: [MessageService]
})
export class DashboardListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoading = false;
  isAiRouting = false;

  todayWorkshopSummary: ITodayWorkshopSummary | null = null;
  outStandingInvoices: IOutStandingBalance | null = null;
  aiSuggestions: AiSuggestion[] = [];

  examplePrompts: string[] = [];

  // Reminders
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
    public readonly dashboardService: DashboardService,
    private readonly reminderService: ReminderService,
    private readonly messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.examplePrompts = [
      this.sharedService.T('aiExamplePromptBooking'),
      this.sharedService.T('aiExamplePromptVehicle'),
      this.sharedService.T('aiExamplePromptCustomer'),
      this.sharedService.T('aiExamplePromptInvoice'),
    ];
    this.loadTodayWorkshopSummary();
    this.loadReminders();
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

  private loadTodayWorkshopSummary(): void {
    this.isLoading = true;
    this.dashboardService.getTodayWorkshopSummary()
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (summary) => {
          this.todayWorkshopSummary = summary;
          this.buildAiSuggestions();
        },
        error: (err) => {
          this.errorHandler.handleError(err, 'loadTodayWorkshopSummary', 'Failed to load today\'s workshop summary.');
        }
      });

    this.dashboardService.getOutStandingInvoices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balance) => {
          this.outStandingInvoices = balance;
          this.buildAiSuggestions();
        },
        error: (err) => {
          this.logger.error('getOutStandingInvoices error', err);
        }
      });
  }

  /**
   * Rule-based, not LLM-generated: each suggestion is a plain threshold check against already-loaded data.
   * "Vehicles due for service" is deliberately not included - it needs service-interval domain rules that
   * don't exist in the data model yet (see the revamp plan's "Deferred" section). "Returning customer
   * detected" is also not included here - it has no standing trigger on a dashboard with no specific
   * customer/vehicle context; that signal already surfaces where it belongs, in workorder-crud's vehicle-
   * history banner.
   */
  private buildAiSuggestions(): void {
    const suggestions: AiSuggestion[] = [];

    if (this.todayWorkshopSummary && this.todayWorkshopSummary.missingMechanicAssignments > 0) {
      suggestions.push({
        icon: 'pi pi-user-minus',
        text: this.sharedService.T('aiSuggestionMissingMechanic').replace('{count}', String(this.todayWorkshopSummary.missingMechanicAssignments)),
      });
    }

    if (this.outStandingInvoices && this.outStandingInvoices.orderCount > 0) {
      suggestions.push({
        icon: 'pi pi-exclamation-circle',
        text: this.sharedService.T('aiSuggestionOverdueInvoices').replace('{count}', String(this.outStandingInvoices.orderCount)),
      });
    }

    this.aiSuggestions = suggestions;
  }

  /**
   * Dashboard's AI input does lightweight client-side keyword routing, not a second backend AI call -
   * consistent with "no multi-agent, one parsing capability per feature" (the workorder-crud AI-assist input
   * already owns the one real parsing call). "Reminders" is the one keyword that doesn't navigate anywhere -
   * it feeds the same quick-capture pipeline as the Reminders section's own input, since there's nowhere to
   * navigate a reminder capture to (it happens right here on the dashboard).
   */
  onAiAssistSubmit(transcript: string): void {
    this.isAiRouting = true;
    const text = transcript.toLowerCase();

    const route = (path: string) => {
      this.router.navigate([path]);
    };

    if (text.includes('kom ihåg') || text.includes('kom ihag') || text.includes('remember') || text.includes('reminder') || text.includes('påminn')) {
      this.submitReminderTranscript(transcript);
    } else if (text.includes('boka') || text.includes('booking') || text.includes('book')) {
      route('sv/workorder/crud');
    } else if (text.includes('fordon') || text.includes('vehicle') || text.includes('bil')) {
      route('sv/vehicle');
    } else if (text.includes('kund') || text.includes('customer')) {
      route('sv/customer');
    } else if (text.includes('faktura') || text.includes('invoice')) {
      route('sv/invoice');
    } else if (text.includes('offert') || text.includes('offer')) {
      route('sv/offer');
    } else if (text.includes('produkt') || text.includes('product')) {
      route('sv/product');
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.sharedService.T('aiRouteNotFoundTitle'),
        detail: this.sharedService.T('aiRouteNotFound'),
        life: 4000,
      });
    }

    this.isAiRouting = false;
  }

  redirectToOrderCrudComponent() {
    this.router.navigate(['sv/workorder/crud']);
  }

  redirectToOfferCrudComponent() {
    this.router.navigate(['sv/offer/crud', {}]);
  }

  redirectToInvoiceCrudComponent() {
    this.router.navigate(['sv/invoice/crud', {}]);
  }

  redirectToCustomerCrudComponent() {
    this.router.navigate(['sv/customer/crud', {}]);
  }

  redirectToVehicleComponent() {
    this.router.navigate(['sv/vehicle', {}]);
  }

  redirectToProductCrudComponent() {
    this.router.navigate(['sv/product', {}]);
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

  /** Typing skips straight to parsing - same pipeline the voice button and the dashboard's main AI input use. */
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
