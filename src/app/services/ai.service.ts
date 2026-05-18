import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IInvoicePromptRequest, IVehicleType } from 'app/app.model';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AiService {
  private baseUrl: string = environment.BASE_URL + '/api/ai';

  constructor(private http: HttpClient) {}

  getInvoiceDescription(prompt: IInvoicePromptRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<string>(`${this.baseUrl}/invoice-description`, prompt, { headers });
  }

  createVehicleModel(vehicleType: IVehicleType): Observable<boolean> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<boolean>(`${this.baseUrl}/create-model`, vehicleType, { headers });
  }
}
