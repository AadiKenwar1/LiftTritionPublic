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
import { useState } from "react";
import { useWorkoutContext } from "../context/WorkoutsV2/WorkoutContext";
import { Alert } from "react-native";


export default function ArchivedPopup(props) {

  const {unarchiveWorkout, unarchiveExercise, deleteWorkout, renameWorkout} = useWorkoutContext()
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
              props.isWorkout? unarchiveWorkout(workout.id) : unarchiveExercise(workout.id, exercise.id)
            },
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteWorkout(workout.id);
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={props.onClose}
            >
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
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
                      archived={item.archived}
                      function={() => props.function2(item)}
                      drag={drag} // ✅ Only drag in moveMode
                      moveMode={props.moveMode}
                      onMenuPress={() => {props.isWorkout? openArchiveMenu(item) : openArchiveMenu(props.workout, item)}} // ✅ Menu button
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  header: {
    position: "relative", // ensure positioning context for absolute child
    marginBottom: 40,
    paddingRight: 40, // add padding so the title text doesn't collide with ✕
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 8, // tap-friendly touch area
    zIndex: 10,
  },
  close: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
  },
  content: {
    flex: 1,
  },
  dataSelector: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  dataSelectorButton: {
    backgroundColor: "#172337",
    height: 40,
    width: "25%",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#00CFFF",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  dataSelectorButtonClicked: {
    backgroundColor: "#00CFFF",
    height: 40,
    width: "30%",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#172337",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  lineWithText: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "white",
  },
  lineText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 500,
    color: "white",
  },
  logContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logItem: {
    backgroundColor: "#172337",
    height: 60,
    borderRadius: 10,
    borderColor: "#00CFFF",
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 5,
  },
  logText: {
    fontSize: 16,
    color: "white",
  },
});
