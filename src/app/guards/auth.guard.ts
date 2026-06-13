import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  if (sessionStorage.getItem('accessToken')) {
    return true;
  }

  console.log('authguard failed. guard is moving to home page');
  inject(Router).navigate(['']);
  return false;
};
