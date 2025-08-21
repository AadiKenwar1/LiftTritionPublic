import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Amplify } from 'aws-amplify';
import { API } from 'aws-amplify/api'; // Explicitly import API for Amplify v6+
import Constants from 'expo-constants';

// Get environment variables with fallback to hardcoded values
const userPoolId = process.env.COGNITO_USER_POOL_ID|| 
Constants.expoConfig?.extra?.COGNITO_USER_POOL_ID 

const userPoolClientId = process.env.COGNITO_USER_POOL_CLIENT_ID || 
                         Constants.expoConfig?.extra?.COGNITO_USER_POOL_CLIENT_ID

// Debug logging
console.log('🔍 AuthContext: Environment Variables Check:', {
  COGNITO_USER_POOL_ID: userPoolId,
  COGNITO_USER_POOL_CLIENT_ID: userPoolClientId,
  processEnv: process.env.COGNITO_USER_POOL_ID,
  constantsExtra: Constants.expoConfig?.extra?.COGNITO_USER_POOL_ID,
  hasUserPoolId: !!userPoolId,
  hasClientId: !!userPoolClientId,
});

// Check if we have the required values
if (!userPoolId || !userPoolClientId) {
  console.error('❌ AuthContext: Cognito configuration values are missing!');
  console.error('Please set COGNITO_USER_POOL_ID and COGNITO_USER_POOL_CLIENT_ID');
  console.error('Current values:', { userPoolId, userPoolClientId });
} else {
  console.log('✅ AuthContext: Cognito configuration values found');
}

// AWS Amplify v6 Configuration - Updated format with AppSync
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId,
      signUpVerificationMethod: 'code',
      loginWith: {
        email: false,
        phone: false,
        username: false,
      },
      // Enable federated sign-in
      allowFederatedSignIn: true,
    },
  },
  API: {
    GraphQL: {
      endpoint: process.env.GRAPHQL_ENDPOINT || 
                Constants.expoConfig?.extra?.GRAPHQL_ENDPOINT ,
      region: 'us-east-1',
      defaultAuthMode: 'apiKey',
      apiKey: process.env.GRAPHQL_API_KEY || 
              Constants.expoConfig?.extra?.GRAPHQL_API_KEY ,
    },
  },
  // Disable network monitoring to avoid netinfo issues
  Analytics: {
    disabled: true,
  },
  // Add region explicitly
  region: 'us-east-1',
};

console.log('🔧 AuthContext: Amplify Config:', JSON.stringify(amplifyConfig, null, 2));

// Configure Amplify
try {
  Amplify.configure(amplifyConfig);
  console.log('✅ AuthContext: Amplify configured successfully');
} catch (error) {
  console.error('❌ AuthContext: Error configuring Amplify:', error);
}

export default Amplify;
export { amplifyConfig };
