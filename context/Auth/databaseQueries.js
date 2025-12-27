import { generateClient } from '@aws-amplify/api';
import { getSettings, listNutritions, listUserExercises, listWorkouts, listExercises, listExerciseLogs } from '../../graphql/queries';
import { deleteWorkout, deleteNutrition, deleteSettings, createSettings, deleteUserExercise, deleteExercise, deleteExerciseLog, createNutrition, createWorkout, createExercise, createExerciseLog, createUserExercise, updateSettings } from '../../graphql/mutations';

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
 * Loads settings for Apple user (nutrition/workout data now stored locally)
 * @param {string} appleUserId - Apple's stable user ID
 * @returns {Object} User settings data
 */
export const loadAppleUserData = async (appleUserId) => {
  try {
    const client = generateClient();
    const settingsResult = await client.graphql({
      query: getSettings,
      variables: { id: appleUserId }
    });
    
    // Parse JSON fields in settings data
    const parsedSettings = settingsResult.data.getSettings ? {
      ...settingsResult.data.getSettings,
      weightProgress: settingsResult.data.getSettings.weightProgress ? 
        JSON.parse(settingsResult.data.getSettings.weightProgress) : [],
    } : null;

    return {
      success: true,
      data: {
        settings: parsedSettings,
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
 * Saves nutrition data to database (backup before sign-out)
 * @param {string} userId - User ID
 * @param {Array} nutritionData - Array of nutrition items from AsyncStorage
 * @returns {Object} Result of save operation
 */
export const saveNutritionToDatabase = async (userId, nutritionData) => {
  try {
    const client = generateClient();
    
    // Step 1: Delete all existing nutrition data for this user
    const existingResult = await client.graphql({
      query: listNutritions,
      variables: { 
        filter: { userId: { eq: userId } }
      }
    });
    
    const existingItems = existingResult.data.listNutritions.items || [];
    if (existingItems.length > 0) {
      const deletePromises = existingItems.map(item =>
        client.graphql({
          query: deleteNutrition,
          variables: { input: { id: item.id } }
        })
      );
      await Promise.all(deletePromises);
      console.log(`🗑️ Deleted ${existingItems.length} existing nutrition entries`);
    }
    
    // Step 2: Create all nutrition items from AsyncStorage (exclude deleted items)
    if (nutritionData && nutritionData.length > 0) {
      const activeItems = nutritionData.filter(item => !item.deleted);
      if (activeItems.length > 0) {
        const createPromises = activeItems.map(item => {
          const input = {
            id: item.id,
            userId: userId,
            name: item.name,
            date: item.date,
            time: item.time,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats,
            calories: item.calories,
            isPhoto: item.isPhoto || false,
            ingredients: item.ingredients || [],
            saved: item.saved || false,
            synced: true,
          };
          return client.graphql({
            query: createNutrition,
            variables: { input }
          });
        });
        
        await Promise.all(createPromises);
        console.log(`✅ Saved ${activeItems.length} nutrition entries to database`);
      }
    }
    
    const activeCount = nutritionData?.filter(item => !item.deleted).length || 0;
    return {
      success: true,
      message: `Saved ${activeCount} nutrition entries`,
    };
  } catch (error) {
    console.error('Error saving nutrition to database:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Saves workout data to database (backup before sign-out)
 * @param {string} userId - User ID
 * @param {Array} workouts - Array of workouts
 * @param {Array} exercises - Array of exercises
 * @param {Array} logs - Array of exercise logs
 * @param {Array} userExercises - Array of user-defined exercises
 * @returns {Object} Result of save operation
 */
export const saveWorkoutDataToDatabase = async (userId, workouts, exercises, logs, userExercises) => {
  try {
    const client = generateClient();
    
    // Step 1: Delete all existing workout data (in dependency order)
    // Delete logs first
    const existingLogsResult = await client.graphql({
      query: listExerciseLogs,
      variables: { filter: { userId: { eq: userId } }
    }});
    const existingLogs = existingLogsResult.data.listExerciseLogs.items || [];
    if (existingLogs.length > 0) {
      await Promise.all(existingLogs.map(log =>
        client.graphql({
          query: deleteExerciseLog,
          variables: { input: { id: log.id } }
        })
      ));
      console.log(`🗑️ Deleted ${existingLogs.length} existing exercise logs`);
    }
    
    // Delete exercises
    const existingExercisesResult = await client.graphql({
      query: listExercises,
      variables: { filter: { userId: { eq: userId } }
    }});
    const existingExercises = existingExercisesResult.data.listExercises.items || [];
    if (existingExercises.length > 0) {
      await Promise.all(existingExercises.map(ex =>
        client.graphql({
          query: deleteExercise,
          variables: { input: { id: ex.id } }
        })
      ));
      console.log(`🗑️ Deleted ${existingExercises.length} existing exercises`);
    }
    
    // Delete workouts
    const existingWorkoutsResult = await client.graphql({
      query: listWorkouts,
      variables: { filter: { userId: { eq: userId } }
    }});
    const existingWorkouts = existingWorkoutsResult.data.listWorkouts.items || [];
    if (existingWorkouts.length > 0) {
      await Promise.all(existingWorkouts.map(workout =>
        client.graphql({
          query: deleteWorkout,
          variables: { input: { id: workout.id } }
        })
      ));
      console.log(`🗑️ Deleted ${existingWorkouts.length} existing workouts`);
    }
    
    // Delete user exercises
    const existingUserExercisesResult = await client.graphql({
      query: listUserExercises,
      variables: { filter: { userId: { eq: userId } }
    }});
    const existingUserExercises = existingUserExercisesResult.data.listUserExercises.items || [];
    if (existingUserExercises.length > 0) {
      await Promise.all(existingUserExercises.map(ue =>
        client.graphql({
          query: deleteUserExercise,
          variables: { input: { id: ue.id } }
        })
      ));
      console.log(`🗑️ Deleted ${existingUserExercises.length} existing user exercises`);
    }
    
    // Step 2: Create all items from AsyncStorage (in dependency order, exclude deleted items)
    // Create workouts first
    if (workouts && workouts.length > 0) {
      const activeWorkouts = workouts.filter(w => !w.deleted);
      if (activeWorkouts.length > 0) {
        await Promise.all(activeWorkouts.map(workout => {
          const input = {
            id: workout.id,
            userId: userId,
            name: workout.name,
            order: workout.order,
            archived: workout.archived || false,
            note: workout.note || null,
            synced: true,
          };
          return client.graphql({
            query: createWorkout,
            variables: { input }
          });
        }));
        console.log(`✅ Saved ${activeWorkouts.length} workouts to database`);
      }
    }
    
    // Create exercises
    if (exercises && exercises.length > 0) {
      const activeExercises = exercises.filter(e => !e.deleted);
      if (activeExercises.length > 0) {
        await Promise.all(activeExercises.map(exercise => {
          const input = {
            id: exercise.id,
            workoutId: exercise.workoutId,
            userId: userId,
            name: exercise.name,
            userMax: exercise.userMax || null,
            order: exercise.order,
            archived: exercise.archived || false,
            note: exercise.note || null,
            synced: true,
          };
          return client.graphql({
            query: createExercise,
            variables: { input }
          });
        }));
        console.log(`✅ Saved ${activeExercises.length} exercises to database`);
      }
    }
    
    // Create exercise logs
    if (logs && logs.length > 0) {
      const activeLogs = logs.filter(l => !l.deleted);
      if (activeLogs.length > 0) {
        await Promise.all(activeLogs.map(log => {
          const input = {
            id: log.id,
            exerciseId: log.exerciseId,
            workoutId: log.workoutId,
            userId: userId,
            date: log.date,
            weight: log.weight,
            reps: log.reps,
            rpe: log.rpe,
            synced: true,
          };
          return client.graphql({
            query: createExerciseLog,
            variables: { input }
          });
        }));
        console.log(`✅ Saved ${activeLogs.length} exercise logs to database`);
      }
    }
    
    // Create user exercises
    if (userExercises && userExercises.length > 0) {
      const activeUserExercises = userExercises.filter(ue => !ue.deleted);
      if (activeUserExercises.length > 0) {
        await Promise.all(activeUserExercises.map(ue => {
          const input = {
            id: ue.id,
            userId: userId,
            name: ue.name,
            isCompound: ue.isCompound,
            fatigueFactor: ue.fatigueFactor,
            userMax: ue.userMax || null,
            mainMuscle: ue.mainMuscle,
            accessoryMuscles: ue.accessoryMuscles || [],
          };
          return client.graphql({
            query: createUserExercise,
            variables: { input }
          });
        }));
        console.log(`✅ Saved ${activeUserExercises.length} user exercises to database`);
      }
    }
    
    const activeWorkoutsCount = workouts?.filter(w => !w.deleted).length || 0;
    const activeExercisesCount = exercises?.filter(e => !e.deleted).length || 0;
    const activeLogsCount = logs?.filter(l => !l.deleted).length || 0;
    const activeUserExercisesCount = userExercises?.filter(ue => !ue.deleted).length || 0;
    
    return {
      success: true,
      message: `Saved ${activeWorkoutsCount} workouts, ${activeExercisesCount} exercises, ${activeLogsCount} logs, ${activeUserExercisesCount} user exercises`,
    };
  } catch (error) {
    console.error('Error saving workout data to database:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Loads nutrition data from database (restore on sign-in)
 * @param {string} userId - User ID
 * @returns {Object} Nutrition data array
 */
export const loadNutritionFromDatabase = async (userId) => {
  try {
    const client = generateClient();
    const result = await client.graphql({
      query: listNutritions,
      variables: { 
        filter: { userId: { eq: userId } }
      }
    });
    
    const nutritionData = (result.data.listNutritions.items || []).map(item => ({
      ...item,
      synced: true
    }));
    
    return {
      success: true,
      data: nutritionData,
    };
  } catch (error) {
    console.error('Error loading nutrition from database:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Loads workout data from database (restore on sign-in)
 * @param {string} userId - User ID
 * @returns {Object} Workout data (workouts, exercises, logs, userExercises)
 */
export const loadWorkoutDataFromDatabase = async (userId) => {
  try {
    const client = generateClient();
    const [workoutsResult, exercisesResult, logsResult, userExercisesResult] = await Promise.all([
      client.graphql({
        query: listWorkouts,
        variables: { filter: { userId: { eq: userId } }
      }}),
      client.graphql({
        query: listExercises,
        variables: { filter: { userId: { eq: userId } }
      }}),
      client.graphql({
        query: listExerciseLogs,
        variables: { filter: { userId: { eq: userId } }
      }}),
      client.graphql({
        query: listUserExercises,
        variables: { filter: { userId: { eq: userId } }
      }}),
    ]);
    
    const workouts = (workoutsResult.data.listWorkouts.items || []).map(item => ({
      ...item,
      synced: true
    }));
    
    const exercises = (exercisesResult.data.listExercises.items || []).map(item => ({
      ...item,
      synced: true
    }));
    
    const logs = (logsResult.data.listExerciseLogs.items || []).map(item => ({
      ...item,
      synced: true
    }));
    
    const userExercises = (userExercisesResult.data.listUserExercises.items || []).map(item => ({
      ...item,
      synced: true
    }));
    
    return {
      success: true,
      data: {
        workouts,
        exercises,
        logs,
        userExercises,
      },
    };
  } catch (error) {
    console.error('Error loading workout data from database:', error);
    return {
      success: false,
      error: error.message,
      data: {
        workouts: [],
        exercises: [],
        logs: [],
        userExercises: [],
      },
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

/**
 * Saves weightProgress to database (backup before sign-out)
 * @param {string} userId - User ID
 * @param {Array} weightProgress - Array of weight progress entries from AsyncStorage
 * @returns {Object} Result of save operation
 */
export const saveWeightProgressToDatabase = async (userId, weightProgress) => {
  try {
    const client = generateClient();
    
    // Update Settings with weightProgress
    const updateResult = await client.graphql({
      query: updateSettings,
      variables: {
        input: {
          id: userId,
          weightProgress: JSON.stringify(weightProgress || []),
        }
      }
    });
    
    console.log(`✅ Saved ${weightProgress?.length || 0} weight progress entries to database`);
    return { success: true };
  } catch (error) {
    console.error('Error saving weightProgress to database:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Loads weightProgress from database (restore on sign-in)
 * @param {string} userId - User ID
 * @returns {Object} Weight progress data
 */
export const loadWeightProgressFromDatabase = async (userId) => {
  try {
    const client = generateClient();
    const settingsResult = await client.graphql({
      query: getSettings,
      variables: { id: userId }
    });
    
    const weightProgress = settingsResult.data.getSettings?.weightProgress
      ? JSON.parse(settingsResult.data.getSettings.weightProgress)
      : [];
    
    return {
      success: true,
      data: weightProgress,
    };
  } catch (error) {
    console.error('Error loading weightProgress from database:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Saves settings to database (backup before sign-out)
 * @param {string} userId - User ID
 * @param {Object} settings - Settings object from cached user data
 * @returns {Object} Result of save operation
 */
export const saveSettingsToDatabase = async (userId, settings) => {
  try {
    const client = generateClient();
    
    const input = {
      id: userId,
      mode: settings.mode,
      unit: settings.unit,
      birthDate: settings.birthDate,
      age: settings.age,
      gender: settings.gender,
      bodyWeight: settings.bodyWeight,
      height: settings.height,
      goalType: settings.goalType,
      goalWeight: settings.goalWeight,
      goalPace: settings.goalPace,
      activityFactor: settings.activityFactor,
      calorieGoal: settings.calorieGoal,
      proteinGoal: settings.proteinGoal,
      carbsGoal: settings.carbsGoal,
      fatsGoal: settings.fatsGoal,
      // weightProgress is saved separately via saveWeightProgressToDatabase
    };
    
    const updateResult = await client.graphql({
      query: updateSettings,
      variables: { input }
    });
    
    console.log('✅ Saved settings to database');
    return { success: true };
  } catch (error) {
    console.error('Error saving settings to database:', error);
    return { success: false, error: error.message };
  }
};


