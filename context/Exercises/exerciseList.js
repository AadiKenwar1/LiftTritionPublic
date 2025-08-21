import chestExercises from "./ExercisesByMuscle/chestExercises";
import backExercises from "./ExercisesByMuscle/backExercises";
import shoulderExercises from "./ExercisesByMuscle/shoulderExercises";
import tricepExercises from "./ExercisesByMuscle/tricepExercises";
import bicepExercises from "./ExercisesByMuscle/bicepExercises";
import legExercises from "./ExercisesByMuscle/legExercises";


/**
 * FATIGUE FACTORS
 * Machine Isolation - 0.5
 * Cable Isolation - 0.6
 * Dumbbell Isolation - 0.7
 * Machine Compound - 0.8
 * Cable Compound - 0.8
 * Dumbbell Compound - 1
 * Barbell Compound - 1.1
 */



const exercises = {
  ...chestExercises,
  ...backExercises,
  ...shoulderExercises,
  ...tricepExercises,
  ...bicepExercises,
  ...legExercises
}

function sortListAlphabetically (list){
  const entries = Object.entries(list);
  entries.sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries);
}

const exerciseList = sortListAlphabetically(exercises);
export default exerciseList