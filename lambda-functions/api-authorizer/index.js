const jwt = require('jsonwebtoken');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

async function getJWTSecret() {
    try {
        const response = await secretsClient.send(
            new GetSecretValueCommand({ SecretId: 'jwt-secret' })
        );
        return JSON.parse(response.SecretString).JWT_SECRET;
    } catch (error) {
        // Fallback to environment variable
        return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    }
}

exports.handler = async (event) => {
    console.log('Authorizer event:', JSON.stringify(event, null, 2));
    
    try {
        // Extract token from Authorization header
        const token = event.authorizationToken;
        
        if (!token) {
            console.error('No authorization token provided');
            throw new Error('Unauthorized');
        }
        
        // Remove "Bearer " prefix if present
        const cleanToken = token.replace(/^Bearer /, '');
        
        // Get JWT secret
        const secret = await getJWTSecret();
        
        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(cleanToken, secret, { algorithms: ['HS256'] });
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError.message);
            
            // Check if token looks like a JWT (has dots separating parts)
            // JWTs have format: header.payload.signature
            const looksLikeJWT = cleanToken.split('.').length === 3;
            
            if (looksLikeJWT) {
                // If it looks like a JWT but verification failed, reject it
                throw jwtError;
            }
            
            // Fallback: Try to decode as base64 JSON (backward compatibility)
            try {
                const decodedBase64 = Buffer.from(cleanToken, 'base64').toString('utf-8');
                const tokenData = JSON.parse(decodedBase64);
                if (tokenData.userId) {
                    console.log('Using legacy token format');
                    decoded = { userId: tokenData.userId };
                } else {
                    throw new Error('Invalid token format');
                }
            } catch (e) {
                // If not base64 JSON, treat as userId directly (simple mode for testing)
                // Only allow this if it doesn't look like a JWT
                if (cleanToken.length >= 10 && !looksLikeJWT) {
                    console.log('Using simple token format (userId)');
                    decoded = { userId: cleanToken };
                } else {
                    throw jwtError; // Re-throw JWT error if all fallbacks fail
                }
            }
        }
        
        const userId = decoded.userId;
        
        if (!userId) {
            console.error('Token missing userId');
            throw new Error('Invalid token: missing userId');
        }
        
        // Generate IAM policy
        const policy = generatePolicy(userId, 'Allow', event.methodArn, {
            userId: userId
        });
        
        console.log('Authorization successful for userId:', userId);
        return policy;
        
    } catch (error) {
        console.error('Authorization error:', error.message);
        // Return Deny policy
        return generatePolicy('user', 'Deny', event.methodArn);
    }
};

// Helper function to generate IAM policy
function generatePolicy(principalId, effect, resource, context = {}) {
    const authResponse = {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource
                }
            ]
        }
    };
    
    // Add context (available in your Lambda functions)
    if (Object.keys(context).length > 0) {
        authResponse.context = context;
    }
    
    return authResponse;
}

