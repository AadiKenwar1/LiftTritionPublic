import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function OnboardingScreen4() {
  const navigation = useNavigation();
  const route = useRoute();
  const { birthDate, age } = route.params || {};
  
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(8);
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState(true); // true = imperial, false = metric

  // Generate arrays for picker options
  const feetOptions = Array.from({ length: 5 }, (_, i) => i + 3); // 3-7 feet
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i); // 0-11 inches

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    if (!weight) {
      Alert.alert('Missing Information', 'Please enter your weight.');
      return;
    }

    const weightNum = parseFloat(weight);

    if (weightNum <= 0) {
      Alert.alert('Invalid Values', 'Please enter a valid weight value.');
      return;
    }

    // Convert height to total inches for storage
    console.log('Height calculation debug:', { feet, inches, feetType: typeof feet, inchesType: typeof inches });
    const totalInches = Number(feet) * 12 + Number(inches);
    console.log('Total inches calculated:', totalInches);

    // Store all data collected so far
    navigation.navigate('Onboarding6', {
      birthDate,
      age,
      height: totalInches,
      weight: weightNum,
      unit,
      feet,
      inches
    });
  };

  const toggleUnit = () => {
    setUnit(!unit);
    // Reset to defaults when switching units
    setFeet(5);
    setInches(8);
    setWeight('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>What are your measurements?</Text>
            
            <Text style={styles.description}>
              This information helps us calculate your personalized nutrition and fitness recommendations.
            </Text>

            {/* Unit Toggle */}
            <View style={styles.unitToggleContainer}>
              <TouchableOpacity 
                style={[styles.unitButton, unit && styles.unitButtonActive]} 
                onPress={() => setUnit(true)}
              >
                <Text style={[styles.unitButtonText, unit && styles.unitButtonTextActive]}>
                  Imperial (lbs, in)
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.unitButton, !unit && styles.unitButtonActive]} 
                onPress={() => setUnit(false)}
              >
                <Text style={[styles.unitButtonText, !unit && styles.unitButtonTextActive]}>
                  Metric (kg, cm)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Height Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Height</Text>
              {unit ? (
                <View style={styles.heightInputRow}>
                  <View style={styles.heightInputGroup}>
                    <Picker
                      selectedValue={feet}
                      onValueChange={(value) => setFeet(Number(value))}
                      style={styles.inlinePicker}
                      itemStyle={styles.inlinePickerItem}
                    >
                      {feetOptions.map((foot) => (
                        <Picker.Item key={foot} label={`${foot} ft`} value={foot} />
                      ))}
                    </Picker>
                  </View>
                  <View style={styles.heightInputGroup}>
                    <Picker
                      selectedValue={inches}
                      onValueChange={(value) => setInches(Number(value))}
                      style={styles.inlinePicker}
                      itemStyle={styles.inlinePickerItem}
                    >
                      {inchesOptions.map((inch) => (
                        <Picker.Item key={inch} label={`${inch} in`} value={inch} />
                      ))}
                    </Picker>
                  </View>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={Math.round((feet * 12 + inches) * 2.54).toString()}
                  onChangeText={(value) => {
                    const cm = parseFloat(value) || 0;
                    const totalInches = cm / 2.54;
                    const newFeet = Math.floor(totalInches / 12);
                    const newInches = Math.round(totalInches % 12);
                    setFeet(newFeet);
                    setInches(newInches);
                  }}
                  placeholder="Enter height in cm"
                  placeholderTextColor="#999"
                />
              )}
            </View>

            {/* Weight Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight ({unit ? 'lbs' : 'kg'})</Text>
              <TextInput
                style={styles.weightInput}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder={`Enter your weight in ${unit ? 'lbs' : 'kg'}`}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={20} color="#666666" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.nextButton, !weight && styles.nextButtonDisabled]} 
                onPress={handleNext}
                disabled={!weight}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    marginBottom: 20,
    paddingHorizontal: 10,
    maxWidth: 300,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    padding: 4,
    gap:10 
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  unitButtonActive: {
    backgroundColor: '#00B8A9',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
    
  },
  heightInputRow: {
    flexDirection: 'row',
    gap: 10,
    
    
  },
  heightInputGroup: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
    
  },
  inlinePicker: {
    height: 50,
  },
  inlinePickerItem: {
    fontSize: 15,
    color: '#1A1A1A',
    height: 100,
  },
  weightInput: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 17,
    backgroundColor: '#F8F9FA',
    color: '#1A1A1A',
    textAlign: 'center',
    fontWeight: '600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
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
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#00B8A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
}); 