# SEO Checklist (No SSR) - Digital Workshop

This checklist is for your current client-side rendered setup (no SSR/prerender yet).

## 1) Google Search Console setup (manual)

Yes, this step is manual and should be done by you in Google Search Console.

1. Go to https://search.google.com/search-console
2. Add property for your domain:
   - Preferred: Domain property for `digitalworkshop.nu` (DNS verification)
   - Alternative: URL-prefix property for `https://digitalworkshop.nu/`
3. Verify ownership.
4. Open URL Inspection and submit:
   - `https://digitalworkshop.nu/`
5. Open Sitemaps and submit:
   - `https://digitalworkshop.nu/sitemap.xml`

## 2) robots.txt (must have)

You should have a `robots.txt` at the site root:

- URL must be: `https://digitalworkshop.nu/robots.txt`
- It should allow crawling and point to sitemap.

Recommended content:

```txt
User-agent: *
Allow: /

Sitemap: https://digitalworkshop.nu/sitemap.xml
```

## 3) sitemap.xml (must have)

You should have a `sitemap.xml` at the site root:

- URL must be: `https://digitalworkshop.nu/sitemap.xml`
- Include canonical public URLs.

Starter sitemap:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://digitalworkshop.nu/</loc>
    <lastmod>2026-04-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

## 4) Validate after publish

1. Open `https://digitalworkshop.nu/robots.txt` in browser and verify content.
2. Open `https://digitalworkshop.nu/sitemap.xml` in browser and verify valid XML.
3. In Search Console:
   - Resubmit sitemap if changed.
   - Request indexing for homepage after major metadata/content updates.

## 5) Metadata checks

Already implemented in project:

- Canonical URL points to `https://digitalworkshop.nu/`
- Swedish locale metadata
- FAQ structured data and SoftwareApplication structured data

## 6) Monitoring (weekly)

Track in Search Console:

1. Indexing > Pages: ensure homepage is indexed.
2. Enhancements / Rich results: monitor structured data detection.
3. Performance > Search results: monitor impressions, CTR, and top queries.

## 7) When SSR is planned (next phase)

For now, keep deployment unchanged.
When ready, migrate gradually:

1. Prerender only public landing route first.
2. Keep authenticated app routes CSR initially.
3. Validate crawlability and Core Web Vitals before full rollout.
