import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LogService } from './log.service';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  constructor(
    private readonly router: Router,
    private readonly logger: LogService,
    private readonly ngZone: NgZone
  ) {}

  get accessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  get wmsId(): string | null {
    const wmsId = sessionStorage.getItem('wmsId')?.trim();
    return wmsId || null;
  }

  forceLogout(userMessage: string): void {
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
