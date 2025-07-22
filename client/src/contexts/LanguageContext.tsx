import React from "react";
import type { Language } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

// Create context with default value to avoid undefined
const LanguageContext = React.createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {}
});

// Simple state management without complex hooks
let currentLanguage: Language = 'en';
const subscribers: Array<(lang: Language) => void> = [];

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('temple-language');
  if (saved && (saved === 'en' || saved === 'ta')) {
    currentLanguage = saved as Language;
  }
}

function notifySubscribers() {
  subscribers.forEach(callback => callback(currentLanguage));
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('temple-language', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(currentLanguage);

  React.useEffect(() => {
    const updateLanguage = (newLang: Language) => {
      setLanguageState(newLang);
    };
    
    subscribers.push(updateLanguage);
    
    return () => {
      const index = subscribers.indexOf(updateLanguage);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  const setLanguage = React.useCallback((lang: Language) => {
    currentLanguage = lang;
    notifySubscribers();
  }, []);

  const toggleLanguage = React.useCallback(() => {
    const newLang = currentLanguage === 'en' ? 'ta' : 'en';
    currentLanguage = newLang;
    notifySubscribers();
  }, []);

  const contextValue = React.useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage
  }), [language, setLanguage, toggleLanguage]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  return context;
}

export function useTranslation() {
  const { language } = useLanguage();
  
  return React.useCallback((key: keyof typeof translations.en) => {
    return translations[language as keyof typeof translations][key] || translations.en[key];
  }, [language]);
}