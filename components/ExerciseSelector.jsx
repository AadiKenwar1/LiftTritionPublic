import {
  View,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useWorkoutContext } from "../context/WorkoutContextFunctions/WorkoutContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ExerciseSelector(props) {

  const navigation = useNavigation();

  const [showPicker, setShowPicker] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { exerciseLibrary } = useWorkoutContext();
  const exerciseList = Object.keys(exerciseLibrary);
  
  const filteredList = exerciseList.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase()),
  )

  const macroList = ["Calories", "Protein", "Carbohydrates", "Fats"]


  const handleSelect = (item) => {
    props.setSelectedExercise(item);
    //setSearchText(item);
    setShowPicker(false);
  };

  function handleNavigate() {
    props.setModalVisible(false);
    navigation.navigate("UserExercisesScreen");
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.dropdown}
        onPress={() => setShowPicker(!showPicker)}
      >
        <View style={styles.dropdownTextItems}>
          <Text style={styles.dropdownText}>
            {props.selectedExercise || "Select an Exercise"}
          </Text>
          <Ionicons
            name={showPicker ? "chevron-up" : "chevron-down"}
            size={18}
            color={props.selectedExercise ? "#000" : "#666"}
            style={{ marginLeft: 8 }}
          />
        </View>
      </Pressable>

      {showPicker && (
        <View style={styles.pickerWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type to filter..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <View style={styles.listContainer}>
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)}>
                <Text style={styles.item}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          </View>
        </View>
      )}

      {props.function && (
        <>
          <Text style={{ marginTop: 10 }}>
            *If an exercise isn't listed, you can add it in{" "}
            <Text style={{ color: "blue" }} onPress={handleNavigate}>
              settings
            </Text>
          </Text>
          <View style={styles.buttonContainer}>
          <TouchableOpacity 
              style={styles.buttonLiftMode} 
              onPress={props.function}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonLiftMode,{backgroundColor: "grey"}]}
              onPress={() => props.setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 20,
  },
  dropdown: {
    backgroundColor: "#fff",
    width: "100%",
    borderWidth: 2,
    borderRadius: 8,
    borderColor: "black",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownTextItems: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,

  },
  dropdownText: {
    fontSize: 16,
    color: "black",
    flexShrink: 1,
    letterSpacing: 0.2,
  },
  pickerWrapper: {
    borderWidth: 2,
    borderRadius: 8,
    marginTop: 4,
    borderColor: "#000",
    backgroundColor: "#fff",
    width: "100%",
    padding: 16,
    maxHeight: 250,
    overflow: "hidden",
  },
  input: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    width: "100%",
    color: "#000",
    backgroundColor: "#fff",
  },
  list: {
    width: "100%",
  },
  listContainer: {
    height: 175,
    borderRadius: 6,
    overflow: "hidden",
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 16,
    color: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    width: "100%",
    letterSpacing: 0.2,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20,
    flexDirection: "column",
    gap: 10,
  },
  buttonLiftMode: {
    backgroundColor: "#2D9CFF",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
})