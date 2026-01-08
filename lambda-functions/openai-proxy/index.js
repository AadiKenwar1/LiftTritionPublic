const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const https = require('https');

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

// Get OpenAI API key from Secrets Manager
async function getOpenAIKey() {
    try {
        const response = await secretsClient.send(
            new GetSecretValueCommand({ SecretId: 'openai-api-key' })
        );
        const secret = JSON.parse(response.SecretString);
        return secret.OPENAI_API_KEY;
    } catch (error) {
        console.error('Error retrieving secret:', error);
        throw error;
    }
}

// Make HTTP request to OpenAI
function makeOpenAIRequest(apiKey, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        
        const options = {
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed.choices[0].message.content);
                } else {
                    reject(new Error(`OpenAI API error: ${res.statusCode} - ${responseData}`));
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

exports.handler = async (event) => {
    try {
        // Parse request body
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { type, question, base64Image } = body;

        // Get API key
        const apiKey = await getOpenAIKey();

        let payload;

        // Route based on type
        if (type === 'chat') {
            // Text completion
            payload = {
                model: 'gpt-4-turbo',
                temperature: 0.2,
                frequency_penalty: 0,
                messages: [
                    {
                        role: 'system',
                        content: 'Keep answers under 50 words.',
                    },
                    { role: 'user', content: question },
                ],
            };
        } else if (type === 'picture') {
            // Food photo analysis
            payload = {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analyze this food photo and extract nutrition info. Focus on:

1. What food items are visible (count exact quantities)
2. Estimate realistic serving sizes based on what's shown
3. Calculate total nutritional values for the portion shown

Respond ONLY with JSON:

{
  "name": string,
  "protein": number,
  "carbs": number,
  "fats": number,
  "calories": number,
  "ingredients": [string]
}

For multiple foods, use an array. Keep ingredients simple (e.g., ["banana", "banana"] for 2 bananas).`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: base64Image,
                                },
                            },
                        ],
                    },
                ],
                temperature: 0.2,
            };
        } else if (type === 'label') {
            // Nutrition label reading
            payload = {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Read this nutrition label carefully and extract the exact values. Focus on:

1. Product name from the label
2. Exact serving size shown
3. Precise nutrition facts (protein, carbs, fats, calories)

Respond ONLY with JSON:

{
  "name": string,
  "protein": number,
  "carbs": number,
  "fats": number,
  "calories": number
}

Use the exact values from the label. If serving size is not 1, adjust all values proportionally to represent 1 serving.`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: base64Image,
                                },
                            },
                        ],
                    },
                ],
                temperature: 0.1,
            };
        } else if (type === 'barcode') {
            // Barcode scanning
            payload = {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Identify this product from the barcode image and provide typical nutrition info. Focus on:
1. Product name and brand
2. Standard serving size for this product
3. Typical nutrition values (protein, carbs, fats, calories)

Respond ONLY with JSON:

{
  "name": string,
  "protein": number,
  "carbs": number,
  "fats": number,
  "calories": number
}

If you can't read the barcode clearly, provide generic nutrition info for the most likely product type.`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: base64Image,
                                },
                            },
                        ],
                    },
                ],
                temperature: 0.3,
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid type. Must be: chat, picture, label, or barcode' }),
            };
        }

        // Call OpenAI
        const result = await makeOpenAIRequest(apiKey, payload);

        // Return response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ content: result }),
        };
    } catch (error) {
        console.error('Lambda error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            }),
        };
    }
};