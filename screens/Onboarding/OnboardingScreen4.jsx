import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Ruler } from 'lucide-react-native';

export default function OnboardingScreen4() {
  const navigation = useNavigation();
  const route = useRoute();
  const { birthDate, age, gender } = route.params || {};
  
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(8);
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState(true); // true = imperial, false = metric
  const [cmValue, setCmValue] = useState('');

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

    // Store height in user's preferred unit (cm for metric, inches for imperial)
    let heightValue;
    if (unit) {
      // Imperial: use feet/inches
      heightValue = Number(feet) * 12 + Number(inches);
    } else {
      // Metric: use cmValue directly if available, otherwise calculate from feet/inches
      heightValue = cmValue ? parseFloat(cmValue) : (Number(feet) * 12 + Number(inches)) * 2.54;
    }

    // Store all data collected so far
    navigation.navigate('Onboarding6', {
      birthDate,
      age,
      gender,
      height: heightValue,
      weight: weightNum,
      unit,
      feet,
      inches
    });
  };

  const toggleUnit = () => {
    const wasMetric = !unit;
    setUnit(!unit);
    if (!wasMetric && !unit) {
      // Switching to metric - initialize cmValue from feet/inches
      const totalInches = Number(feet) * 12 + Number(inches);
      setCmValue(Math.round(totalInches * 2.54).toString());
    } else {
      // Switching to imperial - clear cmValue
      setCmValue('');
    }
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
            <Ruler size={32} color="#00B8A9" style={styles.rulerIcon} />
            <View style={styles.headerSection}>
              <Text style={styles.title}>What are your measurements?</Text>
              
              <Text style={styles.description}>
                This helps us calculate your personalized fitness recommendations.
              </Text>
            </View>

            {/* Unit Toggle */}
            <View style={styles.unitToggleContainer}>
              <TouchableOpacity 
                style={[styles.unitButton, unit && styles.unitButtonActive]} 
                onPress={() => setUnit(true)}
              >
                <Text style={[styles.unitButtonText, unit && styles.unitButtonTextActive]}>
                  Imperial
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.unitButton, !unit && styles.unitButtonActive]} 
                onPress={() => setUnit(false)}
              >
                <Text style={[styles.unitButtonText, !unit && styles.unitButtonTextActive]}>
                  Metric
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs Card */}
            <View style={styles.inputsCard}>
              {/* Height Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Height ({unit ? 'in' : 'cm'})</Text>
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
                    style={styles.weightInput}
                    keyboardType="numeric"
                    value={cmValue}
                    onChangeText={(value) => {
                      setCmValue(value); // Store raw input
                      const cm = parseFloat(value) || 0;
                      if (cm > 0) {
                        const totalInches = cm / 2.54;
                        const newFeet = Math.floor(totalInches / 12);
                        const newInches = Math.round(totalInches % 12);
                        setFeet(newFeet);
                        setInches(newInches);
                      }
                    }}
                    placeholder="Enter height in cm"
                    placeholderTextColor="#9CA3AF"
                  
                  />
                )}
              </View>

              {/* Weight Input */}
              <View style={[styles.inputContainer, styles.inputContainerLast]}>
                <Text style={styles.inputLabel}>Weight ({unit ? 'lbs' : 'kg'})</Text>
                <TextInput
                  style={styles.weightInput}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder={`Enter weight in ${unit ? 'lbs' : 'kg'}`}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={20} color="white" />
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
  rulerIcon: {
    marginBottom: 5,
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'Inter_800ExtraBold',
  },
  description: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    maxWidth: 320,
    fontFamily: 'Inter_400Regular',
    opacity: 0.9,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 12,
    width: '100%',
    maxWidth: 320,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  unitButtonActive: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Inter_700Bold',
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
  },
  inputsCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#242424',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainerLast: {
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    textAlign: 'left',
    fontFamily: 'Inter_600SemiBold',
  },
  input: {
    borderWidth: 0.3,
    borderColor: 'grey',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    color: 'white',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    fontFamily: 'Inter_400Regular',
  },
  heightInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heightInputGroup: {
    flex: 1,
    borderWidth: 0.3,
    borderColor: 'grey',
    borderRadius: 12,
    overflow: 'hidden',
    height: 120,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    backgroundColor: '#1A1A1A',

  },
  inlinePicker: {
    height: 50,
    
  },
  inlinePickerItem: {
    fontSize: 17,
    color: 'white',
    height: 100,
    fontFamily: 'Inter_400Regular',
  },
  weightInput: {
    borderWidth: 0.3,
    borderColor: 'grey',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    backgroundColor: '#1A1A1A',
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
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
  nextButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
}); 