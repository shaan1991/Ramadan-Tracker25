// src/utils/rtlUtils.js
// Utility functions for RTL support

/**
 * Sets the direction of the document based on the language
 * @param {string} language - The language code
 */
export const setDocumentDirection = (language) => {
    const rtlLanguages = ['ar', 'ur', 'he', 'fa'];
    const dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
    
    document.documentElement.dir = dir;
    document.body.dir = dir;
    
    // Update the lang attribute for accessibility
    document.documentElement.lang = language;
    
    // Add or remove the RTL class from the body
    if (dir === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
    
    return dir;
  };
  
  /**
   * Determines if a language is RTL
   * @param {string} language - The language code
   * @returns {boolean} - True if RTL, false otherwise
   */
  export const isRTL = (language) => {
    const rtlLanguages = ['ar', 'ur', 'he', 'fa'];
    return rtlLanguages.includes(language);
  };