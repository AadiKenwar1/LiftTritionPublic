import axios from 'axios';
import Constants from 'expo-constants';

export const askOpenAI = async (question) => {
    const OPENAI_API_KEY = Constants.expoConfig.extra.OPENAI_API_KEY;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
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
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API Error:', error.message);
        return 'I dropped your request mid-rep. Totally my fault. Can you say it again?';
    }
};

// Picture Mode - General food analysis
export const askOpenAIVisionPicture = async (base64Image) => {
  const OPENAI_API_KEY = Constants.expoConfig.extra.OPENAI_API_KEY;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
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
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI Vision Picture API Error:', error.message);
        throw error;
    }
};

// Nutrition Label Mode - Precise label reading
export const askOpenAIVisionNutritionLabel = async (base64Image) => {
  const OPENAI_API_KEY = Constants.expoConfig.extra.OPENAI_API_KEY;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
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
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI Vision Nutrition Label API Error:', error.message);
        throw error;
    }
};

// Barcode Mode - Product identification and nutrition lookup
export const askOpenAIVisionBarcode = async (base64Image) => {
  const OPENAI_API_KEY = Constants.expoConfig.extra.OPENAI_API_KEY;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
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
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI Vision Barcode API Error:', error.message);
        throw error;
    }
};

// Legacy function for backward compatibility
export const askOpenAIVision = async (base64Image) => {
  return await askOpenAIVisionPicture(base64Image);
};
