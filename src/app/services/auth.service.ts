import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITokenClaims, WmsUser } from 'app/app.model';
import { environment } from 'environments/environment';

/**
 * Wraps every `AuthController` endpoint (`/api/auth/*`). Only `login`/`logout` are real routes.
 * `getClaimsFromToken`, `getOfferStatus`, `updateCustomerOffer`, and `printPdfFromToken` call routes
 * that don't exist in wms-api — flagged broken, not fixed here (see root DECISIONS.md). Used by the
 * public no-login offer webview, which is broken end-to-end until that's addressed separately.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl: string = environment.BASE_URL + '/api/auth';

  constructor(private http: HttpClient) {}

  login(login: WmsUser) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<WmsUser>(`${this.authUrl}/login`, login, { headers });
  }

  logout() {
    let userName = sessionStorage.getItem('userName') == null ? '' : sessionStorage.getItem('userName');
    const queryParams = new URLSearchParams();
    queryParams.append('userName', userName!);

    const url = `${this.authUrl}/logout?${queryParams}`;
    return this.http.get<Boolean>(url);
  }

  getClaimsFromToken(token: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('token', token);
    const url = `${this.authUrl}/token-claims?${queryParams}`;
    return this.http.get<ITokenClaims>(url);
  }

  getOfferStatus(wmsId: string, offerId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', wmsId);
    queryParams.append('offerId', offerId.toString());
    const url = `${this.authUrl}/offer-status?${queryParams}`;
    return this.http.get<{ status: string, date: string }>(url);
  }

  updateCustomerOffer(wmsId: string, offerId: number, isAccepted?: boolean) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', wmsId);
    queryParams.append('offerId', offerId.toString());
    queryParams.append('isAccepted', isAccepted ? isAccepted.toString() : 'false');
    const url = `${this.authUrl}/update-customer-offer?${queryParams}`;
    return this.http.get<boolean>(url);
  }

  printPdfFromToken(token: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('token', token);

    return this.http.post(`${this.authUrl}/pdf-from-token?${queryParams}`, null, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      },
      responseType: 'blob' as 'json' // Type assertion to satisfy Angular's HttpClient
    });
  }
}
