import AsyncStorage from '@react-native-async-storage/async-storage';

// Load nutrition data from AsyncStorage
export async function loadDataFromStorage(setNutritionData) {
  try {
    const nutritionData = await AsyncStorage.getItem("nutritionData");
    if (nutritionData)
      setNutritionData(JSON.parse(nutritionData));
  } catch (error) {
    console.error('Error loading nutrition data from storage', error);
  }
}

// Save nutrition data to AsyncStorage
export async function saveDataToStorage(nutritionData) {
  try {
    await AsyncStorage.setItem("nutritionData", JSON.stringify(nutritionData));
  } catch (error) {
    console.error('Error saving nutrition data to storage', error);
  }
} 