/**
 * Authentication Context Exports
 * 
 * This module provides centralized access to all authentication-related
 * functionality including the main context, hooks, and utility functions.
 */

// Main authentication context and hook
export { AuthProvider, useAuth } from './AuthContext';

// Authentication functions (for direct use if needed)
export { 
  signin, 
  signup, 
  confirmSignup, 
  resendConfirmationCode 
} from './standardAuth';

// User management functions (for direct use if needed)
export { 
  logoutCognito, 
  resetPassword, 
  confirmPasswordReset, 
  updatePassword,
  deleteAccount 
} from './userManagement';

// Development and testing helpers
export { 
  devSignIn, 
  clearAuthData, 
  clearUserData, 
  resetOnboarding, 
  generateMockData 
} from './testAuth'; 