import { getLocalDateKey } from '../../../utils/date';
import { estimate1RM } from './oneRepMax';

/*Function List:
 * getFatigueForLastDaysV2
 * fatigueFeedback
*/

/**
 * Calculate fatigue percentage for the last X days
 * @param {number} numDays - Number of days to calculate fatigue for
 * @param {Array} logs - Array of ExerciseLog objects
 * @param {Array} exercises - Array of Exercise objects
 * @param {number} activityFactor - Training frequency activity factor
 * @returns {number} Fatigue percentage (0-100+)
 */
export function getFatigueForLastXDaysV2(numDays, logs, exercises, exerciseLibrary, activityFactor = 1.2) {
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
  // Create exercise lookup map for O(1) access to exercises by id
  const exerciseMap = new Map();
  exercises.forEach(exercise => {exerciseMap.set(exercise.id, exercise);});

  // Iterate through each day in the last X days
  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = getLocalDateKey(date);

    // Get logs for this specific date and iterate through them
    const dayLogs = logs.filter(log => log.date === dateKey && !log.deleted);
    for (const log of dayLogs) {
      // Check for missing or bad values early and skip log if found
      if (log.reps == null || log.weight == null || log.rpe == null ||isNaN(log.reps) || isNaN(log.weight) || isNaN(log.rpe)) {
        continue
      }

      const exercise = exerciseMap.get(log.exerciseId);
      if (!exercise) continue;

      // Get exercise object from exercise library
      const exerciseDef = exerciseLibrary[exercise.name];
      if (!exerciseDef) continue;

      // Calculate 1RM for this log using OneRepMax helper and update currentMax if new 1RM is greater
      let currentMax = exercise.userMax || log.weight;
      const setMax = estimate1RM(log.weight, log.reps);
      if (setMax > currentMax) {
        currentMax = setMax;
      }

      // Skip log if currentMax is not a number or is 0
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
  return Math.max(0, percentage); // Clamp to 0+ to avoid negatives
}

/**
 * Feedback on fatigue percentage
 * @param {number} fatigueTodayPercent - Fatigue percentage for today
 * @returns {string} Feedback message
 */
export function fatigueFeedback(fatigueTodayPercent){
  if (fatigueTodayPercent > 75){
      return "You trained hard today, nice work! Make sure to get enough rest and recovery."
  }
  else if (fatigueTodayPercent > 50){
      return "Solid work today! Some rest and recovery and you'll be back in no time."
  }
  else if (fatigueTodayPercent > 25){
      return "Good work today! You had a light training session."
  }
  else if (fatigueTodayPercent > 0){
      return "Very light training session so far. Great if your goal is recovery or light training."
  }
  else{
      return "No training today. Seems like the focus is on rest and recovery."
  }

}