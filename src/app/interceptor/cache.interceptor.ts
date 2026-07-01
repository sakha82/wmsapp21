import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ResourceCacheService } from 'app/services/resource-cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private readonly cache: ResourceCacheService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.method !== 'GET' || !this.cache.isStaticResourceUrl(request.url)) {
      return next.handle(request);
    }

    const cacheKey = this.cache.cacheKeyForUrl(request.url);
    const cached = this.cache.get<unknown>(cacheKey);
    if (cached !== null) {
      return of(new HttpResponse({ body: cached, status: 200, url: request.url }));
    }

    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse && event.body != null) {
          this.cache.set(cacheKey, event.body);
        }
      })
    );
  }
}
