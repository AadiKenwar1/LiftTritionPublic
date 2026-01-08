import { makeAuthenticatedRequest } from './apiClient';

export const askOpenAI = async (question, userId, authToken) => {
    try {
        const response = await makeAuthenticatedRequest('/open-ai', {
            method: 'POST',
            userId,
            authToken,
            body: JSON.stringify({
                type: 'chat',
                question: question
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('OpenAI API Error:', error.message);
        return 'I dropped your request mid-rep. Totally my fault. Can you say it again?';
    }
};

// Picture Mode - General food analysis
export const askOpenAIVisionPicture = async (base64Image, userId, authToken) => {
    try {
        const response = await makeAuthenticatedRequest('/open-ai', {
            method: 'POST',
            userId,
            authToken,
            body: JSON.stringify({
                type: 'picture',
                base64Image: base64Image
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('OpenAI Vision Picture API Error:', error.message);
        throw error;
    }
};

// Nutrition Label Mode - Precise label reading
export const askOpenAIVisionNutritionLabel = async (base64Image, userId, authToken) => {
    try {
        const response = await makeAuthenticatedRequest('/open-ai', {
            method: 'POST',
            userId,
            authToken,
            body: JSON.stringify({
                type: 'label',
                base64Image: base64Image
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('OpenAI Vision Nutrition Label API Error:', error.message);
        throw error;
    }
};

// Barcode Mode - Product identification and nutrition lookup
export const askOpenAIVisionBarcode = async (base64Image, userId, authToken) => {
    try {
        const response = await makeAuthenticatedRequest('/open-ai', {
            method: 'POST',
            userId,
            authToken,
            body: JSON.stringify({
                type: 'barcode',
                base64Image: base64Image
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('OpenAI Vision Barcode API Error:', error.message);
        throw error;
    }
};

// Legacy function for backward compatibility
export const askOpenAIVision = async (base64Image, userId, authToken) => {
  return await askOpenAIVisionPicture(base64Image, userId, authToken);
};
