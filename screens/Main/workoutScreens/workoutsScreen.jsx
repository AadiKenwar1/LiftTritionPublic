import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import PopupModal from "../../../components/PopupModal";
import DraggableLogList from "../../../components/DraggableLogList";
import { useWorkoutContext } from "../../../context/Workouts/WorkoutContext";
import { Alert } from "react-native";

export default function LogScreen() {
  //Screen variables
  const navigation = useNavigation();
  const [workoutName, setWorkoutName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false)

  const {
    workouts,
    addWorkout,
    reorderWorkouts,
    deleteWorkout,
    renameWorkout,
    archiveWorkout,
  } = useWorkoutContext();

  //Adds workouts
  function handleAddWorkout(inputName) {
    addWorkout(inputName);
    setWorkoutName(""); // clear input
    setModalVisible(false); // close modal
  }

  //Navigates to exerciseScreen when workout is clicked
  function goToWorkoutDetails(workout) {
    navigation.navigate("WorkoutDetails", { workoutId: workout.id });
  }

  //Workout menu indicated by "⋮"
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  function openWorkoutMenu(workout) {
    Alert.alert(
      "Workout Options",
      "WARNING: Deleting a workout will delete all workout related logs \n to preserve logs we suggest archiving. Archived workouts will not be shown on page",
      [
        {
          text: "Rename",
          onPress: () => {
            setRenameVisible(true);
            setSelectedWorkout(workout);
          },
        },
        {
          text: "Archive",
          onPress: () => {
            archiveWorkout(workout.id);
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

  //Rename workout function
  const [renameVisible, setRenameVisible] = useState(false);
  const [newName, setNewName] = useState("");
  function renamePopUp(workout) {
    return (
      <PopupModal
        modalVisible={renameVisible}
        setModalVisible={setRenameVisible}
      >
        <Text style={{ marginBottom: 10 }}>Enter New Name</Text>
        <TextInput
          placeholder="New Name"
          value={newName}
          onChangeText={setNewName}
          style={{
            borderWidth: 1,
            padding: 10,
            marginBottom: 10,
            width: "100%",
          }}
        />
        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
          {/**Close Button */}
          <TouchableOpacity 
              style={{
                backgroundColor: "grey",
                flex: 1,
                marginTop: 5,
                marginHorizontal: 5,
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
                borderColor: "black",
                elevation: 4,
                borderWidth: 1.3,
                borderColor: 'black',
                borderBottomWidth: 6,
                borderBottomColor: 'black',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
              }}
              onPress={() => setRenameVisible(false)}
            >
              <Text style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 16,
                fontFamily: 'Inter_600SemiBold',
              }}>
                Close
              </Text>
          </TouchableOpacity>
          {/**Rename Button */}
          <TouchableOpacity 
              style={{
                backgroundColor: "#2D9CFF",
                flex: 1,
                marginTop: 5,
                marginHorizontal: 5,
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
                borderColor: "black",
                elevation: 4,
                borderWidth: 1.3,
                borderColor: 'black',
                borderBottomWidth: 6,
                borderBottomColor: 'black',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
              }}
              onPress={() => {
                renameWorkout(workout.id, newName);
                setRenameVisible(false);
                setNewName("");
              }}
            >
              <Text style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 16,
                fontFamily: 'Inter_600SemiBold',
              }}>
                Rename
              </Text>
          </TouchableOpacity>
        </View>
      </PopupModal>
    );
  }

  const [archivedVisible, setArchivedVisible] = useState(false);
  return (
    /*Display Workouts With daggable functionality.
      Creates a header containing add button with
      Popup Modal where user enters Workout to add.*/
    <>
      <View style={styles.container}>
        <Text style={styles.header}>Your Workouts</Text>
        {/*Current Workouts*/}
        {workouts.filter((item) => !item.archived).length > 0 && (
          <DraggableLogList
            bold={true}
            data={workouts.filter((item) => !item.archived).sort((a, b) => b.order - a.order)}
            reorderWorkouts={reorderWorkouts}
            function2={goToWorkoutDetails}
            onMenuPress={openWorkoutMenu} // ✅ pass kebab menu handler
          />
        )}


        {renamePopUp(selectedWorkout)}
        {workouts.filter((item) => !item.archived).length === 0 && <Text style={styles.noWorkoutsText}>Create a workout to get started!</Text>}

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#F2F2F2', 
  },
  header: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    color: '#2d3748',
    letterSpacing: -0.5,
    fontFamily: 'Inter_700Bold',
  },
  addWorkoutButton: {
    backgroundColor: '#4CAF50', // green-ish button
    height: 60,
    width: 60,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  addWorkoutText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  archiveButton: {
    backgroundColor: '#B3B3B3',
    height: 60,
    width: 60,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  noWorkoutsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 24,
  },

})