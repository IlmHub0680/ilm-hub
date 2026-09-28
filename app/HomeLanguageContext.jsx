'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translate } from './homepage-i18n';

// Homepage-scoped EN/AR toggle -- separate storage key and dictionary
// from the Admission flow's own LanguageContext (app/admission), since
// the two pages have entirely different content. Persists the choice
// across visits the same way Admission does.
const STORAGE_KEY = 'ulul_azm_homepage_language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'ar' || stored === 'en') {
        setLang(stored);
      }
    } catch (error) {
      // localStorage unavailable -- default to English for this visit.
    } finally {
      setReady(true);
    }
  }, []);

  const changeLang = useCallback((next) => {
    setLang(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      // Non-fatal -- the choice just won't persist across reloads.
    }
  }, []);

  const t = useCallback((text) => translate(lang, text), [lang]);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t, dir, ready }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);

  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return ctx;
}
