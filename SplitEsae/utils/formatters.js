/**
 * Utility functions for formatting data
 */

/**
 * Format currency amount with proper currency symbol and locale
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (e.g., 'SAR', 'USD', 'EUR')
 * @param {string} locale - The locale for formatting (default: 'ar-SA')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'TRY', locale = 'tr-TR') => {
  // Ensure amount is a valid number
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  // Currency symbols mapping
  const currencySymbols = {
    SAR: 'SAR',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED',
  KWD: 'KWD',
  QAR: 'QAR',
  BHD: 'BHD',
  OMR: 'OMR',
  JOD: 'JOD',
  EGP: 'EGP',
  LBP: 'LBP',
  };

  // Get currency symbol
  const symbol = currencySymbols[currency] || currency;
  
  try {
    // Format number with locale-specific formatting
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
    
    // Return formatted string with currency symbol
    return `${formattedAmount} ${symbol}`;
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    const formattedAmount = safeAmount.toFixed(2);
    return `${formattedAmount} ${symbol}`;
  }
};

/**
 * Format date to a readable string
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale for formatting (default: 'ar-SA')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'tr-TR') => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Geçersiz tarih';
  }
};

/**
 * Format time to a readable string
 * @param {string|Date} date - The date to format time from
 * @param {string} locale - The locale for formatting (default: 'ar-SA')
 * @returns {string} Formatted time string
 */
export const formatTime = (date, locale = 'tr-TR') => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    return 'Geçersiz saat';
  }
};

/**
 * Format number with thousands separator
 * @param {number} number - The number to format
 * @param {string} locale - The locale for formatting (default: 'ar-SA')
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, locale = 'tr-TR') => {
  const safeNumber = typeof number === 'number' && !isNaN(number) ? number : 0;
  
  try {
    return new Intl.NumberFormat(locale).format(safeNumber);
  } catch (error) {
    return safeNumber.toString();
  }
};

/**
 * Format percentage
 * @param {number} value - The value to format as percentage
 * @param {number} total - The total value for percentage calculation
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, total, decimals = 1) => {
  if (total === 0 || isNaN(value) || isNaN(total)) {
    return '0%';
  }
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
  formatCurrency,
  formatDate,
  formatTime,
  formatNumber,
  formatPercentage,
  truncateText,
  formatFileSize,
};