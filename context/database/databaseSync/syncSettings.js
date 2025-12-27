import { generateClient } from '@aws-amplify/api';
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

  const client = generateClient();
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
    lastExercise: cachedUser.settings.lastExercise ?? '',
  };

  // Always try to update first (settings should exist after onboarding)
  try {
    const result = await client.graphql({ query: updateSettings, variables: { input } });
    // Check for GraphQL errors in response
    if (result.errors) {
      return { success: false, synced: false, error: 'GraphQL errors in updateSettings' };
    }
  } catch (error) {
    // If update fails (settings don't exist), create them
    if (error.message?.includes('not found') || error.errors?.[0]?.errorType === 'NotFound') {
      try {
        const result = await client.graphql({ query: createSettings, variables: { input } });
        // Check for GraphQL errors in response
        if (result.errors) {
          return { success: false, synced: false, error: 'GraphQL errors in createSettings' };
        }
      } catch (createError) {
        return { success: false, synced: false, error: createError.message };
      }
    } else {
      return { success: false, synced: false, error: error.message };
    }
  }

  return { success: true, synced: true };
}

