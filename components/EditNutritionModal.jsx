import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

export default function EditNutritionModal({
  visible,
  onClose,
  onSave,
  item,
  editName,
  setEditName,
  editProtein,
  setEditProtein,
  editCarbs,
  setEditCarbs,
  editFats,
  setEditFats,
  editCalories,
  setEditCalories,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.editModalContainer}>
          <View style={styles.editModalHeader}>
            <Text style={styles.editModalTitle}>Edit Nutrition Entry</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.editModalContent}>
            <View style={styles.editInputGroup}>
              <Text style={styles.editLabel}>Food Name</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter food name"
              />
            </View>

            <View style={styles.editInputGroup}>
              <Text style={styles.editLabel}>Calories</Text>
              <TextInput
                style={styles.editInput}
                value={editCalories}
                onChangeText={setEditCalories}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.editInputGroup}>
              <Text style={styles.editLabel}>Protein (g)</Text>
              <TextInput
                style={styles.editInput}
                value={editProtein}
                onChangeText={setEditProtein}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.editInputGroup}>
              <Text style={styles.editLabel}>Carbs (g)</Text>
              <TextInput
                style={styles.editInput}
                value={editCarbs}
                onChangeText={setEditCarbs}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.editInputGroup}>
              <Text style={styles.editLabel}>Fats (g)</Text>
              <TextInput
                style={styles.editInput}
                value={editFats}
                onChangeText={setEditFats}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View style={styles.editModalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={onSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Inter_700Bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  editModalContent: {
    maxHeight: 400,
  },
  editInputGroup: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    fontFamily: 'Inter_400Regular',
  },
  editModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CD964',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
}); 