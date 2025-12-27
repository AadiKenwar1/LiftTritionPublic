import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateClient } from '@aws-amplify/api';
import { updateSettings } from '../../graphql/mutations';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Amplify configuration first
import './amplifyConfig';

// Import for internal use
import { signInWithApple as appleSignIn, extractUserData } from './appleAuth';
import { 
  checkAppleUserExists, 
  createDefaultSettings, 
  loadAppleUserData, 
  deleteAppleUserData,
  saveNutritionToDatabase,
  saveWorkoutDataToDatabase,
  loadNutritionFromDatabase,
  loadWorkoutDataFromDatabase,
  saveWeightProgressToDatabase,
  loadWeightProgressFromDatabase,
  saveSettingsToDatabase
} from './databaseQueries';
import { 
  storeAppleUserSession, 
  getAppleUserSession, 
  clearAppleUserSession,
  cacheUserData,
  getCachedUserData,
  clearCachedUserData
} from './sessionStorage';
import { STORAGE_KEYS } from '../storageKeys';



const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  //Reset authentication state
  const resetAuthState = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  //Clear session and reset authentication state
  const clearSessionAndState = async () => {
    await clearAppleUserSession();
    resetAuthState();
  };

  //Sign out with backup to database
  const signOut = async () => {
    if (!user?.userId) {
      return { success: false, error: 'No user to sign out' };
    }

    try {
      // Step 1: Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return { 
          success: false, 
          error: 'No internet connection. Please connect to the internet to sign out and backup your data.',
          code: 'NO_INTERNET'
        };
      }

      console.log('📤 Starting sign-out backup process...');

      // Step 2: Get nutrition data from AsyncStorage
      const nutritionDataString = await AsyncStorage.getItem(STORAGE_KEYS.nutrition);
      const nutritionData = nutritionDataString ? JSON.parse(nutritionDataString) : [];

      // Step 2.5: Get weightProgress from AsyncStorage
      const weightProgressString = await AsyncStorage.getItem(STORAGE_KEYS.weightProgress);
      const weightProgress = weightProgressString ? JSON.parse(weightProgressString) : [];

      // Step 3: Get workout data from AsyncStorage
      const [workoutsString, exercisesString, logsString, userExercisesString] = await AsyncStorage.multiGet([
        STORAGE_KEYS.workouts,
        STORAGE_KEYS.exercises,
        STORAGE_KEYS.exerciseLogs,
        STORAGE_KEYS.userExercises,
      ]);

      const workouts = workoutsString[1] ? JSON.parse(workoutsString[1]) : [];
      const exercises = exercisesString[1] ? JSON.parse(exercisesString[1]) : [];
      const logs = logsString[1] ? JSON.parse(logsString[1]) : [];
      const userExercises = userExercisesString[1] ? JSON.parse(userExercisesString[1]) : [];

      // Step 4: Get latest settings from cache
      const cachedUser = await getCachedUserData();
      const settings = cachedUser?.settings || user.settings;

      // Step 5: Save to database
      /*
      const [nutritionResult, workoutResult, weightProgressResult, settingsResult] = await Promise.all([
        saveNutritionToDatabase(user.userId, nutritionData),
        saveWorkoutDataToDatabase(user.userId, workouts, exercises, logs, userExercises),
        saveWeightProgressToDatabase(user.userId, weightProgress),
        saveSettingsToDatabase(user.userId, settings),
      ]);

      if (!nutritionResult.success || !workoutResult.success || !weightProgressResult.success || !settingsResult.success) {
        console.error('❌ Backup failed:', {
          nutrition: nutritionResult.error,
          workout: workoutResult.error,
          weightProgress: weightProgressResult.error,
          settings: settingsResult.error,
        });
        return {
          success: false,
          error: 'Failed to backup data. Please try again.',
          details: {
            nutrition: nutritionResult.error,
            workout: workoutResult.error,
            weightProgress: weightProgressResult.error,
            settings: settingsResult.error,
          },
        };
      }
      */

      console.log('✅ Backup completed successfully');
      console.log(`📊 Backed up: ${nutritionData.length} nutrition entries, ${workouts.length} workouts, ${exercises.length} exercises, ${logs.length} logs, ${userExercises.length} user exercises, ${weightProgress.length} weight progress entries, settings`);

      // Step 6: Clear cached user data
      await clearCachedUserData();

      // Step 7: Clear all AsyncStorage (session will be cleared by clearSessionAndState)
      try {
        await AsyncStorage.clear();
        console.log('✅ AsyncStorage cleared');
      } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
        // Continue with sign-out even if clearing fails
      }

      // Step 8: Clear session and state
      await clearSessionAndState();

      return {
        success: true,
        message: 'Signed out successfully. Your data has been backed up.',
      };
    } catch (error) {
      console.error('❌ Error during sign-out:', error);
      return {
        success: false,
        error: error.message || 'An error occurred during sign-out',
      };
    }
  };

  //Set authenticated user
  const setAuthenticatedUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  //Restore nutrition and workout data from database to AsyncStorage
  const restoreDataFromDatabase = async (userId) => {
    try {
      console.log('📥 Starting data restore from database...');
      
      // Load data from database
      const [nutritionResult, workoutResult, weightProgressResult] = await Promise.all([
        loadNutritionFromDatabase(userId),
        loadWorkoutDataFromDatabase(userId),
        loadWeightProgressFromDatabase(userId),
      ]);

      // Restore nutrition data - ALWAYS write, even if empty
      if (nutritionResult.success) {
        await AsyncStorage.setItem(STORAGE_KEYS.nutrition, JSON.stringify(nutritionResult.data || []));
        console.log(`✅ Restored ${nutritionResult.data?.length || 0} nutrition entries to AsyncStorage`);
      }

      // Restore workout data - ALWAYS write, even if empty
      if (workoutResult.success) {
        const dataToStore = [
          [STORAGE_KEYS.workouts, JSON.stringify(workoutResult.data.workouts || [])],
          [STORAGE_KEYS.exercises, JSON.stringify(workoutResult.data.exercises || [])],
          [STORAGE_KEYS.exerciseLogs, JSON.stringify(workoutResult.data.logs || [])],
          [STORAGE_KEYS.userExercises, JSON.stringify(workoutResult.data.userExercises || [])],
        ];

        await AsyncStorage.multiSet(dataToStore);
        console.log(`✅ Restored workout data: ${workoutResult.data.workouts?.length || 0} workouts, ${workoutResult.data.exercises?.length || 0} exercises, ${workoutResult.data.logs?.length || 0} logs, ${workoutResult.data.userExercises?.length || 0} user exercises`);
      }

      // Restore weightProgress - ALWAYS write, even if empty
      if (weightProgressResult.success) {
        await AsyncStorage.setItem(STORAGE_KEYS.weightProgress, JSON.stringify(weightProgressResult.data || []));
        console.log(`✅ Restored ${weightProgressResult.data?.length || 0} weight progress entries to AsyncStorage`);
      }

      return {
        success: true,
        nutritionCount: nutritionResult.data?.length || 0,
        workoutCount: workoutResult.data?.workouts?.length || 0,
      };
    } catch (error) {
      console.error('❌ Error restoring data from database:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  //Check authentication state on app startup
  const checkAuthState = async () => {
    setLoading(true);
    try {
      const sessionData = await getAppleUserSession();
      
      if (!sessionData) {
        // No session = user is NOT signed in
        console.log('No existing Apple user session found');
        resetAuthState();
        return;
      }
      
      // Session exists = user WAS signed in
      // Cache should always exist (we cache on sign-in)
      const cachedUser = await getCachedUserData();
      
      if (cachedUser) {
        // Normal case: use cache (works offline)
        setAuthenticatedUser(cachedUser);
        console.log('✅ Loaded user from cache (data already in AsyncStorage)');
      } else {
        // Edge case: session exists but no cache (shouldn't happen)
        // Clear session and require re-sign-in
        console.log('Session exists but no cache - clearing session');
        await clearAppleUserSession();
        resetAuthState();
      }
    } catch (error) {
      console.log('Error checking auth state:', error);
      resetAuthState();
    } finally {
      setLoading(false);
    }
  };
  
  //Sign in with Apple
  const signInWithApple = async () => {
    // Step 1: Apple Sign-In
    const signInResult = await appleSignIn();
    if (!signInResult.success) return signInResult;

    // Step 2: Extract user data
    const userDataResult = extractUserData(signInResult.credential);
    if (!userDataResult.success) return userDataResult;
    
    const appleUserData = userDataResult.userData;
    if (!appleUserData.appleUserId || !appleUserData.email) {
      return { success: false, error: 'Missing required user data from Apple', code: 'INVALID_USER_DATA' };
    }

    // Step 3: Check network connectivity (required for database operations)
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return { 
        success: false, 
        error: 'No internet connection. Please connect to the internet to sign in.',
        code: 'NO_INTERNET'
      };
    }

    // Step 4: Check if user exists
    const userExistsResult = await checkAppleUserExists(appleUserData.appleUserId);
    if (!userExistsResult.success) return userExistsResult;

    // Step 5: Load or create user data
    let userData;
    if (userExistsResult.exists) {
      // Clear AsyncStorage before restore (ensures clean start)
      try {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.nutrition,
          STORAGE_KEYS.workouts,
          STORAGE_KEYS.exercises,
          STORAGE_KEYS.exerciseLogs,
          STORAGE_KEYS.userExercises,
          STORAGE_KEYS.weightProgress,
        ]);
        console.log('✅ Cleared AsyncStorage before restore');
      } catch (error) {
        console.error('Error clearing AsyncStorage before restore:', error);
      }
      
      const loadResult = await loadAppleUserData(appleUserData.appleUserId);
      if (!loadResult.success) return loadResult;
      userData = { ...appleUserData, userId: appleUserData.appleUserId, ...loadResult.data, provider: 'apple' };
      
      // Restore nutrition/workout data from database to AsyncStorage
      await restoreDataFromDatabase(appleUserData.appleUserId);
      
      // Cache user data for offline access
      await cacheUserData(userData);
    } else {
      const createResult = await createDefaultSettings(appleUserData.appleUserId, appleUserData.email, appleUserData.name);
      if (!createResult.success) return createResult;
      userData = { ...appleUserData, userId: appleUserData.appleUserId, settings: createResult.settings, provider: 'apple' };
      
      // Cache user data for offline access
      await cacheUserData(userData);
    }

    await storeAppleUserSession(userData);
    setAuthenticatedUser(userData);
    
    return {
      success: true,
      user: userData,
      message: userExistsResult.exists ? 'Welcome back!' : 'Welcome! Account created successfully.',
    };
  };

  //Deletes user account
  const deleteAccount = async () => {
    if (!user?.appleUserId) {
      return { success: false, error: 'No user to delete' };
    }

    // Check network connectivity (required for database deletion)
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return { 
        success: false, 
        error: 'No internet connection. Please connect to the internet to delete your account.',
        code: 'NO_INTERNET'
      };
    }

    const deleteResult = await deleteAppleUserData(user.appleUserId);
    if (!deleteResult.success) return deleteResult;

    // Clear cached user data
    await clearCachedUserData();

    // Clear all AsyncStorage (same as signOut)
    try {
      await AsyncStorage.clear();
      console.log('✅ AsyncStorage cleared');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      // Continue with deletion even if clearing fails
    }

    await clearSessionAndState();
    return { success: true, message: 'Account deleted successfully.' };
  };


  //Marks onboarding as completed and saves onboarding data
  const markOnboardingCompleted = async (onboardingData = null) => {
    if (!user?.appleUserId) return { success: false, error: 'No user to update' };
    try {
      const client = generateClient();
            const updateInput = {
        id: user.appleUserId,
        onboardingCompleted: true,
      };
      if (onboardingData) {
        updateInput.birthDate = onboardingData.birthDate;
        updateInput.age = onboardingData.age;
        updateInput.height = onboardingData.height;
        updateInput.bodyWeight = onboardingData.weight;
        updateInput.unit = onboardingData.unit;
        updateInput.activityFactor = onboardingData.activityFactor;
        updateInput.goalType = onboardingData.goalType;
        updateInput.goalWeight = onboardingData.goalWeight;
        updateInput.goalPace = onboardingData.goalPace;
        
        if (onboardingData.calculatedMacros) {
          updateInput.calorieGoal = onboardingData.calculatedMacros.calories;
          updateInput.proteinGoal = onboardingData.calculatedMacros.protein;
          updateInput.carbsGoal = onboardingData.calculatedMacros.carbs;
          updateInput.fatsGoal = onboardingData.calculatedMacros.fats;
        }
      }
      
      await client.graphql({
        query: updateSettings,
        variables: { input: updateInput }
      });
      
      // Update user state with new settings
      const updatedSettings = { ...user.settings, ...updateInput };
      const updatedUser = { ...user, settings: updatedSettings };
      
      await storeAppleUserSession(updatedUser);
      setUser(updatedUser);
      
      // Cache updated user data for offline access
      await cacheUserData(updatedUser);
      
      return { success: true, message: 'Onboarding completed!' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Check authentication state on app startup
  useEffect(() => {
    checkAuthState();
  }, []);

  
  const value = {
    user,
    loading,
    isAuthenticated,
    signInWithApple,
    signOut,
    clearSessionAndState,
    deleteAccount,
    markOnboardingCompleted,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  return useContext(AuthContext);
}

// Keep the old export for backward compatibility
export function useAuthContext() {
  return useContext(AuthContext);
} 