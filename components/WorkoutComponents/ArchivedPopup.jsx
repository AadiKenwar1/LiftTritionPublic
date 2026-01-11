import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import Log from "./Log";
import { useState, useEffect } from "react";
import { useWorkoutContext } from "../../context/WorkoutsV2/WorkoutContext";
import { Alert } from "react-native";


export default function ArchivedPopup(props) {

  const {unarchiveWorkout, unarchiveExercise, deleteWorkout, deleteExercise, renameWorkout} = useWorkoutContext()
  const [renameVisible, setRenameVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [newName, setNewName] = useState("");

  function openArchiveMenu(workout, exercise) {
      Alert.alert(
        "Workout Options",
        "WARNING: Deleting a workout will delete all workout related logs. Logs are preserved while acrhived",
        [
          {
            text: "Unarchive",
            onPress: () => {
              if (props.isWorkout) {
                unarchiveWorkout(workout.id);
              } else {
                unarchiveExercise(exercise.id);
              }
            },
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              if (props.isWorkout) {
              deleteWorkout(workout.id);
              } else {
                deleteExercise(exercise.id);
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    }




  const [listKey, setListKey] = useState(0);
  
  // Refresh list when data changes (e.g., after deletion)
  useEffect(() => {
    setListKey((prev) => prev + 1);
  }, [props.data.length]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{"Archived"}</Text>
          </View>

          <View style={styles.content}>
            <DraggableFlatList
              data={props.data}
              key={listKey}
              keyExtractor={(item) => item.id.toString()}
              onDragEnd={({ data }) => {
                props.reorderWorkouts
                  ? props.reorderWorkouts(data)
                  : props.reorderExercises(props.workout.id, data);
                setListKey((prev) => prev + 1);
              }}
              ListHeaderComponent={props.ListHeaderComponent}
              contentContainerStyle={{ paddingBottom: 100 }}
              activationDistance={20}
              //extraData={{ moveMode: props.moveMode, data: props.data }}
              //removeClippedSubviews={false}

              renderItem={({ item, drag, isActive }) => {
                return (
                  <View style={{ marginBottom: 5, paddingHorizontal: 16 }}>
                    <Log
                      bold={props.bold}
                      currItem={item.name ? item.name : item}
                      isActive={isActive}
                      function={() => props.function2(item)}
                      drag={drag}
                      onMenuPress={() => {props.isWorkout? openArchiveMenu(item) : openArchiveMenu(props.workout, item)}}
                    />

                  </View>
                );
              }}
              renderPlaceholder={() => (
                <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
                  <View
                    style={{
                      backgroundColor: "#e0e0e0",
                      height: 60,
                      borderRadius: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  />
                </View>
              )}
            />
            {props.data.length === 0 && <Text style={{ textAlign: 'center', justifyContent: 'center', fontSize: 16, color: 'grey' }}>No archived items</Text>}
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rename Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={renameVisible}
        onRequestClose={() => setRenameVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { height: '40%' }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Rename Workout</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setRenameVisible(false)}
              >
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
              <Text style={{ color: 'white', marginBottom: 10 }}>Enter New Name</Text>
              <TextInput
                placeholder="New Name"
                placeholderTextColor="#999"
                value={newName}
                onChangeText={setNewName}
                style={{
                  borderWidth: 1,
                  borderColor: '#666',
                  padding: 10,
                  marginBottom: 20,
                  width: "100%",
                  color: 'white',
                  borderRadius: 8,
                }}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#007bff',
                  padding: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => {
                  if (selectedWorkout && newName.trim()) {
                    renameWorkout(selectedWorkout.id, newName.trim());
                    setRenameVisible(false);
                    setNewName("");
                    setSelectedWorkout(null);
                  }
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: "90%",
    height: "70%",
    backgroundColor: "#242424",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: 'grey',
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    fontFamily: 'Inter_700Bold',
  },
  closeButton: {
    backgroundColor: '#888888',
    width: "100%",
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
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
  content: {
    flex: 1,
  },
});
