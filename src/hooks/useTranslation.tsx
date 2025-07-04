
import { useState, useEffect } from 'react';
import { getTranslation } from '@/lib/i18n';
import { formatCurrency } from '@/lib/formatCurrency';

export const useTranslation = (namespace?: string) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string, defaultValue?: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return getTranslation(fullKey, defaultValue || key, language);
  };

  const changeLanguage = (lng: string) => {
    setLanguage(lng);
  };

  return { 
    t, 
    language, 
    currentLanguage: language,
    changeLanguage,
    formatCurrency
  };
};
