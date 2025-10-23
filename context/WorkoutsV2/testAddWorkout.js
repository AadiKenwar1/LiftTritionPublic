// Test file to demonstrate adding a workout with V2 context
import { useWorkoutContext } from './WorkoutContext';

export function TestAddWorkout() {
  const { addWorkout, workouts, loading } = useWorkoutContext();

  const handleAddTestWorkout = async () => {
    try {
      console.log('🚀 Adding workout with V2 context...');
      const startTime = performance.now();
      
      await addWorkout('Test Workout V2');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Workout added in ${duration.toFixed(2)}ms`);
      console.log('📊 Current workouts:', workouts.length);
    } catch (error) {
      console.error('❌ Error adding workout:', error);
    }
  };

  return {
    handleAddTestWorkout,
    workouts,
    loading
  };
}

// Usage example:
/*
import { TestAddWorkout } from './context/WorkoutsV2/testAddWorkout';

function MyComponent() {
  const { handleAddTestWorkout, workouts, loading } = TestAddWorkout();

  return (
    <View>
      <Button 
        title="Add Test Workout (V2)" 
        onPress={handleAddTestWorkout}
        disabled={loading}
      />
      <Text>Workouts: {workouts.length}</Text>
    </View>
  );
}
*/
