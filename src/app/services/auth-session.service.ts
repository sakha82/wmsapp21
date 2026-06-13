import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LogService } from './log.service';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  constructor(
    private readonly router: Router,
    private readonly logger: LogService,
    private readonly ngZone: NgZone,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  get accessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return sessionStorage.getItem('accessToken');
  }

  get wmsId(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const wmsId = sessionStorage.getItem('wmsId')?.trim();
    return wmsId || null;
  }

  forceLogout(userMessage: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    sessionStorage.clear();
    sessionStorage.setItem('authErrorMessage', userMessage);
    this.logger.warn('Forced logout', { userMessage });

    this.ngZone.run(() => {
      this.router.navigate(['']).then(
        (success) => {
          if (!success) {
            window.location.href = '/';
          }
        },
        () => {
          window.location.href = '/';
        }
      );
    });
  }
}
