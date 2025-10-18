import { getLocalDateKey } from "../../../utils/date";
import { generateClient } from 'aws-amplify/api';
import { updateWorkout } from '../../../database/graphql/mutations';
const client = generateClient();
//Add new Workout

// Add note to workout
export async function addNoteToWorkoutRoot(workoutId, note, workouts, setWorkouts, userId) {
  const updatedWorkouts = workouts.map((workout) => {
    if (workout.id === workoutId) {
      return {
        ...workout,
        note: note,
      };
    } else {
      return workout;
    }
  });
  const updatedWorkout = updatedWorkouts.find(w => w.id === workoutId);
  const input = {
    id: updatedWorkout.id,
    userId,
    name: updatedWorkout.name,
    exercises: JSON.stringify(updatedWorkout.exercises),
    archived: updatedWorkout.archived,
    note: updatedWorkout.note,
    createdAt: updatedWorkout.createdAt,
    updatedAt: new Date().toISOString(),
  };
  try {
    await client.graphql({ query: updateWorkout, variables: { input } });
    setWorkouts(updatedWorkouts.map(w => ({
      ...w,
      exercises: typeof w.exercises === 'string' ? JSON.parse(w.exercises) : w.exercises,
    })));
  } catch (error) {
    console.error('Error adding note to workout in cloud:', error);
  }
}

// Add a new log entry to a specific exercise in a workout
export async function addNoteToExerciseRoot(
  workoutId,
  exerciseId,
  note,
  workouts,
  setWorkouts,
  userId
) {
  const updatedWorkouts = workouts.map((workout) => {
    if (workout.id === workoutId) {
      const updatedExercises = workout.exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            note: note,
          };
        } else {
          return exercise;
        }
      });
      return {
        ...workout,
        exercises: updatedExercises,
      };
    } else {
      return workout;
    }
  });
  const updatedWorkout = updatedWorkouts.find(w => w.id === workoutId);
  const input = {
    id: updatedWorkout.id,
    userId,
    name: updatedWorkout.name,
    exercises: JSON.stringify(updatedWorkout.exercises),
    archived: updatedWorkout.archived,
    note: updatedWorkout.note,
    createdAt: updatedWorkout.createdAt,
    updatedAt: new Date().toISOString(),
  };
  try {
    await client.graphql({ query: updateWorkout, variables: { input } });
    setWorkouts(updatedWorkouts.map(w => ({
      ...w,
      exercises: typeof w.exercises === 'string' ? JSON.parse(w.exercises) : w.exercises,
    })));
  } catch (error) {
    console.error('Error adding note to exercise in cloud:', error);
  }
}
