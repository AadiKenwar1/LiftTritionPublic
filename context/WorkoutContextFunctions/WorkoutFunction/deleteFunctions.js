import { generateClient } from 'aws-amplify/api';
import { updateWorkout, deleteWorkout as deleteWorkoutMutation } from '../../../database/graphql/mutations';
const client = generateClient();
// Delete a workout by ID
export async function deleteWorkoutRoot(workoutId, setWorkouts) {
  try {
    await client.graphql({ query: deleteWorkoutMutation, variables: { input: { id: workoutId } } });
    setWorkouts((prev) => prev.filter((workout) => workout.id !== workoutId));
  } catch (error) {
    console.error('Error deleting workout from cloud:', error);
  }
}

// Delete an exercise from a workout
export async function deleteExerciseRoot(workoutId, exerciseId, workouts, setWorkouts, userId) {
  const updatedWorkouts = workouts.map((workout) => {
    if (workout.id === workoutId) {
      return {
        ...workout,
        exercises: workout.exercises.filter((exercise) => exercise.id !== exerciseId),
      };
    }
    return workout;
  });
  setWorkouts(updatedWorkouts);
  // Persist to backend
  const updatedWorkout = updatedWorkouts.find(w => w.id === workoutId);
  const input = {
    id: updatedWorkout.id,
    userId,
    name: updatedWorkout.name,
    exercises: JSON.stringify(updatedWorkout.exercises),
    order: updatedWorkout.order,
    archived: updatedWorkout.archived,
    note: updatedWorkout.note,
    createdAt: updatedWorkout.createdAt,
    updatedAt: new Date().toISOString(),
  };
  try {
    await client.graphql({ query: updateWorkout, variables: { input } });
  } catch (error) {
    console.error('Error deleting exercise from workout in cloud:', error);
  }
}

// Delete a specific log entry
export function deleteLogRoot(
  workoutId,
  exerciseId,
  dateKey,
  logIndex,
  setWorkouts,
) {
  setWorkouts((prev) =>
    prev.map((workout) => {
      if (workout.id === workoutId) {
        return {
          ...workout,
          exercises: workout.exercises.map((ex) => {
            if (ex.id === exerciseId && ex.logs?.[dateKey]) {
              const updatedLogsForDate = [...ex.logs[dateKey]];
              updatedLogsForDate.splice(logIndex, 1);

              const updatedLogs = { ...ex.logs };
              if (updatedLogsForDate.length > 0) {
                updatedLogs[dateKey] = updatedLogsForDate;
              } else {
                delete updatedLogs[dateKey]; // Remove empty date key
              }

              return { ...ex, logs: updatedLogs };
            }
            return ex;
          }),
        };
      }
      return workout;
    }),
  );
}
