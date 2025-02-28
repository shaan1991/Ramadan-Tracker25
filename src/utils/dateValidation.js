// src/utils/dateValidation.js
// Utilities for validating dates related to Ramadan

// Define Ramadan dates - update these for the correct year
export const RAMADAN_START_DATE = new Date('2025-02-28'); // February 27, 2025
export const RAMADAN_END_DATE = new Date('2025-04-01');   // March 28, 2025

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