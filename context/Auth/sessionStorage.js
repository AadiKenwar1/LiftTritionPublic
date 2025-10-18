import AsyncStorage from '@react-native-async-storage/async-storage';


const APPLE_USER_SESSION_KEY = 'apple_user_session';

//Store user session in local storage, used for session restoration
export const storeAppleUserSession = async (userData) => {
  try {
    const sessionData = {
      appleUserId: userData.appleUserId,
      email: userData.email,
      name: userData.name,
      isAuthenticated: true,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(APPLE_USER_SESSION_KEY, JSON.stringify(sessionData));
    console.log('✅ Apple user session stored successfully');
    return true;
  } catch (error) {
    console.error('❌ Error storing Apple user session:', error);
    return false;
  }
}

//If user has a session, retrieves user session from local storage. If not returns null
export const getAppleUserSession = async () => {
  try {
    const sessionData = await AsyncStorage.getItem(APPLE_USER_SESSION_KEY);
    if (!sessionData) {
      return null;
    }
    
    const parsedSession = JSON.parse(sessionData);
    return parsedSession;
  } catch (error) {
    console.error('❌ Error retrieving Apple user session:', error);
    return null;
  }
};

//Clears user session from local storage, used for signing out.
export const clearAppleUserSession = async () => {
  try {
    await AsyncStorage.removeItem(APPLE_USER_SESSION_KEY);
    console.log('✅ Apple user session cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing Apple user session:', error);
    return false;
  }
};

