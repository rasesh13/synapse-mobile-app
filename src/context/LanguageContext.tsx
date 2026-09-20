/**
 * SynapseOS Mobile — LanguageContext
 * Full 11-language runtime state management with persistence
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { LanguageCode, LanguageInfo, SUPPORTED_LANGUAGES } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { SecureStorage } from '../storage/secureStorage';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  currentLanguageInfo: LanguageInfo;
  t: (key: string) => string;
  supportedLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    SecureStorage.getLanguage().then(saved => {
      if (saved) {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = async (newLang: LanguageCode) => {
    setLanguageState(newLang);
    await SecureStorage.setLanguage(newLang);
  };

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = useMemo(() => {
    const activeDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    const enDict = TRANSLATIONS.en;
    return (key: string): string => {
      return activeDict[key] || enDict[key] || key;
    };
  }, [language]);

  const value = {
    language,
    setLanguage,
    currentLanguageInfo,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
