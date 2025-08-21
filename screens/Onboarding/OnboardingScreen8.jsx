import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen8() {
  const navigation = useNavigation();
  const route = useRoute();
  const { birthDate, age, height, weight, unit, activityFactor } = route.params || {};
  
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
      <View style={styles.content}>
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
                  value={goalWeight}
                  onChangeText={handleGoalWeightChange}
                  placeholder={`Enter target weight in ${unit ? 'lbs' : 'kg'}`}
                  placeholderTextColor="#999"
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
                 <Ionicons name="arrow-back" size={20} color="#666666" />
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
     </KeyboardAvoidingView>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
    maxWidth: 300,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  optionButtonActive: {
    backgroundColor: '#00B8A9',
    borderColor: 'black',
    shadowColor: '#00B8A9',
    shadowOpacity: 0.2,
  },
  optionText: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 15,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 17,
    backgroundColor: '#F8F9FA',
    color: 'black',
    textAlign: 'center',
    fontWeight: '600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  inputError: {
    borderColor: 'red',
    backgroundColor: '#FFE5E5',
    borderBottomColor: 'red',
    
  },
  inputHint: {
    fontSize: 13,
    color: '#666666',
    marginTop: 6,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#E53E3E',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  maintainInfo: {
    backgroundColor: '#E8F5F5',
    padding: 18,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#00B8A9',
    shadowColor: '#00B8A9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  maintainText: {
    fontSize: 15,
    color: '#00B8A9',
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
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
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
}); 