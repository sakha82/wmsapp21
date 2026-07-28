import translations from '../../src/assets/resources/trans.json';

interface TranslationEntry {
  tkey: string;
  en: string;
  sv: string;
}

const byKey = new Map<string, TranslationEntry>((translations as TranslationEntry[]).map((t) => [t.tkey, t]));

/**
 * Resolves a trans.json key the same way SharedService.T() does, so specs
 * assert against real UI copy instead of hardcoding a second copy of it
 * (the app defaults to 'sv' — see SharedService.lang).
 */
export function t(key: string, lang: 'en' | 'sv' = 'sv'): string {
  const entry = byKey.get(key);
  if (!entry) {
    throw new Error(`Unknown translation key "${key}" — check src/assets/resources/trans.json`);
  }
  return entry[lang];
}
