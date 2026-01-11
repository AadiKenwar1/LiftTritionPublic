import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as crud from './Functions/crudFunctions';
import { addNutritionFromPhoto, addNutritionFromLabel, addNutritionFromBarcode, uriToBase64 } from './Functions/photoAnalysisFunctions';
import { useAuthContext } from '../Auth/AuthContext';
import { STORAGE_KEYS } from '../storageKeys';

const STORAGE_KEY = STORAGE_KEYS.nutrition;

const NutritionContext = createContext();

export function NutritionProvider({ children }) {
  const { user } = useAuthContext();
  const [nutritionData, setNutritionData] = useState([]);
  const [processedPhotoUris, setProcessedPhotoUris] = useState(new Set());
  const [currentlyAnalyzing, setCurrentlyAnalyzing] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Load from AsyncStorage on mount AND when user changes (reloads after sign-in)
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        setNutritionData(data ? JSON.parse(data) : []);
        setLoaded(true);
      } catch (error) {
        console.error('Error loading nutrition data from AsyncStorage:', error);
        setNutritionData([]);
        setLoaded(true);
      }
    };
    
    if (user) {
      loadData(); // Reload when user signs in
    } else {
      setNutritionData([]);
      setLoaded(false);
    }
  }, [user]);

  // Save to AsyncStorage whenever nutritionData changes (after initial load)
  useEffect(() => {
    if (loaded && user) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nutritionData));
    }
  }, [nutritionData, loaded, user]);

  // Clear state when user signs out
  useEffect(() => {
    if (!user) {
      setNutritionData([]);
      setProcessedPhotoUris(new Set());
      setCurrentlyAnalyzing(null);
    }
  }, [user]);

  // Console log nutrition data source
  useEffect(() => {
    // Nutrition data loaded from AsyncStorage
  }, [nutritionData]);

  // Wrappers for photo/label/barcode analysis (unchanged, but use addNutrition)
  const addNutritionFromPhotoWrapper = async (uri) => {
    if (!uri || !user || !user.userId) return null;
    if (processedPhotoUris.has(uri)) return null;
    setCurrentlyAnalyzing(uri);
    try {
      setProcessedPhotoUris(prev => new Set(prev).add(uri));
      return await addNutritionFromPhoto(uri, (...args) => crud.addNutrition(nutritionData, setNutritionData, user.userId, ...args), user.userId, null);
    } finally {
      setCurrentlyAnalyzing(null);
    }
  };
  const addNutritionFromLabelWrapper = async (uri) => {
    if (!uri || !user || !user.userId) return null;
    if (processedPhotoUris.has(uri)) return null;
    setCurrentlyAnalyzing(uri);
    try {
      setProcessedPhotoUris(prev => new Set(prev).add(uri));
      return await addNutritionFromLabel(uri, (...args) => crud.addNutrition(nutritionData, setNutritionData, user.userId, ...args), user.userId, null);
    } finally {
      setCurrentlyAnalyzing(null);
    }
  };
  const addNutritionFromBarcodeWrapper = async (uri) => {
    if (!uri || !user || !user.userId) return null;
    if (processedPhotoUris.has(uri)) return null;
    setCurrentlyAnalyzing(uri);
    try {
      setProcessedPhotoUris(prev => new Set(prev).add(uri));
      return await addNutritionFromBarcode(uri, (...args) => crud.addNutrition(nutritionData, setNutritionData, user.userId, ...args), user.userId, null);
    } finally {
      setCurrentlyAnalyzing(null);
    }
  };

  // Utility functions for getting logs/macros (use CRUD functions)
  const getLogsForDate = (date) => crud.getLogsForDate(nutritionData, date);
  const getMacroForDate = (macroType, date) => crud.getMacroForDate(nutritionData, macroType, date);
  const getMacroForLast30Days = (macroType = "calories") => crud.getMacroForLast30Days(nutritionData, macroType);

  return (
    <NutritionContext.Provider 
      value={{ 
        nutritionData,
        setNutritionData, 
        addNutrition: (name, protein, carbs, fats, calories, isPhoto = false, ingredients = [], isPlaceholder = false) =>
          crud.addNutrition(nutritionData, setNutritionData, user.userId, name, protein, carbs, fats, calories, isPhoto, ingredients, isPlaceholder),
        deleteNutrition: (id) => crud.deleteNutrition(nutritionData, setNutritionData, id, user.userId),
        editNutrition: (id, name, protein, carbs, fats, calories, saved) => crud.editNutrition(nutritionData, setNutritionData, id, name, protein, carbs, fats, calories, user.userId, saved),
        updateIngredientsAndMacros: (id, ingredients, totalMacros) => crud.updateIngredientsAndMacros(nutritionData, setNutritionData, id, ingredients, totalMacros, user.userId),
        getMacroForDate,
        getLogsForDate,
        getMacroForLast30Days,
        uriToBase64,
        addNutritionFromPhoto: addNutritionFromPhotoWrapper,
        addNutritionFromLabel: addNutritionFromLabelWrapper,
        addNutritionFromBarcode: addNutritionFromBarcodeWrapper,
        currentlyAnalyzing,
        loaded
      }}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutritionContext() {
  return useContext(NutritionContext);
}
