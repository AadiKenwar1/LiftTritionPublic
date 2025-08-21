import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import './amplifyConfig'; // Import Amplify configuration
import { Hub } from 'aws-amplify/utils';

// Import authentication functions
import { signin as signinAuth, signup as signupAuth, confirmSignup as confirmSignupAuth, resendConfirmationCode as resendConfirmationCodeAuth } from './standardAuth';
import { logoutCognito, resetPassword, confirmPasswordReset, updatePassword, deleteAccount } from './userManagement';

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AuthContext = createContext();

// ============================================================================
// AUTH PROVIDER
// ============================================================================

export function AuthProvider({ children }) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ========================================================================
  // SESSION MANAGEMENT
  // ========================================================================
  
  /**
   * Checks for existing user session on app startup
   * Sets up user data and authentication state
   */
  const checkAuthState = async () => {
    setLoading(true);
    try {
      console.log('[DEBUG] checkAuthState called');
      const currentUser = await getCurrentUser();
      console.log('[DEBUG] getCurrentUser result:', currentUser);
      if (currentUser) {
        const normalizedUser = {
          ...currentUser,
          userId: currentUser.userId || currentUser.sub || currentUser.username,
          email: currentUser.signInDetails?.loginId || currentUser.username || currentUser.email
        };
        console.log('[DEBUG] Normalized user:', normalizedUser);
        setUser(normalizedUser);
        setIsAuthenticated(true);
        console.log('[DEBUG] setUser called with:', normalizedUser);
      } else {
        console.log('[DEBUG] No current user found, setting user to null');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('[DEBUG] getCurrentUser error:', error, 'Stack:', new Error().stack);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      console.log('[DEBUG] checkAuthState finished, loading set to false');
    }
  };

  // ========================================================================
  // AUTHENTICATION METHODS
  // ========================================================================
  
  /**
   * Signs in user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} Result object with success status and user data or error
   */
  const signin = async (email, password) => {
    try {
      const result = await signinAuth(email, password);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } catch (error) {
      console.error('❌ AuthContext: Signin error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Creates new user account
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} Result object with success status and message or error
   */
  const signup = async (email, password) => {
    try {
      return await signupAuth(email, password);
    } catch (error) {
      console.error('❌ AuthContext: Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Confirms user signup with verification code
   * @param {string} email - User's email address
   * @param {string} code - Verification code from email
   * @returns {Object} Result object with success status and message or error
   */
  const confirmSignup = async (email, code) => {
    try {
      return await confirmSignupAuth(email, code);
    } catch (error) {
      console.error('❌ AuthContext: Confirm signup error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Resends confirmation code to user's email
   * @param {string} email - User's email address
   * @returns {Object} Result object with success status and message or error
   */
  const resendConfirmationCode = async (email) => {
    try {
      return await resendConfirmationCodeAuth(email);
    } catch (error) {
      console.error('❌ AuthContext: Resend confirmation code error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Signs out user and clears all data
   */
  const logout = async () => {
    try {
      await logoutCognito();
      console.log('[DEBUG] setUser(null) called from logout! Stack:', new Error().stack);
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ AuthContext: User logged out successfully');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
    }
  };

  // ========================================================================
  // USER MANAGEMENT METHODS
  // ========================================================================
  
  /**
   * Initiates password reset process
   * @param {string} email - User's email address
   * @returns {Object} Result object with success status and message or error
   */
  const resetPasswordRequest = async (email) => {
    try {
      return await resetPassword(email);
    } catch (error) {
      console.error('❌ AuthContext: Reset password error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Confirms password reset with verification code
   * @param {string} email - User's email address
   * @param {string} code - Verification code from email
   * @param {string} newPassword - New password
   * @returns {Object} Result object with success status and message or error
   */
  const confirmPasswordResetRequest = async (email, code, newPassword) => {
    try {
      return await confirmPasswordReset(email, code, newPassword);
    } catch (error) {
      console.error('❌ AuthContext: Confirm password reset error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Updates user's password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Result object with success status and message or error
   */
  const updatePasswordRequest = async (oldPassword, newPassword) => {
    try {
      return await updatePassword(oldPassword, newPassword);
    } catch (error) {
      console.error('❌ AuthContext: Update password error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Deletes the current user's account
   * This will permanently delete the user from Cognito and clear local state
   * @returns {Object} Result object with success status and message or error
   */
  const deleteAccountRequest = async () => {
    try {
      const result = await deleteAccount();
      if (result.success) {
        // Clear local state after successful account deletion
        console.log('[DEBUG] setUser(null) called from deleteAccount! Stack:', new Error().stack);
        setUser(null);
        setIsAuthenticated(false);
        console.log('✅ AuthContext: User account deleted and local state cleared');
      }
      return result;
    } catch (error) {
      console.error('❌ AuthContext: Delete account error:', error);
      return { success: false, error: error.message };
    }
  };

  // ========================================================================
  // EFFECTS
  // ========================================================================
  
  // Check authentication state on app startup
  useEffect(() => {
    // Listen for Amplify Auth events
    const listener = (data) => {
      const { event } = data.payload;
      console.log('[HUB DEBUG] Received auth event:', event, 'payload:', data.payload);
      if (event === 'signIn' || event === 'signedIn' || event === 'tokenRefresh') {
        console.log('[HUB DEBUG] Auth event:', event, '- calling checkAuthState');
        checkAuthState();
      } else if (event === 'signOut') {
        console.log('[HUB DEBUG] Auth event: signOut - clearing user');
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    Hub.listen('auth', listener);
    // On mount, check for existing session (app reload)
    checkAuthState();
    return () => Hub.remove('auth', listener);
  }, []);

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================
  
  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Authentication methods
    signin,
    signup,
    confirmSignup,
    resendConfirmationCode,
    logout,
    
    // User management methods
    resetPassword: resetPasswordRequest,
    confirmPasswordReset: confirmPasswordResetRequest,
    updatePassword: updatePasswordRequest,
    deleteAccount: deleteAccountRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to access authentication context
 * @returns {Object} Authentication context with state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 