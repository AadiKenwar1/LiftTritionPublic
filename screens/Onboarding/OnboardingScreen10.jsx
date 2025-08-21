import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

export default function OnboardingScreen10() {
  const navigation = useNavigation();
  const route = useRoute();
  const { birthDate, age, height, weight, unit, activityFactor, goalType, goalWeight } = route.params || {};
  
  const [goalPace, setGoalPace] = useState(1.0);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // Store all data collected so far
    navigation.navigate('Onboarding11', {
      birthDate,
      age,
      height,
      weight,
      unit,
      activityFactor,
      goalType,
      goalWeight,
      goalPace
    });
  };

  const getPaceDescription = () => {
    if (goalType === 'maintain') {
      return 'You\'re maintaining your current weight.';
    }
    
    const paceText = goalPace.toFixed(1);
    const unitText = unit ? 'lbs' : 'kg';
    
    if (goalType === 'lose') {
      return `You want to lose ${paceText} ${unitText} per week.`;
    } else {
      return `You want to gain ${paceText} ${unitText} per week.`;
    }
  };

  const getPaceIntensity = () => {
    if (goalPace <= 0.5) return 'Conservative';
    if (goalPace <= 1.0) return 'Moderate';
    if (goalPace <= 2.0) return 'Aggressive';
    return 'Very Aggressive';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How fast do you want to reach your goal?</Text>
        
        <Text style={styles.description}>
          Choose your desired pace. A slower pace is more sustainable and easier to maintain.
        </Text>

        {goalType !== 'maintain' && (
          <>
            {/* Pace Slider */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                {goalPace.toFixed(1)} {unit ? 'lbs' : 'kg'} per week
              </Text>
              
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0.2}
                maximumValue={3.0}
                step={0.1}
                value={goalPace}
                onValueChange={setGoalPace}
                minimumTrackTintColor="white"
                maximumTrackTintColor="#C0C0C0"
                thumbTintColor="white"
              />
              
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderMinMax}>0.2</Text>
                <Text style={styles.sliderMinMax}>3.0</Text>
              </View>
            </View>

            {/* Pace Description */}
            <View style={styles.paceInfoContainer}>
              <Text style={styles.paceDescription}>{getPaceDescription()}</Text>
              <Text style={styles.paceIntensity}>Intensity: {getPaceIntensity()}</Text>
            </View>
          </>
        )}

        {goalType === 'maintain' && (
          <View style={styles.maintainContainer}>
            <Text style={styles.maintainText}>
              You're maintaining your current weight, so no pace adjustment is needed.
            </Text>
          </View>
        )}
        
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
  sliderContainer: {
    width: '100%',
    marginBottom: 25,
    backgroundColor: '#00B8A9',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    borderColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
    
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderMinMax: {
    color: 'white',
    fontSize: 14,
  },
  paceInfoContainer: {
    backgroundColor: '#E8F5F5',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00B8A9',
    shadowColor: '#00B8A9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  paceDescription: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  paceIntensity: {
    fontSize: 13,
    color: '#00B8A9',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  guidelinesContainer: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  guidelinesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  maintainContainer: {
    backgroundColor: '#E8F5F5',
    padding: 25,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#00B8A9',
    alignItems: 'center',
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
  nextButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
}); 