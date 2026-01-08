import Constants from 'expo-constants';
import { getValidToken, clearToken, getNewToken, storeToken } from './tokenManager';

const API_GATEWAY_URL = Constants.expoConfig?.extra?.API_GATEWAY_URL || 
                        'https://um1z6mkple.execute-api.us-east-1.amazonaws.com/prod-v2';

/**
 * Make authenticated API request with automatic token handling
 */
export async function makeAuthenticatedRequest(endpoint, options = {}) {
    const { userId, authToken, ...fetchOptions } = options;
    
    // Get valid token (checks expiration, refreshes if needed)
    let token;
    try {
        token = await getValidToken(userId, authToken);
    } catch (error) {
        console.error('Failed to get token:', error);
        throw new Error('Authentication failed. Please sign in again.');
    }
    
    // Make request with token
    const response = await fetch(`${API_GATEWAY_URL}${endpoint}`, {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...fetchOptions.headers,
        },
    });
    
    // Handle 401 (token expired/invalid)
    if (response.status === 401) {
        console.log('Token invalid, clearing and requesting new one...');
        await clearToken();
        
        // Try once more with new token
        if (userId && authToken) {
            try {
                const newToken = await getNewToken(userId, authToken);
                await storeToken(newToken);
                
                // Retry request
                return fetch(`${API_GATEWAY_URL}${endpoint}`, {
                    ...fetchOptions,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newToken}`,
                        ...fetchOptions.headers,
                    },
                });
            } catch (error) {
                throw new Error('Authentication failed. Please sign in again.');
            }
        } else {
            throw new Error('Authentication required. Please sign in again.');
        }
    }
    
    return response;
}

