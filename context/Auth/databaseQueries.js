import { graphql } from '../../utils/graphqlClient';
import { getSettings, listNutritions, listUserExercises, listWorkouts, listExercises, listExerciseLogs } from '../../graphql/queries';
import { deleteWorkout, deleteNutrition, deleteSettings, createSettings, deleteUserExercise, deleteExercise, deleteExerciseLog, createNutrition, createWorkout, createExercise, createExerciseLog, createUserExercise, updateSettings } from '../../graphql/mutations';

/**
 * IMPORTANT: Mutation Naming Convention
 * 
 * The GraphQL proxy Lambda (lambda-functions/graphql-proxy/index.js) uses pattern matching
 * to enforce user-based access control on mutations. It specifically looks for:
 * - Mutations starting with "Create" (e.g., CreateWorkout, CreateNutrition, CreateSettings)
 * - Mutations starting with "Update" (e.g., UpdateSettings, UpdateWorkout)
 * 
 * When adding new mutations to this file, you MUST follow this naming convention:
 * - Create mutations: Must start with "Create" (e.g., CreateNewFeature)
 * - Update mutations: Must start with "Update" (e.g., UpdateNewFeature)
 * - Delete mutations: Can be named anything (e.g., DeleteNewFeature, RemoveNewFeature)
 * 
 * This is critical for security - the proxy automatically adds the authenticated userId
 * to Create/Update mutation inputs. If you don't follow this convention, the security
 * enforcement may not work correctly.
 */

/**
 * Checks if Apple user exists in the database
 * @param {string} appleUserId - Apple's stable user ID
 * @returns {Object} Settings record if exists, null if not
 */
