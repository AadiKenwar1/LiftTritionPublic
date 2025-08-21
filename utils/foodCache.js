// utils/foodCache.js
//
// Nutritionix API integration for food search and nutrition details.
//
// Caching: This file uses an in-memory cache (foodSearchCache) to store search results for each query string.
// The cache key is the lowercased, trimmed query. Each entry stores the data and a timestamp.
// When a search is performed, the cache is checked first. If the cached data is less than TTL (15 minutes) old, it is returned.
// Otherwise, a new API request is made and the result is cached.

import Constants from 'expo-constants';

// Get Nutritionix credentials with fallback pattern
const APP_ID = process.env.NUTRITIONX_APP_ID || 
               Constants.expoConfig?.extra?.NUTRITIONX_APP_ID 

const API_KEY = process.env.NUTRITIONX_API_KEY || 
                Constants.expoConfig?.extra?.NUTRITIONX_API_KEY 
                
const BASE_URL = 'https://trackapi.nutritionix.com/v2';

const foodSearchCache = {}; // { [query: string]: { data: any, timestamp: number } }
const TTL = 15 * 60 * 1000; // Cache Time-To-Live: 15 minutes

// Retrieve cached search results for a query if still fresh
function getCached(query) {
  const key = query.trim().toLowerCase();
  const entry = foodSearchCache[key];
  if (!entry) return null;
  const isFresh = Date.now() - entry.timestamp < TTL;
  return isFresh ? entry.data : null;
}

// Store search results in the cache for a query
function setCache(query, data) {
  const key = query.trim().toLowerCase();
  foodSearchCache[key] = {
    data,
    timestamp: Date.now(),
  };
}

// Search for branded foods using Nutritionix, rank/filter by word match count
export async function getFoodSearchResults(query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Preprocess: split query into words
  const searchWords = trimmed.split(/\s+/).filter(Boolean);

  // Check cache first
  const cached = getCached(trimmed);
  if (cached) return cached;

  try {
    // Fetch more branded results for better client-side filtering
    const res = await fetch(`${BASE_URL}/search/instant?query=${encodeURIComponent(trimmed)}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-APP-ID': APP_ID,
        'X-APP-KEY': API_KEY,
      },
    });
    const data = await res.json();
    const branded = data.branded || [];

    // For each branded result, count how many search words match food_name or brand_name
    const scored = branded.map(food => {
      const haystack = `${food.food_name} ${food.brand_name || ''}`.toLowerCase();
      const matchCount = searchWords.reduce((count, word) =>
        haystack.includes(word) ? count + 1 : count, 0
      );
      return {
        description: food.food_name,
        brandName: food.brand_name || '',
        fdcId: food.tag_id || food.nix_item_id || food.food_name,
        isBranded: !!food.nix_item_id,
        matchCount,
      };
    });

    // Sort by match count (descending), then alphabetically as tiebreaker
    scored.sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return a.description.localeCompare(b.description);
    });

    // Take top 20 best matches
    const foods = scored.slice(0, 20);
    setCache(trimmed, foods);
    return foods;
  } catch (err) {
    console.error('Nutritionix search error:', err);
    return [];
  }
}

// Get detailed nutrition info for a food item
// Uses /search/item for branded foods, /natural/nutrients for common foods
// Accepts the full item object from search results
export async function getFoodDetails(item) {
  try {
    let food = null;
    if (item.isBranded && item.fdcId) {
      // Branded food: fetch details by nix_item_id
      const res = await fetch(`${BASE_URL}/search/item?nix_item_id=${encodeURIComponent(item.fdcId)}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-APP-ID': APP_ID,
          'X-APP-KEY': API_KEY,
        },
      });
      const data = await res.json();
      food = data.foods && data.foods[0];
    } else {
      // Common food: fetch nutrition using a natural language query with quantity
      const query = `1 serving ${item.description}`;
      const res = await fetch(`${BASE_URL}/natural/nutrients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-APP-ID': APP_ID,
          'X-APP-KEY': API_KEY,
        },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      food = data.foods && data.foods[0];
    }
    if (!food) return null;
    // Map Nutritionix response to expected structure
    const result = {
      name: food.food_name,
      fdcId: item.fdcId,
      calories: food.nf_calories || 0,
      protein: food.nf_protein || 0,
      carbs: food.nf_total_carbohydrate || 0,
      fats: food.nf_total_fat || 0,
      servingSize: `${food.serving_qty} ${food.serving_unit} (${food.serving_weight_grams}g)`,
      brandName: food.brand_name || '',
    };
    return result;
  } catch (err) {
    console.error('Nutritionix details error:', err);
    return null;
  }
}



