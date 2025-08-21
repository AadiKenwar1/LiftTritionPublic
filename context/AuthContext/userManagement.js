import { signOut, resetPassword as resetPasswordAmplify, confirmResetPassword, updatePassword as updatePasswordAmplify, deleteUser } from 'aws-amplify/auth';

// ============================================================================
// USER MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Signs out user from AWS Cognito
 * @returns {Promise<void>}
 */
export async function logoutCognito() {
  try {
    await signOut();
    console.log('✅ User signed out from Cognito');
  } catch (error) {
    console.error('❌ Error signing out from Cognito:', error);
    throw error;
  }
}

/**
 * Initiates password reset process
 * @param {string} email - User's email address
 * @returns {Object} Result object with success status and message or error
 */
export async function resetPassword(email) {
  try {
    await resetPasswordAmplify({ username: email });
    return { 
      success: true, 
      message: 'Password reset code sent to your email.' 
    };
  } catch (error) {
    return handlePasswordResetError(error);
  }
}

/**
 * Confirms password reset with verification code
 * @param {string} email - User's email address
 * @param {string} code - Verification code from email
 * @param {string} newPassword - New password
 * @returns {Object} Result object with success status and message or error
 */
export async function confirmPasswordReset(email, code, newPassword) {
  try {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
    return { 
      success: true, 
      message: 'Password reset successfully. You can now sign in with your new password.' 
    };
  } catch (error) {
    return handlePasswordResetError(error);
  }
}

/**
 * Updates user's password
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} Result object with success status and message or error
 */
export async function updatePassword(oldPassword, newPassword) {
  try {
    await updatePasswordAmplify({
      oldPassword,
      newPassword,
    });
    return { 
      success: true, 
      message: 'Password updated successfully.' 
    };
  } catch (error) {
    return handlePasswordUpdateError(error);
  }
}

/**
 * Deletes the current user's account from AWS Cognito
 * @returns {Object} Result object with success status and message or error
 */
export async function deleteAccount() {
  try {
    await deleteUser();
    return { 
      success: true, 
      message: 'Account deleted successfully.' 
    };
  } catch (error) {
    return handleDeleteAccountError(error);
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handles password reset errors and returns user-friendly messages
 * @param {Error} error - The error object
 * @returns {Object} Result object with error message
 */
function handlePasswordResetError(error) {
  switch (error.name) {
    case 'UserNotFoundException':
      return { success: false, error: 'No account found with this email address.' };
    case 'InvalidParameterException':
      return { success: false, error: 'Please provide a valid email address.' };
    case 'TooManyRequestsException':
      return { success: false, error: 'Too many requests. Please try again later.' };
    case 'LimitExceededException':
      return { success: false, error: 'Too many requests. Please try again later.' };
    case 'CodeMismatchException':
      return { success: false, error: 'Invalid verification code. Please check your email and try again.' };
    case 'ExpiredCodeException':
      return { success: false, error: 'Verification code has expired. Please request a new one.' };
    default:
      return { success: false, error: error.message || 'An unknown error occurred during password reset' };
  }
}

/**
 * Handles password update errors and returns user-friendly messages
 * @param {Error} error - The error object
 * @returns {Object} Result object with error message
 */
function handlePasswordUpdateError(error) {
  switch (error.name) {
    case 'NotAuthorizedException':
      return { success: false, error: 'Current password is incorrect.' };
    case 'InvalidPasswordException':
      return { success: false, error: 'New password must be at least 8 characters long and contain uppercase, lowercase, and special characters.' };
    case 'LimitExceededException':
      return { success: false, error: 'Too many requests. Please try again later.' };
    default:
      return { success: false, error: error.message || 'An unknown error occurred while updating password' };
  }
}

/**
 * Handles delete account errors and returns user-friendly messages
 * @param {Error} error - The error object
 * @returns {Object} Result object with error message
 */
function handleDeleteAccountError(error) {
  switch (error.name) {
    case 'NotAuthorizedException':
      return { success: false, error: 'You must be signed in to delete your account.' };
    case 'TooManyRequestsException':
      return { success: false, error: 'Too many requests. Please try again later.' };
    case 'LimitExceededException':
      return { success: false, error: 'Too many requests. Please try again later.' };
    case 'UserNotFoundException':
      return { success: false, error: 'User account not found.' };
    default:
      return { success: false, error: error.message || 'An unknown error occurred while deleting account' };
  }
} 