import { generateClient } from '@aws-amplify/api';
import { getSettings, listNutritions, listUserExercises, listWorkouts, listExercises, listExerciseLogs } from '../../graphql/queries';
import { deleteWorkout, deleteNutrition, deleteSettings, createSettings, deleteUserExercise, deleteExercise, deleteExerciseLog } from '../../graphql/mutations';

/**
 * Checks if Apple user exists in the database
 * @param {string} appleUserId - Apple's stable user ID
 * @returns {Object} Settings record if exists, null if not
 */
export const checkAppleUserExists = async (appleUserId) => {
  try {
    const client = generateClient();
    const result = await client.graphql({
      query: getSettings,
      variables: { id: appleUserId }
    });
    
    return {
      success: true,
      settings: result.data.getSettings,
      exists: !!result.data.getSettings,
    };
  } catch (error) {
    console.log('Apple user not found:', error);
    return {
      success: true,
      settings: null,
      exists: false,
    };
  }
};

/**
 * Creates default settings for new Apple user
 * @param {string} appleUserId - Apple's stable user ID
 * @param {string} email - User's proxy email
 * @param {string} name - User's name (optional)
 * @returns {Object} Created settings record
 */
export const createDefaultSettings = async (appleUserId, email, name = null) => {
  try {
    const client = generateClient();
    const result = await client.graphql({
      query: createSettings,
      variables: {
        input: {
          id: appleUserId, // Apple user ID becomes the Settings ID
          mode: false, // Default values
          unit: false,
          birthDate: null,
          age: null,
          gender: null,
          bodyWeight: null,
          weightProgress: null,
          height: null,
          activityFactor: 1.2,
          goalType: null,
          goalWeight: null,
          goalPace: null,
          calorieGoal: 2000,
          proteinGoal: 150,
          carbsGoal: 250,
          fatsGoal: 65,
          onboardingCompleted: false,
        }
      }
    });
    
    return {
      success: true,
      settings: result.data.createSettings,
    };
  } catch (error) {
    console.error('Error creating default settings:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Loads all user data for Apple user
 * @param {string} appleUserId - Apple's stable user ID
 * @returns {Object} User data including settings, workouts, and nutrition
 */
export const loadAppleUserData = async (appleUserId) => {
  try {
    const client = generateClient();
        // Load all user data in parallel
        const [settingsResult, nutritionResult, userExercisesResult, workoutsResult, exercisesResult, exerciseLogsResult] = await Promise.all([
          client.graphql({
            query: getSettings,
            variables: { id: appleUserId }
          }),
          
          client.graphql({
            query: listNutritions,
            variables: { 
              filter: { userId: { eq: appleUserId } }
            }
          }),
          
          client.graphql({
            query: listUserExercises,
            variables: { 
              filter: { userId: { eq: appleUserId } }
            }
          }),
          
          client.graphql({
            query: listWorkouts,
            variables: { 
              filter: { userId: { eq: appleUserId } }
            }
          }),
          
          client.graphql({
            query: listExercises,
            variables: { 
              filter: { userId: { eq: appleUserId } }
            }
          }),
          
          client.graphql({
            query: listExerciseLogs,
            variables: { 
              filter: { userId: { eq: appleUserId } }
            }
          })
        ]);
    
    // Parse JSON fields in settings data
    const parsedSettings = settingsResult.data.getSettings ? {
      ...settingsResult.data.getSettings,
      weightProgress: settingsResult.data.getSettings.weightProgress ? 
        JSON.parse(settingsResult.data.getSettings.weightProgress) : [],
    } : null;

    // Add synced: true to all nutrition items from database
    const nutritionWithSyncStatus = nutritionResult.data.listNutritions.items.map(item => ({
      ...item,
      synced: true
    }));


    // Add synced: true to all workout data from database
    const workoutsWithSyncStatus = (workoutsResult.data.listWorkouts.items || []).map(item => ({
      ...item,
      synced: true
    }));

    const exercisesWithSyncStatus = (exercisesResult.data.listExercises.items || []).map(item => ({
      ...item,
      synced: true
    }));

    const exerciseLogsWithSyncStatus = (exerciseLogsResult.data.listExerciseLogs.items || []).map(item => ({
      ...item,
      synced: true
    }));

    return {
      success: true,
      data: {
        settings: parsedSettings,
        nutrition: nutritionWithSyncStatus,
        userExercises: userExercisesResult.data.listUserExercises.items,
        // Workout data (V2 flat structure) with sync status
        workouts: workoutsWithSyncStatus,
        exercises: exercisesWithSyncStatus,
        exerciseLogs: exerciseLogsWithSyncStatus,
      },
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Deletes all user data for Apple user
 * @param {string} appleUserId - Apple's stable user ID
 * @returns {Object} Result of deletion operation
 */
export const deleteAppleUserData = async (appleUserId) => {
  try {
    console.log('🗑️ Starting account deletion for user:', appleUserId);
    const client = generateClient();
    
    // Step 1: Delete ExerciseLogs first (they depend on exercises)
    console.log('📝 Step 1: Deleting ExerciseLogs...');
    const exerciseLogsResult = await client.graphql({
      query: listExerciseLogs,
      variables: { 
        filter: { userId: { eq: appleUserId } }
      }
    });
    
    const exerciseLogsToDelete = exerciseLogsResult.data.listExerciseLogs.items || [];
    console.log(`Found ${exerciseLogsToDelete.length} ExerciseLogs to delete`);
    
    if (exerciseLogsToDelete.length > 0) {
      const deleteLogPromises = exerciseLogsToDelete.map(log =>
        client.graphql({
          query: deleteExerciseLog,
          variables: { input: { id: log.id } }
        })
      );
      await Promise.all(deleteLogPromises);
      console.log('✅ ExerciseLogs deleted successfully');
    }
    
    // Step 2: Delete Exercises (they depend on workouts)
    console.log('💪 Step 2: Deleting Exercises...');
    const exercisesResult = await client.graphql({
      query: listExercises,
      variables: { 
        filter: { userId: { eq: appleUserId } }
      }
    });
    
    const exercisesToDelete = exercisesResult.data.listExercises.items || [];
    console.log(`Found ${exercisesToDelete.length} Exercises to delete`);
    
    if (exercisesToDelete.length > 0) {
      const deleteExercisePromises = exercisesToDelete.map(exercise =>
        client.graphql({
          query: deleteExercise,
          variables: { input: { id: exercise.id } }
        })
      );
      await Promise.all(deleteExercisePromises);
      console.log('✅ Exercises deleted successfully');
    }
    
    // Step 3: Delete Workouts (independent)
    console.log('🏋️ Step 3: Deleting Workouts...');
    const workoutsResult = await client.graphql({
      query: listWorkouts,
      variables: { 
        filter: { userId: { eq: appleUserId } }
      }
    });
    
    const workoutsToDelete = workoutsResult.data.listWorkouts.items || [];
    console.log(`Found ${workoutsToDelete.length} Workouts to delete`);
    
    if (workoutsToDelete.length > 0) {
      const deleteWorkoutPromises = workoutsToDelete.map(workout =>
        client.graphql({
          query: deleteWorkout,
          variables: { input: { id: workout.id } }
        })
      );
      await Promise.all(deleteWorkoutPromises);
      console.log('✅ Workouts deleted successfully');
    }
    
    // Step 4: Delete remaining data in parallel (Nutrition, UserExercises, Settings)
    console.log('📦 Step 4: Deleting remaining data (Nutrition, UserExercises, Settings)...');
    const [nutritionResult, userExercisesResult, settingsResult] = await Promise.all([
      // Delete nutrition entries
      client.graphql({
        query: listNutritions,
        variables: { 
          filter: { userId: { eq: appleUserId } }
        }
      }).then(async (result) => {
        const items = result.data.listNutritions.items || [];
        console.log(`Found ${items.length} Nutrition entries to delete`);
        if (items.length > 0) {
          const deletePromises = items.map(nutrition =>
            client.graphql({
              query: deleteNutrition,
              variables: { input: { id: nutrition.id } }
            })
          );
          await Promise.all(deletePromises);
          console.log('✅ Nutrition entries deleted successfully');
        }
        return items.length;
      }),
      
      // Delete user exercises
      client.graphql({
        query: listUserExercises,
        variables: { 
          filter: { userId: { eq: appleUserId } }
        }
      }).then(async (result) => {
        const items = result.data.listUserExercises.items || [];
        console.log(`Found ${items.length} UserExercises to delete`);
        if (items.length > 0) {
          const deletePromises = items.map(exercise =>
            client.graphql({
              query: deleteUserExercise,
              variables: { input: { id: exercise.id } }
            })
          );
          await Promise.all(deletePromises);
          console.log('✅ UserExercises deleted successfully');
        }
        return items.length;
      }),
      
      // Delete settings
      client.graphql({
        query: deleteSettings,
        variables: { input: { id: appleUserId } }
      }).then(() => {
        console.log('✅ Settings deleted successfully');
        return 1;
      })
    ]);
    
    const totalDeleted = {
      exerciseLogs: exerciseLogsToDelete.length,
      exercises: exercisesToDelete.length,
      workouts: workoutsToDelete.length,
      nutrition: nutritionResult,
      userExercises: userExercisesResult,
      settings: settingsResult
    };
    
    console.log('🎉 Account deletion completed successfully:', totalDeleted);
    
    return {
      success: true,
      message: 'User data deleted successfully',
      deletedItems: totalDeleted
    };
  } catch (error) {
    console.error('❌ Error deleting user data:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};


