import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.editModalContainer}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Edit Nutrition Entry</Text>
              </View>
              
              <ScrollView style={styles.editModalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Food Name</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter food name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Calories</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editCalories}
                    onChangeText={setEditCalories}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
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
                    placeholderTextColor="#9CA3AF"
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
                    placeholderTextColor="#9CA3AF"
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
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
              </ScrollView>

              <View style={styles.editModalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={onSave}
                >
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContainer: {
    width: '95%',
    maxHeight: '80%',
    backgroundColor: '#242424',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  editModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  editModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Inter_700Bold',
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
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  editInput: {
    borderWidth: 0.3,
    borderColor: 'grey',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    fontFamily: 'Inter_400Regular',
    color: 'white',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  editModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 5,
  },
  cancelButton: {
    backgroundColor: '#888888',
    width: "50%",
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  saveButton: {
    backgroundColor: '#4CD964',
    width: "50%",
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
}); 