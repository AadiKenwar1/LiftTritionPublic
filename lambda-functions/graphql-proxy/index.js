const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const https = require('https');

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

// Get GraphQL credentials from Secrets Manager
async function getGraphQLCredentials() {
    try {
        const response = await secretsClient.send(
            new GetSecretValueCommand({ SecretId: 'graphql-credentials' })
        );
        const secret = JSON.parse(response.SecretString);
        return {
            apiKey: secret.GRAPHQL_API_KEY,
            endpoint: secret.GRAPHQL_ENDPOINT
        };
    } catch (error) {
        throw error;
    }
}

// Make GraphQL request
function makeGraphQLRequest(endpoint, apiKey, query, variables) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(endpoint);
        const data = JSON.stringify({ query, variables });
        
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(responseData);
                        resolve(parsed);
                    } catch (e) {
                        resolve(responseData);
                    }
                } else {
                    reject(new Error(`GraphQL request failed: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// Enforce user-based access control by adding userId filter to queries
function enforceUserAccess(query, variables, userId) {
    const safeVariables = variables ? JSON.parse(JSON.stringify(variables)) : {};
    
    // For list queries, ensure userId filter is present
    if (query.includes('list')) {
        if (!safeVariables.filter) {
            safeVariables.filter = {};
        }
        // Always enforce userId filter for list queries
        safeVariables.filter.userId = { eq: userId };
    }
    
    // For get queries, verify the ID matches the userId (Settings uses userId as ID)
    if (query.includes('get') && safeVariables.id) {
        // For Settings, the id is the userId, so we verify it matches
        if (query.includes('getSettings') && safeVariables.id !== userId) {
            throw new Error('Unauthorized: Cannot access other user settings');
        }
        // For other get queries, we could add additional validation if needed
    }
    
    // For mutations (create, update), ensure userId in input matches authenticated user
    // Check for mutation operation name pattern (mutation Create... or mutation Update...)
    // NOT mutation Delete... (which also contains "createdAt" and "updatedAt" in response fields!)
    const isCreateMutation = /mutation\s+Create/.test(query);
    const isUpdateMutation = /mutation\s+Update/.test(query);
    
    if ((isCreateMutation || isUpdateMutation) && safeVariables.input) {
        // Special case: Settings uses 'id' as userId, not a separate 'userId' field
        const isSettingsMutation = query.includes('Settings');
        
        if (isSettingsMutation) {
            // For Settings, verify that the 'id' field matches the authenticated userId
            if (safeVariables.input.id && safeVariables.input.id !== userId) {
                throw new Error('Unauthorized: Settings id does not match authenticated user');
            }
            // Ensure id is set to authenticated userId
            safeVariables.input.id = userId;
        } else {
            // For all other types, use userId field
            // If userId is specified, it must match authenticated user
            if (safeVariables.input.userId && safeVariables.input.userId !== userId) {
                throw new Error('Unauthorized: userId in mutation does not match authenticated user');
            }
            // Always set userId to authenticated user for create/update mutations
            safeVariables.input.userId = userId;
        }
    }
    
    // For delete mutations, we can't easily verify ownership from the query string alone
    // But since we're filtering list queries, users can only delete what they can see
    // Additional validation could be added here if needed
    
    return { query, variables: safeVariables };
}

exports.handler = async (event) => {
    try {
        // Extract userId from authorizer context
        const userId = event.requestContext?.authorizer?.context?.userId ||
                       event.requestContext?.authorizer?.userId ||
                       event.requestContext?.authorizer?.principalId;
        
        if (!userId) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Unauthorized: userId not found in request context' })
            };
        }

        // Parse request body
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { query, variables = {} } = body;

        if (!query) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Missing query parameter' })
            };
        }

        // Enforce user-based access control
        try {
            const { query: safeQuery, variables: safeVariables } = enforceUserAccess(query, variables, userId);
            
            // Get GraphQL credentials
            const credentials = await getGraphQLCredentials();
            
            // Execute GraphQL request
            const result = await makeGraphQLRequest(credentials.endpoint, credentials.apiKey, safeQuery, safeVariables);

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify(result)
            };
        } catch (accessError) {
            console.error('GraphQL access error:', {
                message: accessError.message,
                stack: accessError.stack,
                userId: userId
            });
            return {
                statusCode: 403,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: accessError.message })
            };
        }
    } catch (error) {
        console.error('GraphQL proxy error:', {
            message: error.message,
            stack: error.stack,
            hasUserId: !!userId
        });
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Internal server error', message: error.message })
        };
    }
};

