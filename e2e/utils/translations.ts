import translations from '../../src/assets/resources/trans.json';
import enums from '../../src/assets/resources/enums.json';

interface TranslationEntry {
  tkey: string;
  en: string;
  sv: string;
}

interface EnumEntry {
  country: string;
  lang: string;
  key: string;
  value: string;
  text: string;
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

/**
 * Resolves an enums.json (key, value) pair to its display text the same way
 * SharedService.getEnumByValue() does - for dropdown/checkbox option labels
 * that live in enums.json rather than trans.json (e.g. detailCategory, the
 * digitalservice checkbox list).
 */
export function enumText(key: string, value: string, lang: 'en' | 'sv' = 'sv'): string {
  const entry = (enums as EnumEntry[]).find((e) => e.key === key && e.value === value && e.lang === lang);
  if (!entry) {
    throw new Error(`Unknown enum (key="${key}", value="${value}", lang="${lang}") — check src/assets/resources/enums.json`);
  }
  return entry.text;
}
