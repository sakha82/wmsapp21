import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

const DEFAULT_SEO: SeoConfig = {
  title: 'Digital Workshop | AI-drivet verkstadssystem för Sverige',
  description:
    'Digital Workshop är ett AI-drivet verkstadssystem för svenska bilverkstäder med arbetsorder, fakturering, schemaläggning och digital servicebok.',
  keywords:
    'verkstadssystem, bilverkstad, arbetsorder, fakturering, digital servicebok, schemaläggning',
  canonical: 'https://digitalworkshop.nu/',
  ogImage: 'https://digitalworkshop.nu/assets/images/og-cover.jpg',
};

@Injectable({ providedIn: 'root' })
export class SeoMetaService {
  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  update(config: Partial<SeoConfig>): void {
    const seo: SeoConfig = { ...DEFAULT_SEO, ...config };

    this.title.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });

    if (seo.keywords) {
      this.meta.updateTag({ name: 'keywords', content: seo.keywords });
    }

    this.meta.updateTag({ property: 'og:title', content: seo.ogTitle ?? seo.title });
    this.meta.updateTag({
      property: 'og:description',
      content: seo.ogDescription ?? seo.description,
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Digital Workshop' });

    if (seo.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: seo.ogImage });
    }
    if (seo.ogUrl) {
      this.meta.updateTag({ property: 'og:url', content: seo.ogUrl });
    }

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: seo.twitterTitle ?? seo.title });
    this.meta.updateTag({
      name: 'twitter:description',
      content: seo.twitterDescription ?? seo.description,
    });
    if (seo.twitterImage ?? seo.ogImage) {
      this.meta.updateTag({
        name: 'twitter:image',
        content: seo.twitterImage ?? seo.ogImage!,
      });
    }

    if (seo.canonical) {
      this.setCanonical(seo.canonical);
    }
  }

  applyHome(): void {
    this.update(DEFAULT_SEO);
  }

  applyPrivacyPolicy(): void {
    this.update({
      title: 'Integritetspolicy | Digital Workshop',
      description: 'Läs hur Digital Workshop hanterar personuppgifter och integritet.',
      canonical: 'https://digitalworkshop.nu/privacy-policy',
      ogUrl: 'https://digitalworkshop.nu/privacy-policy',
    });
  }

  applyProductDetail(productName: string, productId: number): void {
    this.update({
      title: `${productName} | Produkter | Digital Workshop`,
      description: `Produktdetaljer för ${productName} i Digital Workshop.`,
      canonical: `https://digitalworkshop.nu/sv/product/details/${productId}`,
      ogUrl: `https://digitalworkshop.nu/sv/product/details/${productId}`,
    });
  }

  private setCanonical(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
