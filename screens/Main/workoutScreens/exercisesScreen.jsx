import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useWorkoutContext } from "../../../context/WorkoutsV2/WorkoutContext";
import DraggableLogList from "../../../components/DraggableLogList";
import ExerciseSelector from "../../../components/ExerciseSelector";
import PopupModal from "../../../components/PopupModal";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../../../components/CustomHeader";
import NotesModal from "../../../components/Notes";
import ArchivedPopup from '../../../components/ArchivedPopup'
import Foundation from '@expo/vector-icons/Foundation';
import Fab from "../../../components/Fab"

export default function WorkoutDetails() {
  // V2 Context - now using for main functionality
  const {
    workouts,
    addExercise,
    reorderExercises,
    deleteExercise,
    archiveExercise,
    getExercisesForWorkout,
    addNoteToWorkout,
  } = useWorkoutContext();


  //Gets the workout exercise is contained in
  const route = useRoute();
  const { workoutId } = route.params;
  const workout = workouts.find((w) => w.id === workoutId);
  
  // Get exercises for this workout using V2 flat structure
  const workoutExercises = getExercisesForWorkout(workoutId);

  const [modalVisible, setModalVisible] = useState(false);


  //Adds exercise to workout
  const [selectedExercise, setSelectedExercise] = useState("");
  function handleAddExercise() {
    const alreadyExists = workoutExercises.some(
      (item) => item.name === selectedExercise,
    );
    if (selectedExercise && !alreadyExists) {
      console.log('🚀 Adding exercise with V2 context:', selectedExercise);
      console.log('📊 Current V2 exercises count for workout:', workoutExercises.length);
      addExercise(workoutId, selectedExercise);
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
          console.log('🚀 Archiving exercise with V2 context:', exercise.name);
          archiveExercise(exercise.id);
        }

      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          console.log('🚀 Deleting exercise with V2 context:', exercise.name);
          deleteExercise(exercise.id);
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
    console.log('🚀 Adding workout note with V2 context:', note);
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

        {/**Display Exercises in Workout */}
        <DraggableLogList
          data={workoutExercises.filter((item) => !item.archived)}
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
                size={35}
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
                size={35}
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
                size={35}
                color="white"
              />
            </TouchableOpacity>
          ]}
        </Fab>

        {/* Modals */}
        <PopupModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          showButtons={true}
          onAdd={handleAddExercise}
          onClose={() => setModalVisible(false)}
          showSettingsLink={true}
          onNavigateToSettings={() => {
            setModalVisible(false);
            navigation.navigate("UserExercisesScreen");
          }}
        >
          <ExerciseSelector
            selectedExercise={selectedExercise}
            setSelectedExercise={setSelectedExercise}
            setModalVisible={setModalVisible}
          />
        </PopupModal>

        <ArchivedPopup
          visible={archivedVisible}
          data={workoutExercises.filter((item) => item.archived)}
          onClose={() => setArchivedVisible(false)}
          marginBottom={30}
          workout={workout}
        />

        <NotesModal
          visible={notesVisible}
          onClose={handleClose}
          note={note}
          setNote={setNote}
          title={"Notes for " + workout.name}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#242424",
  },
  addExerciseButton: {
    backgroundColor: "#2D9CFF",
    height: 60,
    width: 60,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  archiveButton: {
    backgroundColor: "#2D9CFF",
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
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  notesButton: {
    backgroundColor: "#2D9CFF",
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
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
})