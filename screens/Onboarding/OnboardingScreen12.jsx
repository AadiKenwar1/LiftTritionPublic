import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function OnboardingScreen12() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get all onboarding data from previous screens
  const { birthDate, age, height, weight, unit, activityFactor, goalType, goalWeight, goalPace } = route.params || {};
  
  const [calculatedMacros, setCalculatedMacros] = useState(null);

  // Calculate macros using the same logic as SettingsContext
  const calculateMacros = () => {
    // Base calculation using Mifflin-St Jeor Equation
    let calResult = 0;
    const gender = 'male'; // Default for now, could be added to onboarding later
    
    if (gender === 'male') {
      calResult = (4.536 * weight + 15.88 * height - 5 * age + 5) * activityFactor;
    } else if (gender === 'female') {
      calResult = (4.536 * weight + 15.88 * height - 5 * age - 161) * activityFactor;
    } else {
      calResult = (4.536 * weight + 15.88 * height - 5 * age - 78) * activityFactor;
    }

    // Adjust calories based on goal type and desired pace
    if (goalType === 'lose') {
      const weeklyDeficit = goalPace * 3500;
      calResult -= weeklyDeficit / 7;
    } else if (goalType === 'gain') {
      const weeklySurplus = goalPace * 3500;
      calResult += weeklySurplus / 7;
    }

    // Protein calculation with progressive adjustments
    let proteinMultiplier = 0.8;
    
    // Add protein based on training frequency
    if (activityFactor === 1.2) {
      proteinMultiplier += 0.1;
    } else if (activityFactor === 1.375) {
      proteinMultiplier += 0.2;
    } else if (activityFactor === 1.55) {
      proteinMultiplier += 0.3;
    } else if (activityFactor === 1.725) {
      proteinMultiplier += 0.4;
    }
    
    // Add extra protein for weight loss goals
    if (goalType === 'lose') {
      proteinMultiplier += 0.1;
    }
    
    // Convert weight to pounds if in metric mode for protein calculation
    let weightForProtein = goalWeight ? goalWeight : weight;
    if (!unit) { // If metric (kg), convert to lbs
      weightForProtein = weightForProtein * 2.20462;
    }
    
    const proteinGrams = weightForProtein * proteinMultiplier;
    const proteinKcal = proteinGrams * 4;

    // Fat calculation (27.5% of total calories)
    const fatKcal = calResult * 0.275;
    const fatGrams = fatKcal / 9;

    // Carb calculation (remaining calories)
    const carbKcal = calResult - proteinKcal - fatKcal;
    const carbGrams = carbKcal / 4;

    return {
      calories: Math.round(calResult),
      protein: Math.round(proteinGrams),
      fats: Math.round(fatGrams),
      carbs: Math.round(carbGrams)
    };
  };

  // Calculate macros when component mounts
  useEffect(() => {
    if (weight && height && age && activityFactor) {
      const macros = calculateMacros();
      setCalculatedMacros(macros);
    }
  }, [weight, height, age, activityFactor, goalType, goalWeight, goalPace]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // Pass all data including calculated macros to the signup screen
    navigation.navigate('Signup', {
      onboardingData: {
        birthDate,
        age,
        height,
        weight,
        unit,
        activityFactor,
        goalType,
        goalWeight,
        goalPace,
        calculatedMacros
      }
    });
  };

  // Show loading or error if data is missing
  if (!calculatedMacros || !weight || !height) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#E53E3E" />
          <Text style={styles.errorText}>
            Unable to calculate macros. Please complete all previous steps.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Ionicons name="calculator-outline" size={28} color="#00B8A9" />
          </View>
          <Text style={styles.headerTitle}>Your Personalized Plan</Text>
          <Text style={styles.headerSubtitle}>
            Based on your goals and profile, here are your daily macro targets
          </Text>
        </View>

        {/* Total Calories Card */}
        <View style={styles.caloriesCard}>
          <View style={styles.caloriesHeader}>
            <Ionicons name="flame-outline" size={24} color="#FF9500" />
            <Text style={styles.caloriesTitle}>Daily Calories</Text>
          </View>
          <Text style={styles.caloriesValue}>{calculatedMacros.calories}</Text>
          <Text style={styles.caloriesUnit}>kcal</Text>
          <Text style={styles.caloriesDescription}>
            Your daily energy target for {goalType === 'maintain' ? 'maintaining' : goalType === 'lose' ? 'losing' : 'gaining'} weight
            {goalType !== 'maintain' && ` at ${goalPace.toFixed(1)} ${unit ? 'lbs' : 'kg'}/week`}
          </Text>
        </View>

        {/* Macros Grid */}
        <View style={styles.macrosGrid}>
          {/* Protein */}
          <View style={[styles.macroCard, styles.macroCardFirst]}>
            <View style={styles.macroIcon}>
              <MaterialCommunityIcons name="food-steak" size={20} color="#E53E3E" />
            </View>
            <Text style={styles.macroValue}>{calculatedMacros.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroCalories}>
              {calculatedMacros.protein * 4} kcal
            </Text>
          </View>

          {/* Carbs */}
          <View style={styles.macroCard}>
            <View style={styles.macroIcon}>
              <MaterialCommunityIcons name="bread-slice-outline" size={20} color="#FF9500" />
            </View>
            <Text style={styles.macroValue}>{calculatedMacros.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroCalories}>
              {calculatedMacros.carbs * 4} kcal
            </Text>
          </View>

          {/* Fats */}
          <View style={[styles.macroCard, styles.macroCardLast]}>
            <View style={styles.macroIcon}>
              <MaterialCommunityIcons name="peanut-outline" size={20} color="#4CD964" />
            </View>
            <Text style={styles.macroValue}>{calculatedMacros.fats}g</Text>
            <Text style={styles.macroLabel}>Fats</Text>
            <Text style={styles.macroCalories}>
              {calculatedMacros.fats * 9} kcal
            </Text>
          </View>
        </View>



        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color="#00B8A9" />
          <Text style={styles.infoText}>
            These targets will help you reach your goals. You can adjust them later in Settings.
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="#666666" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    maxWidth: 280,
  },
  caloriesCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  caloriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  caloriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  caloriesValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 5,
  },
  caloriesUnit: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 8,
  },
  caloriesDescription: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
    maxWidth: 350,
  }, 
  macroCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignItems: 'center',
  },
  macroCardFirst: {
    marginLeft: 0,
  },
  macroCardLast: {
    marginRight: 0,
  },
  macroIcon: {
    marginBottom: 6,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 3,
    fontWeight: '600',
  },
  macroCalories: {
    fontSize: 10,
    color: '#999999',
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00B8A9',
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#00B8A9',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  nextButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: '#00B8A9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});