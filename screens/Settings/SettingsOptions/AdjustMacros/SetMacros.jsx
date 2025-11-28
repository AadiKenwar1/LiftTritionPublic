import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSettings } from '../../../../context/Settings/SettingsContext';
import CustomHeader from '../../../../components/CustomHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function SetMacrosScreen() {
  // Get settings functions from context
  const {
    setNutritionGoals,
    updateWeight,
    setGoalWeight,
    setGoalPace,
  } = useSettings();
  
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get calculated macros and form data from previous screen
  const { 
    calculatedMacros, 
    formData 
  } = route.params || {};

  // Apply macros to context and show success message
  const handleConfirmSetMacros = () => {
    // Update context with form data
    updateWeight(formData.bodyWeight);
    setGoalWeight(formData.goalWeight);
    setGoalPace(formData.goalPace);
    
    // Set macro goals in context
    setNutritionGoals(
      calculatedMacros.calories,
      calculatedMacros.protein,
      calculatedMacros.fats,
      calculatedMacros.carbs
    );
    
    // Show success message and return to main tabs
    Alert.alert(
      'Macros Set Successfully!', 
      'Your macro goals have been updated.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Tabs')
        }
      ]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Show error if no data received
  if (!calculatedMacros || !formData) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Set Macros" showBack />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff3b30" />
          <Text style={styles.errorText}>
            No macro data found. Please go back and calculate macros first.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Set Macros" showBack />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}


        {/* Total Calories Card */}
        <View style={styles.caloriesCard}>
          <View style={styles.caloriesHeader}>
            <Ionicons name="flame-outline" size={24} color="#FF9500" />
            <Text style={styles.caloriesTitle}>Daily Calories</Text>
          </View>
          <Text style={styles.caloriesValue}>{calculatedMacros.calories}</Text>
          <Text style={styles.caloriesUnit}>kcal</Text>
          <Text style={styles.caloriesDescription}>
            Your daily energy target for {formData.goalType === 'maintain' ? 'maintaining' : formData.goalType === 'lose' ? 'losing' : 'gaining'} weight
            {formData.goalType !== 'maintain' && ` at ${formData.goalPace.toFixed(1)} ${formData.unit ? 'lbs' : 'kg'}/week`}
          </Text>
        </View>

        {/* Macros Grid */}
        <View style={styles.macrosGrid}>
          {/* Protein */}
          <View style={[styles.macroCard, styles.macroCardFirst]}>
            <View style={styles.macroIcon}>
              <MaterialCommunityIcons name="food-steak" size={20} color="#FF3B30" />
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

        {/* Settings Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Settings</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Current Weight</Text>
              <Text style={styles.summaryValue}>{formData.bodyWeight} {formData.unit ? 'lbs' : 'kg'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Goal Weight</Text>
              <Text style={styles.summaryValue}>{formData.goalWeight} {formData.unit ? 'lbs' : 'kg'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Goal Type</Text>
              <Text style={styles.summaryValue}>{formData.goalType}</Text>
            </View>
            {formData.goalType !== 'maintain' && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Weekly Pace</Text>
                <Text style={styles.summaryValue}>{formData.goalPace.toFixed(1)} {formData.unit ? 'lbs' : 'kg'}/week</Text>
              </View>
            )}
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Training</Text>
              <Text style={styles.summaryValue}>
                {(() => {
                  const frequencyOptions = [
                    { label: '0 times/week', value: 1.2 },
                    { label: '1–2 times/week', value: 1.375 },
                    { label: '3–4 times/week', value: 1.55 },
                    { label: '5+ times/week', value: 1.725 },
                  ];
                  const currentOption = frequencyOptions.find(option => option.value === formData.activityFactor);
                  return currentOption ? currentOption.label : 'Not set';
                })()}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmSetMacros}
          >
            <Ionicons name="checkmark-outline" size={20} color="#fff" />
            <Text style={styles.confirmButtonText}>SET MACROS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  caloriesCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  caloriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  caloriesTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: 'white',
    marginLeft: 8,
  },
  caloriesValue: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: '#00B8A9',
    marginBottom: 5,
    fontWeight: '600',
  },
  caloriesUnit: {
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  caloriesDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  }, 
  macroCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    alignItems: 'center',
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  macroCardFirst: {
    marginLeft: 0,
  },
  macroCardLast: {
    marginRight: 0,
  },
  macroIcon: {
    marginBottom: 10,
  },
  macroValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#00B8A9',
    marginBottom: 5,
    fontWeight: '600',
  },
  macroLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginBottom: 5,
  },
  macroCalories: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: 'white',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '48%', // Two columns
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#00B8A9',
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },

  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    marginLeft: 10,
  },
});

