// utils/foodCache.js
// FatSecret API integration for food search and nutrition details

import { makeAuthenticatedRequest } from './apiClient';

// Caching - Temporal Locality (1 week)
const foodSearchCache = {}; // Recently searched queries
const productDetailsCache = {}; // Recently accessed product details
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week (temporal locality)

// Search for foods
export async function getFoodSearchResults(query, userId, authToken) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Check cache
  const cacheKey = trimmed;
  const cached = foodSearchCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await makeAuthenticatedRequest('/fatsecret', {
      method: 'POST',
      userId,
      authToken,
      body: JSON.stringify({
        type: 'search',
        query: trimmed
      })
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    // Lambda already returns scored and sorted results
    const results = data.data || [];

    // Cache results
    foodSearchCache[cacheKey] = { data: results, timestamp: Date.now() };
    
    return results;
  } catch (err) {
    console.error('FatSecret search error:', err.message);
    return [];
  }
}

// Get detailed nutrition info
export async function getFoodDetails(item, userId, authToken) {
  const barcode = item.fdcId;
  if (!barcode) return null;

  // TEMPORAL LOCALITY: Check cache first (recently accessed items)
  const cached = productDetailsCache[barcode];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await makeAuthenticatedRequest('/fatsecret', {
      method: 'POST',
      userId,
      authToken,
      body: JSON.stringify({
        type: 'details',
        foodId: barcode
      })
    });

    if (!response.ok) {
      throw new Error(`Details failed: ${response.status}`);
    }

    const data = await response.json();
    const food = data.data;

    if (!food) return null;

    // The Lambda returns the formatted food details directly
    const details = {
      name: food.name || item.description,
      fdcId: barcode,
      calories: parseFloat(food.calories || 0),
      protein: parseFloat(food.protein || 0),
      carbs: parseFloat(food.carbs || 0),
      fats: parseFloat(food.fats || 0),
      servingSize: food.servingSize || '1 serving',
      brandName: food.brandName || item.brandName || '',
    };

    // TEMPORAL LOCALITY: Cache the details (recently accessed items)
    productDetailsCache[barcode] = { data: details, timestamp: Date.now() };
    
    return details;
  } catch (err) {
    console.error('FatSecret details error:', err.message);
    return null;
  }
}
