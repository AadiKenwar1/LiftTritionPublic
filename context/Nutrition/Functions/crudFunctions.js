import uuid from "react-native-uuid";
import { getLocalDateKey } from "../../../utils/date";

// Create - Add new nutrition entry
export async function addNutrition(nutritionData, setNutritionData, userId, name, protein, carbs, fats, calories, isPhoto = false, ingredients = [], isPlaceholder = false) {
  const date = getLocalDateKey();
  const time = Date.now();
  const newEntry = {
    userId,
    name,
    date,
    time,
    id: uuid.v4(),
    protein,
    carbs,
    fats,
    calories,
    isPhoto,
    ingredients,
    saved: false,
    synced: false,
    isPlaceholder,
  };
  console.log('[DEBUG] addNutrition - userId:', userId);
  console.log('[DEBUG] addNutrition - newEntry:', newEntry);
  
  // Update state
  setNutritionData(prevData => {
    const updated = [{ ...newEntry, synced: false }, ...prevData];
    return updated.sort((a, b) => b.date.localeCompare(a.date));
  });
}

// Read - Get logs for a specific date (excludes deleted items)
export function getLogsForDate(nutritionData, date) {
  const dateKey = getLocalDateKey(date);
  return nutritionData.filter(entry => entry.date === dateKey && !entry.deleted && !entry.isPlaceholder);
}

// Read - Get macro totals for a specific date
export function getMacroForDate(nutritionData, macroType, date) {
  const dateLogs = getLogsForDate(nutritionData, date);
  let total = 0;
  for (let i = 0; i < dateLogs.length; i++) {
    total += dateLogs[i][macroType];
  }
  return Math.round(total);
}

// Read - Get macro data for last 30 days
export function getMacroForLast30Days(nutritionData, macroType = "calories") {
  const result = [];
  if (!nutritionData || nutritionData.length === 0) {
    return result;
  }
  // Determine the oldest date in the logs (exclude deleted items)
  const allDates = nutritionData.filter(e => !e.deleted).map(e => e.date);
  if (allDates.length === 0) return result;
  const oldestDateStr = allDates.reduce((min, d) => d < min ? d : min, allDates[0]);
  const oldestDate = new Date(oldestDateStr);
  // Start from today in LOCAL time
  let current = new Date();
  current.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    // Get date i days ago, LOCAL time
    const date = new Date(current);
    date.setDate(current.getDate() - i);
    // Check if it's before oldest log
    if (date < oldestDate) {
      break;
    }
    // Always generate the key in local time
    const dateKey = getLocalDateKey(date);
    // Sum macros for this local date (exclude deleted items)
    const total = nutritionData
      .filter(entry => entry.date === dateKey && !entry.deleted)
      .reduce((sum, entry) => sum + (entry[macroType] || 0), 0);
    result.push({
      label: dateKey,  // Use full YYYY-MM-DD format (same as logs)
      value: total,
    });
  }
  return result.reverse();
}

// Update - Edit nutrition entry
export async function editNutrition(nutritionData, setNutritionData, id, name, protein, carbs, fats, calories, userId, saved) {
  console.log('[DEBUG] editNutrition - userId:', userId, 'id:', id);
  
  // Check if item exists
  const itemExists = nutritionData.find(item => item.id === id);
  if (!itemExists) {
    throw new Error('Nutrition item not found');
  }
  
  // Update state
  setNutritionData(prevData => {
    return prevData.map(item =>
      item.id === id
        ? { ...item, name, protein, carbs, fats, calories, saved, synced: false }
        : item
    );
  });
}

// Update - Update ingredients and macros
export async function updateIngredientsAndMacros(nutritionData, setNutritionData, id, ingredients, totalMacros, userId) {
  console.log('[DEBUG] updateIngredientsAndMacros - userId:', userId, 'id:', id);
  
  // Check if item exists
  const itemExists = nutritionData.find(item => item.id === id);
  if (!itemExists) {
    throw new Error('Nutrition item not found');
  }
  
  // Update state
  setNutritionData(prevData => {
    return prevData.map(item =>
      item.id === id
        ? {
            ...item,
            ingredients,
            protein: totalMacros.protein,
            carbs: totalMacros.carbs,
            fats: totalMacros.fats,
            calories: totalMacros.calories,
            synced: false,
          }
        : item
    );
  });
}

// Delete - Soft delete nutrition entry (mark as deleted)
export async function deleteNutrition(nutritionData, setNutritionData, id, userId) {
  // Check if item exists
  const itemExists = nutritionData.find(item => item.id === id);
  if (!itemExists) {
    throw new Error('Nutrition item not found');
  }
  
  // Soft delete: mark as deleted instead of removing
  setNutritionData(prevData => 
    prevData.map(item => 
      item.id === id ? { ...item, deleted: true } : item
    )
  );
}
