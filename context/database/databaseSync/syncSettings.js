import { graphql } from '../../../utils/graphqlClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateSettings, createSettings } from '../../../graphql/mutations';
import { getCachedUserData } from '../../Auth/sessionStorage';
import { STORAGE_KEYS } from '../../storageKeys';

export async function syncSettings(userId) {
  const cachedUser = await getCachedUserData();
  if (!cachedUser?.settings) return { success: true, synced: false };

  // Get weightProgress from AsyncStorage
  const weightProgressData = await AsyncStorage.getItem(STORAGE_KEYS.weightProgress);
  const weightProgress = weightProgressData ? JSON.parse(weightProgressData) : [];

  const input = {
    id: userId,
    mode: cachedUser.settings.mode,
    unit: cachedUser.settings.unit,
    birthDate: cachedUser.settings.birthDate,
    age: cachedUser.settings.age,
    gender: cachedUser.settings.gender,
    bodyWeight: cachedUser.settings.bodyWeight,
    weightProgress: JSON.stringify(weightProgress),
    height: cachedUser.settings.height,
    goalType: cachedUser.settings.goalType,
    goalWeight: cachedUser.settings.goalWeight,
    goalPace: cachedUser.settings.goalPace,
    activityFactor: cachedUser.settings.activityFactor,
    calorieGoal: cachedUser.settings.calorieGoal,
    proteinGoal: cachedUser.settings.proteinGoal,
    carbsGoal: cachedUser.settings.carbsGoal,
    fatsGoal: cachedUser.settings.fatsGoal,
    onboardingCompleted: cachedUser.settings.onboardingCompleted ?? false,
    // Note: lastExercise is not included as it's not in UpdateSettingsInput type
  };

  // Helper function to check if error message indicates a conditional failure
  const isConditionalFailure = (errorMessage) => {
    return errorMessage?.includes('conditional request failed') || 
           errorMessage?.includes('ConditionalCheckFailedException');
  };

  // Always try to update first (settings should exist after onboarding)
  try {
    const result = await graphql({ query: updateSettings, variables: { input } }, { userId, authToken: null });
    // Check for GraphQL errors in response
    if (result.errors) {
      return { success: false, synced: false, error: 'GraphQL errors in updateSettings' };
    }
  } catch (error) {
    const errorMessage = error?.message || '';
    
    // If update fails (settings don't exist) - check for conditional failure or not found
    if (isConditionalFailure(errorMessage) || error.message?.includes('not found') || error.errors?.[0]?.errorType === 'NotFound') {
      console.log(`ℹ️ [Settings] Update failed (item doesn't exist), now creating: ${userId}`);
      try {
        const result = await graphql({ query: createSettings, variables: { input } }, { userId, authToken: null });
        // Check for GraphQL errors in response
        if (result.errors) {
          return { success: false, synced: false, error: 'GraphQL errors in createSettings' };
        }
      } catch (createError) {
        const createErrorMessage = createError?.message || '';
        
        // If create also fails with conditional error, item was created between attempts (race condition)
        if (isConditionalFailure(createErrorMessage)) {
          console.log(`ℹ️ [Settings] Create failed (race condition), retrying update: ${userId}`);
          try {
            const retryResult = await graphql({ query: updateSettings, variables: { input } }, { userId, authToken: null });
            if (retryResult.errors) {
              return { success: false, synced: false, error: 'GraphQL errors in retry updateSettings' };
            }
          } catch (retryError) {
            return { success: false, synced: false, error: retryError.message };
          }
        } else {
          return { success: false, synced: false, error: createError.message };
        }
      }
    } else {
      return { success: false, synced: false, error: error.message };
    }
  }

  return { success: true, synced: true };
}

