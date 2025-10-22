import uuid from "react-native-uuid";
import { getLocalDateKey } from "../../../utils/date";
import { generateClient } from 'aws-amplify/api';
import { createWorkout, updateWorkout } from '../../../database/graphql/mutations';
import FailureAlert from '../../../components/FailureAlert';
const client = generateClient();
//Add new Workout

// HYBRID SYNC: This function supports optimistic update and background sync queue
export async function addWorkoutRoot(name, setWorkouts, userId, workouts = []) {
  const newWorkout = {
    id: uuid.v4(),
    userId, // include userId
    name,
    exercises: JSON.stringify([]), // HYBRID SYNC: always save as JSON string
    order: workouts.length, // ORDER PRESERVATION: set order to current number of workouts
    archived: false,
    note: "",
    synced: true, // Mark as synced when saving to database
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  // Update local state first for instant UI feedback
  setWorkouts((prev) => [
    { ...newWorkout, exercises: [], synced: false }, // ensure exercises is an array in local state and mark as unsynced
    ...prev,
  ]);
  
  // Save to database second
  try {
    await client.graphql({ query: createWorkout, variables: { input: newWorkout } });
    // Update local state to mark as synced after successful database save
    setWorkouts(prev => prev.map(workout => 
      workout.id === newWorkout.id 
        ? { ...workout, synced: true }
        : workout
    ));
  } catch (error) {
    console.error('Error adding workout to cloud:', error);
    // Remove the workout from local state if database save fails
    setWorkouts(prev => prev.filter(workout => workout.id !== newWorkout.id));
    FailureAlert('Error adding workout to cloud:', error);
  }
}

// HYBRID SYNC: This function supports optimistic update and background sync queue
export async function addExerciseToWorkoutRoot(workoutId, newExercise, workouts, setWorkouts, userId) {
  // ORDER PRESERVATION: exercises array is updated in the desired order
  const updatedWorkouts = workouts.map((workout) => {
    if (workout.id === workoutId) {
      return {
        ...workout,
        exercises: [...workout.exercises, { ...newExercise, synced: false }], // ORDER PRESERVATION: add new exercise at the end with synced: false
        archived: false,
        note: "",
        synced: false, // Mark workout as unsynced when exercise is added
      };
    } else {
      return workout;
    }
  });
  // Find the updated workout
  const updatedWorkout = updatedWorkouts.find(w => w.id === workoutId);
  // HYBRID SYNC: Only send fields defined in the schema, and exercises as JSON string
  const input = {
    id: updatedWorkout.id,
    userId,
    name: updatedWorkout.name,
    exercises: JSON.stringify(updatedWorkout.exercises), // HYBRID SYNC: always save as JSON string
    order: updatedWorkout.order, // ORDER PRESERVATION: save order field
    archived: updatedWorkout.archived,
    note: updatedWorkout.note,
    synced: true, // Mark as synced when saving to database
    createdAt: updatedWorkout.createdAt,
    updatedAt: new Date().toISOString(),
  };
  // Update local state first for instant UI feedback
  setWorkouts(updatedWorkouts);
  
  // Save to database second
  try {
    await client.graphql({ query: updateWorkout, variables: { input } });
    // Update local state to mark as synced after successful database save
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { ...workout, synced: true, exercises: workout.exercises.map(ex => ex.id === newExercise.id ? { ...ex, synced: true } : ex) }
        : workout
    ));
  } catch (error) {
    console.error('Error adding exercise to workout in cloud:', error);
    // Remove the exercise from local state if database save fails
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { ...workout, exercises: workout.exercises.filter(ex => ex.id !== newExercise.id) }
        : workout
    ));
    FailureAlert('Error adding exercise to workout in cloud:', error);
  }
}

