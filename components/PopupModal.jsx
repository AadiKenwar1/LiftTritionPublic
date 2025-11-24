import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function PopupModal({
  modalVisible,
  setModalVisible,
  children,
  creatingWorkout,
  handleAddWorkout,
  workoutName,
  showButtons,
  onAdd,
  onClose,
  addButtonText,
  closeButtonText,
  showSettingsLink,
  onNavigateToSettings,
}) {
  return (
    <Modal
      animationType="fade"
      duration={200}
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {children}
            
            {showButtons && (
              <>
                {showSettingsLink && (
                  <Text style={styles.settingsText}>
                    *If an exercise isn't listed, you can add it in{" "}
                    <Text style={styles.settingsLink} onPress={onNavigateToSettings}>
                      settings
                    </Text>
                  </Text>
                )}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.buttonClose}
                    onPress={onClose || (() => setModalVisible(false))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>{closeButtonText || "Close"}</Text>
                  </TouchableOpacity>
                  {onAdd && (
                    <TouchableOpacity 
                      style={styles.buttonAdd} 
                      onPress={onAdd}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.buttonText}>{addButtonText || "Add"}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
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
  settingsText: {
    marginTop: 10,
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  settingsLink: {
    color: "#4FC3F7",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  buttonAdd: {
    backgroundColor: "#2D9CFF",
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  buttonClose: {
    backgroundColor: "#888888",
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
