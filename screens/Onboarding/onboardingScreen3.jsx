import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { User, Mars, Venus } from 'lucide-react-native';

const genderOptions = [
  { label: 'Male', value: 'male', icon: Mars },
  { label: 'Female', value: 'female', icon: Venus },
];

export default function OnboardingScreen3() {
  const navigation = useNavigation();
  const route = useRoute();
  const { birthDate, age } = route.params || {};
  
  const [gender, setGender] = useState('male');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // Pass all data collected so far to next screen
    navigation.navigate('Onboarding4', {
      birthDate,
      age,
      gender
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <User size={32} color="#00B8A9" style={styles.userIcon} />
        <Text style={styles.title}>What's Your Biological Sex?</Text>
        <Text style={styles.description}>
            Your biological sex helps us calculate nutrition goals.
        </Text>

        <View style={styles.optionsContainer}>
          {genderOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = gender === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  isSelected && styles.selectedOption,
                ]}
                onPress={() => setGender(option.value)}
              >
                <IconComponent 
                  size={24} 
                  color={isSelected ? '#FFFFFF' : 'white'} 
                  style={styles.optionIcon}
                />
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
  userIcon: {
    marginBottom: 5,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 12,
  },
  optionIcon: {
    marginRight: 0,
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

