import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContextFunctions';

export default function AppleSignInButton({ onSuccess, onError, style, textStyle }) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithApple } = useAuth();

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    
    try {
      // Check if Apple Sign In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert(
          'Apple Sign In Not Available',
          'Apple Sign In is not available on this device. Please use a different sign-in method.'
        );
        return;
      }

      // Perform Apple Sign In
      const result = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (result.identityToken) {
        // Store the Apple credentials securely
        await SecureStore.setItemAsync('appleAuthToken', result.identityToken);
        await SecureStore.setItemAsync('appleUserId', result.user);
        
        // Store user info if available
        if (result.fullName) {
          const fullName = `${result.fullName.givenName || ''} ${result.fullName.familyName || ''}`.trim();
          await SecureStore.setItemAsync('appleFullName', fullName);
        }
        
        if (result.email) {
          await SecureStore.setItemAsync('appleEmail', result.email);
        }

        // Call the auth context method
        const authResult = await signInWithApple(result);
        
        if (authResult.success) {
          onSuccess?.(authResult.user);
        } else {
          onError?.(authResult.error);
        }
      } else {
        throw new Error('No identity token received from Apple');
      }
    } catch (error) {
      console.error('Apple Sign In Error:', error);
      
      if (error.code === 'ERR_CANCELED') {
        // User canceled the sign-in process
        console.log('Apple Sign In canceled by user');
      } else {
        onError?.(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render on Android or if Apple Sign In is not available
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={20}
        style={styles.appleButton}
        onPress={handleAppleSignIn}
        disabled={isLoading}
      />
      {isLoading && (
        <Text style={[styles.loadingText, textStyle]}>
          Signing in with Apple...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButton: {
    width: 280,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
});
