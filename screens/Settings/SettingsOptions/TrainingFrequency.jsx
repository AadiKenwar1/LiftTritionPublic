// screens/TrainingFrequencyScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CustomHeader from '../../../components/CustomHeader';
import { useSettings } from '../../../context/SettingsContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const frequencyOptions = [
  { label: '0 times a week', value: 1.2 },
  { label: '1–2 times a week', value: 1.375 },
  { label: '3–4 times a week', value: 1.55 },
  { label: '5+ times a week', value: 1.725 },
];

export default function TrainingFrequencyScreen() {
  const { activityFactor, setActivityFactor } = useSettings();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get the parameter to know where the route comes from
  const { comingFrom } = route.params || {};

  return (
    <View style={styles.container}>
      <CustomHeader title="Training Frequency" showBack />
      
      <View style={styles.content}>
        <Text style={styles.title}>How Often Are You Lifting?</Text>
        <Text style={styles.description}>
          Your training frequency is used to calculate fatigue and nutrition goals.
        </Text>

        {/* Show different message based on where user came from */}
        {comingFrom !== 'AdjustMacros' && (
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionText}>
              We suggest readjusting your macros in the{' '}
              <Text 
                style={styles.linkText}
                onPress={() => navigation.navigate('AdjustMacros')}
              >
                adjust macros
              </Text>
              {' '}setting to ensure your nutrition goals line up. 
            </Text>
            <Text style={styles.suggestionText}></Text>
            <Text style={styles.suggestionText}>However if fatigue is your main concern, you can adjust your training frequency here.</Text>
          </View>
        )}
        
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  suggestionBox: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEB3B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    marginHorizontal: 4,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0066CC',
    textDecorationLine: 'underline',
  },
  option: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  selectedOption: {
    backgroundColor: '#00B8A9',
    borderColor: 'black',
  },
  optionText: {
    fontSize: 17,
    color: '#1a1a1a',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#ffffff',
    fontFamily: 'Inter_600SemiBold',
  },
});