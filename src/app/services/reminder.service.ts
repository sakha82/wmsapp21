import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICreateReminderRequest, IPageList, IReminder, IReminderIntentResponse } from 'app/app.model';
import { environment } from 'environments/environment';
import { SharedService } from 'app/services/shared.service';

/** 1:1 with ReminderController. */
@Injectable({ providedIn: 'root' })
export class ReminderService {
  private baseUrl: string = environment.BASE_URL + '/api/reminder';
  private coreUrl: string = environment.BASE_URL + '/api/Core';

  constructor(private http: HttpClient, private sharedService: SharedService) {}

  /** Open reminders by default - matches the dashboard's "Reminders" section. */
  getReminders(status: string = 'Open', currentPage: number = 1, pageSize: number = 20) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', this.sharedService.wmsId);
    queryParams.append('status', status);
    queryParams.append('currentPage', currentPage.toString());
    queryParams.append('pageSize', pageSize.toString());
    return this.http.get<IPageList<IReminder>>(`${this.baseUrl}/list?${queryParams}`);
  }

  createReminder(textContent: string, assignedToEmployeeId?: number, customerId?: number, vehiclePlate?: string) {
    const request: ICreateReminderRequest = { wmsId: this.sharedService.wmsId, textContent, assignedToEmployeeId, customerId, vehiclePlate };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IReminder>(`${this.baseUrl}/create-reminder`, request, { headers });
  }

  resolveReminder(reminderId: number) {
    const request = { wmsId: this.sharedService.wmsId, reminderId };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/resolve-reminder`, request, { headers });
  }

  /** Parses a free-text/spoken reminder into clean text plus a resolved assignee. Routed through CoreController like the other AI-parsing endpoints, not this controller. */
  parseReminderIntent(transcript: string) {
    const request = { transcript, wmsId: this.sharedService.wmsId };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IReminderIntentResponse>(`${this.coreUrl}/ai/parse-reminder-intent`, request, { headers });
  }
}
