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
        console.error('Error retrieving JWT secret:', error);
        throw error;
    }
}

exports.handler = async (event) => {
    try {
        // Parse request body
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { userId, authToken } = body;

        // Validate input
        if (!userId) {
            return {
                statusCode: 400,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': '*' 
                },
                body: JSON.stringify({ error: 'userId is required' })
            };
        }

        // TODO: Verify authToken here (verify Apple identity token, etc.)
        // For now, basic validation - just check if it exists
        if (!authToken) {
            return {
                statusCode: 400,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': '*' 
                },
                body: JSON.stringify({ error: 'authToken is required' })
            };
        }

        // Get JWT secret from Secrets Manager
        const secret = await getJWTSecret();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: userId,
                iat: Math.floor(Date.now() / 1000), // Issued at timestamp
            },
            secret,
            {
                expiresIn: '7d', // Token expires in 7 days
                algorithm: 'HS256'
            }
        );

        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json', 
                'Access-Control-Allow-Origin': '*' 
            },
            body: JSON.stringify({
                token: token,
                expiresIn: '7d'
            })
        };
    } catch (error) {
        console.error('Token generation error:', error);
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json', 
                'Access-Control-Allow-Origin': '*' 
            },
            body: JSON.stringify({ 
                error: 'Failed to generate token', 
                message: error.message 
            })
        };
    }
};




