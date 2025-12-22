import React, { createContext, useContext, useState, useEffect } from 'react';
import * as crud from './Functions/crudFunctions';
import { addNutritionFromPhoto, addNutritionFromLabel, addNutritionFromBarcode, uriToBase64 } from './Functions/photoAnalysisFunctions';
import { useAuthContext } from '../Auth/AuthContext';

const NutritionContext = createContext();

export function NutritionProvider({ children }) {
  const { user } = useAuthContext();
  // Get nutrition data from AuthContext user object
  const nutritionDataFromAuth = user?.nutrition || [];
  const [nutritionData, setNutritionData] = useState(nutritionDataFromAuth);
  const [processedPhotoUris, setProcessedPhotoUris] = useState(new Set());
  const [currentlyAnalyzing, setCurrentlyAnalyzing] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Console log nutrition data source
  useEffect(() => {
    console.log('🍎 Nutrition Data Source Check:');
    console.log('📊 Total nutrition logs:', nutritionData.length);
    console.log('🗄️ Data source: Database (via AuthContext)');
    console.log('📋 Nutrition logs:', nutritionData.map(item => `${item.name} - ${item.date}`));
  }, [nutritionData]);

  // Update local state when AuthContext user changes
  useEffect(() => {
    if (user?.nutrition) {
      setNutritionData(user.nutrition);
      setLoaded(true);
    }
  }, [user?.nutrition]);

  // Wrappers for photo/label/barcode analysis (unchanged, but use addNutrition)
  const addNutritionFromPhotoWrapper = async (uri) => {
    if (!uri || !user || !user.userId) return null;
    if (processedPhotoUris.has(uri)) return null;
    setCurrentlyAnalyzing(uri);
    try {
      setProcessedPhotoUris(prev => new Set(prev).add(uri));
      return await addNutritionFromPhoto(uri, (...args) => crud.addNutrition(nutritionData, setNutritionData, user.userId, ...args));
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
      return await addNutritionFromLabel(uri, (...args) => crud.addNutrition(nutritionData, setNutritionData, user.userId, ...args));
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
      return await addNutritionFromBarcode(uri, (...args) => crud.addNutrition(nutritionData, setNutritionData, user.userId, ...args));
    } finally {
      setCurrentlyAnalyzing(null);
    }
  };

  // Utility functions for getting logs/macros (use CRUD functions)
  const getTodaysLogs = () => crud.getTodaysLogs(nutritionData);
  const getLogsForDate = (date) => crud.getLogsForDate(nutritionData, date);
  const getTodaysMacro = (macroType) => crud.getTodaysMacro(nutritionData, macroType);
  const getMacroForDate = (macroType, date) => crud.getMacroForDate(nutritionData, macroType, date);
  const getMacroForLast30Days = (macroType = "calories") => crud.getMacroForLast30Days(nutritionData, macroType);

  function resetNutritionContext() {
    setNutritionData([]);
    setProcessedPhotoUris(new Set());
    setCurrentlyAnalyzing(null);
  }

  return (
    <NutritionContext.Provider 
      value={{ 
        nutritionData,
        setNutritionData, 
        addNutrition: (name, protein, carbs, fats, calories, isPhoto = false, ingredients = []) =>
          user && user.userId
            ? crud.addNutrition(nutritionData, setNutritionData, user.userId, name, protein, carbs, fats, calories, isPhoto, ingredients)
            : null,
        deleteNutrition: (id) => (user && user.userId ? crud.deleteNutrition(nutritionData, setNutritionData, id, user.userId) : null),
        editNutrition: (id, name, protein, carbs, fats, calories, saved) => (user && user.userId ? crud.editNutrition(nutritionData, setNutritionData, id, name, protein, carbs, fats, calories, user.userId, saved) : null),
        updateIngredientsAndMacros: (id, ingredients, totalMacros) => (user && user.userId ? crud.updateIngredientsAndMacros(nutritionData, setNutritionData, id, ingredients, totalMacros, user.userId) : null),
        getTodaysMacro,
        getMacroForDate,
        getTodaysLogs,
        getLogsForDate,
        getMacroForLast30Days,
        uriToBase64,
        addNutritionFromPhoto: addNutritionFromPhotoWrapper,
        addNutritionFromLabel: addNutritionFromLabelWrapper,
        addNutritionFromBarcode: addNutritionFromBarcodeWrapper,
        currentlyAnalyzing,
        resetNutritionContext,
        loaded
      }}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutritionContext() {
  return useContext(NutritionContext);
}
