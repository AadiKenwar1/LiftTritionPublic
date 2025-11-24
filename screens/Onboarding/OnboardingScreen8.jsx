import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Flag } from 'lucide-react-native';

export default function OnboardingScreen8() {
  const navigation = useNavigation();
  const route = useRoute();
  const { birthDate, age, gender, height, weight, unit, activityFactor } = route.params || {};
  
  const [goalType, setGoalType] = useState('maintain');
  const [goalWeight, setGoalWeight] = useState(weight?.toString() || '');
  const [isValidGoal, setIsValidGoal] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const goalOptions = ['lose', 'maintain', 'gain'];

  // Function to validate goal weight and return error message
  const validateGoalWeight = (value, type) => {
    if (type === 'maintain') return { isValid: true, errorMessage: '' };
    if (!value || value.trim() === '') return { isValid: false, errorMessage: 'Please enter your target weight' };
    
    const goalWeightNum = parseFloat(value);
    const currentWeight = parseFloat(weight);
    
    if (isNaN(goalWeightNum)) return { isValid: false, errorMessage: 'Please enter a valid number' };
    if (goalWeightNum <= 0) return { isValid: false, errorMessage: 'Weight must be greater than 0' };
    
    if (type === 'gain' && goalWeightNum <= currentWeight) {
      return { isValid: false, errorMessage: `Target weight must be greater than ${currentWeight} ${unit ? 'lbs' : 'kg'}` };
    }
    if (type === 'lose' && goalWeightNum >= currentWeight) {
      return { isValid: false, errorMessage: `Target weight must be less than ${currentWeight} ${unit ? 'lbs' : 'kg'}` };
    }
    
    return { isValid: true, errorMessage: '' };
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    if (!isValidGoal) return;

    const goalWeightNum = parseFloat(goalWeight) || weight;

    // Store all data collected so far
    navigation.navigate('Onboarding10', {
      birthDate,
      age,
      gender,
      height,
      weight,
      unit,
      activityFactor,
      goalType,
      goalWeight: goalWeightNum
    });
  };

  // Handle goal type change
  const handleGoalTypeChange = (type) => {
    setGoalType(type);
    const validation = validateGoalWeight(goalWeight, type);
    setIsValidGoal(validation.isValid);
    setErrorMessage(validation.errorMessage);
  };

  // Handle goal weight change
  const handleGoalWeightChange = (value) => {
    setGoalWeight(value);
    const validation = validateGoalWeight(value, goalType);
    setIsValidGoal(validation.isValid);
    setErrorMessage(validation.errorMessage);
  };

  return (

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Flag size={32} color="#00B8A9" style={styles.flagIcon} />
          <Text style={styles.title}>What's your goal?</Text>
            
            
            
            <Text style={styles.description}>
              Choose your primary fitness goal to help us calculate your personalized nutrition plan.
            </Text>

            {/* Goal Type Selection */}
            <View style={styles.buttonRow}>
              {goalOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    goalType === option && styles.optionButtonActive,
                  ]}
                  onPress={() => handleGoalTypeChange(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      goalType === option && styles.optionTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Target Weight Input (only show if not maintaining) */}
            {goalType !== 'maintain' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Target Weight ({unit ? 'lbs' : 'kg'})
                </Text>
                <TextInput
                  style={[styles.input, !isValidGoal && goalType !== 'maintain' && styles.inputError]}
                  keyboardType="numeric"
                  value={0}
                  onChangeText={handleGoalWeightChange}
                  placeholder={`Enter target weight in ${unit ? 'lbs' : 'kg'}`}
                  placeholderTextColor="#9CA3AF"
                />
                {!isValidGoal && errorMessage ? (
                  <Text style={styles.errorText}>
                    {errorMessage}
                  </Text>
                ) : (
                  <Text style={styles.inputHint}>
                    Current weight: {weight} {unit ? 'lbs' : 'kg'}
                  </Text>
                )}
              </View>
            )}

            {goalType === 'maintain' && (
              <View style={styles.maintainInfo}>
                <Text style={styles.maintainText}>
                  Your target weight will be set to your current weight of {weight} {unit ? 'lbs' : 'kg'}
                </Text>
              </View>
            )}
            
                         <View style={styles.buttonContainer}>
               <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                 <Ionicons name="arrow-back" size={20} color="white" />
                 <Text style={styles.backButtonText}>Back</Text>
               </TouchableOpacity>
               
               <TouchableOpacity 
                 style={[styles.nextButton, !isValidGoal && styles.nextButtonDisabled]} 
                 onPress={handleNext}
                 disabled={!isValidGoal}
               >
                 <Text style={styles.nextButtonText}>Next</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </TouchableWithoutFeedback>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'Inter_800ExtraBold',
  },
  flagIcon: {
    marginBottom: 5,
  },
  description: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 10,
    maxWidth: 320,
    fontFamily: 'Inter_400Regular',
    opacity: 0.9,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginBottom: 20,
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  optionButtonActive: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
  },
  optionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    backgroundColor: '#1A1A1A',
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    fontFamily: 'Inter_600SemiBold',
  },
  inputError: {
    borderColor: '#E53E3E',
    backgroundColor: '#1A1A1A',
  },
  inputHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    fontSize: 13,
    color: '#E53E3E',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  maintainInfo: {
    backgroundColor: '#1A1A1A',
    padding: 18,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 0.3,
    borderColor: '#00B8A9',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    width: '100%',
    maxWidth: 320,
  },
  maintainText: {
    fontSize: 15,
    color: '#00B8A9',
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
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
  nextButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
}); 