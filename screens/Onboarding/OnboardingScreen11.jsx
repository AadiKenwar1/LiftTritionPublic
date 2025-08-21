import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen11() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get any params passed from previous screen
  const params = route.params || {};
  const { birthDate, age, height, weight, unit, activityFactor, goalType, goalWeight, goalPace } = params;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // Navigate to macro calculation screen with all collected onboarding data
    navigation.navigate('Onboarding12', params);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Review Your Profile</Text>
          <Text style={styles.headerSubtitle}>
            Here's a summary of all the information you've provided
          </Text>
        </View>

        {/* Profile Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Age</Text>
              <Text style={styles.summaryValue}>{age} years</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Current Weight</Text>
              <Text style={styles.summaryValue}>{weight} {unit ? 'lbs' : 'kg'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Goal Weight</Text>
              <Text style={styles.summaryValue}>
                {goalType === 'maintain' ? weight : goalWeight} {unit ? 'lbs' : 'kg'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Goal Type</Text>
              <Text style={styles.summaryValue}>{goalType?.charAt(0).toUpperCase() + goalType?.slice(1)}</Text>
            </View>
            {goalType !== 'maintain' && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Weekly Pace</Text>
                <Text style={styles.summaryValue}>{goalPace?.toFixed(1)} {unit ? 'lbs' : 'kg'}/week</Text>
              </View>
            )}
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Training Frequency</Text>
              <Text style={styles.summaryValue}>
                {(() => {
                  const frequencyOptions = [
                    { label: '0 times/week', value: 1.2 },
                    { label: '1–2 times/week', value: 1.375 },
                    { label: '3–4 times/week', value: 1.55 },
                    { label: '5+ times/week', value: 1.725 },
                  ];
                  const currentOption = frequencyOptions.find(option => option.value === activityFactor);
                  return currentOption ? currentOption.label : 'Not set';
                })()}
              </Text>
            </View>
          </View>
        </View>



        {/* Navigation Buttons */}
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 15,
    maxWidth: 300,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#00B8A9',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00B8A9',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00B8A9',
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',

  },
  infoText: {
    fontSize: 14,
    color: '#00B8A9',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 5,
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