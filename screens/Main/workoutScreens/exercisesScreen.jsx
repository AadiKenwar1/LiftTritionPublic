import React, { useState } from "react";
import {View, StyleSheet, Alert, TouchableOpacity, Text} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useWorkoutContext } from "../../../context/WorkoutsV2/WorkoutContext";
import DraggableLogList from "../../../components/WorkoutComponents/DraggableLogList";
import ExerciseSelector from "../../../components/WorkoutComponents/ExerciseSelector";
import PopupModal from "../../../components/PopupModal";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../../../components/CustomHeader";
import NotesModal from "../../../components/WorkoutComponents/Notes";
import ArchivedPopup from '../../../components/WorkoutComponents/ArchivedPopup'
import Foundation from '@expo/vector-icons/Foundation';
import Fab from "../../../components/Fab"

export default function WorkoutDetails() {
  //Workout Context Functions
  const {workouts, addExercise, reorderExercises, deleteExercise, archiveExercise, getExercisesForWorkout, addNoteToWorkout} = useWorkoutContext();
  //Gets the workout id and workout object from the route params
  const route = useRoute();
  const { workoutId } = route.params;
  const workout = workouts.find((w) => w.id === workoutId);
  // Get exercises for this workout using V2 flat structure
  const workoutExercises = getExercisesForWorkout(workoutId);
  //Add exercise popup visibility
  const [addExerciseVisible, setAddExerciseVisible] = useState(false);
  //Archived popup visibility
  const [archivedVisible, setArchivedVisible] = useState("");
  //Notes popup visibility and note state
  const [notesVisible, setNotesVisible] = useState(false);
  const [note, setNote] = useState(workout.note);
  //Selected exercise object state
  const [selectedExercise, setSelectedExercise] = useState("");
  //Navigation
  const navigation = useNavigation();

  //Function to add exercise to workout
  function handleAddExercise() {
    const alreadyExists = workoutExercises.some((item) => item.name === selectedExercise);
    if (selectedExercise && !alreadyExists) {
      addExercise(workoutId, selectedExercise);
      setAddExerciseVisible(false);
    } else {
      Alert.alert("", "This exercise has already been added");
    }
  }

  //Function to navigate to logs for an exercise when clicked
  function goToLogDetails(exercise) {
    navigation.navigate("LogDetails", {
      workoutId: workout.id,
      exerciseId: exercise.id,
    });
  }

  //Function to close notes popup and add note to workout
  function handleCloseNotes() {
    setNotesVisible(false);
    addNoteToWorkout(workout.id, note);
  }

  //Exercise edit menu, allowing archiving and deleting
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

  return (
    <>
      <CustomHeader title={`Exercises in ${workout.name}`} showBack />

      <View style={styles.container}>

        {/**Floating Action Button for adding, archiving, and notes */}
        <Fab>
          {[
            // Add Button
            <TouchableOpacity
              key="add"
              style={styles.addExerciseButton}
              onPress={() => setAddExerciseVisible(!addExerciseVisible)}
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

        {/**Display exercises*/}
        <DraggableLogList
          data={workoutExercises.filter((item) => !item.archived && !item.deleted)}
          workout={workout}
          reorderExercises={reorderExercises}
          function2={goToLogDetails}
          onMenuPress={openExerciseMenu}
        />

        
        {/* Add exercise popup */}
        <PopupModal
          modalVisible={addExerciseVisible}
          setModalVisible={setAddExerciseVisible}
          showButtons={true}
          marginBottom={80}
          onAdd={handleAddExercise}
          onClose={() => setAddExerciseVisible(false)}
        >
          <ExerciseSelector
            selectedExercise={selectedExercise}
            setSelectedExercise={setSelectedExercise}
          />
          <Text style={styles.settingsText}>
            *If an exercise isn't listed, you can add it in{" "}
            <Text 
              style={styles.settingsLink} 
              onPress={() => {
                setAddExerciseVisible(false);
                navigation.navigate("UserExercisesScreen");
              }}
            >
              settings
            </Text>
          </Text>
        </PopupModal>

        {/* Archived exercises popup */}
        <ArchivedPopup
          visible={archivedVisible}
          data={workoutExercises.filter((item) => item.archived && !item.deleted)}
          onClose={() => setArchivedVisible(false)}
          marginBottom={30}
          workout={workout}
        />

        {/* Notes popup */}
        <NotesModal
          visible={notesVisible}
          onClose={handleCloseNotes}
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
})