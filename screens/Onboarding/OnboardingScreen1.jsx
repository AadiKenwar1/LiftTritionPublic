import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen1() {
  const navigation = useNavigation();

  const handleNext = () => {
    navigation.navigate('Onboarding2');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.featureText}>Visualize your progress and make sense of your fitness data, with insights and analytics.</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="flag-outline" size={24} color="#00B8A9" />
            </View>
            <Text style={styles.featureText}>Finally, set goals and crush them.</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          
          <TouchableOpacity style={styles.backButton}>
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
    fontSize: 60,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
    maxWidth: 320,
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
    backgroundColor: '#E8F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#00B8A9',
  },
  featureText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
    minWidth: 140,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
}); 