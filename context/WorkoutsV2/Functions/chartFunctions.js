import { format1RMForChart } from './oneRepMax';

/*Function List:
 * getVolumeChartV2
 * getSetsChartV2
 * getLiftLogsV2
 * formatForChartV2
 * getLogsByDateV2
 */


/**
 * Get volume chart data
 * Groups logs by date and calculates total volume (weight * reps) per day
 * @param {Array} logs - Array of ExerciseLog objects
 * @returns {Array} Array of logs for the specified exercise in chart format, sorted by date: [{label: date, value: totalVolume}]
 */
export function getVolumeChartV2(logs) {
  const volumeByDate = {};
  logs.filter(log => !log.deleted).forEach(log => {
    const date = log.date;
    const volume = log.weight * log.reps;
    if (!volumeByDate[date]) {
      volumeByDate[date] = 0;
    }
    volumeByDate[date] += volume;
  });
  return Object.entries(volumeByDate)
    .map(([date, volume]) => ({
      label: date,
      value: Math.round(volume)
    }))
    .sort((a, b) => new Date(a.label) - new Date(b.label));
}

/**
 * Get sets chart data
 * Groups logs by date and counts total sets per day
 * @param {Array} logs - Array of ExerciseLog objects
 * @returns {Array} Array of logs for the specified exercise in chart format, sorted by date: [{label: date, value: totalSets}]
 */
export function getSetsChartV2(logs) {
  const setsByDate = {};
  logs.filter(log => !log.deleted).forEach(log => {
    const date = log.date;
    
    if (!setsByDate[date]) {
      setsByDate[date] = 0;
    }
    setsByDate[date] += 1; // Each log entry is one set
  });
  return Object.entries(setsByDate)
    .map(([date, sets]) => ({
      label: date,
      value: sets
    }))
    .sort((a, b) => new Date(a.label) - new Date(b.label));
}

/**
 * Get lift logs for a specific exercise
 * @param {string} exerciseName - Name of the exercise
 * @param {Array} exercises - Array of Exercise objects
 * @param {Array} logs - Array of ExerciseLog objects
 * @returns {Array} Array of logs for the specified exercise in chart format, sorted by date: [{label: date, value: totalVolume}]
 */
export function getLiftLogsV2(exerciseName, exercises, logs) {
  const exercise = exercises.find(ex => ex.name === exerciseName);
  if (!exercise) {
    return [];
  }
  return logs.filter(log => log.exerciseId === exercise.id && !log.deleted);
}

/**
 * Format log data for chart display
 * Now calculates estimated 1RM for each lifting session
 * @param {Array} logData - Array of ExerciseLog objects
 * @returns {Array} Array of logs for the specified exercise in chart format, sorted by date: [{label: date, value: estimated1RM}]
 */
export function formatForChartV2(logData) {
  // Use the OneRepMax helper to calculate 1RM for each session
  return format1RMForChart(logData);
}

/**
 * Get logs grouped by date
 * @param {Array} logs - Array of ExerciseLog objects
 * @returns {Object} Object with date keys and log arrays as values: {date: [log1, log2, log3]}
 */
export function getLogsByDateV2(logs) {
  const logsByDate = {};
  
  logs.filter(log => !log.deleted).forEach(log => {
    const date = log.date;
    
    if (!logsByDate[date]) {
      logsByDate[date] = [];
    }
    logsByDate[date].push(log);
  });
  
  return logsByDate;
}
