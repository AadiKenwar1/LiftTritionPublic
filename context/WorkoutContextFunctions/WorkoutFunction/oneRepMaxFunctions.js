// WorkoutFunction/userMaxFunctions.js

/**
 * Estimate 1RM from weight and reps
 */
export function estimate1RM(weight, reps) {
  return weight * (1 + 0.0333 * reps);
}

/**
 * Fully recompute userMaxes from all logs
 * @param {Array} workouts
 * @param {Function} getLiftLogs
 * @param {Object} currentExercises
 * @returns {Object} updated exercises object with new userMaxes
 */
export function recomputeUserMaxesRoot(workouts, getLiftLogs, currentExercises) {
  const newUserMaxes = {};

  for (const exerciseName in currentExercises) {
    const logs = getLiftLogs(exerciseName, workouts);
    let max = 0;
    for (const log of logs) {
      const est = estimate1RM(log.weight, log.reps);
      if (est > max) max = est;
    }
    newUserMaxes[exerciseName] = max;
  }

  // Return new exercises object with updated userMaxes
  const updatedExercises = { ...currentExercises };
  for (const name in newUserMaxes) {
    if (updatedExercises[name]) {
      updatedExercises[name] = {
        ...updatedExercises[name],
        userMax: newUserMaxes[name],
      };
    }
  }
  return updatedExercises;
}


// userMaxFunctions.js
export function updateUserMaxRoot(setExercises, exerciseName, newMax) {
  setExercises(prev => ({
    ...prev,
    [exerciseName]: {
      ...prev[exerciseName],
      userMax: newMax,
    },
  }));
}
