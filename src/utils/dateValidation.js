<<<<<<< HEAD

=======
>>>>>>> pre-final
// src/utils/dateValidation.js
// Utilities for validating dates related to Ramadan

<<<<<<< HEAD
// Define Ramadan dates - update these for the correct year
export const RAMADAN_START_DATE = new Date('2025-02-28'); // February 27, 2025
<<<<<<< HEAD
export const RAMADAN_END_DATE = new Date('2025-03-30');   // March 28, 2025
=======
export const RAMADAN_END_DATE = new Date('2025-03-28');   // March 28, 2025
>>>>>>> pre-final
=======
// We'll make these values dynamic so they can be updated based on user's location
let RAMADAN_START_DATE = new Date('2025-02-28'); // February 27, 2025 - Default date
let RAMADAN_END_DATE = new Date('2025-03-30');   // March 28, 2025 - 30 days after start

// Function to update the Ramadan dates based on user's location
// This will be called from the Home component when location is determined
export const updateRamadanDates = (startDate) => {
  if (!startDate) return;
  
  // Update start date
  RAMADAN_START_DATE = new Date(startDate);
  
  // Calculate end date (30 days after start)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 29); // 30 days including start date
  RAMADAN_END_DATE = endDate;
  
  console.log(`Ramadan dates updated - Start: ${RAMADAN_START_DATE.toDateString()}, End: ${RAMADAN_END_DATE.toDateString()}`);
  
  // Make the update function available globally so it can be called from any component
  if (typeof window !== 'undefined') {
    window.updateRamadanStartDate = updateRamadanDates;
  }
};
>>>>>>> pre-final

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
 * @returns {boolean} True if date is before Ramadan
 */
export const isBeforeRamadan = (date) => {
  // Ensure date is a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Set time to midnight for accurate comparison
  const normalizedDate = new Date(dateObj);
  normalizedDate.setHours(0, 0, 0, 0);
  
  const startDate = new Date(RAMADAN_START_DATE);
  startDate.setHours(0, 0, 0, 0);
  
  return normalizedDate < startDate;
};

/**
 * Checks if a date is within Ramadan period
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is during Ramadan
 */
export const isWithinRamadan = (date) => {
  // Ensure date is a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Set time to midnight for accurate comparison
  const normalizedDate = new Date(dateObj);
  normalizedDate.setHours(0, 0, 0, 0);
  
  const startDate = new Date(RAMADAN_START_DATE);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(RAMADAN_END_DATE);
  endDate.setHours(23, 59, 59, 999); // End of the last day
  
  return normalizedDate >= startDate && normalizedDate <= endDate;
};

/**
 * Calculates which day of Ramadan a date is (1-30)
 * Returns 0 for dates before Ramadan starts
 * @param {Date|string} date - Date to calculate
 * @returns {number} Day of Ramadan (1-30), 0 for before Ramadan
 */
export const calculateRamadanDay = (date) => {
  // Ensure date is a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // If date is before Ramadan, return 0
  if (isBeforeRamadan(dateObj)) {
    return 0;
  }
  
  // Set time to noon to avoid timezone issues
  const normalizedDate = new Date(dateObj);
  normalizedDate.setHours(12, 0, 0, 0);
  
  const startDate = new Date(RAMADAN_START_DATE);
  startDate.setHours(12, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = normalizedDate - startDate;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 because first day is day 1
  
  // Cap at 30 days
  return Math.min(diffDays, 30);
};

// Initialize by trying to get the saved date from localStorage
const initializeFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const savedDate = localStorage.getItem('ramadanStartDate');
    if (savedDate) {
      updateRamadanDates(new Date(savedDate));
    }
  }
};

// Run initialization 
initializeFromLocalStorage();