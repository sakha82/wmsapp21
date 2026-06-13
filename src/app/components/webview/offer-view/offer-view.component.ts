import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import {ITokenClaims} from 'app/app.model';
import { SharedService } from 'app/services/shared.service';
import { OfferService } from 'app/services/offer.service';
import { LogService } from 'app/services/log.service';
import { finalize, takeUntil, Subject } from 'rxjs';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-offer-view',
  standalone: true,
 imports: [
    CommonModule,
    ButtonModule,
    PdfViewerModule
  ],
  templateUrl: './offer-view.component.html'
})
export class OfferViewComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  private destroy$ = new Subject<void>();
  token: string = ''
  wmsId: string = '';
  workshopName: string = '';
  offerId: string = '';
  acceptRejectDate: string = '';
  isButtonDisabled: boolean = false;
  pdfUrl: any;
  status: string = 'wait';
  statusText: string = 'Väntar på svar'

  constructor(private logger: LogService,
              private readonly sharedService:SharedService,
              private router: Router,
              private readonly route: ActivatedRoute,
              private readonly offerService: OfferService,
              private http: HttpClient
              ) {

  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token']||''; 
    //this.sharedService.setPageHeader(this.translateService.instant('applayout.offer') + ' [#' + this.offerId + ']');
    this.loadOffer();
    this.loadPdf();
}

  loadOffer() {
    this.sharedService
      .getClaimsFromToken(this.token)
      .pipe(
        finalize(() => {}),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: ITokenClaims) => {
          if (response) {
            this.wmsId = response.wmsId;
            this.workshopName = response.workshopName;
            this.offerId = response.id;
            if (this.wmsId && this.offerId) {
              this.getOfferStatus();
            }
          }
        },
        error: (err) => {
          this.logger.error('Error loading offer:', err);
        }
      });
  }

  getOfferStatus() {
    this.sharedService
      .getOfferStatus(this.wmsId, Number(this.offerId))
      .pipe(
        finalize(() => {}),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.status = response.status;
            this.acceptRejectDate = response.date;
            if (this.status === 'accepted') {
              this.statusText = 'Offert accepterad den ' + this.acceptRejectDate;
            } else if (this.status === 'rejected') {
              this.statusText = 'Offert avvisad den ' + this.acceptRejectDate;
            }
          }
        },
        error: (err) => {
          this.logger.error('Error getting offer status:', err);
        }
      });
  }

  loadPdf() {
    this.sharedService
      .printPdfFromToken(this.token)
      .pipe(
        finalize(() => {}),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            const newBlob = new Blob([response], { type: 'application/pdf' });
            if (isPlatformBrowser(this.platformId)) {
              this.pdfUrl = window.URL.createObjectURL(newBlob);
            }
          }
        },
        error: (err) => {
          this.logger.error('Error loading offer PDF:', err);
        }
      });
  }

  generatePdf() {
    if (!isPlatformBrowser(this.platformId) || !this.pdfUrl) {
      return;
    }
    window.open(this.pdfUrl);
  }

  updateStatus(accepted: boolean) {
    this.sharedService
      .updateCustomerOffer(this.wmsId, Number(this.offerId), accepted)
      .pipe(
        finalize(() => {}),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.loadOffer();
            this.loadPdf();
          }
        },
        error: (err) => {
          this.logger.error('Error updating offer:', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

