import { generateClient } from 'aws-amplify/api';
import { 
  createUserExercise, 
  updateUserExercise as updateUserExerciseMutation, 
  deleteUserExercise as deleteUserExerciseMutation 
} from '../../../graphql/mutations';
import uuid from 'react-native-uuid';

const client = generateClient();

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

  // Optimistic update - mark as unsynced initially
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

  try {
    await client.graphql({
      query: createUserExercise,
      variables: { input: newUserExercise }
    });

    // Mark as synced after successful database save
    setUserExercises(prev => prev.map(exercise =>
      exercise.id === newUserExercise.id
        ? { ...exercise, synced: true }
        : exercise
    ));
  } catch (error) {
    console.error('Error adding user exercise:', error);
    // Remove from local state on error
    setUserExercises(prev => prev.filter(exercise => exercise.id !== newUserExercise.id));
    // Remove from exercise library on error
    setExerciseLibrary(prev => {
      const { [exerciseData.name]: removed, ...rest } = prev;
      return rest;
    });
    throw error;
  }
}

/**
 * Update an existing user exercise
 * @param {string} exerciseId - The exercise ID to update
 * @param {Object} updateData - The data to update
 * @param {Function} setUserExercises - State setter for userExercises
 * @param {Function} setExerciseLibrary - State setter for exerciseLibrary
 */
export async function updateUserExercise(exerciseId, updateData, setUserExercises, setExerciseLibrary) {
  // Optimistic update
  setUserExercises(prev => prev.map(exercise =>
    exercise.id === exerciseId
      ? { ...exercise, ...updateData, synced: false }
      : exercise
  ));

  // Update exercise library if name or other key properties changed
  if (updateData.name || updateData.fatigueFactor || updateData.isCompound || 
      updateData.mainMuscle || updateData.accessoryMuscles) {
    setExerciseLibrary(prev => {
      const updated = { ...prev };
      // Find the exercise to get its current name
      const currentExercise = setUserExercises.getState?.()?.find(ex => ex.id === exerciseId);
      if (currentExercise) {
        // Remove old entry if name changed
        if (updateData.name && updateData.name !== currentExercise.name) {
          delete updated[currentExercise.name];
        }
        // Add/update with new data
        const exerciseName = updateData.name || currentExercise.name;
        updated[exerciseName] = {
          isCompound: updateData.isCompound ?? currentExercise.isCompound,
          fatigueFactor: updateData.fatigueFactor ?? currentExercise.fatigueFactor,
          userMax: updateData.userMax ?? currentExercise.userMax,
          mainMuscle: updateData.mainMuscle ?? currentExercise.mainMuscle,
          accessoryMuscles: updateData.accessoryMuscles ?? currentExercise.accessoryMuscles,
        };
      }
      return updated;
    });
  }

  try {
    await client.graphql({
      query: updateUserExerciseMutation,
      variables: {
        input: {
          id: exerciseId,
          ...updateData,
          synced: true
        }
      }
    });

    // Mark as synced after successful database save
    setUserExercises(prev => prev.map(exercise =>
      exercise.id === exerciseId
        ? { ...exercise, synced: true }
        : exercise
    ));
  } catch (error) {
    console.error('Error updating user exercise:', error);
    // Revert optimistic update on error - we'd need to get the original data
    // For now, we'll just mark as synced to avoid UI issues
    setUserExercises(prev => prev.map(exercise =>
      exercise.id === exerciseId
        ? { ...exercise, synced: true }
        : exercise
    ));
    throw error;
  }
}

/**
 * Delete a user exercise
 * @param {string} exerciseId - The exercise ID to delete
 * @param {string} exerciseName - The exercise name (for removing from library)
 * @param {Function} setUserExercises - State setter for userExercises
 * @param {Function} setExerciseLibrary - State setter for exerciseLibrary
 */
export async function deleteUserExercise(exerciseId, exerciseName, setUserExercises, setExerciseLibrary) {
  // Optimistic update - remove from local state
  setUserExercises(prev => prev.filter(exercise => exercise.id !== exerciseId));
  
  // Remove from exercise library
  setExerciseLibrary(prev => {
    const { [exerciseName]: removed, ...rest } = prev;
    return rest;
  });

  try {
    await client.graphql({
      query: deleteUserExerciseMutation,
      variables: { input: { id: exerciseId } }
    });
  } catch (error) {
    console.error('Error deleting user exercise:', error);
    // Revert optimistic update on error - we'd need to restore the exercise
    // For now, we'll just log the error
    throw error;
  }
}

/**
 * Get a user exercise by ID
 * @param {string} exerciseId - The exercise ID
 * @param {Array} userExercises - Array of user exercises
 * @returns {Object|null} The user exercise or null if not found
 */
export function getUserExercise(exerciseId, userExercises) {
  return userExercises.find(exercise => exercise.id === exerciseId) || null;
}

/**
 * Get a user exercise by name
 * @param {string} exerciseName - The exercise name
 * @param {Array} userExercises - Array of user exercises
 * @returns {Object|null} The user exercise or null if not found
 */
export function getUserExerciseByName(exerciseName, userExercises) {
  return userExercises.find(exercise => exercise.name === exerciseName) || null;
}
