import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { AuthSessionService } from 'app/services/auth-session.service';

const WMS_ID_KEYS = ['wmsId', 'wmsid'];

/** API routes that must not require a workshop/tenant id. */
const EXEMPT_URL_FRAGMENTS = [
  '/assets/',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/user/forgotpassword',
  '/api/user/resetpassword',
  '/api/core/signup',
  '/api/demo/bookdemo',
];

@Injectable()
export class WmsIdInterceptor implements HttpInterceptor {
  constructor(private readonly authSession: AuthSessionService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isExempt(request)) {
      return next.handle(request);
    }

    const accessToken = this.authSession.accessToken;
    const wmsId = this.authSession.wmsId;

    if (accessToken && !wmsId) {
      this.authSession.forceLogout(
        'Verkstadskontext saknas i sessionen. Logga in igen.'
      );
      return EMPTY;
    }

    if (!wmsId) {
      return next.handle(request);
    }

    if (this.requestHasWmsId(request)) {
      return next.handle(request);
    }

    return next.handle(this.attachWmsId(request, wmsId));
  }

  private isExempt(request: HttpRequest<unknown>): boolean {
    const url = request.url.toLowerCase();
    return EXEMPT_URL_FRAGMENTS.some((fragment) => url.includes(fragment));
  }

  private requestHasWmsId(request: HttpRequest<unknown>): boolean {
    if (this.urlHasWmsId(request.url)) {
      return true;
    }

    if (this.paramsHaveWmsId(request.params)) {
      return true;
    }

    return this.bodyHasWmsId(request.body);
  }

  private urlHasWmsId(url: string): boolean {
    return WMS_ID_KEYS.some((key) => new RegExp(`[?&]${key}=`, 'i').test(url));
  }

  private paramsHaveWmsId(params: HttpParams): boolean {
    return WMS_ID_KEYS.some((key) => params.has(key));
  }

  private bodyHasWmsId(body: unknown): boolean {
    if (body == null) {
      return false;
    }

    if (body instanceof FormData) {
      return WMS_ID_KEYS.some((key) => body.has(key));
    }

    if (typeof body === 'object') {
      const record = body as Record<string, unknown>;
      return WMS_ID_KEYS.some((key) => key in record && record[key] != null && record[key] !== '');
    }

    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        return WMS_ID_KEYS.some(
          (key) => key in parsed && parsed[key] != null && parsed[key] !== ''
        );
      } catch {
        return false;
      }
    }

    return false;
  }

  private attachWmsId(request: HttpRequest<unknown>, wmsId: string): HttpRequest<unknown> {
    const method = request.method.toUpperCase();

    if (method === 'GET' || method === 'DELETE' || method === 'HEAD' || method === 'OPTIONS') {
      return request.clone({
        params: request.params.set('wmsId', wmsId),
      });
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      if (request.body == null) {
        return request.clone({
          params: request.params.set('wmsId', wmsId),
        });
      }

      if (request.body instanceof FormData) {
        const formData = new FormData();
        request.body.forEach((value, key) => formData.append(key, value));
        formData.set('wmsId', wmsId);
        return request.clone({ body: formData });
      }

      if (typeof request.body === 'string') {
        try {
          const parsed = JSON.parse(request.body) as Record<string, unknown>;
          return request.clone({ body: { ...parsed, wmsId } });
        } catch {
          return request.clone({
            params: request.params.set('wmsId', wmsId),
          });
        }
      }

      if (typeof request.body === 'object') {
        return request.clone({
          body: { ...(request.body as Record<string, unknown>), wmsId },
        });
      }
    }

    return request.clone({
      params: request.params.set('wmsId', wmsId),
    });
  }
}
