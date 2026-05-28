// ELAB Tutor — © Andrea Marro — 2026-05-28
// i18n runtime config: react-i18next + browser-languagedetector.
// IT default, EN second locale, fallback IT.
// Locales loaded statically (single bundle); future lazy-load can swap to Backend plugin.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import itTranslations from '../locales/it.json';
import enTranslations from '../locales/en.json';

const SUPPORTED = ['it', 'en'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: itTranslations },
      en: { translation: enTranslations },
    },
    fallbackLng: 'it',
    supportedLngs: SUPPORTED,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'elab-locale',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
    returnEmptyString: false,
  });

export { SUPPORTED };
export default i18n;
