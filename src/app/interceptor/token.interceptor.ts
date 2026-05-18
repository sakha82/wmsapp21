import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, EMPTY, Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { LogService } from 'app/services/log.service';
import { AuthSessionService } from 'app/services/auth-session.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private logger: LogService, private authSession: AuthSessionService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> 
  { 
  const accessToken = sessionStorage.getItem('accessToken');
  if (accessToken) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
  return next.handle(request).pipe(
  catchError((error: HttpErrorResponse) => {
    const status = error.status;
    // Only handle auth-related errors here: 401/404 with an access token present
    if ((status === 401 || status === 404) && accessToken) {
      // Try to read a message from the backend response
      let serverMessage = '';

      if (typeof error.error === 'string') {
        serverMessage = error.error;
      } else if (error.error && typeof error.error.message === 'string') {
        serverMessage = error.error.message;
      }

      // Default user message
      let userMessage = 'Din session är ogiltig eller har gått ut. Logga in igen.';

      // If backend middleware used the specific text:
      // "You have been logged out because your account was used to sign in from another location."
      if (serverMessage.toLowerCase().includes('double session')) {
        userMessage = 'Du har loggats ut eftersom ditt konto användes för inloggning på en annan plats. Logga in igen.';
      }
      this.logger.warn('Auth error, navigating to login', { status, serverMessage });
      this.authSession.forceLogout(userMessage);
      return EMPTY;
    }

    // For all other errors (including 400), just pass through
    return throwError(() => error);
  })
);
} 
}
