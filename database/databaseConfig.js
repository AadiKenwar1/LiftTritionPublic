// Database Configuration - Only for data operations
// Authentication configuration is now in context/AuthContext/amplifyConfig.js

import Constants from 'expo-constants';

// Database-specific configuration
export const DATABASE_CONFIG = {
  // AppSync API Configuration (for data operations only)
  APPSYNC: {
    endpoint: process.env.APPSYNC_ENDPOINT || 
              Constants.expoConfig?.extra?.APPSYNC_ENDPOINT, 
    region: 'us-east-1',
    apiKey: process.env.APPSYNC_API_KEY || 
            Constants.expoConfig?.extra?.APPSYNC_API_KEY
  },
  
  // Storage configuration
  STORAGE: {
    // Local storage keys
    KEYS: {
      WORKOUTS: 'workouts',
      EXERCISES: 'exercises', 
      PROGRESS: 'progress',
      SETTINGS: 'settings',
      USER_PROFILE: 'user_profile',
      USER_STATE: 'user_state',
    },
    
    // Migration settings
    MIGRATION: {
      BATCH_SIZE: 50,
      RETRY_ATTEMPTS: 3,
      TIMEOUT: 30000,
    }
  },
  
  // Development settings
  DEVELOPMENT: {
    ENABLE_DEBUG_LOGS: true,
    MOCK_USER_ID_PREFIX: 'mock_',
  }
};

// Helper functions for database operations
export const getDatabaseEndpoint = () => DATABASE_CONFIG.APPSYNC.endpoint;
export const getDatabaseRegion = () => DATABASE_CONFIG.APPSYNC.region;
export const getDatabaseApiKey = () => DATABASE_CONFIG.APPSYNC.apiKey;

// Export for use in database services
export default DATABASE_CONFIG;
