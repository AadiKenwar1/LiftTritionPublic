import { generateClient } from 'aws-amplify/api';
import { updateWorkout } from '../../../database/graphql/mutations';
const client = generateClient();
// Rename a workout by ID
export async function renameWorkoutRoot(workoutId, newName, workouts, setWorkouts, userId) {
  const updatedWorkouts = workouts.map((workout) =>
    workout.id === workoutId ? { ...workout, name: newName } : workout,
  );
  const updatedWorkout = updatedWorkouts.find(w => w.id === workoutId);
  const input = {
    id: updatedWorkout.id,
    userId,
    name: updatedWorkout.name,
    exercises: JSON.stringify(updatedWorkout.exercises),
    order: updatedWorkout.order,
    archived: updatedWorkout.archived,
    note: updatedWorkout.note,
    synced: updatedWorkout.synced,
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
    console.error('Error renaming workout in cloud:', error);
  }
}

// Rename an exercise by ID within a workout
export async function renameExerciseRoot(
  workoutId,
  exerciseId,
  newName,
  workouts,
  setWorkouts,
  userId
) {
  const updatedWorkouts = workouts.map((workout) => {
    if (workout.id === workoutId) {
      return {
        ...workout,
        exercises: workout.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, name: newName }
            : exercise,
        ),
      };
    }
    return workout;
  });
  const updatedWorkout = updatedWorkouts.find(w => w.id === workoutId);
  try {
    await client.graphql({ query: updateWorkout, variables: { input: { ...updatedWorkout, userId } } });
    setWorkouts(updatedWorkouts);
  } catch (error) {
    console.error('Error renaming exercise in cloud:', error);
  }
}
