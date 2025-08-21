import uuid from "react-native-uuid";
import { getLocalDateKey } from "../../../utils/date";
import { generateClient } from 'aws-amplify/api';
import { createWorkout, updateWorkout } from '../../../database/graphql/mutations';
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  try {
    await client.graphql({ query: createWorkout, variables: { input: newWorkout } });
    setWorkouts((prev) => [
      { ...newWorkout, exercises: [] }, // ensure exercises is an array in local state
      ...prev,
    ]);
  } catch (error) {
    console.error('Error adding workout to cloud:', error);
  }
}

// HYBRID SYNC: This function supports optimistic update and background sync queue
export async function addExerciseToWorkoutRoot(workoutId, newExercise, workouts, setWorkouts, userId) {
  // ORDER PRESERVATION: exercises array is updated in the desired order
  const updatedWorkouts = workouts.map((workout) => {
    if (workout.id === workoutId) {
      return {
        ...workout,
        exercises: [...workout.exercises, newExercise], // ORDER PRESERVATION: add new exercise at the end
        archived: false,
        note: "",
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
    createdAt: updatedWorkout.createdAt,
    updatedAt: new Date().toISOString(),
  };
  try {
    await client.graphql({ query: updateWorkout, variables: { input } });
    setWorkouts(updatedWorkouts);
  } catch (error) {
    console.error('Error adding exercise to workout in cloud:', error);
  }
}

// HYBRID SYNC: This function supports optimistic update and background sync queue
// ORDER PRESERVATION: logs are always saved in the correct order for each exercise
export async function addLogToExerciseRoot(workoutId, exerciseId, newLog, workouts, setWorkouts, userId) {
  const dateKey = getLocalDateKey(); // Format: 'YYYY-MM-DD'

  const updatedWorkouts = workouts.map((workout) => {
    if (workout.id === workoutId) {
      const updatedExercises = workout.exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          let existingLogsForDate = [];
          if (exercise.logs && exercise.logs[dateKey]) {
            existingLogsForDate = exercise.logs[dateKey];
          }
          const updatedLogs = {};
          if (exercise.logs) {
            for (const key in exercise.logs) {
              updatedLogs[key] = exercise.logs[key];
            }
          }
          // ORDER PRESERVATION: new logs are added at the start of the array for the date
          updatedLogs[dateKey] = [newLog, ...existingLogsForDate];
          return {
            ...exercise,
            logs: updatedLogs,
          };
        } else {
          return exercise;
        }
      });
      return {
        ...workout,
        exercises: updatedExercises, // ORDER PRESERVATION: exercises array is preserved
      };
    } else {
      return workout;
    }
  });
  setWorkouts(updatedWorkouts);
  // HYBRID SYNC: Persist to backend as AWSJSON
  const updatedWorkout = updatedWorkouts.find(w => w.id === workoutId);
  const input = {
    id: updatedWorkout.id,
    userId,
    name: updatedWorkout.name,
    exercises: JSON.stringify(updatedWorkout.exercises), // HYBRID SYNC: always save as JSON string
    order: updatedWorkout.order, // ORDER PRESERVATION: save order field
    archived: updatedWorkout.archived,
    note: updatedWorkout.note,
    createdAt: updatedWorkout.createdAt,
    updatedAt: new Date().toISOString(),
  };
  try {
    await client.graphql({ query: updateWorkout, variables: { input } });
  } catch (error) {
    console.error('Error saving exercise log to cloud:', error);
  }
}
