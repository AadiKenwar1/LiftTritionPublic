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

interface PopupModalProps {
  // Required props
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  children: React.ReactNode;

  // Optional button controls
  showButtons?: boolean;
  onAdd?: () => void;
  onClose?: () => void;
  addButtonText?: string;
  closeButtonText?: string;

  // Optional styling
  marginBottom?: number;
}

export default function PopupModal({modalVisible, setModalVisible, children, showButtons, onAdd, onClose, addButtonText, closeButtonText, marginBottom = 0}: PopupModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { marginBottom: marginBottom }]}>
          <View style={styles.modalContent}>
            {children}
            
            {showButtons && (
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
    shadowOpacity: 0.8,
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
    shadowOpacity: 0.8,
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

