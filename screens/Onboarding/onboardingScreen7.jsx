import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Turtle, Rabbit } from 'lucide-react-native';
import WiFiStatusBanner from '../../components/WiFiStatusBanner';

export default function OnboardingScreen10() {
  const navigation = useNavigation();
  const route = useRoute();
  const { birthDate, age, gender, height, weight, unit, activityFactor, goalType, goalWeight } = route.params || {};
  
  const [goalPace, setGoalPace] = useState(1.0);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // Store all data collected so far
    navigation.navigate('Onboarding8', {
      birthDate,
      age,
      gender,
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
      <WiFiStatusBanner />
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
              
              <View style={styles.sliderRow}>
                <Turtle size={24} color="#00B8A9" />
                <View style={styles.sliderWrapper}>
                  <Slider
                    style={{ flex: 1, height: 40 }}
                    minimumValue={0.2}
                    maximumValue={3.0}
                    step={0.1}
                    value={goalPace}
                    onValueChange={setGoalPace}
                    minimumTrackTintColor="#00B8A9"
                    maximumTrackTintColor="#666666"
                    thumbTintColor="#00B8A9"
                  />
                </View>
                <Rabbit size={24} color="#00B8A9" />
              </View>
              
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
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter_800ExtraBold',
  },
  description: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
    maxWidth: 320,
    fontFamily: 'Inter_400Regular',
    opacity: 0.9,
  },
  sliderContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 25,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter_700Bold',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  sliderWrapper: {
    flex: 1,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderMinMax: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  paceInfoContainer: {
    backgroundColor: '#1A1A1A',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 0.3,
    borderColor: '#00B8A9',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    width: '100%',
    maxWidth: 320,
  },
  paceDescription: {
    fontSize: 15,
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  paceIntensity: {
    fontSize: 13,
    color: '#00B8A9',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter_600SemiBold',
  },
  maintainContainer: {
    backgroundColor: '#1A1A1A',
    padding: 25,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 0.3,
    borderColor: '#00B8A9',
    alignItems: 'center',
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
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
}); 