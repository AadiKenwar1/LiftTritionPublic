import { signIn, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Signs in user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} Result object with success status and user data or error
 */
export async function signin(email, password) {
  try {
    const { isSignedIn, nextStep } = await signIn({ username: email, password });
    
    if (isSignedIn) {
      return { 
        success: true, 
        message: 'Sign in successful'
      };
    } else {
      return { 
        success: false, 
        error: 'Sign in failed' 
      };
    }
  } catch (error) {
    return handleSigninError(error);
  }
}

/**
 * Creates new user account
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} Result object with success status and message or error
 */
export async function signup(email, password) {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });

    if (isSignUpComplete) {
      return { 
        success: true, 
        message: 'Account created successfully. Please check your email for verification code.' 
      };
    } else {
      return { 
        success: true, 
        message: 'Account created. Please check your email for verification code.' 
      };
    }
  } catch (error) {
    return handleSignupError(error);
  }
}

/**
 * Confirms user signup with verification code
 * @param {string} email - User's email address
 * @param {string} code - Verification code from email
 * @returns {Object} Result object with success status and message or error
 */
export async function confirmSignup(email, code) {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    if (isSignUpComplete) {
      return { 
        success: true, 
        message: 'Email confirmed successfully. You can now sign in.' 
      };
    } else {
      return { 
        success: false, 
        error: 'Email confirmation failed' 
      };
    }
  } catch (error) {
    return handleSignupError(error);
  }
}

/**
 * Resends confirmation code to user's email
 * @param {string} email - User's email address
 * @returns {Object} Result object with success status and message or error
 */
export async function resendConfirmationCode(email) {
  try {
    await resendSignUpCode({ username: email });
    return { 
      success: true, 
      message: 'Confirmation code resent to your email.' 
    };
  } catch (error) {
    return handleSignupError(error);
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handles signin errors and returns user-friendly messages
 * @param {Error} error - The error object
 * @returns {Object} Result object with error message
 */
function handleSigninError(error) {
  switch (error.name) {
    case 'UserNotFoundException':
      return { success: false, error: 'No account found with this email address. Please sign up first.' };
    case 'NotAuthorizedException':
      return { success: false, error: 'Incorrect email or password. Please try again.' };
    case 'UserNotConfirmedException':
      return { success: false, error: 'Please confirm your email address before signing in.' };
    case 'TooManyRequestsException':
      return { success: false, error: 'Too many failed attempts. Please try again later.' };
    case 'LimitExceededException':
      return { success: false, error: 'Too many requests. Please try again later.' };
    default:
      return { success: false, error: error.message || 'An unknown error occurred during signin' };
  }
}

/**
 * Handles signup errors and returns user-friendly messages
 * @param {Error} error - The error object
 * @returns {Object} Result object with error message
 */
function handleSignupError(error) {
  switch (error.name) {
    case 'UsernameExistsException':
      return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
    case 'InvalidPasswordException':
      return { success: false, error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and special characters.' };
    case 'InvalidParameterException':
      return { success: false, error: 'Please provide a valid email address.' };
    case 'TooManyRequestsException':
      return { success: false, error: 'Too many requests. Please try again later.' };
    case 'LimitExceededException':
      return { success: false, error: 'Too many requests. Please try again later.' };
    default:
      return { success: false, error: error.message || 'An unknown error occurred during signup' };
  }
} 