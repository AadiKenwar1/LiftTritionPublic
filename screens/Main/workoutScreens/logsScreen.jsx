import React, { useState } from "react";
import {View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Keyboard, TouchableWithoutFeedback} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useWorkoutContext } from "../../../context/WorkoutsV2/WorkoutContext";
import CustomHeader from "../../../components/CustomHeader";
import NotesModal from "../../../components/WorkoutComponents/Notes";
import { Ionicons } from "@expo/vector-icons";
import Foundation from '@expo/vector-icons/Foundation';
import { useSettings } from "../../../context/Settings/SettingsContext";
import { LinearGradient } from 'expo-linear-gradient';

export default function LogDetails() {
  //Workout Context Functions
  const {workouts, exercises, addLog, deleteLog, getLogsForExercise, addNoteToExercise} = useWorkoutContext();
  //Settings Context Functions
  const { setLastExercise, unit } = useSettings();
  //Gets parent exercise and workout ids and objects
  const route = useRoute();
  const { workoutId, exerciseId } = route.params;
  const workout = workouts.find((w) => w.id === workoutId);
  const exercise = exercises.find((e) => e.id === exerciseId);
  // Get logs for this exercise 
  const exerciseLogs = getLogsForExercise(exerciseId);
  //Default log information
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [rpe, setRpe] = useState('');
  //Notes popup visibility and note state
  const [notesVisible, setNotesVisible] = useState(false);
  const [note, setNote] = useState(exercise?.note || "");

  //Function to add log
  function handleAddLog() {
    if (!reps || !weight) {
      Alert.alert("Missing Info", "Please enter both reps and weight.")
      return
    }
    if(parseFloat(rpe) > 10 || parseFloat(rpe) < 1) {
      Alert.alert("Invalid RPE", "Please enter a RPE between 1 and 10.")
      return
    }
    const noRPE = rpe === '';
    const logData = {
      workoutId: workoutId,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      rpe: noRPE ? 7 : parseFloat(rpe)
    };    
    addLog(exerciseId, logData);
    setLastExercise(exercise.name);
    
  }

  //Function to close notes popup and add note to exercise
  function handleCloseNotes() {
      setNotesVisible(false);
      addNoteToExercise(exerciseId, note);
    }

  //Group logs by date
  function groupLogsByDate(logs) {
    const logsByDate = {};
    logs.filter(log => !log.deleted).forEach(log => {
      if (!logsByDate[log.date]) {
        logsByDate[log.date] = [];
      }
      logsByDate[log.date].push(log);
    });
    return logsByDate;
  }

  //Render log content (text and button)
  function renderLogContent(entry) {
    return (
      <>
        {/* Log Text */}
        <Text style={styles.logText}>
          {entry.weight} {unit ? 'lbs' : 'kg'} x {entry.reps} reps{" "}
          {entry.rpe !== undefined && entry.rpe !== 7 ? "x RPE: " + entry.rpe : ""}
        </Text>

        {/* Edit Menu Button */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Log Options",
              `Reps: ${entry.reps}, Weight: ${entry.weight}`,
              [
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    console.log('🚀 Deleting log with V2 context:', entry.id);
                    deleteLog(entry.id);
                  },
                },
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ],
            );
          }}
          style={styles.kebabButton}
        >
          <Ionicons name="pencil" size={20} color="white" />
        </TouchableOpacity>
      </>
    );
  }

  //Render a single log entry
  function renderLogContainer(entry, index) {
    return (
      <View key={entry.id || index} style={styles.logItemWrapper}>
        <LinearGradient
          colors={['#1A7FE0', '#2D9CFF', '#3DAFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.logItem}
        >
          {renderLogContent(entry)}
        </LinearGradient>
      </View>
    );
  }

  //Render date header
  function renderDateHeader(date) {
    return (
      <View style={styles.lineWithText}>
        <View style={styles.line} />
        <Text style={styles.lineText}>{date}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  //Render all logs for a specific date
  function renderDateGroup(date, logs) {
    return (
      <View key={date}>
        {renderDateHeader(date)}
        {logs.map((entry, index) => renderLogContainer(entry, index))}
      </View>
    );
  }

  //Function to display logs
  function displayLogs() {
    const logsByDate = groupLogsByDate(exerciseLogs);
    const sortedDates = Object.keys(logsByDate).slice().reverse();
    
    return sortedDates.map((date) => 
      renderDateGroup(date, logsByDate[date])
    );
  }

  return (
    <>
      <CustomHeader title={`Logs For ${exercise.name}`} showBack />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1, backgroundColor: "#242424" }}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
          <View style={styles.container}>
            <View style={styles.inputGroup}>
              {/* Weight Input */}
              <TextInput
                style={styles.input}
                placeholder="Weight*"
                placeholderTextColor="grey"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
              {/* Reps Input */}
              <TextInput
                style={styles.input}
                placeholder="Reps*"
                placeholderTextColor="grey"
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
              />
              {/* RPE Input */}
              <TextInput
                style={styles.input}
                placeholder="RPE"
                placeholderTextColor="grey"
                keyboardType="numeric"
                value={rpe}
                onChangeText={setRpe}
              />
              {/* Add Log Button */}
              <TouchableOpacity style={styles.add} onPress={handleAddLog}>
                <LinearGradient
                  colors={['#1A7FE0', '#2D9CFF', '#3DAFFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.addGradient}
                >
                  <Text style={styles.addText}>+</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {/* RPE Info Text */}
            <Text style={styles.rpeInfo}>Not sure what RPE means? No problem, you can leave it blank.</Text>
            {/* Display Logs */}
            {displayLogs()}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      {/* Notes Button and Popup*/}
      <TouchableOpacity
        style={styles.notesButton}
        onPress={() => {setNotesVisible(!notesVisible);}}>
        <View>
          <Foundation
            name="clipboard-notes"
            size={35}
            color="white"
          />
        </View>
        <NotesModal
          visible={notesVisible}
          onClose={handleCloseNotes}
          note={note}
          setNote={setNote}
          title={
            "Notes for " + exercise.name + " in " + workout.name
          }
        />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#242424", // Light blue-tinted background
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#1E3A8A", // Dark blue
  },
  logItemWrapper: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 8,
  },
  logItem: {
    height: 60,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 0.3,
    borderColor: 'grey',
    overflow: 'hidden',
  },
  logText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
    flex: 1,
  },
  inputGroup: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 10,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1.5,
    borderColor: "black", // Main color border
    padding: 12,
    borderRadius: 10,
    width: "25%",
    color: "white", // Dark blue text
    fontSize: 16,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  add: {
    height: 48,
    width: "20%",
    borderRadius: 10,
    borderWidth: 0.3,
    borderColor: "grey", // Darker blue border
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey'
  },
  addGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    fontSize: 24,
    color: 'white',
    fontWeight: "bold",
  },
  lineWithText: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'white', // Light blue line
  },
  lineText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Inter_500Medium',
    color: 'white', // Dark blue
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
  },
  kebabButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  notesButton: {
    position: "absolute",
    left: 20,
    bottom: 20,
    backgroundColor: "#2D9CFF",
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'black', 
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
    zIndex: 10, // ensure it floats above other content
  },
  rpeInfo: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
    fontFamily: 'Inter_500Medium',
  },
})