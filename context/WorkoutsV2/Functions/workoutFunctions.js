import uuid from 'react-native-uuid';

/*Function List:
 * addWorkout
 * deleteWorkout
 * renameWorkout
 * reorderWorkouts
 * archiveWorkout
 * unarchiveWorkout
 * addNoteToWorkout
 */

/**
 * Add a new workout 
 * @param {string} name - Workout name
 * @param {string} userId - User ID
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when workout is added
 */
export async function addWorkout(name, userId, setWorkouts) {
  let currentWorkouts = [];
  setWorkouts(prev => {
    currentWorkouts = prev;
    return prev;
  });

  const maxOrder = currentWorkouts.length > 0 
    ? Math.max(...currentWorkouts.map(w => w.order || 0))
    : -1;

  const newWorkout = {
    id: uuid.v4(),
    userId,
    name,
    order: maxOrder + 1, // New workout gets highest order (appears first)
    archived: false,
    note: "",
    synced: false, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setWorkouts(prev => [{ ...newWorkout, synced: false }, ...prev]);
}

/**
 * Delete a workout and all its exercises and logs by setting the deleted flag to true for the workout, exercises, and logs
 * @param {string} workoutId - Workout ID to delete
 * @param {function} setWorkouts - State setter for workouts
 * @param {function} setExercises - State setter for exercises
 * @param {function} setLogs - State setter for logs
 * @returns {Promise} - Promise that resolves when workout is deleted
 */
export async function deleteWorkout(workoutId, setWorkouts, setExercises, setLogs) {
  setWorkouts(prev => prev.map(workout => 
    workout.id === workoutId ? { ...workout, deleted: true } : workout
  ));
  setExercises(prev => prev.map(exercise => 
    exercise.workoutId === workoutId ? { ...exercise, deleted: true } : exercise
  ));
  setLogs(prev => prev.map(log => 
    log.workoutId === workoutId ? { ...log, deleted: true } : log
  ));
}

/**
 * Rename a workout by updating the name field
 * @param {string} workoutId - Workout ID to rename
 * @param {string} newName - New workout name
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when workout is renamed
 */
export async function renameWorkout(workoutId, newName, setWorkouts) {  
  setWorkouts(prev => prev.map(workout => {
    if (workout.id === workoutId) {
      return { ...workout, name: newName, synced: false, updatedAt: new Date().toISOString() };
    }
    return workout;
  }));
}

/**
 * Reorder workouts by updating the order field for each workout (highest order on top)
 * @param {Array} newOrder - Array of workout objects in new order
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when workouts are reordered
 */
export async function reorderWorkouts(newOrder, setWorkouts) {
  let originalWorkouts = [];
  setWorkouts(prev => {
    originalWorkouts = [...prev];
    return prev;
  });
  const updatedWorkouts = newOrder.map((workout, index) => ({
    ...workout,
    order: newOrder.length - 1 - index, // Higher order = appears first
    synced: false,
    updatedAt: new Date().toISOString(),
  }));
  setWorkouts(updatedWorkouts);
}

/**
 * Archive a workout by setting the archived flag to true
 * @param {string} workoutId - Workout ID to archive
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when workout is archived
 */
export async function archiveWorkout(workoutId, setWorkouts) {
  setWorkouts(prev => prev.map(workout => 
    workout.id === workoutId 
      ? { ...workout, archived: true, synced: false, updatedAt: new Date().toISOString() }
      : workout
  ));
}

/**
 * Unarchive a workout by setting the archived flag to false
 * @param {string} workoutId - Workout ID to unarchive
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when workout is unarchived
 */
export async function unarchiveWorkout(workoutId, setWorkouts) {
  setWorkouts(prev => prev.map(workout => 
    workout.id === workoutId 
      ? { ...workout, archived: false, synced: false, updatedAt: new Date().toISOString() }
      : workout
  ));
}

/**
 * Add a note to a workout by updating the note field
 * @param {string} workoutId - Workout ID
 * @param {string} note - Note content
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when note is added
 */
export async function addNoteToWorkout(workoutId, note, setWorkouts) {
  setWorkouts(prev => prev.map(workout =>
    workout.id === workoutId
      ? { ...workout, note, synced: false, updatedAt: new Date().toISOString() }
      : workout
  ));
}
