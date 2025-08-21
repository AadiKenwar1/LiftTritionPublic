/**
 * Calculate total volume for each day over the last 30 days
 * @param {Object} logsByDateObj - Object with dates as keys and arrays of logs as values
 * @returns {Array} Array of objects with label (date) and value (total volume)
 */
export function volumeChartRoot(logsByDateObj) {
  const result = [];

  // Get all dates from logsByDateObj and sort them (newest first)
  const dates = Object.keys(logsByDateObj).sort((a, b) => new Date(b) - new Date(a));

  // Process only the last 30 days that have logs
  const last30DaysWithLogs = dates.slice(0, 30);

  for (const dateKey of last30DaysWithLogs) {
    const logs = logsByDateObj[dateKey];
    let dailyVolume = 0;

    for (const logEntry of logs) {
      const log = logEntry.log;
      if (log && log.weight && log.reps) {
        const volume = log.weight * log.reps;
        dailyVolume += volume;
      }
    }

    // Only add days that have volume > 0
    if (dailyVolume > 0) {
      result.push({
        label: dateKey,
        value: Math.round(dailyVolume)
      });
    }
  }

  return result.reverse();
}

/**
 * Calculate total sets for each day over the last 30 lift days
 * @param {Object} logsByDateObj - Object with dates as keys and arrays of logs as values
 * @returns {Array} Array of objects with label (date) and value (total sets)
 */
export function setChartRoot(logsByDateObj) {
  const result = [];

  // Get all dates from logsByDateObj and sort them (newest first)
  const dates = Object.keys(logsByDateObj).sort((a, b) => new Date(b) - new Date(a));

  // Process only the last 30 days that have logs
  const last30DaysWithLogs = dates.slice(0, 30);

  for (const dateKey of last30DaysWithLogs) {
    const logs = logsByDateObj[dateKey];
    let dailySets = 0;

    for (const logEntry of logs) {
      const log = logEntry.log;
      if (log && log.weight && log.reps) {
        // Each log entry represents one set
        dailySets += 1;
      }
    }

    // Only add days that have sets > 0
    if (dailySets > 0) {
      result.push({
        label: dateKey,
        value: dailySets
      });
    }
  }

  return result.reverse();
}
