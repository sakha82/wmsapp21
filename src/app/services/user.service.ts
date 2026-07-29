import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ForgotPassword, ResetPassword } from 'app/app.model';
import { environment } from 'environments/environment';

/** Wraps every `UserController` endpoint (`/api/User/*`) used outside the auth module itself. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private userUrl: string = environment.BASE_URL + '/api/User';

  constructor(private http: HttpClient) {}

  isValidAppUser(userId: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('userId', userId);
    const url = `${this.userUrl}/is-valid-appuser?${queryParams}`;
    return this.http.get<Boolean>(url);
  }

  resetPassword(resetPassword: ResetPassword) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<boolean>(`${this.userUrl}/resetpassword`, resetPassword, { headers });
  }

  forgotPassword(forgotPassword: ForgotPassword) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<boolean>(`${this.userUrl}/forgotpassword`, forgotPassword, { headers });
  }
}
