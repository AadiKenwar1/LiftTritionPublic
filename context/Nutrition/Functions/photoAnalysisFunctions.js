import { askOpenAIVisionPicture, askOpenAIVisionNutritionLabel, askOpenAIVisionBarcode } from '../../../utils/openAI';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

// Utility function to convert URI to base64
async function uriToBase64(uri) {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting to base64:', error);
    throw error;
  }
}

// Picture Mode - General food analysis with ingredients
export async function addNutritionFromPhoto(uri, addNutrition, userId, authToken = null) {
  try {
    const base64Image = await uriToBase64(uri);

    let openAIResponse = await askOpenAIVisionPicture(base64Image, userId, authToken);

    // Attempt to extract JSON from code block if present
    if (openAIResponse.includes('```')) {
      const match = openAIResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match) {
        openAIResponse = match[1].trim();
      }
    }

         // Try parsing
     let nutrition;
     try {
       nutrition = JSON.parse(openAIResponse);
     } catch (e) {
       console.warn('Failed to parse food analysis JSON. Raw response:', openAIResponse);
       Alert.alert(
         'Unable to Analyze Food',
         'The food image could not be processed. Please make sure the food is clearly visible and try again.',
         [{ text: 'OK' }]
       );
       return null;
     }

    // Handle both single item and multiple items (array)
    if (Array.isArray(nutrition)) {
      // Multiple foods detected - combine them into one log entry
      
      // Validate all items first
      const validItems = nutrition.filter(item => 
        item &&
        typeof item.name === 'string' &&
        typeof item.protein === 'number' &&
        typeof item.carbs === 'number' &&
        typeof item.fats === 'number' &&
        typeof item.calories === 'number'
      );
      
      if (validItems.length === 0) {
        console.warn('No valid nutrition items found in array');
        Alert.alert(
          'Unable to Analyze Food',
          'The food data could not be processed. Please make sure the food is clearly visible and try again.',
          [{ text: 'OK' }]
        );
        return null;
      }
      
      // Combine all items into one log entry
      const combinedName = validItems.map(item => item.name).join(', ');
      const combinedProtein = validItems.reduce((sum, item) => sum + item.protein, 0);
      const combinedCarbs = validItems.reduce((sum, item) => sum + item.carbs, 0);
      const combinedFats = validItems.reduce((sum, item) => sum + item.fats, 0);
      const combinedCalories = validItems.reduce((sum, item) => sum + item.calories, 0);
      
      // Combine all ingredients from all items
      const allIngredients = validItems.reduce((ingredients, item) => {
        if (item.ingredients && Array.isArray(item.ingredients)) {
          return [...ingredients, ...item.ingredients];
        }
        return ingredients;
      }, []);
      
      // Add the combined food items as one log entry
      addNutrition(
        combinedName,
        combinedProtein,
        combinedCarbs,
        combinedFats,
        combinedCalories,
        true,
        allIngredients
      );
      
      return nutrition; // Return the array for reference
    } else {
      // Single food item
      // Validate fields
             if (
         !nutrition ||
         typeof nutrition.name !== 'string' ||
         typeof nutrition.protein !== 'number' ||
         typeof nutrition.carbs !== 'number' ||
         typeof nutrition.fats !== 'number' ||
         typeof nutrition.calories !== 'number'
       ) {
         console.warn('Invalid food analysis data received. Data:', nutrition);
         Alert.alert(
           'Unable to Analyze Food',
           'The food data could not be processed. Please make sure the food is clearly visible and try again.',
           [{ text: 'OK' }]
         );
         return null;
       }

             // Add the single food item with ingredients
       addNutrition(
         nutrition.name,
         nutrition.protein,
         nutrition.carbs,
         nutrition.fats,
         nutrition.calories,
         true,
         nutrition.ingredients || []
       );

      return nutrition;
    }

  } catch (error) {
    console.error('Error analyzing and adding nutrition from photo:', error);
    return null;
  }
}

