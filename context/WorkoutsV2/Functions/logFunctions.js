import { getLocalDateKey } from '../../../utils/date';
import uuid from 'react-native-uuid';

/*Function List:
 * addLog
 * deleteLog
 */

/**
 * Add a new log entry to an exercise
 * @param {string} exerciseId - Exercise ID
 * @param {Object} logData - Log data (workoutId, date, weight, reps, rpe, etc.)
 * @param {string} userId - User ID
 * @param {function} setLogs - State setter for logs
 * @returns {Promise} - Promise that resolves when log is added
 */
export async function addLog(exerciseId, logData, userId, setLogs) {
  const newLog = {
    id: uuid.v4(),
    exerciseId,
    workoutId: logData.workoutId,
    userId,
    date: logData.date || getLocalDateKey(),
    weight: logData.weight,
    reps: logData.reps,
    rpe: logData.rpe || 7, // Default RPE
    synced: false, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setLogs(prev => [newLog, ...prev]);
}

/**
 * Delete a log entry by setting the deleted flag to true for the log
 * @param {string} logId - Log ID to delete
 * @param {function} setLogs - State setter for logs
 * @returns {Promise} - Promise that resolves when log is deleted
 */
export async function deleteLog(logId, setLogs) {
  setLogs(prev => prev.map(log => 
    log.id === logId ? { ...log, deleted: true } : log
  ));
}
