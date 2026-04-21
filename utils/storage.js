/**
 * LocalStorage utilities for persisting application data
 */

import { STORAGE_CONFIG } from './config.js';

/**
 * Retrieve stored data from localStorage
 * @returns {Object} Stored data or default schema
 */
export const getStoredData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_CONFIG.KEY);
    return stored ? JSON.parse(stored) : STORAGE_CONFIG.SCHEMA;
  } catch (error) {
    console.error('Error retrieving stored data:', error);
    return STORAGE_CONFIG.SCHEMA;
  }
};

/**
 * Save data to localStorage
 * @param {Object} data - Data to save
 */
export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_CONFIG.KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

/**
 * Clear all stored data
 */
export const clearStoredData = () => {
  try {
    localStorage.removeItem(STORAGE_CONFIG.KEY);
  } catch (error) {
    console.error('Error clearing stored data:', error);
  }
};

/**
 * Export data as JSON for backup
 * @returns {string} JSON string of all data
 */
export const exportData = () => {
  const data = getStoredData();
  return JSON.stringify(data, null, 2);
};

/**
 * Import data from JSON
 * @param {string} jsonString - JSON string to import
 * @returns {boolean} Success status
 */
export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.movies && data.anime && data.books) {
      saveData(data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
