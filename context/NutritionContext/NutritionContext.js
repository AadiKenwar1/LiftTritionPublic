import { createContext, useContext, useState, useEffect } from 'react';
import * as crud from './NutritionFunctions/crudFunctions';
import { addNutritionFromPhoto, addNutritionFromLabel, addNutritionFromBarcode, uriToBase64 } from './NutritionFunctions/photoAnalysisFunctions';
import { useAuthContext } from '../AuthContextFunctions/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NutritionContext = createContext();

const PENDING_NUTRITION_KEY = 'pendingNutritionSyncs';

export function NutritionProvider({ children }) {
  const { user } = useAuthContext();
  // Get nutrition data from AuthContext user object
  const nutritionDataFromAuth = user?.nutrition || [];
  const [nutritionData, setNutritionData] = useState(nutritionDataFromAuth);
  const [pendingSyncs, setPendingSyncs] = useState([]); // HYBRID SYNC: queue for failed mutations
  const [processedPhotoUris, setProcessedPhotoUris] = useState(new Set());
  const [currentlyAnalyzing, setCurrentlyAnalyzing] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // HYBRID SYNC: Load pending syncs from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(PENDING_NUTRITION_KEY).then(data => {
      if (data) {
        console.log('[HYBRID SYNC][Nutrition] Loaded pendingSyncs from storage:', data);
        setPendingSyncs(JSON.parse(data));
      } else {
        console.log('[HYBRID SYNC][Nutrition] No pendingSyncs found in storage.');
      }
    });
  }, []);

  // HYBRID SYNC: Persist pendingSyncs to AsyncStorage whenever it changes
  useEffect(() => {
    console.log('[HYBRID SYNC][Nutrition] Saving pendingSyncs to storage:', pendingSyncs);
    AsyncStorage.setItem(PENDING_NUTRITION_KEY, JSON.stringify(pendingSyncs));
  }, [pendingSyncs]);

  // HYBRID SYNC: Background retry loop for pending syncs
  useEffect(() => {
    const interval = setInterval(() => {
      if (!user || !user.userId) return;
      if (pendingSyncs.length === 0) return;
      // Assume isOnline is always true for simplicity; replace with real check if available
      const { type, data } = pendingSyncs[0];
      console.log(`[HYBRID SYNC][Nutrition] Attempting to sync pending mutation:`, pendingSyncs[0]);
      let mutationPromise;
      if (type === 'add') {
        mutationPromise = crud.addNutrition(nutritionData, setNutritionData, user.userId, ...data, { skipOptimistic: true });
      } else if (type === 'edit') {
        mutationPromise = crud.editNutrition(setNutritionData, ...data, user.userId, undefined, { skipOptimistic: true });
      } else if (type === 'delete') {
        mutationPromise = crud.deleteNutrition(setNutritionData, ...data, user.userId, { skipOptimistic: true });
      } else {
        mutationPromise = Promise.resolve();
      }
      mutationPromise
        .then(() => {
          console.log('[HYBRID SYNC][Nutrition] Mutation synced successfully, removing from queue:', pendingSyncs[0]);
          setPendingSyncs(prev => prev.slice(1));
        })
        .catch(error => {
          console.error('[HYBRID SYNC][Nutrition] Error syncing mutation:', error, pendingSyncs[0]);
          // Permanent error detection (example: validation, schema)
          if (error && error.message && (error.message.includes('validation') || error.message.includes('schema'))) {
            console.warn('[HYBRID SYNC][Nutrition] Permanent error, removing from queue:', pendingSyncs[0]);
            setPendingSyncs(prev => prev.slice(1));
            // Optionally: alert user
          }
          // Otherwise, leave in queue for next retry
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [pendingSyncs, user]);

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
        deleteNutrition: (id) => (user && user.userId ? crud.deleteNutrition(setNutritionData, id, user.userId)
          .catch(error => {
            console.warn('[HYBRID SYNC][Nutrition] deleteNutrition failed, queueing mutation:', id, error);
            setPendingSyncs(prev => [...prev, { type: 'delete', data: [id] }]);
          }) : null),
        editNutrition: (id, name, protein, carbs, fats, calories, saved) => (user && user.userId ? crud.editNutrition(setNutritionData, id, name, protein, carbs, fats, calories, user.userId, saved)
          .catch(error => {
            console.warn('[HYBRID SYNC][Nutrition] editNutrition failed, queueing mutation:', [id, name, protein, carbs, fats, calories, saved], error);
            setPendingSyncs(prev => [...prev, { type: 'edit', data: [id, name, protein, carbs, fats, calories, saved] }]);
          }) : null),
        updateIngredientsAndMacros: (id, ingredients, totalMacros) => (user && user.userId ? crud.updateIngredientsAndMacros(setNutritionData, id, ingredients, totalMacros, user.userId) : null),
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