// HYBRID SYNC: This function supports optimistic update and background sync queue
// ORDER PRESERVATION: logs are always saved in the correct order for each exercise
export async function addLogToExerciseRoot(workoutId, exerciseId, newLog, workouts, setWorkouts, userId) {
  const dateKey = getLocalDateKey(); // Format: 'YYYY-MM-DD'

  // O(n) optimization: Direct access instead of nested mapping
  const workoutIndex = workouts.findIndex(w => w.id === workoutId);
  if (workoutIndex === -1) return; // Workout not found
  
  const workout = workouts[workoutIndex];
  const exerciseIndex = workout.exercises.findIndex(e => e.id === exerciseId);
  if (exerciseIndex === -1) return; // Exercise not found
  
  const exercise = workout.exercises[exerciseIndex];
  
  // Build updated logs
  let existingLogsForDate = [];
  if (exercise.logs && exercise.logs[dateKey]) {
    existingLogsForDate = exercise.logs[dateKey];
  }
  const updatedLogs = { ...exercise.logs };
  // ORDER PRESERVATION: new logs are added at the start of the array for the date
  updatedLogs[dateKey] = [{ ...newLog, synced: false }, ...existingLogsForDate];
  
  // Create updated exercise
  const updatedExercise = {
    ...exercise,
    logs: updatedLogs,
    synced: false, // Mark exercise as unsynced when log is added
  };
  
  // Create updated workout with new exercise
  const updatedWorkout = {
    ...workout,
    exercises: [
      ...workout.exercises.slice(0, exerciseIndex),
      updatedExercise,
      ...workout.exercises.slice(exerciseIndex + 1)
    ],
    synced: false, // Mark workout as unsynced when log is added
  };
  
  // Create updated workouts array
  const updatedWorkouts = [
    ...workouts.slice(0, workoutIndex),
    updatedWorkout,
    ...workouts.slice(workoutIndex + 1)
  ];
  setWorkouts(updatedWorkouts);
  // HYBRID SYNC: Persist to backend as AWSJSON
  const input = {
    id: updatedWorkout.id,
    userId,
    name: updatedWorkout.name,
    exercises: JSON.stringify(updatedWorkout.exercises), // HYBRID SYNC: always save as JSON string
    order: updatedWorkout.order, // ORDER PRESERVATION: save order field
    archived: updatedWorkout.archived,
    note: updatedWorkout.note,
    synced: true, // Mark as synced when saving to database
    createdAt: updatedWorkout.createdAt,
    updatedAt: new Date().toISOString(),
  };
  try {
    await client.graphql({ query: updateWorkout, variables: { input } });
    // Update local state to mark as synced after successful database save (O(n) optimized)
    setWorkouts(prev => {
      const prevWorkoutIndex = prev.findIndex(w => w.id === workoutId);
      if (prevWorkoutIndex === -1) return prev;
      
      const prevWorkout = prev[prevWorkoutIndex];
      const prevExerciseIndex = prevWorkout.exercises.findIndex(e => e.id === exerciseId);
      if (prevExerciseIndex === -1) return prev;
      
      const prevExercise = prevWorkout.exercises[prevExerciseIndex];
      const logIndex = prevExercise.logs[dateKey]?.findIndex(log => log.id === newLog.id);
      
      if (logIndex === -1) return prev;
      
      // Update the specific log to synced: true
      const updatedLogs = { ...prevExercise.logs };
      updatedLogs[dateKey] = [...updatedLogs[dateKey]];
      updatedLogs[dateKey][logIndex] = { ...updatedLogs[dateKey][logIndex], synced: true };
      
      // Update the exercise
      const updatedExercise = { ...prevExercise, synced: true, logs: updatedLogs };
      
      // Update the workout
      const updatedWorkout = { 
        ...prevWorkout, 
        synced: true,
        exercises: [
          ...prevWorkout.exercises.slice(0, prevExerciseIndex),
          updatedExercise,
          ...prevWorkout.exercises.slice(prevExerciseIndex + 1)
        ]
      };
      
      // Update the workouts array
      return [
        ...prev.slice(0, prevWorkoutIndex),
        updatedWorkout,
        ...prev.slice(prevWorkoutIndex + 1)
      ];
    });
  } catch (error) {
    console.error('Error saving exercise log to cloud:', error);
    // Remove the log from local state if database save fails
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? {
            ...workout,
            exercises: workout.exercises.map(exercise => 
              exercise.id === exerciseId 
                ? {
                    ...exercise,
                    logs: {
                      ...exercise.logs,
                      [dateKey]: exercise.logs[dateKey]?.filter(log => log.id !== newLog.id) || []
                    }
                  }
                : exercise
            )
          }
        : workout
    ));
    FailureAlert('Error saving exercise log to cloud:', error);
  }
}
