import { generateClient } from 'aws-amplify/api';
import { createWorkoutV2, updateWorkoutV2, deleteWorkoutV2 } from '../../../database/graphql/mutations';
import uuid from 'react-native-uuid';

const client = generateClient();

/**
 * Add a new workout
 * @param {string} name - Workout name
 * @param {string} userId - User ID
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when workout is added
 */
export async function addWorkout(name, userId, setWorkouts) {
  const newWorkout = {
    id: uuid.v4(),
    userId,
    name,
    order: 0, // Will be updated by reorder function
    archived: false,
    note: "",
    synced: true, // Mark as synced when saving to database
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Optimistic update - mark as unsynced initially
  setWorkouts(prev => [{ ...newWorkout, synced: false }, ...prev]);

  try {
    await client.graphql({
      query: createWorkoutV2,
      variables: { input: newWorkout }
    });
    
    // Mark as synced after successful database save
    setWorkouts(prev => prev.map(workout => 
      workout.id === newWorkout.id 
        ? { ...workout, synced: true }
        : workout
    ));
  } catch (error) {
    console.error('Error adding workout:', error);
    // Remove from local state on error
    setWorkouts(prev => prev.filter(workout => workout.id !== newWorkout.id));
    throw error;
  }
}

/**
 * Delete a workout and all its exercises and logs
 * @param {string} workoutId - Workout ID to delete
 * @param {function} setWorkouts - State setter for workouts
 * @param {function} setExercises - State setter for exercises
 * @param {function} setLogs - State setter for logs
 * @returns {Promise} - Promise that resolves when workout is deleted
 */
export async function deleteWorkout(workoutId, setWorkouts, setExercises, setLogs) {
  // Optimistic update - remove from local state
  setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
  setExercises(prev => prev.filter(exercise => exercise.workoutId !== workoutId));
  setLogs(prev => prev.filter(log => log.workoutId !== workoutId));

  try {
    await client.graphql({
      query: deleteWorkoutV2,
      variables: { input: { id: workoutId } }
    });
  } catch (error) {
    console.error('Error deleting workout:', error);
    // Note: In a real app, you'd want to restore the data on error
    // For now, we'll just log the error
    throw error;
  }
}

/**
 * Rename a workout
 * @param {string} workoutId - Workout ID to rename
 * @param {string} newName - New workout name
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when workout is renamed
 */
export async function renameWorkout(workoutId, newName, setWorkouts) {
  // Store original name for potential revert
  let originalName = '';
  
  // Optimistic update - mark as unsynced
  setWorkouts(prev => prev.map(workout => {
    if (workout.id === workoutId) {
      originalName = workout.name; // Store original name
      return { ...workout, name: newName, synced: false };
    }
    return workout;
  }));
  
  try {
    const input = {
      id: workoutId,
      name: newName,
      updatedAt: new Date().toISOString(),
    };

    await client.graphql({
      query: updateWorkoutV2,
      variables: { input }
    });

    // Mark as synced after successful database save
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { ...workout, synced: true }
        : workout
    ));
  } catch (error) {
    console.error('Error renaming workout:', error);
    // Revert optimistic update
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { ...workout, name: originalName, synced: true } // Revert to original name
        : workout
    ));
    throw error;
  }
}

/**
 * Reorder workouts
 * @param {Array} newOrder - Array of workout objects in new order
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when workouts are reordered
 */
export async function reorderWorkouts(newOrder, setWorkouts) {
  // Update order field for each workout
  const updatedWorkouts = newOrder.map((workout, index) => ({
    ...workout,
    order: newOrder.length - 1 - index, // Higher order = appears first
    synced: false,
  }));

  // Optimistic update
  setWorkouts(updatedWorkouts);

  try {
    // Update each workout's order in the database
    const updatePromises = updatedWorkouts.map(workout => {
      const input = {
        id: workout.id,
        order: workout.order,
        updatedAt: new Date().toISOString(),
      };

      return client.graphql({
        query: updateWorkoutV2,
        variables: { input }
      });
    });

    await Promise.all(updatePromises);

    // Mark all as synced
    setWorkouts(prev => prev.map(workout => ({ ...workout, synced: true })));
  } catch (error) {
    console.error('Error reordering workouts:', error);
    // Note: In a real app, you'd want to revert to the original order
    throw error;
  }
}

/**
 * Archive a workout
 * @param {string} workoutId - Workout ID to archive
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when workout is archived
 */
export async function archiveWorkout(workoutId, setWorkouts) {
  // Optimistic update - mark as unsynced
  setWorkouts(prev => prev.map(workout => 
    workout.id === workoutId 
      ? { ...workout, archived: true, synced: false }
      : workout
  ));

  try {
    const input = {
      id: workoutId,
      archived: true,
      updatedAt: new Date().toISOString(),
    };

    await client.graphql({
      query: updateWorkoutV2,
      variables: { input }
    });

    // Mark as synced after successful database save
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { ...workout, synced: true }
        : workout
    ));
  } catch (error) {
    console.error('Error archiving workout:', error);
    // Revert optimistic update
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { ...workout, archived: false, synced: true }
        : workout
    ));
    throw error;
  }
}

/**
 * Unarchive a workout
 * @param {string} workoutId - Workout ID to unarchive
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when workout is unarchived
 */
export async function unarchiveWorkout(workoutId, setWorkouts) {
  // Optimistic update - mark as unsynced
  setWorkouts(prev => prev.map(workout => 
    workout.id === workoutId 
      ? { ...workout, archived: false, synced: false }
      : workout
  ));

  try {
    const input = {
      id: workoutId,
      archived: false,
      updatedAt: new Date().toISOString(),
    };

    await client.graphql({
      query: updateWorkoutV2,
      variables: { input }
    });

    // Mark as synced after successful database save
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { ...workout, synced: true }
        : workout
    ));
  } catch (error) {
    console.error('Error unarchiving workout:', error);
    // Revert optimistic update
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { ...workout, archived: true, synced: true }
        : workout
    ));
    throw error;
  }
}

/**
 * Add a note to a workout
 * @param {string} workoutId - Workout ID
 * @param {string} note - Note content
 * @param {function} setWorkouts - State setter for workouts
 * @returns {Promise} - Promise that resolves when note is added
 */
export async function addNoteToWorkout(workoutId, note, setWorkouts) {
  // Optimistic update
  setWorkouts(prev => prev.map(workout =>
    workout.id === workoutId
      ? { ...workout, note, synced: false }
      : workout
  ));

  try {
    await client.graphql({
      query: updateWorkoutV2,
      variables: {
        input: {
          id: workoutId,
          note,
          synced: true
        }
      }
    });

    // Mark as synced after successful database save
    setWorkouts(prev => prev.map(workout =>
      workout.id === workoutId
        ? { ...workout, synced: true }
        : workout
    ));
  } catch (error) {
    console.error('Error adding note to workout:', error);
    // Revert optimistic update on error - we'd need to get the original note
    // For now, we'll just mark as synced to avoid UI issues
    setWorkouts(prev => prev.map(workout =>
      workout.id === workoutId
        ? { ...workout, synced: true }
        : workout
    ));
    throw error;
  }
}
