 import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSettings } from '../../context/Settings/SettingsContext';

export default function WeightUpdateModal({ visible, onClose }) {
  // Access context
  const {
    unit, 
    bodyWeight, 
    updateWeight,
    calculateMacros,
    setNutritionGoals,
    age,
    gender,
    height,
    goalType,
    goalWeight,
    goalPace,
    activityFactor
  } = useSettings();

  // Local state for input field
  const [tempWeight, setTempWeight] = useState(bodyWeight?.toString() ?? '');

  const [weightUnit, setWeightUnit] = useState(unit ? 'lbs' : 'kg');

  // Reset local input when modal opens
  useEffect(() => {
    if (visible) {
      setTempWeight(bodyWeight?.toString() ?? '');
      setWeightUnit(unit ? 'lbs' : 'kg');
    }
  }, [visible, bodyWeight, unit]);

  // Save handler (now using centralized function)
  const handleUpdate = () => {
    const parsedWeight = parseFloat(tempWeight);
    if (!isNaN(parsedWeight) && parsedWeight > 0) {
      // Update weight first
      updateWeight(parsedWeight);
      
      // Recalculate macros with the new weight
      const macroResult = calculateMacros(
        parsedWeight,           // currentBodyWeight (new weight)
        goalWeight,             // currentGoalWeight
        activityFactor,         // currentActivityFactor
        age,                    // currentAge
        gender,                 // currentGender
        height,                 // currentHeight
        goalPace,               // currentGoalPace
        unit                    // currentUnit
      );
      
      // Update macro goals (this will automatically save to database via useEffect)
      setNutritionGoals(
        macroResult.calResult,
        macroResult.proteinGrams,
        macroResult.fatGrams,
        macroResult.carbGrams
      );
      
      onClose();
    } else {
      alert('Please enter a valid weight.');
    }
  };

    //console.log(JSON.stringify(weightProgress, null, 2));


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Weight</Text>
              <Text style={styles.modalSubtitle}>Enter your current weight{'\n'}Macros will be updated automatically</Text>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight</Text>
                <View style={styles.weightInputContainer}>
                  <TextInput
                    style={styles.weightInput}
                    value={tempWeight}
                    onChangeText={setTempWeight}
                    placeholder="Enter weight"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    autoFocus
                  />
                <TouchableOpacity style={styles.unitButton} onPress={() => setWeightUnit('lbs')}>
                    <Text style={styles.unitButtonText}>
                    {unit === true? "lb" : "kg"}
                    </Text>
                </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.updateButton]}
                onPress={handleUpdate}
                activeOpacity={0.7}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}



const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#242424',
    borderRadius: 16,
    width: '95%',
    maxWidth: 400,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: 'grey',
    marginBottom: 90,
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightInput: {
    flex: 1,
    borderWidth: 0.3,
    borderColor: 'grey',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: 'white',
    backgroundColor: '#1A1A1A',
    fontFamily: 'Inter_400Regular',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  unitButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },

  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  cancelButton: {
    backgroundColor: '#888888',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  updateButton: {
    backgroundColor: '#4CD964',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
});
