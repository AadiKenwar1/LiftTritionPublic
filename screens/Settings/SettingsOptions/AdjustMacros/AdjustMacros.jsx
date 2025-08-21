import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettings } from '../../../../context/SettingsContext';
import CustomHeader from '../../../../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';

export default function AdjustMacrosScreen() {
  // Get settings from context
  const {
    goalType,
    setGoalType,
    goalWeight,
    setGoalWeight,
    bodyWeight,
    updateWeight,
    goalPace,
    setGoalPace,
    unit,
    activityFactor,
    calculateMacros,
  } = useSettings();
  
  const navigation = useNavigation();

  // Local state for form values - these only get applied when "Set Macros" is clicked
  const [localBodyWeight, setLocalBodyWeight] = useState(bodyWeight);
  const [localGoalWeight, setLocalGoalWeight] = useState(goalWeight);
  const [localGoalPace, setLocalGoalPace] = useState(goalPace);
  const [localActivityFactor, setLocalActivityFactor] = useState(activityFactor);

  // Sync local state with context values when they change
  useEffect(() => {
    setLocalBodyWeight(bodyWeight);
    setLocalGoalWeight(goalWeight);
    setLocalGoalPace(goalPace);
    setLocalActivityFactor(activityFactor);
  }, [bodyWeight, goalWeight, goalPace, activityFactor]);

  // Goal type options
  const goalOptions = ['lose', 'maintain', 'gain'];

  // Auto-set goal weight to current weight when in maintain mode
  useEffect(() => {
    if (goalType === 'maintain') {
      setLocalGoalWeight(localBodyWeight);
    }
  }, [goalType, localBodyWeight]);

  // Helper function to check if goal and target weight are valid
  const isGoalValid = () => {
    const currentBodyWeight = parseFloat(localBodyWeight) || 0;
    const currentGoalWeight = parseFloat(localGoalWeight) || currentBodyWeight;
    
    if (goalType === 'gain') {
      return currentGoalWeight > currentBodyWeight;
    } else if (goalType === 'lose') {
      return currentGoalWeight < currentBodyWeight;
    }
    return true; // Maintain mode is always valid
  };

        // Calculate macros and navigate to SetMacros screen
  const handleCalculate = () => {
    // Parse form values
    const currentBodyWeight = parseFloat(localBodyWeight) || 0;
    const currentGoalWeight = parseFloat(localGoalWeight) || currentBodyWeight;
    const currentActivityFactor = localActivityFactor;
    const currentGoalPace = localGoalPace;
    
    // Validate goal and target weight logic
    if (goalType === 'gain' && currentGoalWeight <= currentBodyWeight) {
      Alert.alert(
        'Invalid Goal',
        'For weight gain, your target weight must be greater than your current weight. Please adjust your goal or target weight.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (goalType === 'lose' && currentGoalWeight >= currentBodyWeight) {
      Alert.alert(
        'Invalid Goal',
        'For weight loss, your target weight must be less than your current weight. Please adjust your goal or target weight.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Calculate macros using current form values
    const { calResult, proteinGrams, fatGrams, carbGrams } = calculateMacros(
      currentBodyWeight,
      currentGoalWeight,
      currentActivityFactor,
      currentGoalPace,
      unit
    );
    
    // Prepare data for SetMacros screen
    const calculatedMacros = {
      calories: Math.round(calResult),
      protein: Math.round(proteinGrams),
      fats: Math.round(fatGrams),
      carbs: Math.round(carbGrams)
    };
    
    const formData = {
      bodyWeight: currentBodyWeight,
      goalWeight: currentGoalWeight,
      goalPace: localGoalPace,
      goalType: goalType,
      activityFactor: localActivityFactor,
      unit: unit
    };
    
    // Navigate to SetMacros screen with calculated data
    navigation.navigate('SetMacros', {
      calculatedMacros,
      formData
    });
  };

  return (
    <>
      <CustomHeader title='Adjust Macros' showBack />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Type Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What's your goal?</Text>
          <View style={styles.buttonRow}>
            {goalOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  goalType === option && styles.optionButtonActive,
                ]}
                onPress={() => setGoalType(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    goalType === option && styles.optionTextActive,
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Weight Input */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Current Weight ({unit ? 'lbs' : 'kg'})
          </Text>
          <TextInput
            style={styles.input}
            keyboardType='numeric'
            value={localBodyWeight?.toString() ?? ''}
            onChangeText={(val) => setLocalBodyWeight(parseFloat(val) || 0)}
            placeholder={`Enter current weight in ${unit ? 'lbs' : 'kg'}`}
            placeholderTextColor='#aaa'
          />
        </View>

        {/* Target Weight Input (only show if not maintaining) */}
        {goalType !== 'maintain' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Target Weight ({unit ? 'lbs' : 'kg'})
            </Text>
            <TextInput
              style={[
                styles.input,
                !isGoalValid() && styles.inputError
              ]}
              keyboardType='numeric'
              value={localGoalWeight?.toString() ?? ''}
              onChangeText={(val) => setLocalGoalWeight(parseFloat(val) || 0)}
              placeholder={`Enter target weight in ${unit ? 'lbs' : 'kg'}`}
              placeholderTextColor='#aaa'
            />
            {!isGoalValid() && (
              <Text style={styles.errorText}>
                {goalType === 'gain' 
                  ? 'Target weight must be greater than current weight'
                  : 'Target weight must be less than current weight'
                }
              </Text>
            )}
          </View>
        )}

        {/* Training Frequency (navigates to separate screen) */}
        <TouchableOpacity onPress={() => navigation.navigate('TrainingFrequency', { comingFrom: 'AdjustMacros' })} activeOpacity={0.7}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Training Frequency</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              {(() => {
                const frequencyOptions = [
                  { label: '0 times a week', value: 1.2 },
                  { label: '1–2 times a week', value: 1.375 },
                  { label: '3–4 times a week', value: 1.55 },
                  { label: '5+ times a week', value: 1.725 },
                ];
                const currentOption = frequencyOptions.find(option => option.value === localActivityFactor);
                return currentOption ? currentOption.label : 'Not set';
              })()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Goal Pace Slider (only show if not maintaining) */}
        {goalType !== 'maintain' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Desired Pace: {localGoalPace.toFixed(1)} {unit ? 'lb' : 'kg'}/week
            </Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0.2}
              maximumValue={3}
              step={0.1}
              value={localGoalPace}
              onValueChange={setLocalGoalPace}
              minimumTrackTintColor='#000'
              maximumTrackTintColor='#ccc'
              thumbTintColor='#000'
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0.2</Text>
              <Text style={styles.sliderLabel}>3.0</Text>
            </View>
          </View>
        )}

        {/* Calculate Macros Button */}
        <TouchableOpacity
          style={[
            styles.calculateButton,
            !isGoalValid() && styles.calculateButtonDisabled
          ]}
          onPress={handleCalculate}
          disabled={!isGoalValid()}
        >
          <Text style={[
            styles.calculateButtonText,
            !isGoalValid() && styles.calculateButtonTextDisabled
          ]}>
            Calculate Macros
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F2F2F2',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    color: '#000',
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chevron: {
    fontSize: 24,
    color: '#666',
    fontFamily: 'Inter_400Regular',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter_500Medium',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 30,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#00B8A9',
    borderColor: 'black',
  },
  optionText: {
    color: '#000',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  optionTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    backgroundColor: '#f8f8f8',
    color: '#000',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  summaryCard: {
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    color: '#000',
    textAlign: 'center',
  },
  summaryItem: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontFamily: 'Inter_700Bold',
  },
  calculateButton: {
    marginTop: 0,
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    
  },
  calculateButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  calculateButtonTextDisabled: {
    color: '#999',
  },
  inputError: {
    borderColor: '#ff3b30',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Inter_500Medium',
  },
  macrosCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  macroItem: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#000',
    marginBottom: 8,
  },
});
