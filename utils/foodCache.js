// utils/foodCache.js
// FatSecret API integration for food search and nutrition details

import Constants from 'expo-constants';

// Configuration
const CLIENT_ID = process.env.FATSECRET_CLIENT_ID || 
                  Constants.expoConfig?.extra?.FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET || 
                      Constants.expoConfig?.extra?.FATSECRET_CLIENT_SECRET;
const BASE_URL = 'https://platform.fatsecret.com/rest/server.api';
const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';

// Caching - Temporal Locality (1 week)
const foodSearchCache = {}; // Recently searched queries
const productDetailsCache = {}; // Recently accessed product details
const tokenCache = { accessToken: null, expiresAt: 0 };
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week (temporal locality)

// Base64 encode (correct implementation)
function base64Encode(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    
    // Fix: Check if we actually read 2 or 3 chars, not the i value
    if (b !== 0 && c !== 0) {
      // Read 3 chars, no padding needed
      result += chars.charAt((bitmap >> 6) & 63);
      result += chars.charAt(bitmap & 63);
    } else if (b !== 0) {
      // Read 2 chars, need 1 padding
      result += chars.charAt((bitmap >> 6) & 63);
      result += '=';
    } else {
      // Read 1 char, need 2 padding
      result += '=';
      result += '=';
    }
  }
  
  return result;
}

// Get OAuth 2.0 access token
async function getAccessToken() {
  // Return cached token if still valid
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('FatSecret credentials not found');
  }

  const credentials = base64Encode(`${CLIENT_ID}:${CLIENT_SECRET}`);
  
  // Minimal debug: verify encoding ends with = (correct padding)
  console.log('🔍 Base64 check:', credentials.endsWith('=') ? '✅ Correct padding' : '❌ Wrong padding');
  console.log('🔍 CLIENT_ID:', CLIENT_ID);
  console.log('🔍 CLIENT_SECRET preview:', CLIENT_SECRET.substring(0, 8) + '...');
  
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    console.error('❌ Token request failed:', response.status, responseText);
    const error = JSON.parse(responseText).error || 'Unknown error';
    throw new Error(`Token request failed: ${response.status} - ${error}`);
  }

  const data = JSON.parse(responseText);
  
  if (!data.access_token) {
    throw new Error('No access token in response');
  }

  // Cache token (refresh 10 min before expiry)
  tokenCache.accessToken = data.access_token;
  tokenCache.expiresAt = Date.now() + ((data.expires_in || 3600) - 600) * 1000;
  
  console.log('✅ Token obtained successfully');
  return data.access_token;
}

// Smart search: score results by word matches
function scoreResults(foods, searchWords) {
  return foods.map(food => {
    const foodName = food.food_name || food.food_description || '';
    const brandName = food.brand_name || '';
    const text = `${foodName} ${brandName}`.toLowerCase();
    
    const matchCount = searchWords.reduce((count, word) =>
      text.includes(word) ? count + 1 : count, 0
    );
    
    return {
      description: foodName,
      brandName: brandName,
      fdcId: food.food_id || foodName,
      isBranded: !!brandName,
      matchCount,
    };
  }).sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return a.description.localeCompare(b.description);
  });
}

// Search for foods
export async function getFoodSearchResults(query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Check cache
  const cacheKey = trimmed;
  const cached = foodSearchCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const accessToken = await getAccessToken();
    const params = new URLSearchParams({
      method: 'foods.search',
      search_expression: trimmed,
      format: 'json',
      max_results: '50',
    });

    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Search failed: ${res.status}`);
    }

    const data = await res.json();
    const foods = data.foods?.food || [];
    const searchWords = trimmed.split(/\s+/).filter(Boolean);
    
    // Score and sort results (smart searching)
    const results = scoreResults(foods, searchWords)
      .filter(item => item.description)
      .slice(0, 20);

    // Cache results
    foodSearchCache[cacheKey] = { data: results, timestamp: Date.now() };
    
    return results;
  } catch (err) {
    console.error('FatSecret search error:', err.message);
    return [];
  }
}

// Get detailed nutrition info
export async function getFoodDetails(item) {
  const barcode = item.fdcId;
  if (!barcode) return null;

  // TEMPORAL LOCALITY: Check cache first (recently accessed items)
  const cached = productDetailsCache[barcode];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const accessToken = await getAccessToken();
    const params = new URLSearchParams({
      method: 'food.get.v3',
      food_id: barcode,
      format: 'json',
    });

    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Details failed: ${res.status}`);
    }

    const data = await res.json();
    const food = data.food;

    if (!food) return null;

    const serving = food.servings?.serving?.[0] || {};

    const details = {
      name: food.food_name || food.food_description || item.description,
      fdcId: barcode,
      calories: parseFloat(serving.calories || 0),
      protein: parseFloat(serving.protein || 0),
      carbs: parseFloat(serving.carbohydrate || 0),
      fats: parseFloat(serving.fat || 0),
      servingSize: serving.serving_description || 
                   `${serving.metric_serving_amount || '1'} ${serving.metric_serving_unit || 'serving'}`,
      brandName: food.brand_name || item.brandName || '',
    };

    // TEMPORAL LOCALITY: Cache the details (recently accessed items)
    productDetailsCache[barcode] = { data: details, timestamp: Date.now() };
    
    return details;
  } catch (err) {
    console.error('FatSecret details error:', err.message);
    return null;
  }
}
