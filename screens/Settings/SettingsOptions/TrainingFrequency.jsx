// screens/TrainingFrequencyScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CustomHeader from '../../../components/CustomHeader';
import { useSettings } from '../../../context/Settings/SettingsContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const frequencyOptions = [
  { label: '0 times a week', value: 1.2 },
  { label: '1–2 times a week', value: 1.375 },
  { label: '3–4 times a week', value: 1.55 },
  { label: '5+ times a week', value: 1.725 },
];

export default function TrainingFrequencyScreen() {
  const { 
    activityFactor, 
    setActivityFactor,
    bodyWeight,
    goalWeight,
    age,
    gender,
    height,
    goalPace,
    unit,
    calculateMacros,
    setNutritionGoals
  } = useSettings();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get the parameter to know where the route comes from
  const { comingFrom } = route.params || {};
  
  // Local state for selected frequency (not saved until button is pressed)
  const [selectedFrequency, setSelectedFrequency] = useState(activityFactor);
  
  // Handle updating the training frequency and recalculating macros
  const handleUpdateFrequency = () => {
    // Update activity factor
    setActivityFactor(selectedFrequency);
    
    // Recalculate macros with the new activity factor
    if (bodyWeight && height && age) {
      const { calResult, proteinGrams, fatGrams, carbGrams } = calculateMacros(
        bodyWeight,
        goalWeight || bodyWeight,
        selectedFrequency, // Use the new selected frequency
        age,
        gender,
        height,
        goalPace,
        unit
      );
      
      // Set the new nutrition goals
      setNutritionGoals(
        calResult,
        proteinGrams,
        fatGrams,
        carbGrams
      );
    }
    
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Training Frequency" showBack />
      
      <View style={styles.content}>
        <Text style={styles.title}>How Often Are You Lifting?</Text>
        <Text style={styles.description}>
          Your training frequency is used to calculate fatigue and nutrition goals.
        </Text>

        
        
        {frequencyOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              selectedFrequency === option.value && styles.selectedOption,
            ]}
            onPress={() => setSelectedFrequency(option.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                selectedFrequency === option.value && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Update Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.updateButton} 
            onPress={handleUpdateFrequency}
          >
            <Ionicons name="checkmark-outline" size={20} color="#fff" />
            <Text style={styles.updateButtonText}>UPDATE TRAINING FREQUENCY</Text>
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
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  suggestionBox: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEB3B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    marginHorizontal: 4,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0066CC',
    textDecorationLine: 'underline',
  },
  option: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 0.3,
    borderColor: 'grey',
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    minHeight: 64,
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#1A1A1A',
    borderColor: '#00B8A9',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 17,
    color: 'white',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#00B8A9',
    fontFamily: 'Inter_600SemiBold',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  updateButton: {
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
  updateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    marginLeft: 10,
  },
});