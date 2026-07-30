import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ITodayWorkshopSummary, IOutStandingBalance } from 'app/app.model';
import { LogService } from 'app/services/log.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { SharedService } from 'app/services/shared.service';
import { DashboardService } from 'app/services/dashboard.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { AiAssistInputComponent } from 'app/components/shared/ai-assist-input/ai-assist-input.component';
import { Subject, finalize, takeUntil } from 'rxjs';

interface AiSuggestion {
  icon: string;
  text: string;
}

/**
 * Dashboard rebuilt as an AI workspace (Initiative 4's "New Dashboard" revamp, 2026-07-30). The sales charts/
 * top-customers/top-manufacturers/unpaid-invoices-table/waiting-offers-table/month-metrics content that used to
 * live here moved verbatim to statistics-list - see StatisticsListComponent.
 */
@Component({
  selector: 'app-dashboard-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    TagModule,
    GenericLoaderComponent,
    AiAssistInputComponent,
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

  constructor(
    private readonly router: Router,
    private readonly logger: LogService,
    private readonly errorHandler: ErrorHandlerService,
    public readonly sharedService: SharedService,
    public readonly dashboardService: DashboardService,
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
   * already owns the one real parsing call). "Reminders" isn't built yet (Intelligent Reminders, a separate,
   * not-yet-started initiative) - that keyword is recognized but has nowhere to route to yet.
   */
  onAiAssistSubmit(transcript: string): void {
    this.isAiRouting = true;
    const text = transcript.toLowerCase();

    const route = (path: string) => {
      this.router.navigate([path]);
    };

    if (text.includes('boka') || text.includes('booking') || text.includes('book')) {
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
    } else if (text.includes('kom ihåg') || text.includes('kom ihag') || text.includes('remember') || text.includes('reminder') || text.includes('påminn')) {
      this.messageService.add({
        severity: 'info',
        summary: this.sharedService.T('aiRouteRemindersNotAvailableTitle'),
        detail: this.sharedService.T('aiRouteRemindersNotAvailable'),
        life: 4000,
      });
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
}
