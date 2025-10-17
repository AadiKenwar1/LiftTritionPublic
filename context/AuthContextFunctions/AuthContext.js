import React, { createContext, useContext, useState, useEffect } from 'react';

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
        setAuthenticatedUser({
          appleUserId: sessionData.appleUserId,
          email: sessionData.email,
          name: sessionData.name,
          provider: 'apple',
        });
        console.log('✅ Existing Apple user session restored');
      } else {
        console.log('No existing Apple user session found');
      }
    } catch (error) {
      console.log('Error checking auth state:', error);
    } finally {
      resetAuthState();
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuthContext() {
  return useContext(AuthContext);
} 