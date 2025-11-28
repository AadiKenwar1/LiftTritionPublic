import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateClient } from '@aws-amplify/api';
import { updateSettings } from '../../graphql/mutations';

// Import Amplify configuration first
import './amplifyConfig';

// Import for internal use
import { signInWithApple as appleSignIn, extractUserData } from './appleAuth';
import { checkAppleUserExists, createDefaultSettings, loadAppleUserData, deleteAppleUserData } from './databaseQueries';
import { storeAppleUserSession, getAppleUserSession, clearAppleUserSession } from './sessionStorage';



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

  //Set authenticated user
  const setAuthenticatedUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  //Check authentication state on app startup
  const checkAuthState = async () => {
    setLoading(true);
    try {
      const sessionData = await getAppleUserSession();
      if (sessionData) {
        // Load fresh user data from database
        const loadResult = await loadAppleUserData(sessionData.appleUserId);
        if (loadResult.success) {
          const userData = {
            appleUserId: sessionData.appleUserId,
            email: sessionData.email,
            name: sessionData.name,
            provider: 'apple',
            userId: sessionData.appleUserId,
            ...loadResult.data,
          };
          setAuthenticatedUser(userData);
          console.log('✅ Existing Apple user session restored with fresh data');
        } else {
          console.log('Failed to load user data, clearing session');
          await clearAppleUserSession();
          resetAuthState();
        }
      } else {
        console.log('No existing Apple user session found');
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

    // Step 3: Check if user exists
    const userExistsResult = await checkAppleUserExists(appleUserData.appleUserId);
    if (!userExistsResult.success) return userExistsResult;

    // Step 4: Load or create user data
    let userData;
    if (userExistsResult.exists) {
      const loadResult = await loadAppleUserData(appleUserData.appleUserId);
      if (!loadResult.success) return loadResult;
      userData = { ...appleUserData, userId: appleUserData.appleUserId, ...loadResult.data, provider: 'apple' };
    } else {
      const createResult = await createDefaultSettings(appleUserData.appleUserId, appleUserData.email, appleUserData.name);
      if (!createResult.success) return createResult;
      userData = { ...appleUserData, userId: appleUserData.appleUserId, settings: createResult.settings, provider: 'apple' };
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

    const deleteResult = await deleteAppleUserData(user.appleUserId);
    if (!deleteResult.success) return deleteResult;

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