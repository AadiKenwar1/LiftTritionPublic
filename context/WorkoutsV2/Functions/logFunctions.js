import { generateClient } from 'aws-amplify/api';
import { createExerciseLog, deleteExerciseLog } from '../../../graphql/mutations';
import { getLocalDateKey } from '../../../utils/date';
import uuid from 'react-native-uuid';

const client = generateClient();

/**
 * Add a new log entry to an exercise
 * @param {string} exerciseId - Exercise ID
 * @param {Object} logData - Log data (weight, reps, rpe, etc.)
 * @param {string} userId - User ID
 * @param {function} setLogs - State setter for logs
 * @returns {Promise} - Promise that resolves when log is added
 */
export async function addLog(exerciseId, logData, userId, setLogs) {
  const newLog = {
    id: uuid.v4(),
    exerciseId,
    workoutId: logData.workoutId, // Should be passed in logData
    userId,
    date: logData.date || getLocalDateKey(),
    weight: logData.weight,
    reps: logData.reps,
    rpe: logData.rpe || 8, // Default RPE
    synced: true, // Mark as synced when saving to database
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Optimistic update - mark as unsynced initially
  setLogs(prev => [{ ...newLog, synced: false }, ...prev]);

  try {
    await client.graphql({
      query: createExerciseLog,
      variables: { input: newLog }
    });
    
    // Mark as synced after successful database save
    setLogs(prev => prev.map(log => 
      log.id === newLog.id 
        ? { ...log, synced: true }
        : log
    ));
  } catch (error) {
    console.error('Error adding log:', error);
    // Remove from local state on error
    setLogs(prev => prev.filter(log => log.id !== newLog.id));
    throw error;
  }
}

/**
 * Delete a log entry
 * @param {string} logId - Log ID to delete
 * @param {function} setLogs - State setter for logs
 * @returns {Promise} - Promise that resolves when log is deleted
 */
export async function deleteLog(logId, setLogs) {
  // Optimistic update - remove from local state
  setLogs(prev => prev.filter(log => log.id !== logId));

  try {
    await client.graphql({
      query: deleteExerciseLog,
      variables: { input: { id: logId } }
    });
  } catch (error) {
    console.error('Error deleting log:', error);
    // Note: In a real app, you'd want to restore the data on error
    throw error;
  }
}
