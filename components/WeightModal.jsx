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
import { useSettings } from '../context/SettingsContext';
import { getLocalDateKey } from '../utils/date';

export default function WeightUpdateModal({ visible, onClose }) {
  // Access context
  const {unit, bodyWeight, updateWeight} = useSettings();

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
        updateWeight(parsedWeight);
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
              <Text style={styles.modalSubtitle}>Enter your current weight</Text>
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
                    placeholderTextColor="#999"
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom:80,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    color: '#000',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    color: '#fff',
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
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  updateButton: {
    backgroundColor: '#000',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
