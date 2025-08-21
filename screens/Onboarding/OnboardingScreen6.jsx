import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const frequencyOptions = [
  { label: '0 times a week', value: 1.2 },
  { label: '1–2 times a week', value: 1.375 },
  { label: '3–4 times a week', value: 1.55 },
  { label: '5+ times a week', value: 1.725 },
];

export default function OnboardingScreen6() {
  const navigation = useNavigation();
  const route = useRoute();
  const { birthDate, age, height, weight, unit } = route.params || {};
  
  const [activityFactor, setActivityFactor] = useState(1.2);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // Store all data collected so far
    navigation.navigate('Onboarding8', {
      birthDate,
      age,
      height,
      weight,
      unit,
      activityFactor
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How Often Are You Lifting?</Text>
        
        <Text style={styles.description}>
          Your training frequency helps us calculate your personalized nutrition goals and fatigue tracking.
        </Text>

        {frequencyOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              activityFactor === option.value && styles.selectedOption,
            ]}
            onPress={() => setActivityFactor(option.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                activityFactor === option.value && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="#666666" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'center',
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
    alignSelf: 'center',
  },
  option: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
  selectedOption: {
    backgroundColor: '#00B8A9',
    borderColor: 'black',
    shadowColor: '#00B8A9',
    shadowOpacity: 0.2,
  },
  optionText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
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