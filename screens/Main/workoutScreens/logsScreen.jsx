import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useWorkoutContext } from "../../../context/WorkoutsV2/WorkoutContext";
import { Entypo } from "@expo/vector-icons";
import CustomHeader from "../../../components/CustomHeader";
import NotesModal from "../../../components/Notes";
import { Ionicons } from "@expo/vector-icons";
import Foundation from '@expo/vector-icons/Foundation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSettings } from "../../../context/Settings/SettingsContext";
import { LinearGradient } from 'expo-linear-gradient';

export default function LogDetails() {
  // V2 Context - now using for main functionality
  const {
    workouts,
    exercises,
    logs,
    addLog,
    deleteLog,
    getLogsForExercise,
    addNoteToExercise,
  } = useWorkoutContext();

  const { setLastExercise, unit } = useSettings();
  //Gets ids of parent exercise and workout
  const route = useRoute();
  const { workoutId, exerciseId } = route.params;
  const workout = workouts.find((w) => w.id === workoutId);
  const exercise = exercises.find((e) => e.id === exerciseId);
  
  // Get logs for this exercise using V2 flat structure
  const exerciseLogs = getLogsForExercise(exerciseId);

  //Set information
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [rpe, setRpe] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);


  function handleAddLog() {
    if (!reps || !weight) {
      Alert.alert("Missing Info", "Please enter both reps and weight.");
      return;
    }
    const noRPE = rpe === '';
    const logData = {
      workoutId: workoutId,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      rpe: noRPE ? 8 : parseFloat(rpe)
    };
    
    console.log('🚀 Adding log with V2 context:', logData);
    console.log('📊 Current V2 logs count for exercise:', exerciseLogs.length);
    addLog(exerciseId, logData);
    setLastExercise(exercise.name);
    //setReps("");
    //setWeight("");
    //setRpe("");
  }

  //Display logs functions - V2 flat structure
  function displayLogs() {
    // Group logs by date
    const logsByDate = {};
    exerciseLogs.forEach(log => {
      if (!logsByDate[log.date]) {
        logsByDate[log.date] = [];
      }
      logsByDate[log.date].push(log);
    });

    return Object.keys(logsByDate)
      .slice()
      .reverse()
      .map((date) => {
        return (
          //This is the date surrounded by lines
          <View key={date}>
            <View style={styles.lineWithText}>
              <View style={styles.line} />
              <Text style={styles.lineText}>{date}</Text>
              <View style={styles.line} />
            </View>

            {logsByDate[date].map((entry, index) => {
              const content = (
                <>
                  <Text style={[
                    styles.logText,
                    entry.synced === false && styles.logTextUnsynced
                  ]}>
                    {entry.weight} {unit ? 'lbs' : 'kg'} x {entry.reps} reps{" "}
                    {entry.rpe !== undefined && entry.rpe !== 8
                      ? "x RPE: " + entry.rpe
                      : ""}
                  </Text>

                  {/* Kebab Menu Button */}
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

              // Render gradient for synced items; solid style for unsynced
              if (entry.synced === false) {
                return (
                  <View
                    key={entry.id || index}
                    style={[styles.logItem, styles.logItemUnsynced]}
                  >
                    {content}
                  </View>
                );
              }

              return (
                <View key={entry.id || index} style={styles.logItemWrapper}>
                  <LinearGradient
                    colors={['#1A7FE0', '#2D9CFF', '#3DAFFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.logItem}
                  >
                    {content}
                  </LinearGradient>
                </View>
              );
            })}
          </View>
        );
      });
  }

  const [note, setNote] = useState(exercise?.note || "");
  const [notesVisible, setNotesVisible] = useState(false);
  function handleClose() {
    setNotesVisible(false);
    console.log('🚀 Adding exercise note with V2 context:', note);
    addNoteToExercise(exerciseId, note);
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
              <TextInput
                style={styles.input}
                placeholder="Weight*"
                placeholderTextColor="grey"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
              <TextInput
                style={styles.input}
                placeholder="Reps*"
                placeholderTextColor="grey"
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
              />
              <TextInput
                style={styles.input}
                placeholder="RPE"
                placeholderTextColor="grey"
                keyboardType="numeric"
                value={rpe}
                onChangeText={setRpe}
              />
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
            <Text style={styles.rpeInfo}>Not sure what RPE means? No problem, you can leave it blank.</Text>
            {displayLogs()}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      {/* Notes Button outside ScrollView so it doesn't scroll */}
      <TouchableOpacity
        style={styles.notesButton}
        onPress={() => {
          setNotesVisible(!notesVisible);
        }}
      >
        <View>
          <Foundation
            name="clipboard-notes"
            size={35}
            color="white"
          />
        </View>

        <NotesModal
          visible={notesVisible}
          onClose={handleClose}
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
  logItemUnsynced: {
    backgroundColor: "#9CA3AF", // Grey color for unsynced
    borderColor: "#6B7280", // Darker grey border
    shadowColor: "#9CA3AF",
    marginBottom: 12,
  },
  logText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
    flex: 1,
  },
  logTextUnsynced: {
    color: "#F3F4F6", // Light grey text for unsynced
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