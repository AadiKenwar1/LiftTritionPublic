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
import { useNavigation } from "@react-navigation/native";
import { useSettings } from "../context/Settings/SettingsContext";

export default function ItemSelector(props) {

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
            color={'white'}
            style={styles.chevronIcon}
          />
        </View>
      </Pressable>

      {showPicker && (
        <View style={styles.pickerWrapper}>
          <TextInput
            style={styles.input}
            placeholder={mode === true ? "Search an exercise..." : "Search a macronutrient..."}
            placeholderTextColor="grey"
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
                  activeOpacity={0.6}
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
  dropdownActive: {
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
    fontFamily: 'Inter_500Medium',
  },
  selectedText: {
    color: "white",
    fontWeight: "600",
  },
  chevronIcon: {
    marginLeft: 8,
  },
  pickerWrapper: {
    borderRadius: 8,
    marginTop: 4,
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
    marginBottom: 5,
    fontSize: 16,
    width: "100%",
    color: "white",
    backgroundColor: "#1A1A1A",
    borderWidth: 0.3,
    borderColor: 'grey',
    fontFamily: 'Inter_500Medium',
  },
  listContainer: {
    height: 175,
    borderRadius: 6,
    overflow: "hidden",
  },
  list: {
    width: "100%",
  },
  listItem: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  item: {
    fontSize: 16,
    color: "white",
    fontWeight: '500',
    letterSpacing: 0.2,
    fontFamily: 'Inter_500Medium',
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
    elevation: 4,
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  buttonLiftMode: {
    backgroundColor: "#2D9CFF",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderColor: "black",
    elevation: 4,
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,

  },
  buttonDisabled: {
    backgroundColor: "grey",
    borderWidth: 1,
    borderColor: "grey",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderColor: "black",
    elevation: 4,

  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonTextDisabled: {
    color: "white",
  },
})