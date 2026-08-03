import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IInvoicePromptRequest, IReminderIntentResponse, IWorkOrderIntentRequest, IWorkOrderIntentResponse } from 'app/app.model';
import { environment } from 'environments/environment';
import { SharedService } from 'app/services/shared.service';

/** Every call into the AI Layer (wms-ai) goes through here - 1:1 with AiController (`/api/Ai/*`). */
@Injectable({ providedIn: 'root' })
export class AiService {
  private baseUrl: string = environment.BASE_URL + '/api/Ai';

  constructor(private http: HttpClient, private sharedService: SharedService) {}

  /** Generates a short, professional Swedish work description for an invoice line from free-form context/items. */
  generateInvoiceDescription(prompt: IInvoicePromptRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<{ text: string }>(`${this.baseUrl}/invoice-description`, prompt, { headers });
  }

  /** Parses a free-text description (e.g. "BMH565, oil change, assign to Amir") into work order field suggestions. Never saves anything — the caller patches a form and the user still has to click Save. */
  parseWorkOrderIntent(transcript: string, employeeId?: number) {
    const request: IWorkOrderIntentRequest = { transcript, wmsId: this.sharedService.wmsId, employeeId };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IWorkOrderIntentResponse>(`${this.baseUrl}/parse-workorder-intent`, request, { headers });
  }

  /** Parses a free-text/spoken reminder into clean text plus a resolved assignee. */
  parseReminderIntent(transcript: string) {
    const request = { transcript, wmsId: this.sharedService.wmsId };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IReminderIntentResponse>(`${this.baseUrl}/parse-reminder-intent`, request, { headers });
  }

  /** Transcribes a recorded audio clip to text. Used by the AI-assist input, the work order description field, and the reminders quick-capture row. */
  transcribeAudio(audio: Blob) {
    const formData = new FormData();
    formData.append('audio', audio, 'recording.webm');
    return this.http.post<{ text: string }>(`${this.baseUrl}/speech-to-text`, formData);
  }
}
