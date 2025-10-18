import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useWorkoutContext } from "../../../context/Workouts/WorkoutContext";
import { Entypo } from "@expo/vector-icons"; // Add this line
import CustomHeader from "../../../components/CustomHeader";
import NotesModal from "../../../components/Notes";
import { Ionicons } from "@expo/vector-icons";
import Foundation from '@expo/vector-icons/Foundation';
import DateTimePicker from '@react-native-community/datetimepicker';



export default function LogDetails() {
  //Object Functions
  const { workouts, addLogToExercise, deleteLog, addNoteToExercise, exerciseLibrary, setLatestLogExercise} =
    useWorkoutContext();


  //Gets ids of parent exercise and workout
  const route = useRoute();
  const { workoutId, exerciseId } = route.params;
  const workout = workouts.find((w) => w.id === workoutId);
  const exercise = workout.exercises.find((e) => e.id === exerciseId);

  //Set information
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [rpe, setRpe] = useState('');
  const fatigueFactor = exerciseLibrary[exercise.name].fatigueFactor ?? 1
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);


  function handleAddLog() {
    if (!reps || !weight) {
      Alert.alert("Missing Info", "Please enter both reps and weight.");
      return;
    }

    const timestamp = new Date().toISOString();
    const noRPE = rpe === '';
    const newLog = {
      id: timestamp,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      rpe: noRPE ? 8 : parseFloat(rpe),
      rpeEntered: noRPE, //boolean
      fatigueFactor: fatigueFactor
    };
    addLogToExercise(workoutId, exerciseId, newLog);
    setLatestLogExercise(exercise.name)
    setReps("");
    setWeight("");
    setRpe("");
  }

  //Display logs functions
  function displayLogs() {
    const logs = exercise.logs;
    return Object.keys(logs)
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

            {logs[date].map((entry, index) => (
              <View key={entry.id || index} style={styles.logItem}>
                <Text style={styles.logText}>
                  {entry.weight} lbs x {entry.reps} reps{" "}
                  {!entry.defaultRir && entry.rpe !== undefined
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
                          text: "Change Reps",
                        },
                        {
                          text: "Change Sets",
                        },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => {
                            deleteLog(workoutId, exerciseId, date, index);
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
              </View>
            ))}
          </View>
        );
      });
  }

  const [note, setNote] = useState(exercise.note);
  const [notesVisible, setNotesVisible] = useState(false);
  function handleClose() {
    setNotesVisible(false);
    addNoteToExercise(workoutId, exerciseId, note);
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <CustomHeader title={`Logs For ${exercise.name}`} showBack />

          <TouchableOpacity
            style={styles.notesButton}
            onPress={() => {
              setNotesVisible(!notesVisible);
            }}
          >
            <View>
              <Foundation
                name="clipboard-notes"
                size={40}
                color="white"
              />
            </View>

            <NotesModal
              visible={notesVisible}
              onClose={handleClose}
              note={note}
              setNote={setNote}
              title={
                "Notes for " + exercise.name + " in Workout: " + workout.name
              }
            />
          </TouchableOpacity>

          <View style={styles.container}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Weight"
                placeholderTextColor="grey"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
              <TextInput
                style={styles.input}
                placeholder="Reps"
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
              <Pressable style={styles.add} onPress={handleAddLog}>
                <Text style={styles.addText}>+</Text>
              </Pressable>
            </View>
            {displayLogs()}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#F2F2F2", // Light blue-tinted background
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#1E3A8A", // Dark blue
  },
  logItem: {
    backgroundColor: "#2D9CFF", // Main color
    height: 60,
    borderRadius: 12,
    borderColor: "#1E3A8A", // Darker blue border
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#2D9CFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    marginVertical: 20,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "black", // Main color border
    padding: 12,
    borderRadius: 10,
    width: "25%",
    color: "black", // Dark blue text
    fontSize: 16,
    shadowColor: "#2D9CFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  add: {
    backgroundColor: "#007bff", // Main color
    height: 48,
    width: "20%",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#1E3A8A", // Darker blue border
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2D9CFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: 'black', // Light blue line
  },
  lineText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
    color: 'black', // Dark blue
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 8,
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
    backgroundColor: "#FFD52E",
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'black', 
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: '#2D9CFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 10, // ensure it floats above other content
  },
  
})