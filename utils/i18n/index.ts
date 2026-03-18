// utils/i18n/index.ts
// 對外介面與原本 utils/i18n.ts 完全相同，所有 import 路徑不需要改動。

export type { Language, BaseCurrencyCode, Translations } from './types';
export { LANGUAGES } from './types';

import { zhTW } from './zh-TW';
import { zhCN } from './zh-CN';
import { en }   from './en';
import { ja }   from './ja';
import { ko }   from './ko';
import { de }   from './de';
import { fr }   from './fr';
import { hi }   from './hi';
import { ar }   from './ar';
import { pt }   from './pt';

import type { Language, Translations } from './types';
import type { BaseCurrencyCode } from './types';

const translations: Record<Language, Translations> = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  en,
  ja,
  ko,
  de,
  fr,
  hi,
  ar,
  pt,
};

export const getLanguage = (): Language => {
  const saved = localStorage.getItem('tf_language');
  const valid: Language[] = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'de', 'fr', 'hi', 'ar', 'pt'];
  return valid.includes(saved as Language) ? (saved as Language) : 'zh-TW';
};

export const setLanguage = (lang: Language): void => {
  localStorage.setItem('tf_language', lang);
};

export const t = (lang: Language): Translations =>
  translations[lang] ?? translations['zh-TW'];

export const translate = (
  key: string,
  lang: Language,
  params?: Record<string, string | number>,
): string => {
  const keys = key.split('.');
  let value: unknown = translations[lang] ?? translations['zh-TW'];
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return key;
  }
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (match, p) =>
      p in params ? String(params[p]) : match,
    );
  }
  return typeof value === 'string' ? value : key;
};

export const getBaseCurrencyLabel = (code: BaseCurrencyCode, lang: Language): string => {
  const tr = translations[lang] ?? translations['zh-TW'];
  return tr?.baseCurrency?.[code] ?? code;
};
