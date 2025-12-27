import uuid from 'react-native-uuid';

/*Function List:
 * addUserExercise
 * updateUserExercise
 * deleteUserExercise
 */

/**
 * Add a new user exercise (custom exercise beyond the exercise library)
 * @param {Object} exerciseData - The exercise data
 * @param {string} exerciseData.name - Exercise name
 * @param {boolean} exerciseData.isCompound - Whether it's a compound exercise
 * @param {number} exerciseData.fatigueFactor - Custom fatigue factor
 * @param {number} exerciseData.userMax - User's max for this exercise
 * @param {string} exerciseData.mainMuscle - Primary muscle group
 * @param {Array} exerciseData.accessoryMuscles - Secondary muscle groups
 * @param {string} userId - User ID
 * @param {Function} setUserExercises - State setter for userExercises
 * @param {Function} setExerciseLibrary - State setter for exerciseLibrary
 */
export async function addUserExercise(exerciseData, userId, setUserExercises, setExerciseLibrary) {
  const newUserExercise = {
    id: uuid.v4(),
    userId,
    name: exerciseData.name,
    isCompound: exerciseData.isCompound,
    fatigueFactor: exerciseData.fatigueFactor,
    userMax: exerciseData.userMax || 0,
    mainMuscle: exerciseData.mainMuscle,
    accessoryMuscles: exerciseData.accessoryMuscles || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setUserExercises(prev => [{ ...newUserExercise, synced: false }, ...prev]);

  // Also add to exercise library for immediate use
  setExerciseLibrary(prev => ({
    ...prev,
    [exerciseData.name]: {
      isCompound: exerciseData.isCompound,
      fatigueFactor: exerciseData.fatigueFactor,
      userMax: exerciseData.userMax || 0,
      mainMuscle: exerciseData.mainMuscle,
      accessoryMuscles: exerciseData.accessoryMuscles || [],
    }
  }));
}

/**
 * Update an existing user exercise 
 * @param {string} exerciseId - The exercise ID to update
 * @param {Object} updateData - The data to update
 * @param {Function} setUserExercises - State setter for userExercises
 * @param {Function} setExerciseLibrary - State setter for exerciseLibrary
 */
export async function updateUserExercise(exerciseId, updateData, setUserExercises, setExerciseLibrary) {
  let currentExercise = null;
  let oldName = null;
  
  setUserExercises(prev => {
    const exercise = prev.find(ex => ex.id === exerciseId);
    if (exercise) {
      currentExercise = exercise;
      oldName = exercise.name;
    }
    return prev.map(exercise =>
      exercise.id === exerciseId
        ? { ...exercise, ...updateData, synced: false, updatedAt: new Date().toISOString() }
        : exercise
    );
  });

  // Update exercise library if name or other key properties changed by updating the exercise library with the new data
  if (currentExercise && (updateData.name || updateData.fatigueFactor || updateData.isCompound || 
      updateData.mainMuscle || updateData.accessoryMuscles)) {
    setExerciseLibrary(prev => {
      const updated = { ...prev };
      if (updateData.name && updateData.name !== oldName) {
        delete updated[oldName];
      }
      const exerciseName = updateData.name || oldName;
      updated[exerciseName] = {
        isCompound: updateData.isCompound ?? currentExercise.isCompound,
        fatigueFactor: updateData.fatigueFactor ?? currentExercise.fatigueFactor,
        userMax: updateData.userMax ?? currentExercise.userMax,
        mainMuscle: updateData.mainMuscle ?? currentExercise.mainMuscle,
        accessoryMuscles: updateData.accessoryMuscles ?? currentExercise.accessoryMuscles,
      };
      return updated;
    });
  }
}

/**
 * Delete a user exercise by setting the deleted flag to true for the exercise
 * @param {string} exerciseId - The exercise ID to delete
 * @param {string} exerciseName - The exercise name (for removing from library)
 * @param {Function} setUserExercises - State setter for userExercises
 * @param {Function} setExerciseLibrary - State setter for exerciseLibrary
 */
export async function deleteUserExercise(exerciseId, exerciseName, setUserExercises, setExerciseLibrary) {
  setUserExercises(prev => prev.map(exercise => 
    exercise.id === exerciseId ? { ...exercise, deleted: true } : exercise
  ));
  
  // Remove from exercise library 
  setExerciseLibrary(prev => {
    const { [exerciseName]: removed, ...rest } = prev;
    return rest;
  });
}
