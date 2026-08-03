import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { IDashboardOverview, IPageList, ISelect, IUnpaidInvoice } from 'app/app.model'
import { LogService } from 'app/services/log.service';
import { SharedService } from 'app/services/shared.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl: string = environment.BASE_URL +  '/api/dashboard';
  constructor(private http: HttpClient,private logger: LogService,private sharedService:SharedService) {}

  /** Single aggregate read for the Dashboard's "Today's Workshop"/"AI-förslag"/"Sales this month" widgets. */
  getOverview() {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    return this.http.get<IDashboardOverview>(`${this.baseUrl}/overview?${queryParams}`);
  }

  getUnpaidInvoices() {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    const url = `${this.baseUrl}/unpaid-invoices?${queryParams}`;
    return this.http.get<IUnpaidInvoice[]>(url);
  }
}
