import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSettings } from '../../context/Settings/SettingsContext';

const { width: screenWidth } = Dimensions.get("window");

export default function TextOnlyModal(props) {
  const { mode } = useSettings();
  
  return (
    <Modal
      animationType="fade"
      duration={200}
      transparent={true}
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {props.title && (
              <Text style={styles.title}>{props.title}</Text>
            )}
            <Text style={styles.text}>{props.text}</Text>
            <TouchableOpacity 
              style={[
                styles.closeButton,
                { backgroundColor: mode === true ? "#2D9CFF" : '#4CD964' }
              ]}
              onPress={props.onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: screenWidth - 40,
    backgroundColor: "#242424",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  modalContent: {
    alignItems: "center",
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Inter_700Bold',
  },
  text: {
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Inter_400Regular',
  },
  closeButton: {
    marginTop: 0,
    marginHorizontal: 5,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    minWidth: 120,
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
