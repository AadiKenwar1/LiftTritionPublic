import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'sessionToken';
const APPLE_IDENTITY_TOKEN_KEY = 'appleIdentityToken';
const API_GATEWAY_URL = Constants.expoConfig?.extra?.API_GATEWAY_URL || 
                        'https://um1z6mkple.execute-api.us-east-1.amazonaws.com/prod-v2';

/**
 * Get JWT token from secure storage
 */
export async function getStoredToken() {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('Error getting stored token:', error);
        return null;
    }
}

/**
 * Store JWT token securely
 */
export async function storeToken(token) {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        return true;
    } catch (error) {
        console.error('Error storing token:', error);
        return false;
    }
}

/**
 * Clear stored token and Apple identity token
 */
export async function clearToken() {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(APPLE_IDENTITY_TOKEN_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing token:', error);
        return false;
    }
}

/**
 * Store Apple identity token securely (for JWT refresh)
 */
export async function storeAppleIdentityToken(identityToken) {
    try {
        await SecureStore.setItemAsync(APPLE_IDENTITY_TOKEN_KEY, identityToken);
        return true;
    } catch (error) {
        console.error('Error storing Apple identity token:', error);
        return false;
    }
}

/**
 * Get stored Apple identity token
 */
export async function getStoredAppleIdentityToken() {
    try {
        return await SecureStore.getItemAsync(APPLE_IDENTITY_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting stored Apple identity token:', error);
        return null;
    }
}

/**
 * Clear Apple identity token
 */
export async function clearAppleIdentityToken() {
    try {
        await SecureStore.deleteItemAsync(APPLE_IDENTITY_TOKEN_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing Apple identity token:', error);
        return false;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true; // If can't decode, consider expired
    }
}

/**
 * Get new JWT token from token-generator
 */
export async function getNewToken(userId, authToken) {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/token-generator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                authToken: authToken
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unable to read error');
            console.error(`Token generation failed: ${response.status} - ${errorText.substring(0, 200)}`);
            throw new Error(`Token generation failed: ${response.status}`);
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error getting new token:', error);
        throw error;
    }
}

/**
 * Get valid token - checks expiration and refreshes if needed
 * Automatically uses stored Apple identityToken if authToken is not provided
 */
export async function getValidToken(userId, authToken) {
    let token = await getStoredToken();
    
    // If no token or expired, try to get new one
    if (!token || isTokenExpired(token)) {
        // If authToken not provided, try stored Apple identityToken
        const tokenToUse = authToken || await getStoredAppleIdentityToken();
        
        if (tokenToUse && userId) {
            try {
                token = await getNewToken(userId, tokenToUse);
                await storeToken(token);
            } catch (error) {
                console.error('Failed to refresh token:', error);
                // If refresh fails and we used stored identityToken, it might be expired too
                if (!authToken) {
                    await clearAppleIdentityToken();
                }
                throw new Error('Token expired. Please sign in again.');
            }
        } else {
            // No authToken or stored identityToken available
            console.error(`No token available for refresh - userId: ${userId ? 'exists' : 'missing'}, tokenToUse: ${tokenToUse ? 'exists' : 'missing'}`);
            throw new Error('Token expired. Please sign in again.');
        }
    }
    
    return token;
}

