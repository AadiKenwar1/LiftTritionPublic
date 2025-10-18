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
import { useWorkoutContext } from "../context/Workouts/WorkoutContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSettings } from "../context/SettingsContext";

export default function ExerciseSelector(props) {

  const navigation = useNavigation();
  const {mode} = useSettings()

  const [showPicker, setShowPicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedItem, setSelectedItem] = useState("")

  const { exerciseLibrary } = useWorkoutContext();
  const exerciseList = Object.keys(exerciseLibrary);
  const filteredExerciseList = exerciseList.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase()),
  )

  const macroList = ["Protein", "Carbs", "Fats"]
  const filteredMacroList = macroList.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase()),
  )


  function handleChosen(item){
    setSelectedItem(item);
    setShowPicker(false);
  }

  function handleSelect(){
    props.setSelectedItem(selectedItem)
    props.function(false)
  }


  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.dropdown, showPicker && styles.dropdownActive]}
        onPress={() => setShowPicker(!showPicker)}
      >
        <View style={styles.dropdownTextItems}>
          <Text style={[styles.dropdownText, selectedItem && styles.selectedText]}>
            {selectedItem || ("Select a "+ (mode === true? "Exercise": "Macronutrient"))}
          </Text>
          <Ionicons
            name={showPicker ? "chevron-up" : "chevron-down"}
            size={18}
            color={selectedItem ? "#000" : "#666"}
            style={styles.chevronIcon}
          />
        </View>
      </Pressable>

      {showPicker && (
        <View style={styles.pickerWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type to filter..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <View style={styles.listContainer}>
            <FlatList
              data={mode == true? filteredExerciseList: filteredMacroList}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => handleChosen(item)}
                  style={styles.listItem}
                  activeOpacity={0.7}
                >
                  <Text style={styles.item}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}

      {props.function && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              !selectedItem ? styles.buttonDisabled : 
              mode === true ? styles.buttonLiftMode : styles.buttonMacroMode
            ]} 
            onPress={handleSelect}
            disabled={!selectedItem}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, !selectedItem && styles.buttonTextDisabled]}>
              Select
            </Text>
          </TouchableOpacity>
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
    marginTop: 10,
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
  dropdownActive: {
    borderColor: "#000",
  },
  dropdownTextItems: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: "#666",
    flexShrink: 1,
    letterSpacing: 0.2,
  },
  selectedText: {
    color: "#000",
    fontWeight: "600",
  },
  chevronIcon: {
    marginLeft: 8,
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
  listContainer: {
    height: 175,
  },
  list: {
    width: "100%",
  },
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  item: {
    paddingVertical: 8,
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
  },
  buttonMacroMode: {
    backgroundColor: "#4CD964",
    width: "100%",
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
    borderBottomRightRadius: 12
  },
  buttonLiftMode: {
    backgroundColor: "#2D9CFF",
    width: "100%",
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
    borderBottomRightRadius: 12
  },
  buttonDisabled: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: "100%",
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
    borderBottomRightRadius: 12
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonTextDisabled: {
    color: "#000",
  },
})