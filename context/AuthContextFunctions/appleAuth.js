import * as AppleAuthentication from 'expo-apple-authentication';

/**
 * Initiates Apple Sign-In flow
 * @returns {Object} Apple credential object with user data
 */
export const signInWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    
    return {
      success: true,
      credential,
    };
  } catch (error) {
    console.error('Apple Sign-In error:', error);
    return {
      success: false,
      error: error.message || 'Apple Sign-In failed',
      code: error.code || 'UNKNOWN_ERROR',
    };
  }
};

//Extracts user data from Apple credential
export const extractUserData = (credential) => {
  try {
    // Decode JWT token to get reliable email
    const identityToken = credential.identityToken;
    const parts = identityToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    
    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload);
    const userData = JSON.parse(decodedPayload);
    
    // Get name from credential (may be null on subsequent sign-ins)
    const fullName = credential.fullName;
    const name = fullName ? 
      `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : 
      null;
    
    return {
      success: true,
      userData: {
        appleUserId: credential.user,
        email: userData.email, // Reliable email from JWT
        name: name,
        emailVerified: userData.email_verified,
        isPrivateEmail: userData.is_private_email,
        authorizationCode: credential.authorizationCode,
        realUserStatus: credential.realUserStatus,
      },
    };
  } catch (error) {
    console.error('Error extracting user data:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
