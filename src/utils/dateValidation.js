// src/utils/dateValidation.js
// Utilities for validating dates related to Ramadan with region support

// Default Ramadan dates (expected, subject to moon sighting)
// Many astronomical sources point to first fast on Feb 19, 2026 (if the crescent isn't visible on Feb 17).
export const DEFAULT_RAMADAN_START_DATE = new Date('2026-02-19'); // February 19, 2026 (expected)
export const DEFAULT_RAMADAN_END_DATE = new Date('2026-03-20');   // March 20, 2026 (expected end if 30 days)

// Region-specific start dates (exported for use in RegionSelector)
export const DEFAULT_RAMADAN_REGION = 'Likely start (Expected Feb 19)';

export const RAMADAN_REGIONS = {
  'Early sighting (Possible Feb 18)': '2026-02-18',
  'Likely start (Expected Feb 19)': '2026-02-19'
};

/**
 * Gets the appropriate Ramadan start date based on user data
 * @param {Object} userData - User data object which may contain region info
 * @returns {Date} - The Ramadan start date for the user's region
 */
export const getRamadanStartDate = (userData) => {
  // If userData has a ramadanStartDate, use that
  if (userData?.ramadanStartDate) {
    return new Date(userData.ramadanStartDate);
  }
  
  // If userData has a ramadanRegion, use the date for that region
  if (userData?.ramadanRegion && RAMADAN_REGIONS[userData.ramadanRegion]) {
    return new Date(RAMADAN_REGIONS[userData.ramadanRegion]);
  }
  
  // If no user data or no valid region, use default
  return DEFAULT_RAMADAN_START_DATE;
};

/**
 * Gets the Ramadan end date (always 30 days after start date)
 * @param {Object} userData - User data object which may contain region info
 * @returns {Date} - The Ramadan end date for the user's region
 */
export const getRamadanEndDate = (userData) => {
  const startDate = getRamadanStartDate(userData);
  const length = userData?.ramadanLength || 30;
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (length - 1)); // 29 or 30 days (including first day)
  return endDate;
};

/**
 * Formats a date as YYYY-MM-DD - ensures consistent format across the app
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a date is before Ramadan starts
 * @param {Date|string} date - Date to check
 * @param {Object} userData - User data for region-specific checking
 * @returns {boolean} True if date is before Ramadan
 */
export const isBeforeRamadan = (date, userData) => {
  // Ensure date is a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Set time to midnight for accurate comparison
  const normalizedDate = new Date(dateObj);
  normalizedDate.setHours(0, 0, 0, 0);
  
  const startDate = getRamadanStartDate(userData);
  startDate.setHours(0, 0, 0, 0);
  
  return normalizedDate < startDate;
};

/**
 * Checks if a date is within Ramadan period
 * @param {Date|string} date - Date to check
 * @param {Object} userData - User data for region-specific checking
 * @returns {boolean} True if date is during Ramadan
 */
export const isWithinRamadan = (date, userData) => {
  // Ensure date is a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Set time to noon for accurate comparison
  const normalizedDate = new Date(dateObj);
  normalizedDate.setHours(12, 0, 0, 0);
  
  const startDate = getRamadanStartDate(userData);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = getRamadanEndDate(userData);
  endDate.setHours(23, 59, 59, 999); // End of the last day
  
  return normalizedDate >= startDate && normalizedDate <= endDate;
};

/**
 * Calculates which day of Ramadan a date is (1-30)
 * Returns 0 for dates before Ramadan starts
 * @param {Date|string} date - Date to calculate
 * @param {Object} userData - User data for region-specific calculation
 * @returns {number} Day of Ramadan (1-30), 0 for before Ramadan
 */
export const calculateRamadanDay = (date, userData) => {
  // Ensure date is a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // If date is before Ramadan, return 0
  if (isBeforeRamadan(dateObj, userData)) {
    return 0;
  }
  
  // Set time to noon to avoid timezone issues
  const normalizedDate = new Date(dateObj);
  normalizedDate.setHours(12, 0, 0, 0);
  
  const startDate = getRamadanStartDate(userData);
  startDate.setHours(12, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = normalizedDate - startDate;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 because first day is day 1
  
  // Cap at 30 days
  return Math.min(diffDays, 30);
};
