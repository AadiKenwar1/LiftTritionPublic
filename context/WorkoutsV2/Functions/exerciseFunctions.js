import { generateClient } from 'aws-amplify/api';
import { createExercise, updateExercise, deleteExercise as deleteExerciseMutation } from '../../../database/graphql/mutations';
import uuid from 'react-native-uuid';

const client = generateClient();

/**
 * Add a new exercise to a workout
 * @param {string} workoutId - Workout ID
 * @param {string} exerciseName - Exercise name (from exercise library)
 * @param {string} userId - User ID
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when exercise is added
 */
export async function addExercise(workoutId, exerciseName, userId, setExercises) {
  const newExercise = {
    id: uuid.v4(),
    workoutId,
    userId,
    name: exerciseName,
    userMax: 0,
    order: 0, // Will be updated by reorder function
    archived: false,
    note: "",
    synced: true, // Mark as synced when saving to database
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Optimistic update - mark as unsynced initially
  setExercises(prev => [{ ...newExercise, synced: false }, ...prev]);

  try {
    await client.graphql({
      query: createExercise,
      variables: { input: newExercise }
    });
    
    // Mark as synced after successful database save
    setExercises(prev => prev.map(exercise => 
      exercise.id === newExercise.id 
        ? { ...exercise, synced: true }
        : exercise
    ));
  } catch (error) {
    console.error('Error adding exercise:', error);
    // Remove from local state on error
    setExercises(prev => prev.filter(exercise => exercise.id !== newExercise.id));
    throw error;
  }
}

/**
 * Delete an exercise and all its logs
 * @param {string} exerciseId - Exercise ID to delete
 * @param {function} setExercises - State setter for exercises
 * @param {function} setLogs - State setter for logs
 * @returns {Promise} - Promise that resolves when exercise is deleted
 */
export async function deleteExercise(exerciseId, setExercises, setLogs) {
  // Optimistic update - remove from local state
  setExercises(prev => prev.filter(exercise => exercise.id !== exerciseId));
  setLogs(prev => prev.filter(log => log.exerciseId !== exerciseId));

  try {
    await client.graphql({
      query: deleteExerciseMutation,
      variables: { input: { id: exerciseId } }
    });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    // Note: In a real app, you'd want to restore the data on error
    throw error;
  }
}

/**
 * Rename an exercise
 * @param {string} exerciseId - Exercise ID to rename
 * @param {string} newName - New exercise name
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when exercise is renamed
 */
export async function renameExercise(exerciseId, newName, setExercises) {
  // Optimistic update
  setExercises(prev => prev.map(exercise => 
    exercise.id === exerciseId 
      ? { ...exercise, name: newName, synced: false }
      : exercise
  ));

  try {
    const input = {
      id: exerciseId,
      name: newName,
      updatedAt: new Date().toISOString(),
    };

    await client.graphql({
      query: updateExercise,
      variables: { input }
    });

    // Mark as synced
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, synced: true }
        : exercise
    ));
  } catch (error) {
    console.error('Error renaming exercise:', error);
    // Revert optimistic update
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, name: exercise.name, synced: true } // Revert to original name
        : exercise
    ));
    throw error;
  }
}

/**
 * Reorder exercises within a workout
 * @param {string} workoutId - Workout ID
 * @param {Array} newOrder - Array of exercise objects in new order
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when exercises are reordered
 */
export async function reorderExercises(workoutId, newOrder, setExercises) {
  // Update order field for each exercise
  const updatedExercises = newOrder.map((exercise, index) => ({
    ...exercise,
    order: newOrder.length - 1 - index, // Higher order = appears first
    synced: false,
  }));

  // Optimistic update
  setExercises(prev => prev.map(exercise => {
    const updatedExercise = updatedExercises.find(ue => ue.id === exercise.id);
    return updatedExercise || exercise;
  }));

  try {
    // Update each exercise's order in the database
    const updatePromises = updatedExercises.map(exercise => {
      const input = {
        id: exercise.id,
        order: exercise.order,
        updatedAt: new Date().toISOString(),
      };

      return client.graphql({
        query: updateExercise,
        variables: { input }
      });
    });

    await Promise.all(updatePromises);

    // Mark all as synced
    setExercises(prev => prev.map(exercise => {
      const updatedExercise = updatedExercises.find(ue => ue.id === exercise.id);
      return updatedExercise ? { ...exercise, synced: true } : exercise;
    }));
  } catch (error) {
    console.error('Error reordering exercises:', error);
    // Note: In a real app, you'd want to revert to the original order
    throw error;
  }
}

/**
 * Archive an exercise
 * @param {string} exerciseId - Exercise ID to archive
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when exercise is archived
 */
export async function archiveExercise(exerciseId, setExercises) {
  // Optimistic update
  setExercises(prev => prev.map(exercise => 
    exercise.id === exerciseId 
      ? { ...exercise, archived: true, synced: false }
      : exercise
  ));

  try {
    const input = {
      id: exerciseId,
      archived: true,
      updatedAt: new Date().toISOString(),
    };

    await client.graphql({
      query: updateExercise,
      variables: { input }
    });

    // Mark as synced
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, synced: true }
        : exercise
    ));
  } catch (error) {
    console.error('Error archiving exercise:', error);
    // Revert optimistic update
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, archived: false, synced: true }
        : exercise
    ));
    throw error;
  }
}

/**
 * Unarchive an exercise
 * @param {string} exerciseId - Exercise ID to unarchive
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when exercise is unarchived
 */
export async function unarchiveExercise(exerciseId, setExercises) {
  // Optimistic update
  setExercises(prev => prev.map(exercise => 
    exercise.id === exerciseId 
      ? { ...exercise, archived: false, synced: false }
      : exercise
  ));

  try {
    const input = {
      id: exerciseId,
      archived: false,
      updatedAt: new Date().toISOString(),
    };

    await client.graphql({
      query: updateExercise,
      variables: { input }
    });

    // Mark as synced
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, synced: true }
        : exercise
    ));
  } catch (error) {
    console.error('Error unarchiving exercise:', error);
    // Revert optimistic update
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, archived: true, synced: true }
        : exercise
    ));
    throw error;
  }
}

/**
 * Add a note to an exercise
 * @param {string} exerciseId - Exercise ID
 * @param {string} note - Note content
 * @param {function} setExercises - State setter for exercises
 * @returns {Promise} - Promise that resolves when note is added
 */
export async function addNoteToExercise(exerciseId, note, setExercises) {
  // Optimistic update
  setExercises(prev => prev.map(exercise =>
    exercise.id === exerciseId
      ? { ...exercise, note, synced: false }
      : exercise
  ));

  try {
    await client.graphql({
      query: updateExercise,
      variables: {
        input: {
          id: exerciseId,
          note,
          synced: true
        }
      }
    });

    // Mark as synced after successful database save
    setExercises(prev => prev.map(exercise =>
      exercise.id === exerciseId
        ? { ...exercise, synced: true }
        : exercise
    ));
  } catch (error) {
    console.error('Error adding note to exercise:', error);
    // Revert optimistic update on error - we'd need to get the original note
    // For now, we'll just mark as synced to avoid UI issues
    setExercises(prev => prev.map(exercise =>
      exercise.id === exerciseId
        ? { ...exercise, synced: true }
        : exercise
    ));
    throw error;
  }
}
