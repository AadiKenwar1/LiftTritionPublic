import { getLocalDateKey } from '../../../utils/date';
import { estimate1RM } from './oneRepMax';

/**
 * Calculate fatigue percentage for the last X days using V2 flat structure
 * @param {number} numDays - Number of days to calculate fatigue for
 * @param {Array} logs - Array of ExerciseLog objects
 * @param {Array} exercises - Array of Exercise objects
 * @param {number} activityFactor - Training frequency activity factor
 * @returns {number} Fatigue percentage (0-100+)
 */
export function getFatigueForLastXDaysV2(numDays, logs, exercises, exerciseLibrary, activityFactor = 1.2) {
  const startTime = performance.now();
  let totalFatigue = 0;
  const dailyBudget = 600;

  // Get frequency multiplier based on activity factor
  let frequencyMultiplier = 1.0; // Default for 0 times/week
  if (activityFactor === 1.375) {
    frequencyMultiplier = 0.966; // 1-2 times/week
  } else if (activityFactor === 1.55) {
    frequencyMultiplier = 0.933; // 3-4 times/week
  } else if (activityFactor === 1.725) {
    frequencyMultiplier = 0.9; // 5+ times/week
  }

  const today = new Date();

  // Create exercise lookup map for O(1) access
  const exerciseMap = new Map();
  exercises.forEach(exercise => {
    exerciseMap.set(exercise.id, exercise);
  });

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = getLocalDateKey(date);

    // Get logs for this specific date
    const dayLogs = logs.filter(log => log.date === dateKey);

    for (const log of dayLogs) {
      // Check for missing or bad values early
      if (
        log.reps == null || log.weight == null || log.rpe == null ||
        isNaN(log.reps) || isNaN(log.weight) || isNaN(log.rpe)
      ) {
        continue;
      }

      const exercise = exerciseMap.get(log.exerciseId);
      if (!exercise) continue;

      // Get exercise definition from exercise library
      const exerciseDef = exerciseLibrary[exercise.name];
      if (!exerciseDef) continue;

      let currentMax = exercise.userMax || log.weight;

      // Calculate 1RM for this log using OneRepMax helper
      const setMax = estimate1RM(log.weight, log.reps);
      if (setMax > currentMax) {
        // Use the calculated max for this calculation
        currentMax = setMax;
      }

      if (!currentMax || isNaN(currentMax) || currentMax === 0) continue;

      // Calculate fatigue: reps * (weight / max) * rpe * fatigueFactor * frequencyMultiplier
      const fatigue = log.reps * (log.weight / currentMax) * log.rpe * exerciseDef.fatigueFactor * frequencyMultiplier;
      if (!isNaN(fatigue)) {
        totalFatigue += fatigue;
      }
    }
  }

  const denominator = dailyBudget * numDays;

  if (denominator === 0) return 0;

  const percentage = (totalFatigue / denominator) * 100;
  
  // Performance logging
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  const logsProcessed = logs.length;
  
  // Log today's logs specifically if calculating for today (1 day)
  
  console.log(`🚀 V2 Fatigue Calculation Performance:`, {
    executionTime: `${executionTime.toFixed(2)}ms`,
    logsProcessed,
    logsPerMs: (logsProcessed / executionTime).toFixed(2),
    numDays,
    fatiguePercentage: percentage.toFixed(1)
  });
  
  return Math.max(0, percentage); // Clamp to 0+ to avoid negatives
}
