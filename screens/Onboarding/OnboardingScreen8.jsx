import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NotepadText } from 'lucide-react-native';
import WiFiStatusBanner from '../../components/WiFiStatusBanner';

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
    navigation.navigate('Onboarding9', params);
  };

  return (
    <View style={styles.container}>
      <WiFiStatusBanner />
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <NotepadText size={32} color="#00B8A9" style={styles.notepadIcon} />
          <Text style={styles.headerTitle}>Review Your Profile</Text>
          <Text style={styles.headerSubtitle}>
            Here's a summary of all the information you've provided
          </Text>
        </View>

        {/* Profile Summary */}
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



        {/* Navigation Buttons */}
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: 'Inter_800ExtraBold',
  },
  notepadIcon: {
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 15,
    maxWidth: 320,
    fontWeight: '500',
    fontFamily: 'Inter_400Regular',
    opacity: 0.9,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '48%',
    height: '22.5%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 0.3,
    borderColor: 'grey',
    marginBottom: 15,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter_600SemiBold',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00B8A9',
    textAlign: 'center',
    letterSpacing: -0.2,
    fontFamily: 'Inter_700Bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    marginTop: -50,
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