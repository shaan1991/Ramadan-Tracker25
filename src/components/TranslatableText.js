// src/components/TranslatableText.js
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// A simple component that returns text as-is for now
// Later will be enhanced with actual translation
const TranslatableText = ({ children }) => {
  const { language } = useLanguage();
  
  // For now, just return the children
  return <>{children}</>;
};

export default TranslatableText;