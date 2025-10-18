/**
 * 
 * @param {String} selectedExercise - selected exercise to get logs of
 * @param {Array} workouts - main variable where all workouts are stored
 * @returns logs for the last 30 unique dates of a certain exercise
 */
export function getLiftLogsRoot(selectedExercise = "Barbell Bench Press", workouts) {
  const result = [];
  //Set for fast look up
  const dateSet = new Set();

  // Sort workouts newest first
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

  for (let i = 0; i < sortedWorkouts.length; i++) {
    const workout = sortedWorkouts[i];

    for (let j = 0; j < workout.exercises.length; j++) {
      const exercise = workout.exercises[j];

      if (exercise.name === selectedExercise) {
        // Sort log dates newest first
        const logDates = Object.keys(exercise.logs).sort((a, b) => new Date(b) - new Date(a));

        for (let d = 0; d < logDates.length; d++) {
          const date = logDates[d];

          // ✅ If we've already collected 30 unique dates, stop
          if (dateSet.size >= 30) {
            return result;
          }

          // ✅ If this is a new date, track it
          if (!dateSet.has(date)) {
            dateSet.add(date);
          }

          const logsOnDate = exercise.logs[date];
          for (let k = 0; k < logsOnDate.length; k++) {
            const log = logsOnDate[k];

            result.push({
              date,
              weight: log.weight,
              reps: log.reps,
              workout: workout.name,
            });
          }
        }
      }
    }
  }

  return result;
}


/**
 * 
 * @param {Object} workouts - main workout object
 * @returns Map containing keys of dates and values of logs
 */
export function arrangeLogsByDateRoot(workouts) {
    const index = {};

    for (const workout of workouts) {
      for (const exercise of workout.exercises) {
        if (exercise.logs) {
          for (const dateKey in exercise.logs) {
            if (!index[dateKey]) index[dateKey] = [];
            
            for (const log of exercise.logs[dateKey]) {
              index[dateKey].push({
                workoutId: workout.id,
                workoutName: workout.name,
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                log,
              });
            }
          }
        }
      }
    }

    return index;
  }


