// utils/foodCache.js
//
// FatSecret API integration for food search and nutrition details.
//
// Caching: This file uses an in-memory cache (foodSearchCache) to store search results for each query string.
// The cache key is the lowercased, trimmed query. Each entry stores the data and a timestamp.
// When a search is performed, the cache is checked first. If the cached data is less than TTL (15 minutes) old, it is returned.
// Otherwise, a new API request is made and the result is cached.

import Constants from 'expo-constants';

// Get FatSecret credentials with fallback pattern
const CLIENT_ID = process.env.FATSECRET_CLIENT_ID || 
                  Constants.expoConfig?.extra?.FATSECRET_CLIENT_ID;

const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET || 
                      Constants.expoConfig?.extra?.FATSECRET_CLIENT_SECRET;

const BASE_URL = 'https://platform.fatsecret.com/rest/server.api';
const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';

const foodSearchCache = {}; // { [query: string]: { data: any, timestamp: number } }
const tokenCache = { accessToken: null, expiresAt: 0 };
const TTL = 15 * 60 * 1000; // Cache Time-To-Live: 15 minutes

// Simple base64 encoder for React Native (btoa is not available)
function base64Encode(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    output += chars.charAt((bitmap >> 18) & 63);
    output += chars.charAt((bitmap >> 12) & 63);
    output += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    output += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
  }
  return output;
}

// Get OAuth 2.0 access token from FatSecret
async function getAccessToken() {
  // Check if cached token is still valid (refresh 10 minutes before expiry)
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - (10 * 60 * 1000)) {
    return tokenCache.accessToken;
  }

  try {
    // Verify credentials are loaded
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('FatSecret credentials not found. Please check your environment variables.');
    }

    // Create Basic Auth header (base64 encode CLIENT_ID:CLIENT_SECRET)
    const credentials = base64Encode(`${CLIENT_ID}:${CLIENT_SECRET}`);
    
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=basic',
    });

    // Get the response text first to see what the error is
    const responseText = await response.text();
    
    if (!response.ok) {
      let errorMessage = `Token request failed: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage += ` - ${errorData.error || errorData.error_description || responseText}`;
      } catch (e) {
        errorMessage += ` - ${responseText}`;
      }
      console.error('FatSecret token error details:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    
    if (data.access_token) {
      // Cache token (use expires_in from response if available, otherwise default to 50 minutes)
      tokenCache.accessToken = data.access_token;
      const expiresIn = data.expires_in ? data.expires_in * 1000 : (50 * 60 * 1000);
      tokenCache.expiresAt = Date.now() + expiresIn;
      return data.access_token;
    }
    throw new Error('No access token in response');
  } catch (err) {
    console.error('FatSecret token error:', err);
    throw err;
  }
}

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

// Search for foods using FatSecret API, rank/filter by word match count
export async function getFoodSearchResults(query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Preprocess: split query into words
  const searchWords = trimmed.split(/\s+/).filter(Boolean);

  // Check cache first
  const cached = getCached(trimmed);
  if (cached) return cached;

  try {
    // Get access token
    const accessToken = await getAccessToken();

    // FatSecret uses method parameter in query string
    const params = new URLSearchParams({
      method: 'foods.search',
      search_expression: trimmed,
      format: 'json',
      max_results: '50',
    });

    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Search request failed: ${res.status}`);
    }

    const data = await res.json();
    const foods = data.foods?.food || [];

    // For each result, count how many search words match food_name or brand_name
    const scored = foods.map(food => {
      const foodName = food.food_name || food.food_description || '';
      const brandName = food.brand_name || '';
      const haystack = `${foodName} ${brandName}`.toLowerCase();
      const matchCount = searchWords.reduce((count, word) =>
        haystack.includes(word) ? count + 1 : count, 0
      );
      return {
        description: foodName,
        brandName: brandName,
        fdcId: food.food_id || foodName,
        isBranded: !!brandName,
        matchCount,
      };
    });

    // Sort by match count (descending), then alphabetically as tiebreaker
    scored.sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return a.description.localeCompare(b.description);
    });

    // Take top 20 best matches
    const results = scored.slice(0, 20);
    setCache(trimmed, results);
    return results;
  } catch (err) {
    console.error('FatSecret search error:', err);
    return [];
  }
}

// Get detailed nutrition info for a food item using FatSecret API
// Accepts the full item object from search results
export async function getFoodDetails(item) {
  try {
    // Get access token
    const accessToken = await getAccessToken();

    // FatSecret uses food_id to get details
    const params = new URLSearchParams({
      method: 'food.get.v3',
      food_id: item.fdcId,
      format: 'json',
    });

    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Details request failed: ${res.status}`);
    }

    const data = await res.json();
    const food = data.food;

    if (!food) return null;

    // Extract nutrition data from FatSecret response
    // FatSecret returns servings as an array
    const servings = food.servings?.serving || [];
    const serving = servings[0] || {}; // Use first serving

    // Map FatSecret response to expected structure
    const result = {
      name: food.food_name || food.food_description || item.description,
      fdcId: item.fdcId,
      calories: parseFloat(serving.calories || 0),
      protein: parseFloat(serving.protein || 0),
      carbs: parseFloat(serving.carbohydrate || 0),
      fats: parseFloat(serving.fat || 0),
      servingSize: serving.serving_description || 
                   `${serving.metric_serving_amount || '1'} ${serving.metric_serving_unit || 'serving'}`,
      brandName: food.brand_name || item.brandName || '',
    };
    return result;
  } catch (err) {
    console.error('FatSecret details error:', err);
    return null;
  }
}



