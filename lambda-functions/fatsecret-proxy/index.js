const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const https = require('https');

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });
const BASE_URL = 'https://platform.fatsecret.com/rest/server.api';
const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';

// Base64 encode
function base64Encode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < str.length) {
        const a = str.charCodeAt(i++);
        const b = i < str.length ? str.charCodeAt(i++) : 0;
        const c = i < str.length ? str.charCodeAt(i++) : 0;
        
        const bitmap = (a << 16) | (b << 8) | c;
        
        result += chars.charAt((bitmap >> 18) & 63);
        result += chars.charAt((bitmap >> 12) & 63);
        
        if (b !== 0 && c !== 0) {
            result += chars.charAt((bitmap >> 6) & 63);
            result += chars.charAt(bitmap & 63);
        } else if (b !== 0) {
            result += chars.charAt((bitmap >> 6) & 63);
            result += '=';
        } else {
            result += '==';
        }
    }
    
    return result;
}

async function getFatSecretCredentials() {
    try {
        // Get client ID and secret from separate secrets
        const [clientIdResponse, clientSecretResponse] = await Promise.all([
            secretsClient.send(new GetSecretValueCommand({ SecretId: 'fatsecret-client-id' })),
            secretsClient.send(new GetSecretValueCommand({ SecretId: 'fatsecret-client-secret' }))
        ]);
        
        // Parse JSON to get the actual values (same pattern as OpenAI)
        const clientIdSecret = JSON.parse(clientIdResponse.SecretString);
        const clientSecretSecret = JSON.parse(clientSecretResponse.SecretString);
        
        return {
            clientId: clientIdSecret.FATSECRET_CLIENT_ID,
            clientSecret: clientSecretSecret.FATSECRET_CLIENT_SECRET
        };
    } catch (error) {
        console.error('Error retrieving secret:', error);
        throw error;
    }
}

function makeRequest(url, options, body) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        if (body) {
            requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = https.request(requestOptions, (res) => {
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
                    reject(new Error(`Request failed: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(body);
        }
        req.end();
    });
}

async function getAccessToken(clientId, clientSecret) {
    const credentials = base64Encode(`${clientId}:${clientSecret}`);
    
    const response = await makeRequest(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
        }
    }, 'grant_type=client_credentials&scope=basic');

    if (!response.access_token) {
        throw new Error('No access token in response');
    }

    return response.access_token;
}

function scoreResults(foods, searchWords) {
    return foods.map(food => {
        const foodName = food.food_name || food.food_description || '';
        const brandName = food.brand_name || '';
        const text = `${foodName} ${brandName}`.toLowerCase();
        
        const matchCount = searchWords.reduce((count, word) =>
            text.includes(word) ? count + 1 : count, 0
        );
        
        return {
            description: foodName,
            brandName: brandName,
            fdcId: food.food_id || foodName,
            isBranded: !!brandName,
            matchCount,
        };
    }).sort((a, b) => {
        if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
        return a.description.localeCompare(b.description);
    });
}

async function searchFoods(accessToken, query) {
    const params = new URLSearchParams({
        method: 'foods.search',
        search_expression: query.trim().toLowerCase(),
        format: 'json',
        max_results: '50',
    });

    const data = await makeRequest(`${BASE_URL}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const foods = data.foods?.food || [];
    const searchWords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    
    const results = scoreResults(foods, searchWords)
        .filter(item => item.description)
        .slice(0, 20);

    return results;
}

async function getFoodDetails(accessToken, foodId) {
    const params = new URLSearchParams({
        method: 'food.get.v3',
        food_id: foodId,
        format: 'json',
    });

    const data = await makeRequest(`${BASE_URL}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const food = data.food;
    if (!food) return null;

    const serving = food.servings?.serving?.[0] || {};

    return {
        name: food.food_name || food.food_description || '',
        fdcId: foodId,
        calories: parseFloat(serving.calories || 0),
        protein: parseFloat(serving.protein || 0),
        carbs: parseFloat(serving.carbohydrate || 0),
        fats: parseFloat(serving.fat || 0),
        servingSize: serving.serving_description || 
                     `${serving.metric_serving_amount || '1'} ${serving.metric_serving_unit || 'serving'}`,
        brandName: food.brand_name || '',
    };
}

exports.handler = async (event) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { type, query, foodId } = body;

        if (!type) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Missing type parameter' })
            };
        }

        // Get credentials from Secrets Manager
        const credentials = await getFatSecretCredentials();
        
        // Get access token
        const accessToken = await getAccessToken(credentials.clientId, credentials.clientSecret);

        let result;

        if (type === 'search') {
            if (!query) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                    body: JSON.stringify({ error: 'Missing query parameter for search' })
                };
            }
            result = await searchFoods(accessToken, query);
        } else if (type === 'details') {
            if (!foodId) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                    body: JSON.stringify({ error: 'Missing foodId parameter for details' })
                };
            }
            result = await getFoodDetails(accessToken, foodId);
        } else {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Invalid type. Use "search" or "details"' })
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ data: result })
        };
    } catch (error) {
        console.error('Lambda error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Internal server error', message: error.message })
        };
    }
};

