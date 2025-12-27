import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import WiFiStatusBanner from '../../components/WiFiStatusBanner';

export default function OnboardingScreen1() {
  const navigation = useNavigation();

  const handleNext = () => {
    navigation.navigate('Onboarding2');
  };


  return (
    <View style={styles.container}>
      <WiFiStatusBanner />
      <View style={styles.content}>
        <Text style={styles.title}>LiftTrition</Text>
        
        <Text style={styles.description}>
          The #1 app for logging and visualizing your lifting and nutrition progress.
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="barbell-outline" size={24} color="#00B8A9" />
            </View>
            <Text style={styles.featureText}>Log workouts and meals effortlessly — like a notes app, but built for lifters.</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="nutrition-outline" size={24} color="#00B8A9" />
            </View>
            <Text style={styles.featureText}>Snap a photo or describe your meal — AI fills in the macros for effortless tracking</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="analytics-outline" size={24} color="#00B8A9" />
            </View>
            <Text style={styles.featureText}>Visualize your progress easily and make sense of your fitness data, with insights and analytics.</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="flag-outline" size={24} color="#00B8A9" />
            </View>
            <Text style={styles.featureText}>Set goals and crush them!</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
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
    paddingVertical: 30,
  },
  title: {
    fontSize: 60,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'Inter_700Bold',
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
    maxWidth: 320,
    fontFamily: 'Inter_400Regular',
    opacity: 0.9,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 50,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#00B8A9',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    flex: 1,
    fontWeight: '500',
    fontFamily: 'Inter_400Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
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
    minWidth: 140,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
}); 