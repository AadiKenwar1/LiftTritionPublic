import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

interface NotesModalProps {
  visible: boolean;
  onClose: () => void;
  note: string;
  setNote: (note: string) => void;
  title: string;
}

export default function NotesModal({visible, onClose, note, setNote, title}: NotesModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>{title}</Text>
            <TextInput
              style={styles.input}
              placeholder="Write your note here..."
              placeholderTextColor="grey"
              multiline
              value={note}
              onChangeText={setNote}
            />
            <Pressable style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "70%",
    marginBottom: 50,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
    color: "white",
  },
  button: {
    backgroundColor: "#888888",
    marginTop: 15,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
    elevation: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

