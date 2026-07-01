import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, throwError } from 'rxjs';
import { LogService } from 'app/services/log.service';

export interface NormalizedApiError {
  status: number;
  message: string;
  url: string;
  serverMessage?: string;
}

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  constructor(
    private readonly logger: LogService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const normalized = this.normalizeError(error, request.url);

        if (!isPlatformBrowser(this.platformId)) {
          this.logger.warn('[SSR API Error]', normalized);
        } else {
          this.logger.error('[API Error]', normalized);
        }

        return throwError(() => normalized);
      })
    );
  }

  private normalizeError(error: HttpErrorResponse, url: string): NormalizedApiError {
    let serverMessage = '';
    if (typeof error.error === 'string') {
      serverMessage = error.error;
    } else if (error.error && typeof error.error.message === 'string') {
      serverMessage = error.error.message;
    }

    const message =
      serverMessage ||
      error.message ||
      'Ett oväntat fel uppstod. Försök igen senare.';

    return {
      status: error.status,
      message,
      url,
      serverMessage: serverMessage || undefined,
    };
  }
}