export const checkAppleUserExists = async (appleUserId) => {
  try {
    const result = await graphql({
      query: getSettings,
      variables: { id: appleUserId }
    }, { userId: appleUserId, authToken: null });
    
    return {
      success: true,
      settings: result.data.getSettings,
      exists: !!result.data.getSettings,
    };
  } catch (error) {
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
    const result = await graphql({
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
    }, { userId: appleUserId, authToken: null });
    
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
    const settingsResult = await graphql({
      query: getSettings,
      variables: { id: appleUserId }
    }, { userId: appleUserId, authToken: null });
    
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
    // Step 1: Delete all existing nutrition data for this user
    const existingResult = await graphql({
      query: listNutritions,
      variables: { 
        filter: { userId: { eq: userId } }
      }
    }, { userId, authToken: null });
    
    const existingItems = existingResult.data.listNutritions.items || [];
    if (existingItems.length > 0) {
      const deletePromises = existingItems.map(item =>
        graphql({
          query: deleteNutrition,
          variables: { input: { id: item.id } }
        }, { userId, authToken: null })
      );
      await Promise.all(deletePromises);
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
            isPlaceholder: item.isPlaceholder || false,
            synced: true,
          };
          return graphql({
            query: createNutrition,
            variables: { input }
          }, { userId, authToken: null });
        });
        
        await Promise.all(createPromises);
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
    // Step 1: Delete all existing workout data (in dependency order)
    // Delete logs first
    const existingLogsResult = await graphql({
      query: listExerciseLogs,
      variables: { filter: { userId: { eq: userId } }
    }}, { userId, authToken: null });
    const existingLogs = existingLogsResult.data.listExerciseLogs.items || [];
    if (existingLogs.length > 0) {
      await Promise.all(existingLogs.map(log =>
        graphql({
          query: deleteExerciseLog,
          variables: { input: { id: log.id } }
        }, { userId, authToken: null })
      ));
    }
    
    // Delete exercises
    const existingExercisesResult = await graphql({
      query: listExercises,
      variables: { filter: { userId: { eq: userId } }
    }}, { userId, authToken: null });
    const existingExercises = existingExercisesResult.data.listExercises.items || [];
    if (existingExercises.length > 0) {
      await Promise.all(existingExercises.map(ex =>
        graphql({
          query: deleteExercise,
          variables: { input: { id: ex.id } }
        }, { userId, authToken: null })
      ));
    }
    
    // Delete workouts
    const existingWorkoutsResult = await graphql({
      query: listWorkouts,
      variables: { filter: { userId: { eq: userId } }
    }}, { userId, authToken: null });
    const existingWorkouts = existingWorkoutsResult.data.listWorkouts.items || [];
    if (existingWorkouts.length > 0) {
      await Promise.all(existingWorkouts.map(workout =>
        graphql({
          query: deleteWorkout,
          variables: { input: { id: workout.id } }
        }, { userId, authToken: null })
      ));
    }
    
    // Delete user exercises
    const existingUserExercisesResult = await graphql({
      query: listUserExercises,
      variables: { filter: { userId: { eq: userId } }
    }}, { userId, authToken: null });
    const existingUserExercises = existingUserExercisesResult.data.listUserExercises.items || [];
    if (existingUserExercises.length > 0) {
      await Promise.all(existingUserExercises.map(ue =>
        graphql({
          query: deleteUserExercise,
          variables: { input: { id: ue.id } }
        }, { userId, authToken: null })
      ));
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
          return graphql({
            query: createWorkout,
            variables: { input }
          }, { userId, authToken: null });
        }));
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
          return graphql({
            query: createExercise,
            variables: { input }
          }, { userId, authToken: null });
        }));
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
          return graphql({
            query: createExerciseLog,
            variables: { input }
          }, { userId, authToken: null });
        }));
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
          return graphql({
            query: createUserExercise,
            variables: { input }
          }, { userId, authToken: null });
        }));
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
    const result = await graphql({
      query: listNutritions,
      variables: { 
        filter: { userId: { eq: userId } }
      }
    }, { userId, authToken: null });
    
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
    const [workoutsResult, exercisesResult, logsResult, userExercisesResult] = await Promise.all([
      graphql({
        query: listWorkouts,
        variables: { filter: { userId: { eq: userId } }
      }}, { userId, authToken: null }),
      graphql({
        query: listExercises,
        variables: { filter: { userId: { eq: userId } }
      }}, { userId, authToken: null }),
      graphql({
        query: listExerciseLogs,
        variables: { filter: { userId: { eq: userId } }
      }}, { userId, authToken: null }),
      graphql({
        query: listUserExercises,
        variables: { filter: { userId: { eq: userId } }
      }}, { userId, authToken: null }),
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
    // Step 1: Delete ExerciseLogs first (they depend on exercises)
    const exerciseLogsResult = await graphql({
      query: listExerciseLogs,
      variables: { 
        filter: { userId: { eq: appleUserId } }
      }
    }, { userId: appleUserId, authToken: null });
    
    const exerciseLogsToDelete = exerciseLogsResult.data.listExerciseLogs.items || [];
    
    if (exerciseLogsToDelete.length > 0) {
      const deleteLogPromises = exerciseLogsToDelete.map(log =>
        graphql({
          query: deleteExerciseLog,
          variables: { input: { id: log.id } }
        }, { userId: appleUserId, authToken: null })
      );
      await Promise.all(deleteLogPromises);
    }
    
    // Step 2: Delete Exercises (they depend on workouts)
    const exercisesResult = await graphql({
      query: listExercises,
      variables: { 
        filter: { userId: { eq: appleUserId } }
      }
    }, { userId: appleUserId, authToken: null });
    
    const exercisesToDelete = exercisesResult.data.listExercises.items || [];
    
    if (exercisesToDelete.length > 0) {
      const deleteExercisePromises = exercisesToDelete.map(exercise =>
        graphql({
          query: deleteExercise,
          variables: { input: { id: exercise.id } }
        }, { userId: appleUserId, authToken: null })
      );
      await Promise.all(deleteExercisePromises);
    }
    
    // Step 3: Delete Workouts (independent)
    const workoutsResult = await graphql({
      query: listWorkouts,
      variables: { 
        filter: { userId: { eq: appleUserId } }
      }
    }, { userId: appleUserId, authToken: null });
    
    const workoutsToDelete = workoutsResult.data.listWorkouts.items || [];
    
    if (workoutsToDelete.length > 0) {
      const deleteWorkoutPromises = workoutsToDelete.map(workout =>
        graphql({
          query: deleteWorkout,
          variables: { input: { id: workout.id } }
        }, { userId: appleUserId, authToken: null })
      );
      await Promise.all(deleteWorkoutPromises);
    }
    
    // Step 4: Delete remaining data in parallel (Nutrition, UserExercises, Settings)
    const [nutritionResult, userExercisesResult, settingsResult] = await Promise.all([
      // Delete nutrition entries
      graphql({
        query: listNutritions,
        variables: { 
          filter: { userId: { eq: appleUserId } }
        }
      }, { userId: appleUserId, authToken: null }).then(async (result) => {
        const items = result.data.listNutritions.items || [];
        if (items.length > 0) {
          const deletePromises = items.map(nutrition =>
            graphql({
              query: deleteNutrition,
              variables: { input: { id: nutrition.id } }
            }, { userId: appleUserId, authToken: null })
          );
          await Promise.all(deletePromises);
        }
        return items.length;
      }),
      
      // Delete user exercises
      graphql({
        query: listUserExercises,
        variables: { 
          filter: { userId: { eq: appleUserId } }
        }
      }, { userId: appleUserId, authToken: null }).then(async (result) => {
        const items = result.data.listUserExercises.items || [];
        if (items.length > 0) {
          const deletePromises = items.map(exercise =>
            graphql({
              query: deleteUserExercise,
              variables: { input: { id: exercise.id } }
            }, { userId: appleUserId, authToken: null })
          );
          await Promise.all(deletePromises);
        }
        return items.length;
      }),
      
      // Delete settings
      graphql({
        query: deleteSettings,
        variables: { input: { id: appleUserId } }
      }, { userId: appleUserId, authToken: null }).then(() => {
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
    // Update Settings with weightProgress
    const updateResult = await graphql({
      query: updateSettings,
      variables: {
        input: {
          id: userId,
          weightProgress: JSON.stringify(weightProgress || []),
        }
      }
    }, { userId, authToken: null });
    
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
    const settingsResult = await graphql({
      query: getSettings,
      variables: { id: userId }
    }, { userId, authToken: null });
    
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
    
    const updateResult = await graphql({
      query: updateSettings,
      variables: { input }
    }, { userId, authToken: null });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving settings to database:', error);
    return { success: false, error: error.message };
  }
};


