// theme/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateKey } from '../../utils/date';
import { useAuthContext } from '../Auth/AuthContext';
import { STORAGE_KEYS } from '../storageKeys';


const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const { user } = useAuthContext();
    
    // Get settings from AuthContext user object
    const settings = user?.settings || {};
    
    /**
     * MODES
     * - Lift Mode
     * - Macro Mode
     */
    const [mode, setMode] = useState(settings.mode ?? true);
    const toggleMode = () => {
        setMode((prev) => !prev);
    };

    /**
     * UNITS
     * - Imperial (lb and in) - true
     * - Metric (kg and cm) - false
     */
    const [unit, setUnits] = useState(settings.unit ?? true);

    /**
     * PERSONAL INFORMATION
     * - Birth date
     * - Gender (male, female, other)
     * - Body Weight - line chart
     * - Height - double scroll
     */
    const [birthDate, setBirthDate] = useState(settings.birthDate ?? null);
    const [age, setAge] = useState(settings.age ?? 19);
    const [gender, setGender] = useState(settings.gender ?? 'male');
    const [bodyWeight, setBodyWeight] = useState(settings.bodyWeight ?? 150);
    const [weightProgress, setWeightProgress] = useState([]);
    const [weightProgressLoaded, setWeightProgressLoaded] = useState(false);
    const [height, setHeight] = useState(settings.height ?? 60);

    /**GOAL WEIGHTS
     * - goalType: lose, maintain, gain
     * - goalWeight
     * - goalPace: how fast we want to achive goalWeight
     */
    const [goalType, setGoalType] = useState(settings.goalType ?? 'maintain'); // lose, maintain, gain
    const [goalWeight, setGoalWeight] = useState(settings.goalWeight ?? settings.bodyWeight ?? 150);
    const [goalPace, setGoalPace] = useState(settings.goalPace ?? 1.0);

    const [lastExercise, setLastExercise] = useState("");


    /**
     * CENTRALIZED WEIGHT UPDATE FUNCTION
     * Updates both bodyWeight and weightProgress with new weight entry
     */
    const updateWeight = async (newWeight) => {
        if (!isNaN(newWeight) && newWeight > 0) {
            setBodyWeight(newWeight);
            
            const dateKey = getLocalDateKey();
            
            // Read from AsyncStorage first (source of truth), update it, save it, then update state
            try {
                const data = await AsyncStorage.getItem(STORAGE_KEYS.weightProgress);
                const currentArray = data ? JSON.parse(data) : [];
                
                // Find or add entry for today
                const existingIndex = currentArray.findIndex(entry => entry.label === dateKey);
                let updatedArray;
                
                if (existingIndex !== -1) {
                    // Update existing entry
                    updatedArray = [...currentArray];
                    updatedArray[existingIndex] = { label: dateKey, value: newWeight };
                } else {
                    // Add new entry for today DO NOT CHANGE THIS
                    updatedArray = [{ label: dateKey, value: newWeight }, ...currentArray];
                }
                
                // Save to AsyncStorage (await ensures it's saved before returning)
                await AsyncStorage.setItem(STORAGE_KEYS.weightProgress, JSON.stringify(updatedArray));
                
                // Update state with what we saved
                setWeightProgress(updatedArray);
                setWeightProgressLoaded(true);
            } catch (error) {
                console.error('Error updating weightProgress:', error);
            }
        }
    };

    /**
     * FORMAT WEIGHT CHART FUNCTION
     * Fills in gaps between logged dates with the last known weight
     * Creates a continuous line from first logged date to today
     */
    const formatWeightChart = () => {
        if (!weightProgress || weightProgress.length === 0) {
            return [];
        }
        
        // Sort by date (oldest first)
        const sortedProgress = [...weightProgress].sort((a, b) => new Date(a.label) - new Date(b.label));
        
        const oldestDateKey = sortedProgress[0].label;
        const todayDateKey = getLocalDateKey();
        
        // Create a map for quick lookup of logged weights
        const weightMap = new Map();
        sortedProgress.forEach(entry => {
            weightMap.set(entry.label, entry.value);
        });
        
        const result = [];
        let lastWeight = sortedProgress[0].value;
        
        // Convert date strings to Date objects for iteration
        const oldestDate = new Date(oldestDateKey + 'T00:00:00');
        const todayDate = new Date(todayDateKey + 'T00:00:00');
        const currentDate = new Date(oldestDate);
        
        // Iterate from oldest logged date to today (inclusive)
        while (currentDate <= todayDate) {
            const dateKey = getLocalDateKey(currentDate);
            
            // If we have a logged weight for this date, use it and update lastWeight
            if (weightMap.has(dateKey)) {
                lastWeight = weightMap.get(dateKey);
            }
            
            // Format label to short format (MM/DD) to match other charts
            const [year, month, day] = dateKey.split("-");
            const shortLabel = `${month}/${day}`;
            
            // Add this date with the current lastWeight (either logged or carried forward)
            result.push({
                label: shortLabel,  // Use short format instead of full dateKey
                value: lastWeight
            });
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return result;
    };

    /**
     * TRAINING FREQUENCIES to ACTIVITY FACTORS
     * - 0 = 1.2
     * - 1 to 2 times a week = 1.375
     * - 3 to 4 times a week = 1.55
     * - 5+ times a week = 1.725
     */
    const [activityFactor, setActivityFactor] = useState(settings.activityFactor ?? 1.2);

    /**
     * MACRONUTRIENT GOALS
     * - Calories
     *   Mifflin-St Jeor Equation
     *   - BMR Male = 10W + 6.25H - 5A + 5 * activityFactor
     *   - BMR Female = 10W + 6.25H - 5A - 161 * activityFactor
     *   - BMR Other = 10W + 6.25H - 5A - 78 * activityFactor
     * - Protein = 0.8 × bodyWeight (lb) → 4 kcal/g
     * - Fats = 27.5% of calories → 9 kcal/g
     * - Carbs = remaining calories → 4 kcal/g
     */
    const [calorieGoal, setCalorieGoal] = useState(settings.calorieGoal ?? 0);
    const [proteinGoal, setProteinGoal] = useState(settings.proteinGoal ?? 0);
    const [carbsGoal, setCarbsGoal] = useState(settings.carbsGoal ?? 0);
    const [fatsGoal, setFatsGoal] = useState(settings.fatsGoal ?? 0);

    function calculateMacros(
        currentBodyWeight = bodyWeight,
        currentGoalWeight = goalWeight,
        currentActivityFactor = activityFactor,
        currentAge = age,
        currentGender = gender,
        currentHeight = height,
        currentGoalPace = goalPace,
        currentUnit = unit
    ) {
        // Convert to imperial units for calculations (formula expects lbs and inches)
        if (!currentUnit) { // If metric, convert to imperial
            currentBodyWeight = currentBodyWeight * 2.20462; // kg to lbs
            currentHeight = currentHeight / 2.54; // cm to inches
            currentGoalWeight = currentGoalWeight * 2.20462; // kg to lbs
            currentGoalPace = currentGoalPace * 2.20462; // kg/week to lbs/week
        }
        
        // Base calculation using converted values (Mifflin-St Jeor Equation)
        let calResult = 0;
        if (currentGender === 'male') {
            calResult =
                (4.536 * currentBodyWeight + 15.88 * currentHeight - 5 * currentAge + 5) *
                currentActivityFactor;
        } else if (currentGender === 'female') {
            calResult =
                (4.536 * currentBodyWeight + 15.88 * currentHeight - 5 * currentAge - 161) *
                currentActivityFactor;
        } else {
            calResult =
                (4.536 * currentBodyWeight + 15.88 * currentHeight - 5 * currentAge - 78) *
                currentActivityFactor;
        }

        // Adjust calories based on goal type and desired pace
        // 1 lb = 3500 calories, so weekly deficit = pace * 3500
        if(currentBodyWeight > currentGoalWeight){
            const weeklyDeficit = currentGoalPace * 3500;
            calResult -= weeklyDeficit / 7; // Daily deficit
        }

        if(currentBodyWeight < currentGoalWeight){
            const weeklySurplus = currentGoalPace * 3500;
            calResult += weeklySurplus / 7; // Daily surplus
        }
        
        // For 'maintain', no adjustment needed

        // Protein calculation with progressive adjustments
        let proteinMultiplier = 0.55; // Base multiplier (g/lb)
        
        // Add protein based on training frequency
        if (currentActivityFactor === 1.2) {
            proteinMultiplier += 0.1; // 0 times a week (sedentary)
        } else if (currentActivityFactor === 1.375) {
            proteinMultiplier += 0.2; // 1-2 times a week (light activity)
        } else if (currentActivityFactor === 1.55) {
            proteinMultiplier += 0.3; // 3-4 times a week (moderate activity)
        } else if (currentActivityFactor === 1.725) {
            proteinMultiplier += 0.4; // 5+ times a week (very active)
        }
        
        // Add extra protein for weight loss goals
        if (currentBodyWeight > currentGoalWeight) {
            proteinMultiplier += 0.1;
        }
        
        // Cap protein at 1.0g/lb (diminishing returns above this)
        proteinMultiplier = Math.min(proteinMultiplier, 1.1);
        
        // Use converted weight (already in lbs at this point)
        const proteinGrams = currentBodyWeight * proteinMultiplier;
        const proteinKcal = proteinGrams * 4;

        // Fat calculation based on goal type (determined by weight comparison)
        let fatMultiplier;
        if (currentBodyWeight > currentGoalWeight) {
            // Cutting: lower fat to prioritize carbs for performance
            fatMultiplier = 0.3;
        } else if (currentBodyWeight < currentGoalWeight) {
            // Gaining: higher fat is fine when calories are higher
            fatMultiplier = 0.4;
        } else {
            // Maintaining: middle ground
            fatMultiplier = 0.35;
        }
        
        const fatGrams = currentBodyWeight * fatMultiplier;
        const fatKcal = fatGrams * 9;

        // Carb calculation (remaining calories)
        const carbKcal = calResult - proteinKcal - fatKcal;
        const carbGrams = carbKcal / 4;

        return {calResult, proteinGrams, fatGrams, carbGrams};
    }

    function setNutritionGoals(calResult, proteinGrams, fatGrams, carbGrams){
        setCalorieGoal(Math.round(calResult));
        setProteinGoal(Math.round(proteinGrams));
        setFatsGoal(Math.round(fatGrams));
        setCarbsGoal(Math.round(carbGrams));
    }

    function resetSettings(){
        setWeightProgress([]);
    }

    const [loaded, setLoaded] = useState(false);

    // Load weightProgress from AsyncStorage on mount AND when user changes (reloads after sign-in)
    useEffect(() => {
        const loadWeightProgress = async () => {
            try {
                const data = await AsyncStorage.getItem(STORAGE_KEYS.weightProgress);
                setWeightProgress(data ? JSON.parse(data) : []);
                setWeightProgressLoaded(true);
            } catch (error) {
                console.error('Error loading weightProgress from AsyncStorage:', error);
                setWeightProgress([]);
                setWeightProgressLoaded(true);
            }
        };
        
        if (user) {
            loadWeightProgress(); // Reload when user signs in
        } else {
            setWeightProgress([]);
            setWeightProgressLoaded(false);
        }
    }, [user]);

    // Save to AsyncStorage whenever weightProgress changes (after initial load)
    useEffect(() => {
        if (weightProgressLoaded && user) {
            AsyncStorage.setItem(STORAGE_KEYS.weightProgress, JSON.stringify(weightProgress));
        }
    }, [weightProgress, weightProgressLoaded, user]);

    // Update local state when AuthContext user changes
    useEffect(() => {
        if (user?.settings) {
            const s = user.settings;
            setMode(s.mode ?? true);
            setUnits(s.unit ?? true);
            setBirthDate(s.birthDate ?? null);
            setAge(s.age ?? 19);
            setGender(s.gender ?? 'male');
            setBodyWeight(s.bodyWeight ?? 150);
            setHeight(s.height ?? 60);
            setGoalType(s.goalType ?? 'maintain');
            setGoalWeight(s.goalWeight ?? s.bodyWeight ?? 150);
            setGoalPace(s.goalPace ?? 1.0);
            setActivityFactor(s.activityFactor ?? 1.2);
            setCalorieGoal(s.calorieGoal ?? 0);
            setProteinGoal(s.proteinGoal ?? 0);
            setCarbsGoal(s.carbsGoal ?? 0);
            setFatsGoal(s.fatsGoal ?? 0);
            setLoaded(true);
        } else {
            setWeightProgress([]);
            setWeightProgressLoaded(false);
        }
    }, [user?.settings]);

    // Update cached user data whenever settings change (works offline)
    useEffect(() => {
        if (!loaded) return;
        if (!user) return; // Don't update cache if user is null (signing out/deleting account)
        
        async function updateCache() {
            try {
                const { cacheUserData } = await import('../Auth/sessionStorage');
                const updatedSettings = {
                    id: user.userId,
                    mode,
                    unit,
                    birthDate,
                    age,
                    gender,
                    bodyWeight,
                    // weightProgress removed - now stored in AsyncStorage
                    height,
                    goalType,
                    goalWeight,
                    goalPace,
                    activityFactor,
                    calorieGoal,
                    proteinGoal,
                    carbsGoal,
                    fatsGoal,
                    lastExercise,
                };
                
                const updatedUser = {
                    ...user,
                    settings: { ...user.settings, ...updatedSettings }
                };
                
                await cacheUserData(updatedUser);
            } catch (e) {
                console.error('[SettingsContext] Error updating cached user data:', e);
            }
        }
        updateCache();
    }, [
        mode,
        unit,
        birthDate,
        age,
        gender,
        bodyWeight,
        // weightProgress removed - now stored in AsyncStorage
        height,
        goalType,
        goalWeight,
        goalPace,
        activityFactor,
        calorieGoal,
        proteinGoal,
        carbsGoal,
        fatsGoal,
        lastExercise,
        loaded,
        user,
    ]);

    return (
        <SettingsContext.Provider
            value={{
                mode,
                setMode,
                toggleMode,
                unit,
                setUnits,
                birthDate,
                setBirthDate,
                age,
                setAge,
                gender,
                setGender,
                bodyWeight,
                setBodyWeight,
                weightProgress,
                setWeightProgress,
                height,
                setHeight,
                activityFactor,
                setActivityFactor,
                calorieGoal,
                setCalorieGoal,
                proteinGoal,
                setProteinGoal,
                fatsGoal,
                setFatsGoal,
                carbsGoal,
                setCarbsGoal,
                calculateMacros,
                setNutritionGoals,
                goalType,
                setGoalType,
                goalWeight,
                setGoalWeight,
                goalPace,
                setGoalPace,
                updateWeight,
                formatWeightChart,
                resetSettings,
                lastExercise,
                setLastExercise,
                loaded,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
