import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Amplify } from 'aws-amplify';
import Constants from 'expo-constants';

// Get GraphQL configuration
const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT || 
                       Constants.expoConfig?.extra?.GRAPHQL_ENDPOINT

const graphqlApiKey = process.env.GRAPHQL_API_KEY || 
                     Constants.expoConfig?.extra?.GRAPHQL_API_KEY

// Debug logging for GraphQL configuration
console.log('🔍 Database Config: Environment Variables Check:', {
  // GraphQL
  GRAPHQL_ENDPOINT: graphqlEndpoint,
  GRAPHQL_API_KEY: graphqlApiKey ? `${graphqlApiKey.substring(0, 10)}...` : 'undefined',
  
  // Validation
  hasGraphqlEndpoint: !!graphqlEndpoint,
  hasGraphqlApiKey: !!graphqlApiKey,
});

// Check if we have the required GraphQL values
if (!graphqlEndpoint || !graphqlApiKey) {
  console.error('❌ Database Config: GraphQL configuration values are missing!');
  console.error('Please set GRAPHQL_ENDPOINT and GRAPHQL_API_KEY');
  console.error('Current values:', { 
    graphqlEndpoint, 
    graphqlApiKey: graphqlApiKey ? `${graphqlApiKey.substring(0, 10)}...` : 'undefined' 
  });
} else {
  console.log('✅ Database Config: GraphQL configuration values found');
}

// AWS Amplify v6 Configuration - Database only (no authentication)
const amplifyConfig = {
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

console.log('🔧 Database Config: Amplify Config:', JSON.stringify(amplifyConfig, null, 2));

// Configure Amplify for database operations only
try {
  Amplify.configure(amplifyConfig);
  console.log('✅ Database Config: Amplify configured successfully');
} catch (error) {
  console.error('❌ Database Config: Error configuring Amplify:', error);
}

export default Amplify;
export { amplifyConfig };
