import { makeAuthenticatedRequest } from './apiClient';

/**
 * Execute a GraphQL query or mutation via the authenticated GraphQL proxy
 * @param {string} query - GraphQL query/mutation string
 * @param {Object} variables - GraphQL variables object
 * @param {Object} options - Options including userId and authToken
 * @returns {Promise<Object>} GraphQL response in format { data: {...}, errors?: [...] }
 */
export async function graphqlRequest(query, variables = {}, options = {}) {
    const { userId, authToken } = options;
    
    try {
        const response = await makeAuthenticatedRequest('/graphql', {
            method: 'POST',
            userId,
            authToken,
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `GraphQL request failed: ${response.status}`;
            
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            
            throw new Error(errorMessage);
        }

        const result = await response.json();
        
        // Check for GraphQL errors in response
        if (result.errors && result.errors.length > 0) {
            const errorMessages = result.errors.map(err => err.message).join(', ');
            const error = new Error(`GraphQL errors: ${errorMessages}`);
            
            // Don't log expected conditional failures (they're handled by sync logic)
            const isConditionalFailure = errorMessages.includes('conditional request failed') || 
                                        errorMessages.includes('ConditionalCheckFailedException');
            
            if (!isConditionalFailure) {
                console.error('GraphQL request error:', error);
            }
            
            throw error;
        }
        
        return result;
    } catch (error) {
        // Don't log expected conditional failures (they're handled by sync logic)
        const isConditionalFailure = error?.message?.includes('conditional request failed') || 
                                    error?.message?.includes('ConditionalCheckFailedException');
        
        if (!isConditionalFailure) {
            console.error('GraphQL request error:', error);
        }
        
        throw error;
    }
}

/**
 * Convenience wrapper that mimics Amplify's client.graphql() format
 * @param {Object} params - Object with query and variables
 * @param {Object} options - Options including userId and authToken
 * @returns {Promise<Object>} GraphQL response with data property
 */
export async function graphql(params, options = {}) {
    const { query, variables = {} } = params;
    const result = await graphqlRequest(query, variables, options);
    
    // Return in Amplify-compatible format
    return {
        data: result.data,
        errors: result.errors,
    };
}

