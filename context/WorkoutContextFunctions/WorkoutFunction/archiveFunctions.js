import { generateClient } from 'aws-amplify/api';
import { updateWorkout } from '../../../database/graphql/mutations';
const client = generateClient();
// Archive a workout (mark with `archived: true`)
export async function archiveWorkoutRoot(workoutId, workouts, setWorkouts, userId) {
  const updatedWorkouts = workouts.map((workout) =>
    workout.id === workoutId ? { ...workout, archived: true } : workout,
  );
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
    console.error('Error archiving workout in cloud:', error);
  }
}

//Archive an exercise within a workout
export async function archiveExerciseRoot(workoutId, exerciseId, workouts, setWorkouts, userId) {
  const updatedWorkouts = workouts.map((workout) => {
    if (workout.id === workoutId) {
      return {
        ...workout,
        exercises: workout.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, archived: true } : ex,
        ),
      };
    }
    return workout;
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
    console.error('Error archiving exercise in cloud:', error);
  }
}

// Archive a workout (mark with `archived: true`)
export async function unarchiveWorkoutRoot(workoutId, workouts, setWorkouts, userId) {
  const updatedWorkouts = workouts.map((workout) =>
    workout.id === workoutId ? { ...workout, archived: false } : workout,
  );
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
    console.error('Error unarchiving workout in cloud:', error);
  }
}

//Archive an exercise within a workout
export async function unarchiveExerciseRoot(workoutId, exerciseId, workouts, setWorkouts, userId) {
  const updatedWorkouts = workouts.map((workout) => {
    if (workout.id === workoutId) {
      return {
        ...workout,
        exercises: workout.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, archived: false } : ex,
        ),
      };
    }
    return workout;
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
    console.error('Error unarchiving exercise in cloud:', error);
  }
}
