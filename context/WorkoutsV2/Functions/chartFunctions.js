import { getLocalDateKey } from '../../../utils/date';
import { format1RMForChart } from './oneRepMax';

/**
 * Get volume chart data for V2 flat structure
 * Groups logs by date and calculates total volume (weight * reps) per day
 * @param {Array} logs - Array of ExerciseLog objects
 * @returns {Array} Chart data with {label: date, value: totalVolume}
 */
export function getVolumeChartV2(logs) {
  const volumeByDate = {};
  
  logs.forEach(log => {
    const date = log.date;
    const volume = log.weight * log.reps;
    
    if (!volumeByDate[date]) {
      volumeByDate[date] = 0;
    }
    volumeByDate[date] += volume;
  });
  
  // Convert to chart format and sort by date
  return Object.entries(volumeByDate)
    .map(([date, volume]) => ({
      label: date,
      value: Math.round(volume)
    }))
    .sort((a, b) => new Date(a.label) - new Date(b.label));
}

/**
 * Get sets chart data for V2 flat structure
 * Groups logs by date and counts total sets per day
 * @param {Array} logs - Array of ExerciseLog objects
 * @returns {Array} Chart data with {label: date, value: totalSets}
 */
export function getSetsChartV2(logs) {
  const setsByDate = {};
  
  logs.forEach(log => {
    const date = log.date;
    
    if (!setsByDate[date]) {
      setsByDate[date] = 0;
    }
    setsByDate[date] += 1; // Each log entry is one set
  });
  
  // Convert to chart format and sort by date
  return Object.entries(setsByDate)
    .map(([date, sets]) => ({
      label: date,
      value: sets
    }))
    .sort((a, b) => new Date(a.label) - new Date(b.label));
}

/**
 * Get lift logs for a specific exercise in V2 flat structure
 * @param {string} exerciseName - Name of the exercise
 * @param {Array} exercises - Array of Exercise objects
 * @param {Array} logs - Array of ExerciseLog objects
 * @returns {Array} Array of logs for the specified exercise
 */
export function getLiftLogsV2(exerciseName, exercises, logs) {
  // Find exercise by name
  const exercise = exercises.find(ex => ex.name === exerciseName);
  if (!exercise) {
    return [];
  }
  
  // Get all logs for this exercise
  return logs.filter(log => log.exerciseId === exercise.id);
}

/**
 * Format log data for chart display in V2 structure
 * Now calculates estimated 1RM for each lifting session
 * @param {Array} logData - Array of ExerciseLog objects
 * @returns {Array} Chart data with {label: date, value: estimated1RM}
 */
export function formatForChartV2(logData) {
  // Use the OneRepMax helper to calculate 1RM for each session
  return format1RMForChart(logData);
}

/**
 * Get logs grouped by date for V2 structure (equivalent to logsByDateObj)
 * @param {Array} logs - Array of ExerciseLog objects
 * @returns {Object} Object with date keys and log arrays as values
 */
export function getLogsByDateV2(logs) {
  const logsByDate = {};
  
  logs.forEach(log => {
    const date = log.date;
    
    if (!logsByDate[date]) {
      logsByDate[date] = [];
    }
    logsByDate[date].push(log);
  });
  
  return logsByDate;
}

/**
 * Get all unique exercise names from V2 exercises
 * @param {Array} exercises - Array of Exercise objects
 * @returns {Array} Array of unique exercise names
 */
export function getExerciseNamesV2(exercises) {
  const uniqueNames = [...new Set(exercises.map(ex => ex.name))];
  return uniqueNames.sort();
}
