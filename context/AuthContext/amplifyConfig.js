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

// Get GraphQL configuration
const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT || 
                       Constants.expoConfig?.extra?.GRAPHQL_ENDPOINT

const graphqlApiKey = process.env.GRAPHQL_API_KEY || 
                     Constants.expoConfig?.extra?.GRAPHQL_API_KEY

// Comprehensive debug logging
console.log('🔍 AuthContext: Environment Variables Check:', {
  // Cognito
  COGNITO_USER_POOL_ID: userPoolId,
  COGNITO_USER_POOL_CLIENT_ID: userPoolClientId,
  
  // GraphQL
  GRAPHQL_ENDPOINT: graphqlEndpoint,
  GRAPHQL_API_KEY: graphqlApiKey ? `${graphqlApiKey.substring(0, 10)}...` : 'undefined',
  
  // Process env
  processEnv: {
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
    GRAPHQL_API_KEY: process.env.GRAPHQL_API_KEY ? `${process.env.GRAPHQL_API_KEY.substring(0, 10)}...` : 'undefined',
  },
  
  // Constants extra
  constantsExtra: {
    COGNITO_USER_POOL_ID: Constants.expoConfig?.extra?.COGNITO_USER_POOL_ID,
    GRAPHQL_ENDPOINT: Constants.expoConfig?.extra?.GRAPHQL_ENDPOINT,
    GRAPHQL_API_KEY: Constants.expoConfig?.extra?.GRAPHQL_API_KEY ? `${Constants.expoConfig?.extra?.GRAPHQL_API_KEY.substring(0, 10)}...` : 'undefined',
  },
  
  // Validation
  hasUserPoolId: !!userPoolId,
  hasClientId: !!userPoolClientId,
  hasGraphqlEndpoint: !!graphqlEndpoint,
  hasGraphqlApiKey: !!graphqlApiKey,
});

// Check if we have the required values
if (!userPoolId || !userPoolClientId) {
  console.error('❌ AuthContext: Cognito configuration values are missing!');
  console.error('Please set COGNITO_USER_POOL_ID and COGNITO_USER_POOL_CLIENT_ID');
  console.error('Current values:', { userPoolId, userPoolClientId });
} else {
  console.log('✅ AuthContext: Cognito configuration values found');
}

if (!graphqlEndpoint || !graphqlApiKey) {
  console.error('❌ AuthContext: GraphQL configuration values are missing!');
  console.error('Please set GRAPHQL_ENDPOINT and GRAPHQL_API_KEY');
  console.error('Current values:', { 
    graphqlEndpoint, 
    graphqlApiKey: graphqlApiKey ? `${graphqlApiKey.substring(0, 10)}...` : 'undefined' 
  });
} else {
  console.log('✅ AuthContext: GraphQL configuration values found');
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
      endpoint: graphqlEndpoint,
      region: 'us-east-1',
      defaultAuthMode: 'apiKey',
      apiKey: graphqlApiKey,
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
