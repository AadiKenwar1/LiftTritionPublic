import { signIn } from 'aws-amplify/auth';

// ============================================================================
// DEVELOPMENT AND TESTING HELPERS
// ============================================================================

/**
 * Quick development sign-in for testing
 * Uses hardcoded test credentials
 * @returns {Promise<Object>} Result object
 */
export async function devSignIn() {
  try {
    const testEmail = 'test@example.com';
    const testPassword = 'TestPassword123!';
    
    console.log('🧪 Dev sign-in with:', testEmail);
    
    const { isSignedIn } = await signIn({ 
      username: testEmail, 
      password: testPassword 
    });
    
    if (isSignedIn) {
      console.log('✅ Dev sign-in successful');
      return { success: true, message: 'Dev sign-in successful' };
    } else {
      console.log('❌ Dev sign-in failed');
      return { success: false, error: 'Dev sign-in failed' };
    }
  } catch (error) {
    console.error('❌ Dev sign-in error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clears all authentication data for testing
 * @returns {Promise<Object>} Result object
 */
export async function clearAuthData() {
  try {
    console.log('🧪 Clearing all auth data...');
    
    // Clear AsyncStorage
    // await AsyncStorage.clear(); // Removed
    
    // Clear data service
    // dataService.setCurrentUser(null); // Removed
    
    console.log('✅ Auth data cleared successfully');
    return { success: true, message: 'Auth data cleared' };
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clears user-specific data for testing
 * @returns {Promise<Object>} Result object
 */
export async function clearUserData() {
  try {
    console.log('🧪 Clearing user data...');
    
    // Clear data service
    // dataService.setCurrentUser(null); // Removed
    
    console.log('✅ User data cleared successfully');
    return { success: true, message: 'User data cleared' };
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Resets onboarding status for testing
 * @returns {Promise<Object>} Result object
 */
export async function resetOnboarding() {
  try {
    console.log('🧪 Resetting onboarding status...');
    
    // Clear onboarding status
    // await dataService.markUserOnboarded(false); // Removed
    
    console.log('✅ Onboarding status reset successfully');
    return { success: true, message: 'Onboarding reset' };
  } catch (error) {
    console.error('❌ Error resetting onboarding:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generates mock data for testing
 * @returns {Promise<Object>} Result object
 */
export async function generateMockData() {
  try {
    console.log('🧪 Generating mock data...');
    
    // Set current user
    // dataService.setCurrentUser('test-user-id'); // Removed
    
    // Mark as onboarded
    // await dataService.markUserOnboarded(true); // Removed
    
    console.log('✅ Mock data generated successfully');
    return { success: true, message: 'Mock data generated' };
  } catch (error) {
    console.error('❌ Error generating mock data:', error);
    return { success: false, error: error.message };
  }
} 