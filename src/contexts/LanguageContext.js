// src/contexts/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';

// List of supported languages with their native names
export const supportedLanguages = {
  en: { name: 'English', dir: 'ltr' },
  ar: { name: 'العربية', dir: 'rtl' }, // Arabic
  ur: { name: 'اردو', dir: 'rtl' },    // Urdu
  fr: { name: 'Français', dir: 'ltr' } // French
};

// Create the language context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  
  // Change language function
  const changeLanguage = (newLang) => {
    if (supportedLanguages[newLang]) {
      setLanguage(newLang);
      localStorage.setItem('preferredLanguage', newLang);
    }
  };
  
  // Update document direction when language changes
  useEffect(() => {
    // Check if the language is RTL
    const isRightToLeft = language === 'ar' || language === 'ur';
    setIsRTL(isRightToLeft);
    
    // Update document direction
    document.documentElement.dir = isRightToLeft ? 'rtl' : 'ltr';
    
    // Load language from localStorage if available
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && supportedLanguages[savedLang]) {
      setLanguage(savedLang);
    }
  }, [language]);
  
  // Simple translation function - just returns the text for now
  const translate = (text) => {
    return text;
  };
  
  // Context value
  const value = {
    language,
    isRTL,
    supportedLanguages,
    changeLanguage,
    translate
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper hook for translation
export const useTranslation = () => {
  const { translate } = useLanguage();
  return { t: translate };
};