// Nutrition Label Mode - Precise label reading (no ingredients)
export async function addNutritionFromLabel(uri, addNutrition, userId, authToken = null) {
  try {
    const base64Image = await uriToBase64(uri);

    let openAIResponse = await askOpenAIVisionNutritionLabel(base64Image, userId, authToken);

    // Attempt to extract JSON from code block if present
    if (openAIResponse.includes('```')) {
      const match = openAIResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match) {
        openAIResponse = match[1].trim();
      }
    }

         // Try parsing
     let nutrition;
     try {
       nutrition = JSON.parse(openAIResponse);
     } catch (e) {
       console.warn('Failed to parse nutrition label JSON. Raw response:', openAIResponse);
       Alert.alert(
         'Unable to Read Nutrition Label',
         'Please make sure you\'re taking a clear photo of a nutrition label. For whole foods like fruits and vegetables, use Picture mode instead.',
         [{ text: 'OK' }]
       );
       return null;
     }

         // Validate fields
     if (
       !nutrition ||
       typeof nutrition.name !== 'string' ||
       typeof nutrition.protein !== 'number' ||
       typeof nutrition.carbs !== 'number' ||
       typeof nutrition.fats !== 'number' ||
       typeof nutrition.calories !== 'number'
     ) {
       console.warn('Invalid nutrition data received. Data:', nutrition);
       Alert.alert(
         'Unable to Read Nutrition Label',
         'The nutrition label data could not be processed. Please make sure the label is clearly visible and try again.',
         [{ text: 'OK' }]
       );
       return null;
     }

         // Add the nutrition label entry (no ingredients)
     addNutrition(
       nutrition.name,
       nutrition.protein,
       nutrition.carbs,
       nutrition.fats,
       nutrition.calories,
       false, // Not a photo for nutrition labels
       [] // No ingredients for nutrition labels
     );

    return nutrition;

  } catch (error) {
    console.error('Error analyzing and adding nutrition from label:', error);
    return null;
  }
}

// Barcode Mode - Product identification (no ingredients)
export async function addNutritionFromBarcode(uri, addNutrition, userId, authToken = null) {
  try {
    const base64Image = await uriToBase64(uri);

    let openAIResponse = await askOpenAIVisionBarcode(base64Image, userId, authToken);

    // Attempt to extract JSON from code block if present
    if (openAIResponse.includes('```')) {
      const match = openAIResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match) {
        openAIResponse = match[1].trim();
      }
    }

         // Try parsing
     let nutrition;
     try {
       nutrition = JSON.parse(openAIResponse);
     } catch (e) {
       console.warn('Failed to parse barcode JSON. Raw response:', openAIResponse);
       Alert.alert(
         'Unable to Read Barcode',
         'Please make sure you\'re taking a clear photo of a product barcode. Try again or use Picture mode for general food items.',
         [{ text: 'OK' }]
       );
       return null;
     }

    // Validate fields
    if (
      !nutrition ||
      typeof nutrition.name !== 'string' ||
      typeof nutrition.protein !== 'number' ||
      typeof nutrition.carbs !== 'number' ||
      typeof nutrition.fats !== 'number' ||
      typeof nutrition.calories !== 'number'
    ) {
      console.warn('Invalid barcode data received. Data:', nutrition);
      Alert.alert(
        'Unable to Read Barcode',
        'The barcode data could not be processed. Please make sure the barcode is clearly visible and try again.',
        [{ text: 'OK' }]
      );
      return null;
    }

         // Add the barcode product entry (no ingredients)
     addNutrition(
       nutrition.name,
       nutrition.protein,
       nutrition.carbs,
       nutrition.fats,
       nutrition.calories,
       false, // Not a photo for barcode products
       [] // No ingredients for barcode products
     );

    return nutrition;

  } catch (error) {
    console.error('Error analyzing and adding nutrition from barcode:', error);
    return null;
  }
}

// Export the utility function as well
export { uriToBase64 }; 