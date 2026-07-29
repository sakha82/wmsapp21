import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IInvoicePromptRequest } from 'app/app.model';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class ExternalService {
  private baseUrl: string = environment.BASE_URL + '/api/external';

  constructor(private http: HttpClient) {}

  getInvoiceDescription(prompt: IInvoicePromptRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<string>(`${this.baseUrl}/invoice-description`, prompt, { headers });
  }

  getCompanyInfo(companyId:string)
    {
        const queryParams = new URLSearchParams();
        queryParams.append("companyId", companyId);
        const url = `${this.baseUrl}/company-info?${queryParams}`;
        return this.http.get<any>(url);
    }

}
