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
import NetInfo from '@react-native-community/netinfo';
import { useAuthContext } from '../../context/Auth/AuthContext';
import { useSettings } from '../../context/Settings/SettingsContext';
import WiFiStatusBanner from '../../components/WiFiStatusBanner';

export default function OnboardingScreen12() {
  const navigation = useNavigation();
  const route = useRoute();
  const { markOnboardingCompleted, user } = useAuthContext();
  const { calculateMacros, updateWeight } = useSettings();
  
  // Get all onboarding data from previous screens
  const { birthDate, age, gender, height, weight, unit, activityFactor, goalType, goalWeight, goalPace } = route.params || {};
  
  const [calculatedMacros, setCalculatedMacros] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // Check network connectivity
  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    // Listen for network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);


  // Calculate macros when we get to this onboarding screen
  useEffect(() => {
    if (weight && height && age && activityFactor) {
      const macroResult = calculateMacros(weight, goalWeight || weight, activityFactor, age, gender || 'male', height, goalPace, unit);
      const macros = {
        calories: Math.round(macroResult.calResult),
        protein: Math.round(macroResult.proteinGrams),
        fats: Math.round(macroResult.fatGrams),
        carbs: Math.round(macroResult.carbGrams)
      };
      setCalculatedMacros(macros);
    }
  }, [weight, height, age, activityFactor, goalType, goalWeight, goalPace, unit]);

  // Watch for onboardingCompleted to become true, then navigate
  // This ensures the navigation structure has updated before we try to navigate
  useEffect(() => {
    if (user?.settings?.onboardingCompleted) {
      // Navigation structure has updated, now we can navigate safely
      navigation.replace('Tabs');
    }
  }, [user?.settings?.onboardingCompleted, navigation]);

  //Since this is the onboarding screen, we need to mark the onboarding as completed and save the data to the database
  async function handleNext(){
    // Check network connectivity before proceeding
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please connect to the internet to complete onboarding.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const onboardingData = {
        birthDate,
        age,
        gender,
        height,
        weight,
        unit,
        activityFactor,
        goalType,
        goalWeight,
        goalPace,
        calculatedMacros
      };

      // Update weight first (before markOnboardingCompleted to avoid race condition)
      await updateWeight(weight);

      const result = await markOnboardingCompleted(onboardingData);
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to complete onboarding');
        return;
      }
      // Navigation will be handled by useEffect when onboardingCompleted becomes true
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.errorBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WiFiStatusBanner />
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Ionicons name="calculator-outline" size={28} color="#00B8A9"/>
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextButton, !isConnected && styles.disabledButton]} 
            onPress={handleNext}
            disabled={!isConnected}
          >
            <Text style={[styles.nextButtonText, !isConnected && styles.disabledButtonText]}>
              Finish
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Inter_400Regular',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  headerIcon: {
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'Inter_800ExtraBold',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    maxWidth: 320,
    fontFamily: 'Inter_400Regular',
    opacity: 0.9,
  },
  caloriesCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  caloriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  caloriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
    fontFamily: 'Inter_700Bold',
  },
  caloriesValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 5,
    fontFamily: 'Inter_700Bold',
  },
  caloriesUnit: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  caloriesDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
    maxWidth: 320,
    gap: 12,
  }, 
  macroCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
    alignItems: 'center',
  },
  macroCardFirst: {
    marginLeft: 0,
  },
  macroCardLast: {
    marginRight: 0,
  },
  macroIcon: {
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  macroLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macroCalories: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    fontFamily: 'Inter_400Regular',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 0.3,
    borderColor: '#00B8A9',
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  infoText: {
    fontSize: 13,
    color: '#00B8A9',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    marginTop: 20,
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
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'Inter_600SemiBold',
  },
  errorBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  nextButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  disabledButton: {
    backgroundColor: '#888888',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#CCCCCC',
  },
});