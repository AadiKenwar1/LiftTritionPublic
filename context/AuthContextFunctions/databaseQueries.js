import { generateClient } from 'aws-amplify/api';
import { getSettings, listWorkouts, listNutritions } from '../../database/graphql/queries';
import { deleteWorkout, deleteNutrition, deleteSettings, createSettings } from '../../database/graphql/mutations';

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
 * DELETE ONCE ONBOARDING IS SET UP!!!!!!!!!!
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
          fatsGoal: 65
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
    const [settingsResult, workoutsResult, nutritionResult] = await Promise.all([
      client.graphql({
        query: getSettings,
        variables: { id: appleUserId }
      }),
      
      client.graphql({
        query: listWorkouts,
        variables: { 
          filter: { userId: { eq: appleUserId } }
        }
      }),
      
      client.graphql({
        query: listNutritions,
        variables: { 
          filter: { userId: { eq: appleUserId } }
        }
      })
    ]);
    
    return {
      success: true,
      data: {
        settings: settingsResult.data.getSettings,
        workouts: workoutsResult.data.listWorkouts.items,
        nutrition: nutritionResult.data.listNutritions.items,
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
    const client = generateClient();
    // Delete all user data in parallel
    const [workoutsResult, nutritionResult, settingsResult] = await Promise.all([
      // Delete workouts
      client.graphql({
        query: listWorkouts,
        variables: { 
          filter: { userId: { eq: appleUserId } }
        }
      }).then(async (result) => {
        const deletePromises = result.data.listWorkouts.items.map(workout =>
          client.graphql({
            query: deleteWorkout,
            variables: { input: { id: workout.id } }
          })
        );
        return Promise.all(deletePromises);
      }),
      
      // Delete nutrition entries
      client.graphql({
        query: listNutritions,
        variables: { 
          filter: { userId: { eq: appleUserId } }
        }
      }).then(async (result) => {
        const deletePromises = result.data.listNutritions.items.map(nutrition =>
          client.graphql({
            query: deleteNutrition,
            variables: { input: { id: nutrition.id } }
          })
        );
        return Promise.all(deletePromises);
      }),
      
      // Delete settings
      client.graphql({
        query: deleteSettings,
        variables: { input: { id: appleUserId } }
      })
    ]);
    
    return {
      success: true,
      message: 'User data deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting user data:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
