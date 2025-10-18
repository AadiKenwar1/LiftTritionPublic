import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import uuid from "react-native-uuid";
import { useWorkoutContext } from "../../../context/Workouts/WorkoutContext";
import DraggableLogList from "../../../components/DraggableLogList";
import { useNavigation } from "@react-navigation/native";
import ExerciseSelector from "../../../components/ExerciseSelector";
import PopupModal from "../../../components/PopupModal";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../../../components/CustomHeader";
import NotesModal from "../../../components/Notes";
import ArchivedPopup from '../../../components/ArchivedPopup'
import Foundation from '@expo/vector-icons/Foundation';
import Fab from "../../../components/Fab"
import ItemSelector from "../../../components/ItemSelector";

export default function WorkoutDetails() {
  //Object functions
  const {
    workouts,
    addExerciseToWorkout,
    reorderExercises,
    deleteExercise,
    addNoteToWorkout,
    archiveExercise
  } = useWorkoutContext();


  //Gets the workout exercise is containedin
  const route = useRoute();
  const { workoutId } = route.params;
  const workout = workouts.find((w) => w.id === workoutId);

  const [modalVisible, setModalVisible] = useState(false);


  //Adds exercise to workout
  const [selectedExercise, setSelectedExercise] = useState("");
  function handleAddExercise() {
    const alreadyExists = workout.exercises.some(
      (item) => item.name === selectedExercise,
    );
    if (selectedExercise && !alreadyExists) {
      const newExercise = {
        id: uuid.v4(),
        name: selectedExercise,
        logs: [],
      };
      addExerciseToWorkout(workoutId, newExercise);
      setModalVisible(false);
    } else {
      Alert.alert("", "This exercise has already been added");
    }
  }

  //Navigates to logsScreen when exercise is clicked
  const navigation = useNavigation();
  function goToLogDetails(exercise) {
    navigation.navigate("LogDetails", {
      workoutId: workout.id,
      exerciseId: exercise.id,
    });
  }

  //Exercise menu indicated by "⋮"
  function openExerciseMenu(workout, exercise) {
    Alert.alert("Exercise Options", "", [
      {
        text:"Archive",
        onPress:() => {
          archiveExercise(workout.id, exercise.id)
        }

      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteExercise(workout.id, exercise.id);
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  }

  const [note, setNote] = useState(workout.note);
  const [notesVisible, setNotesVisible] = useState(false);
  function handleClose() {
    setNotesVisible(false);
    addNoteToWorkout(workout.id, note);
  }


  const [archivedVisible, setArchivedVisible] = useState("");

  return (
    /*Display Exercises With daggable functionality.
        Creates a header containing add button with
        Popup Modal where user selects exercise to add.*/
    <>
      <CustomHeader title={`Exercises in ${workout.name}`} showBack />

      <View style={styles.container}>

        {/**Display Exercies in Workout */}
        <DraggableLogList
          data={workout.exercises.filter((item) => !item.archived)}
          workout={workout}
          reorderExercises={reorderExercises}
          function2={goToLogDetails}
          onMenuPress={openExerciseMenu} // ✅ pass kebab menu handler
        />


        {/**Floating Action Buttons */}
        <Fab>
          {[
            // Add Button
            <TouchableOpacity
              key="add"
              style={styles.addExerciseButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Ionicons
                name="add"
                size={40}
                color="white"
              />
            </TouchableOpacity>,

            // Archive Button
            <TouchableOpacity
              key="archive"
              style={styles.archiveButton}
              onPress={() => {
                setArchivedVisible(!archivedVisible);
              }}
            >
              <Ionicons
                name="archive-outline"
                size={40}
                color="white"
              />
            </TouchableOpacity>,

            // Notes Button
            <TouchableOpacity
              key="notes"
              style={styles.notesButton}
              onPress={() => {
                setNotesVisible(!notesVisible);
              }}
            >
              <Foundation
                name="clipboard-notes"
                size={40}
                color="white"
              />
            </TouchableOpacity>
          ]}
        </Fab>

        {/* Modals */}
        <PopupModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        >
          <ExerciseSelector
            selectedExercise={selectedExercise}
            setSelectedExercise={setSelectedExercise}
            function={handleAddExercise}
            setModalVisible={setModalVisible}
          />
        </PopupModal>

        <ArchivedPopup
          visible={archivedVisible}
          data={workout.exercises.filter((item) => item.archived)}
          onClose={() => setArchivedVisible(false)}
          marginBottom={30}
          workout={workout}
        />

        <NotesModal
          visible={notesVisible}
          onClose={handleClose}
          note={note}
          setNote={setNote}
          title={"Notes for Workout: " + workout.name}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    margineBottom: 10,
    marginBottom: 20,
    color: 'black',
  },
  addExerciseButton: {
    backgroundColor: "#007bff",
    height: 60,
    width: 60,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  addExerciseText: {
    color: "black",
    fontSize: 40,
    fontWeight: 5000,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownText: {
    fontSize: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  archiveButton: {
    backgroundColor: "#B3B3B3",
    height: 60,
    width: 60,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  notesButton: {
    backgroundColor: "#FFD52E",
    height: 60,
    width: 60,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
})