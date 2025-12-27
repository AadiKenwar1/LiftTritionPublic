/*Function List:
 * estimate1RM
 * getHighest1RMByDate
 * format1RMForChart
 */

/**
 * Estimate 1RM from weight and reps using the Epley formula
 * Formula: weight * (1 + 0.0333 * reps)
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of repetitions
 * @returns {number} Estimated 1RM
 */
export function estimate1RM(weight, reps) {
  if (!weight || !reps || weight <= 0 || reps <= 0) {
    return 0;
  }
  return weight * (1 + 0.0333 * reps);
}

/**
 * Group logs for a specific exercise by date and get the highest 1RM for each date
 * @param {Array} logs - Array of log objects with weight, reps, and date
 * @returns {Object} Object with date keys and highest 1RM values
 */
export function getHighest1RMByDate(logs) {
  if (!logs || logs.length === 0) return {};
  
  const highest1RMByDate = {};
  
  logs.forEach(log => {
    const date = log.date;
    const estimated1RM = estimate1RM(log.weight, log.reps);
    
    if (!highest1RMByDate[date] || estimated1RM > highest1RMByDate[date]) {
      highest1RMByDate[date] = estimated1RM;
    }
  });
  
  return highest1RMByDate;
}

/**
 * Format 1RM data for chart display
 * @param {Array} logs - Array of log objects with weight, reps, and date
 * @returns {Array} Array of chart data objects with label (date) and value (1RM)
 */
export function format1RMForChart(logs) {
  const highest1RMByDate = getHighest1RMByDate(logs);
  
  return Object.entries(highest1RMByDate)
    .map(([date, estimated1RM]) => ({
      label: date,
      value: Math.floor(estimated1RM) // Round down to whole number
    }))
    .sort((a, b) => new Date(a.label) - new Date(b.label));
}
