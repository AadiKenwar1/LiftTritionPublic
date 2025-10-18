import { getLocalDateKey } from "../../../utils/date";
import exerciseList from "../../Exercises/exerciseList";


/**
 * Calculate daily fatigue percentages for the last 30 days
 * @param {Object} logsByDateObj - Object with dates as keys and arrays of logs as values
 * @param {Object} exercises - Object containing exercise data
 * @param {number} activityFactor - Training frequency activity factor
 * @returns {Array} Array of objects with label (date) and value (fatigue percentage)
 */
export function fatigueChartRoot(logsByDateObj, exercises, activityFactor = 1.2) {
  const result = [];
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

  // Get all dates from logsByDateObj and sort them (newest first)
  const dates = Object.keys(logsByDateObj).sort((a, b) => new Date(b) - new Date(a));

  // Process only the last 30 days that have logs
  const last30DaysWithLogs = dates.slice(0, 30);

  for (const dateKey of last30DaysWithLogs) {
    const logs = logsByDateObj[dateKey];
    let dayFatigue = 0;
    
    for (const logEntry of logs) {
      const log = logEntry.log;
      const exerciseName = logEntry.exerciseName;

      if (!log || !exerciseName) continue;

      const reps = log.reps;
      const weight = log.weight;
      const rpe = log.rpe;
      const fatigueFactor = log.fatigueFactor;

      const exerciseData = exercises[exerciseName];
      if (!exerciseData) continue;

      const currentMax = exerciseData.userMax || weight;

      if (!currentMax || isNaN(currentMax) || currentMax === 0) continue;

      const fatigue = reps * (weight / currentMax) * rpe * fatigueFactor * frequencyMultiplier;
      if (!isNaN(fatigue)) {
        dayFatigue += fatigue;
      }
    }

    // Only add days that have fatigue > 0
    if (dayFatigue > 0) {
      const percentage = (dayFatigue / dailyBudget) * 100;
      result.push({
        label: dateKey,
        value: Math.round(percentage)
      });
    }
  }

  return result;
}

export function getFatigueForLastXDaysRoot(
  logsByDate,
  exercises,
  updateUserMax,
  numDays = 1,
  activityFactor = 1.2
) {
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

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateKey = getLocalDateKey(date);
    const logs = logsByDate[dateKey] || [];

    for (let j = 0; j < logs.length; j++) {
      const logEntry = logs[j].log;
      const exerciseName = logs[j].exerciseName;

      if (!logEntry || !exerciseName) continue;

      const reps = logEntry.reps;
      const weight = logEntry.weight;
      const rpe = logEntry.rpe;
      const fatigueFactor = logEntry.fatigueFactor;

      // Check for missing or bad values early
      if (
        reps == null || weight == null || rpe == null || fatigueFactor == null ||
        isNaN(reps) || isNaN(weight) || isNaN(rpe) || isNaN(fatigueFactor)
      ) {
        continue;
      }

      const exerciseData = exercises[exerciseName];
      if (!exerciseData) continue;

      let currentMax = exerciseData.userMax || weight;

      // Update user max if needed
      const setMax = weight * (1 + 0.0333 * reps);
      if (setMax > currentMax) {
        updateUserMax(exerciseName, setMax);
        currentMax = setMax;
      }

      if (!currentMax || isNaN(currentMax) || currentMax === 0) continue;

      const fatigue = reps * (weight / currentMax) * rpe * fatigueFactor * frequencyMultiplier;
      if (!isNaN(fatigue)) {
        totalFatigue += fatigue;
      }
    }
  }

  const denominator = dailyBudget * numDays;

  if (denominator === 0) return 0;

  const percentage = (totalFatigue / denominator) * 100;
  return percentage // Clamp to 0+ to avoid negatives
}


