import uuid from "react-native-uuid";
import { getLocalDateKey } from "../../../utils/date";
import { generateClient } from 'aws-amplify/api';
import { createNutrition, updateNutrition, deleteNutrition as deleteNutritionMutation } from '../../../database/graphql/mutations';
import { listNutritions } from '../../../database/graphql/queries';

const client = generateClient();

// Create - Add new nutrition entry (local + cloud)
export async function addNutrition(nutritionData, setNutritionData, userId, name, protein, carbs, fats, calories, isPhoto = false, ingredients = []) {
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
  };
  console.log('[DEBUG] addNutrition - userId:', userId);
  console.log('[DEBUG] addNutrition - newEntry:', newEntry);
  setNutritionData(prevData => {
    const updated = [newEntry, ...prevData];
    return updated.sort((a, b) => b.date.localeCompare(a.date));
  });
  // Save to cloud
  try {
    await client.graphql({ query: createNutrition, variables: { input: newEntry } });
  } catch (error) {
    console.error('Error saving nutrition to cloud:', error);
  }
}

// Read - Get logs for a specific date
export function getLogsForDate(nutritionData, date) {
  const dateKey = getLocalDateKey(date);
  return nutritionData.filter(entry => entry.date === dateKey);
}

// Read - Get today's logs
export function getTodaysLogs(nutritionData) {
  const today = getLocalDateKey();
  return nutritionData.filter(entry => entry.date === today);
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

// Read - Get today's macro totals
export function getTodaysMacro(nutritionData, macroType) {
  const todaysLogs = getTodaysLogs(nutritionData);
  let total = 0;
  for (let i = 0; i < todaysLogs.length; i++) {
    total += todaysLogs[i][macroType];
  }
  return Math.round(total);
}

// Read - Get macro data for last 30 days
export function getMacroForLast30Days(nutritionData, macroType = "calories") {
  const result = [];
  if (!nutritionData || nutritionData.length === 0) {
    return result;
  }
  // Determine the oldest date in the logs
  const allDates = nutritionData.map(e => e.date);
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
    const [year, month, day] = dateKey.split("-");
    const label = `${month}/${day}`;
    // Sum macros for this local date
    const total = nutritionData
      .filter(entry => entry.date === dateKey)
      .reduce((sum, entry) => sum + (entry[macroType] || 0), 0);
    result.push({
      label: label,
      value: total,
    });
  }
  return result.reverse();
}

// Update - Edit nutrition entry (local + cloud)
export async function editNutrition(setNutritionData, id, name, protein, carbs, fats, calories, userId, saved) {
  console.log('[DEBUG] editNutrition - userId:', userId, 'id:', id);
  setNutritionData(prevData =>
    prevData.map(item =>
      item.id === id
        ? { ...item, name, protein, carbs, fats, calories, saved }
        : item
    )
  );
  // Update in cloud
  try {
    const input = { id, userId, name, protein, carbs, fats, calories };
    if (typeof saved !== 'undefined') input.saved = saved;
    await client.graphql({ query: updateNutrition, variables: { input } });
  } catch (error) {
    console.error('Error updating nutrition in cloud:', error);
  }
}

// Update - Update ingredients and macros (local + cloud)
export async function updateIngredientsAndMacros(setNutritionData, id, ingredients, totalMacros, userId) {
  console.log('[DEBUG] updateIngredientsAndMacros - userId:', userId, 'id:', id);
  setNutritionData(prevData =>
    prevData.map(item =>
      item.id === id
        ? {
            ...item,
            ingredients,
            protein: totalMacros.protein,
            carbs: totalMacros.carbs,
            fats: totalMacros.fats,
            calories: totalMacros.calories,
          }
        : item
    )
  );
  // Update in cloud
  try {
    await client.graphql({ query: updateNutrition, variables: { input: {
      id,
      userId,
      ingredients,
      protein: totalMacros.protein,
      carbs: totalMacros.carbs,
      fats: totalMacros.fats,
      calories: totalMacros.calories,
    } } });
  } catch (error) {
    console.error('Error updating nutrition (ingredients/macros) in cloud:', error);
  }
}

// Delete - Remove nutrition entry (local + cloud)
export async function deleteNutrition(setNutritionData, id) {
  // Remove locally
  setNutritionData(prevData => prevData.filter(entry => entry.id !== id));
  // Remove from cloud
  try {
    await client.graphql({ query: deleteNutritionMutation, variables: { input: { id } } });
  } catch (error) {
    console.error('Error deleting nutrition from cloud:', error);
  }
}

// Fetch all nutrition logs from the cloud (for initial sync)
export async function fetchAllNutritionFromCloud(userId) {
  const filter = { filter: { userId: { eq: userId } } };
  console.log('[DEBUG] fetchAllNutritionFromCloud - userId:', userId);
  console.log('[DEBUG] fetchAllNutritionFromCloud - filter:', filter);
  try {
    const result = await client.graphql({ query: listNutritions, variables: filter });
    console.log('[DEBUG] fetchAllNutritionFromCloud - result:', result);
    return result.data.listNutritions.items || [];
  } catch (error) {
    console.error('Error fetching nutrition logs from cloud:', error);
    return [];
  }
} 