import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Dumbbell } from 'lucide-react-native';
import WiFiStatusBanner from '../../components/WiFiStatusBanner';

const frequencyOptions = [
  { label: '0 times a week', value: 1.2 },
  { label: '1–2 times a week', value: 1.375 },
  { label: '3–4 times a week', value: 1.55 },
  { label: '5+ times a week', value: 1.725 },
];

export default function OnboardingScreen6() {
  const navigation = useNavigation();
  const route = useRoute();
  const { birthDate, age, gender, height, weight, unit } = route.params || {};
  
  const [activityFactor, setActivityFactor] = useState(1.2);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // Store all data collected so far
    navigation.navigate('Onboarding6', {
      birthDate,
      age,
      gender,
      height,
      weight,
      unit,
      activityFactor
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Dumbbell size={32} color="#00B8A9" style={styles.dumbbellIcon} />
        <Text style={styles.title}>Whats your training frequency?</Text>
        <Text style={styles.description}>
          Your training frequency helps us calculate your personalized nutrition goals and fatigue tracking.
        </Text>

        <View style={styles.optionsContainer}>
          {frequencyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                activityFactor === option.value && styles.selectedOption,
              ]}
              onPress={() => setActivityFactor(option.value)}
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
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="white" />
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
    backgroundColor: '#242424',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  dumbbellIcon: {
    marginBottom: 5,
    transform: [{ rotate: '45deg' }],
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
  optionsContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 0,
  },
  option: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 0.3,
    borderColor: 'grey',
    marginBottom: 15,
    backgroundColor: '#1A1A1A',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
  },
  optionText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
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
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
}); 