/**
 * Format a number to K (thousands) or M (millions) format
 * @param {number} value - The number to format
 * @param {boolean} useKFormat - If true, format as K for 5-6 digits, M for 7+
 * @returns {string} Formatted string (e.g., "21.3K" or "1.0M") or original number as string
 */
export function formatYAxisLabel(value, useKFormat = false) {
  if (!useKFormat) {
    return Math.round(value).toString();
  }

  const absValue = Math.abs(value);
  const digitCount = Math.floor(absValue).toString().length;

  if (digitCount >= 7) {
    // Format as millions (M) - e.g., 1047533 -> 1.0M
    const millions = value / 1000000;
    return (Math.round(millions * 10) / 10).toFixed(1) + 'M';
  } else if (digitCount >= 5) {
    // Format as thousands (K) - e.g., 21345 -> 21.3K
    const thousands = value / 1000;
    return (Math.round(thousands * 10) / 10).toFixed(1) + 'K';
  }

  // Less than 5 digits: return as is
  return Math.round(value).toString();
}

/**
 * Determine if Y-axis labels should use K/M formatting based on max value
 * @param {Array} chartData - Array of chart data points with {value: number} structure
 * @returns {boolean} True if formatting should be applied (5+ digits)
 */
export function shouldFormatYAxisLabels(chartData) {
  if (!chartData || chartData.length === 0) return false;
  
  const maxValue = chartData.reduce((max, item) => Math.max(max, item.value), -Infinity);
  const digitCount = Math.floor(Math.abs(maxValue)).toString().length;
  
  return digitCount >= 5;
}

/**
 * Calculate the additional width needed for Y-axis labels based on the number of digits
 * in the maximum data point value
 * @param {Array} chartData - Array of chart data points with {value: number} structure
 * @returns {number} Additional width to add to base yAxisLabelWidth (40)
 */
export function calculateYAxisLabelWidth(chartData) {
  // Find the maximum value in the chart data
  const maxValue = chartData.reduce((max, item) => Math.max(max, item.value), -Infinity);
  
  // Get the number of digits
  const digitCount = Math.floor(maxValue).toString().length;

  // Return additional width based on digit count
  if (digitCount <= 4) {
    return 0;  // 4 digits or less: add 0 (keep at 40)
  } else if (digitCount === 5) {
    return 5;  // 5 digits: add 5 (becomes 45)
  } else if (digitCount === 6) {
    return 10; // 6 digits: add 10 (becomes 50)
  } else {
    return 15; // 7+ digits: add 15 (becomes 55)
  }
}

