import { generateClient } from 'aws-amplify/api';
import { updateWorkout } from '../../../database/graphql/mutations';
const client = generateClient();
//Reordering for the Draggable List
// HYBRID SYNC & ORDER PRESERVATION: This function updates the order field for all workouts after drag-and-drop and persists the new order to the backend for each workout.
export const reorderWorkoutsRoot = async (newOrder, setWorkouts, userId) => {
  // newOrder: array of workout objects in new order (top to bottom)
  // ORDER PRESERVATION: Newest at top gets highest order
  const updatedWorkouts = newOrder.map((workout, idx) => ({
    ...workout,
    order: newOrder.length - 1 - idx, // ORDER PRESERVATION: set order so top is highest
  }));
  setWorkouts(updatedWorkouts);
  // HYBRID SYNC: Persist each workout's new order to the backend
  for (const workout of updatedWorkouts) {
    const input = {
      id: workout.id,
      userId,
      name: workout.name,
      exercises: JSON.stringify(workout.exercises), // HYBRID SYNC: always save as JSON string
      order: workout.order, // ORDER PRESERVATION: save order field
      archived: workout.archived,
      note: workout.note,
      createdAt: workout.createdAt,
      updatedAt: new Date().toISOString(),
    };
    try {
      await client.graphql({ query: updateWorkout, variables: { input } });
    } catch (error) {
      console.error('Error saving workout order to cloud:', error);
    }
  }
};

// HYBRID SYNC & ORDER PRESERVATION: This function updates the exercises array order and persists it to the backend as AWSJSON.
export const reorderExercisesRoot = async (
  workoutId,
  newExerciseOrder,
  workouts,
  setWorkouts,
  userId
) => {
  // ORDER PRESERVATION: Update local state with new exercise order
  const updatedWorkouts = workouts.map((workout) => {
    if (workout.id === workoutId) {
      return {
        ...workout,
        exercises: newExerciseOrder, // ORDER PRESERVATION: set new order
      };
    }
    return workout;
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
    console.error('Error saving exercise order to cloud:', error);
  }
};
