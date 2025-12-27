import uuid from 'react-native-uuid';

/*Function List:
 * addExercise
 * deleteExercise
 * renameExercise
 * reorderExercises
 * archiveExercise
 * unarchiveExercise
 * addNoteToExercise
 */

/**
 * Add a new exercise to a workout
 * @param {string} workoutId - Workout ID
 * @param {string} exerciseName - Exercise name (from exercise library)
 * @param {string} userId - User ID
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when exercise is added
 */
export async function addExercise(workoutId, exerciseName, userId, setExercises) {
  // Get current exercises to determine the highest order (order in which workouts are displayed) for this workout
  let currentExercises = [];
  setExercises(prev => {
    currentExercises = prev;
    return prev;
  })

  const workoutExercises = currentExercises.filter(ex => ex.workoutId === workoutId);
  // Find the highest order value among exercises for this specific workout so we can add the new exercise to the end of the list
  const maxOrder = workoutExercises.length > 0 ? Math.max(...workoutExercises.map(ex => ex.order || 0)): -1;

  const newExercise = {
    id: uuid.v4(),
    workoutId,
    userId,
    name: exerciseName,
    userMax: 0,
    order: maxOrder + 1, // New exercise gets highest order (appears first)
    archived: false,
    note: "",
    synced: false, // Mark as unsynced initially
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setExercises(prev => [{ ...newExercise, synced: false }, ...prev]);
}

/**
 * Delete an exercise by setting the deleted flag to true for the exercise and all its logs
 * @param {string} exerciseId - Exercise ID to delete
 * @param {function} setExercises - State setter for exercises
 * @param {function} setLogs - State setter for logs
 * @returns {Promise} - Promise that resolves when exercise is deleted
 */
export async function deleteExercise(exerciseId, setExercises, setLogs) {
  setExercises(prev => prev.map(exercise => 
    exercise.id === exerciseId ? { ...exercise, deleted: true } : exercise
  ));
  setLogs(prev => prev.map(log => 
    log.exerciseId === exerciseId ? { ...log, deleted: true } : log
  ));
}

/**
 * Rename an exercise
 * @param {string} exerciseId - Exercise ID to rename
 * @param {string} newName - New exercise name
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when exercise is renamed
 */
export async function renameExercise(exerciseId, newName, setExercises) {
  setExercises(prev => prev.map(exercise => 
    exercise.id === exerciseId 
      ? { ...exercise, name: newName, synced: false, updatedAt: new Date().toISOString() }
      : exercise
  ));
}

/**
 * Reorder exercises within a workout by updating order field for each exercise (highest order on top)
 * @param {string} workoutId - Workout ID
 * @param {Array} newOrder - Array of exercise objects in new order (must only contain exercises from the specified workout)
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when exercises are reordered
 */
export async function reorderExercises(workoutId, newOrder, setExercises) {
  const updatedExercises = newOrder.map((exercise, index) => ({
    ...exercise,
    order: newOrder.length - 1 - index, 
    synced: false,
  }));

  // Update state - only update exercises that belong to this workout
  setExercises(prev => prev.map(exercise => {
    // Skip exercises from other workouts (normal, no error)
    if (exercise.workoutId !== workoutId) {
      return exercise; // Don't touch exercises from other workouts
    }
    
    const updatedExercise = updatedExercises.find(ue => ue.id === exercise.id);
    return updatedExercise ? { ...updatedExercise, updatedAt: new Date().toISOString() } : exercise;
  }));
}

/**
 * Archive an exercise by setting the archived flag to true
 * @param {string} exerciseId - Exercise ID to archive
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when exercise is archived
 */
export async function archiveExercise(exerciseId, setExercises) {
  setExercises(prev => prev.map(exercise => 
    exercise.id === exerciseId 
      ? { ...exercise, archived: true, synced: false, updatedAt: new Date().toISOString() }
      : exercise
  ));
}

/**
 * Unarchive an exercise by setting the archived flag to false
 * @param {string} exerciseId - Exercise ID to unarchive
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when exercise is unarchived
 */
export async function unarchiveExercise(exerciseId, setExercises) {
  setExercises(prev => prev.map(exercise => 
    exercise.id === exerciseId 
      ? { ...exercise, archived: false, synced: false, updatedAt: new Date().toISOString() }
      : exercise
  ));
}

/**
 * Add a note to an exercise by updating the note field
 * @param {string} exerciseId - Exercise ID
 * @param {string} note - Note content
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when note is added
 */
export async function addNoteToExercise(exerciseId, note, setExercises) {
  setExercises(prev => prev.map(exercise =>
    exercise.id === exerciseId
      ? { ...exercise, note, synced: false, updatedAt: new Date().toISOString() }
      : exercise
  ));
}
