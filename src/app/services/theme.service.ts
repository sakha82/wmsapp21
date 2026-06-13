// theme.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

type Shade = 50|100|200|300|400|500|600|700|800|900|950;
const SHADES: Shade[] = [50,100,200,300,400,500,600,700,800,900,950];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private styleEl: HTMLStyleElement | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.styleEl = this.document.getElementById('dynamic-primary') as HTMLStyleElement;
    if (!this.styleEl) {
      this.styleEl = this.document.createElement('style');
      this.styleEl.id = 'dynamic-primary';
      this.document.head.appendChild(this.styleEl);
    }
  }

  setPrimaryPalette(paletteName: string) {
    if (!isPlatformBrowser(this.platformId) || !this.styleEl) {
      return;
    }

    const shadeVars = SHADES
      .map((s) => `--p-primary-${s}: var(--p-${paletteName}-${s});`)
      .join('');
    const css = `:root{${shadeVars}--p-primary-color:var(--p-${paletteName}-600);--p-primary-contrast-color:var(--p-${paletteName}-contrast-color,#ffffff);}`;
    this.styleEl.textContent = css;
  }

  setDarkMode(enable: boolean) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.document.documentElement.classList.toggle('p-dark', enable);
    this.document.documentElement.classList.toggle('dark', enable);

    console.log('Dark mode class applied:', enable);
    console.log('HTML element has p-dark:', this.document.documentElement.classList.contains('p-dark'));
    console.log('HTML element has dark:', this.document.documentElement.classList.contains('dark'));
  }

}
