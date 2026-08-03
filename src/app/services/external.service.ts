import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class ExternalService {
  private baseUrl: string = environment.BASE_URL + '/api/external';

  constructor(private http: HttpClient) {}

  getCompanyInfo(companyId:string)
    {
        const queryParams = new URLSearchParams();
        queryParams.append("companyId", companyId);
        const url = `${this.baseUrl}/company-info?${queryParams}`;
        return this.http.get<any>(url);
    }

}
