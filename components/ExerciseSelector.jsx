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
import { useWorkoutContext } from "../context/WorkoutsV2/WorkoutContext";
import { Ionicons } from "@expo/vector-icons";
export default function ExerciseSelector(props) {

  const [showPicker, setShowPicker] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { exerciseLibrary } = useWorkoutContext();
  const exerciseList = Object.keys(exerciseLibrary);
  
  const filteredList = exerciseList.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleSelect = (item) => {
    props.setSelectedExercise(item);
    //setSearchText(item);
    setShowPicker(false);
  };

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
            color={'white'}
            style={{ marginLeft: 8 }}
          />
        </View>
      </Pressable>

      {showPicker && (
        <View style={styles.pickerWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type to filter..."
            placeholderTextColor="grey"
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

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 0,
  },
  dropdown: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
    width: '100%',
    color: 'white',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 0.3,
    borderColor: 'grey',
    
  },
  dropdownTextItems: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,

  },
  dropdownText: {
    fontSize: 16,
    color: "white",
    flexShrink: 1,
    letterSpacing: 0.2,
  },
  pickerWrapper: {
    borderWidth: 2,
    borderRadius: 8,
    marginTop: 4,
    borderColor: "#000",
    backgroundColor: "#1A1A1A",
    width: "100%",
    padding: 16,
    maxHeight: 250,
    overflow: "hidden",
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    width: "100%",
    color: "white",
    backgroundColor: "#1A1A1A",
    borderWidth: 0.3,
    borderColor: 'grey',
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
    color: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    width: "100%",
    letterSpacing: 0.2,
  },
})