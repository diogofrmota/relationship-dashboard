/**
 * Utility functions and helpers
 */

import { STATUS_LABELS, STATUS_CONFIG, FILTER_CONFIG } from './config.js';

/**
 * Format status string to readable label
 * @param {string} status - Status value
 * @returns {string} Formatted label
 */
export const formatStatusLabel = (status) => STATUS_LABELS[status] || status;

/**
 * Get available status options based on category
 * @param {string} category - Category (movies, anime, books)
 * @returns {Array<string>} Array of status options
 */
export const getStatusOptions = (category) => {
  if (category === 'books') {
    return [
      STATUS_CONFIG.BOOKS.PLAN_TO_READ,
      STATUS_CONFIG.BOOKS.READING,
      STATUS_CONFIG.BOOKS.READ
    ];
  }
  return [
    STATUS_CONFIG.MOVIES_TV.PLAN_TO_WATCH,
    STATUS_CONFIG.MOVIES_TV.WATCHING,
    STATUS_CONFIG.MOVIES_TV.COMPLETED
  ];
};

/**
 * Get filter options for a category
 * @param {string} category - Category (movies, anime, books)
 * @returns {Array<Object>} Array of filter option objects
 */
export const getFilterOptions = (category) => {
  if (category === 'books') {
    return FILTER_CONFIG.BOOKS;
  }
  return FILTER_CONFIG.MOVIES_TV;
};

/**
 * Get default status for a category
 * @param {string} category - Category (movies, anime, books)
 * @returns {string} Default status
 */
export const getDefaultStatus = (category) => {
  return category === 'books'
    ? STATUS_CONFIG.BOOKS.PLAN_TO_READ
    : STATUS_CONFIG.MOVIES_TV.PLAN_TO_WATCH;
};

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Filter items by search query
 * @param {Array} items - Items to filter
 * @param {string} query - Search query
 * @returns {Array} Filtered items
 */
export const filterByQuery = (items, query) => {
  const searchQuery = query.toLowerCase();
  return items.filter(item =>
    item.title?.toLowerCase().includes(searchQuery) ||
    item.author?.toLowerCase().includes(searchQuery) ||
    item.year?.toString().includes(searchQuery)
  );
};

/**
 * Get category name with proper capitalization
 * @param {string} category - Category identifier
 * @returns {string} Formatted category name
 */
export const getCategoryName = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};
