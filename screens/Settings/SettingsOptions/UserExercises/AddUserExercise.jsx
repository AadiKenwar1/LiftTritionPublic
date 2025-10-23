import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useWorkoutContext as useWorkoutContextV2 } from "../../../../context/WorkoutsV2/WorkoutContext";
import CustomHeader from "../../../../components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";

export default function AddUserExercise() {
  const navigation = useNavigation();
  const { setExerciseLibrary, userExercises, setUserExercises, exerciseLibrary, addUserExercise: addUserExerciseV2 } =
    useWorkoutContextV2();

  const allMuscles = [
    "Upper Chest", "Lower Chest", "Front Deltoid", "Side Deltoid", "Rear Deltoid",
    "Bicep Long Head", "Bicep Short Head", "Brachialis", "Tricep Long Head",
    "Tricep Medial Head", "Tricep Lateral Head", "Forearm", "Glutes", "Quads",
    "Hamstrings", "Calves", "Adductors", "Abductors", "Abs", "Obliques",
    "Upper Back", "Lats", "Lower Back", "Traps",
  ];

  const [name, setName] = useState("");
  const [mainOpen, setMainOpen] = useState(false);
  const [mainMuscle, setMainMuscle] = useState(null);
  const [mainSearchText, setMainSearchText] = useState("");
  const [accessoryOpen, setAccessoryOpen] = useState(false);
  const [accessoryMuscles, setAccessoryMuscles] = useState([]);
  const [accessorySearchText, setAccessorySearchText] = useState("");
  const [isCompound, setIsCompound] = useState(false);
  const [equipmentType, setEquipmentType] = useState(null);
  const [equipmentOpen, setEquipmentOpen] = useState(false);

  // Ensure only one dropdown is open at a time
  const openDropdown = (dropdownName) => {
    setMainOpen(dropdownName === 'main');
    setAccessoryOpen(dropdownName === 'accessory');
    setEquipmentOpen(dropdownName === 'equipment');
  };

  const filteredMainMuscles = allMuscles.filter(muscle =>
    muscle.toLowerCase().includes(mainSearchText.toLowerCase())
  );

  const filteredAccessoryMuscles = allMuscles.filter(muscle =>
    muscle.toLowerCase().includes(accessorySearchText.toLowerCase())
  );

  const estimateFatigueFactor = ({ mainMuscle, accessoryMuscles, isCompound, equipmentType }) => {
    let fatigue = 0.5;
    const equipmentMultipliers = {
      "Machine": 0.8, "Cable": 0.85, "Dumbbell": 1.0, "Barbell": 1.1, "Bodyweight": 1.05,
    };
    if (isCompound) fatigue += 0.2;
    const muscleFatigueFactors = {
      "Quads": 0.15, "Hamstrings": 0.15, "Glutes": 0.15, "Upper Back": 0.12,
      "Lower Back": 0.12, "Lats": 0.12, "Upper Chest": 0.12, "Lower Chest": 0.12,
      "Front Deltoid": 0.12, "Side Deltoid": 0.10, "Rear Deltoid": 0.08,
      "Bicep Long Head": 0.05, "Bicep Short Head": 0.05, "Tricep Long Head": 0.08,
      "Tricep Medial Head": 0.08, "Tricep Lateral Head": 0.08, "Brachialis": 0.03,
      "Forearm": 0.03, "Calves": 0.03, "Adductors": 0.03, "Abductors": 0.03,
      "Abs": 0.02, "Obliques": 0.02, "Traps": 0.1,
    };
    fatigue += muscleFatigueFactors[mainMuscle] || 0.08;
    if (accessoryMuscles.length > 0) {
      const accessoryFatigue = accessoryMuscles.reduce((total, muscle) => {
        return total + (muscleFatigueFactors[muscle] || 0.05) * 0.5;
      }, 0);
      fatigue += Math.min(accessoryFatigue, 0.2);
    }
    const multiplier = equipmentMultipliers[equipmentType] || 1.0;
    fatigue *= multiplier;
    return Math.min(1.1, Math.max(0.5, parseFloat(fatigue.toFixed(2))));
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Missing Info", "Please enter an exercise name.");
      return;
    }
    if (!mainMuscle) {
      Alert.alert("Missing Info", "Please select a main muscle.");
      return;
    }
    if (accessoryMuscles.includes(mainMuscle)) {
      Alert.alert("Invalid Selection", "The accessory muscles cannot include the main muscle.");
      return;
    }
    const normalizedInput = trimmedName.toLowerCase();
    const existingNames = Object.keys(exerciseLibrary).map((name) => name.toLowerCase());
    if (existingNames.includes(normalizedInput)) {
      Alert.alert("Duplicate Exercise", "An exercise with this name already exists.");
      return;
    }
    const fatigueFactor = estimateFatigueFactor({ mainMuscle, accessoryMuscles, isCompound, equipmentType, });
    const exerciseData = { 
      name: trimmedName,
      isCompound, 
      fatigueFactor, 
      userMax: 0, 
      mainMuscle, 
      accessoryMuscles 
    };
    
    // Use V2 addUserExercise function
    await addUserExerciseV2(exerciseData);
    console.log('🚀 Added user exercise with V2 context:', trimmedName);
    Alert.alert("Success", "Exercise added successfully!", [{ text: "OK", onPress: () => navigation.goBack() }]);
  };

  return (
    <>
      <CustomHeader title="Add Exercise" showBack />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          
          {/* Exercise Name */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Exercise Name</Text>
            <TextInput
              placeholder="Enter exercise name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              style={styles.textInput}
            />
          </View>

          {/* Primary Muscle */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Primary Muscle</Text>
            <TouchableOpacity
              style={[styles.dropdown, mainOpen && styles.dropdownActive]}
              onPress={() => openDropdown(mainOpen ? '' : 'main')}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, mainMuscle && styles.selectedText]}>
                {mainMuscle || "Select primary muscle"}
              </Text>
              <Ionicons
                name={mainOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={mainMuscle ? "#000" : "#999"}
              />
            </TouchableOpacity>
            
            {mainOpen && (
              <View style={styles.dropdownContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor="#999"
                  value={mainSearchText}
                  onChangeText={setMainSearchText}
                />
                <FlatList
                  data={filteredMainMuscles}
                  keyExtractor={(item) => item}
                  style={styles.dropdownList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setMainMuscle(item);
                        openDropdown('');
                        setMainSearchText("");
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Secondary Muscles */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Secondary Muscles</Text>
            <TouchableOpacity
              style={[styles.dropdown, accessoryOpen && styles.dropdownActive]}
              onPress={() => openDropdown(accessoryOpen ? '' : 'accessory')}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, accessoryMuscles.length > 0 && styles.selectedText]}>
                {accessoryMuscles.length > 0 ? `${accessoryMuscles.length} selected` : "Select secondary muscles (optional)"}
              </Text>
              <Ionicons
                name={accessoryOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={accessoryMuscles.length > 0 ? "#000" : "#999"}
              />
            </TouchableOpacity>
            
            {accessoryOpen && (
              <View style={styles.dropdownContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor="#999"
                  value={accessorySearchText}
                  onChangeText={setAccessorySearchText}
                />
                <FlatList
                  data={filteredAccessoryMuscles}
                  keyExtractor={(item) => item}
                  style={styles.dropdownList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        if (accessoryMuscles.includes(item)) {
                          setAccessoryMuscles(accessoryMuscles.filter(muscle => muscle !== item));
                        } else {
                          setAccessoryMuscles([...accessoryMuscles, item]);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.checkboxContainer}>
                        <View style={[
                          styles.checkbox,
                          accessoryMuscles.includes(item) && styles.checkboxChecked
                        ]}>
                          {accessoryMuscles.includes(item) && (
                            <Ionicons name="checkmark" size={10} color="#fff" />
                          )}
                        </View>
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Equipment Type */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Equipment Type</Text>
            <TouchableOpacity
              style={[styles.dropdown, equipmentOpen && styles.dropdownActive]}
              onPress={() => openDropdown(equipmentOpen ? '' : 'equipment')}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, equipmentType && styles.selectedText]}>
                {equipmentType || "Select equipment type"}
              </Text>
              <Ionicons
                name={equipmentOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={equipmentType ? "#000" : "#999"}
              />
            </TouchableOpacity>
            
            {equipmentOpen && (
              <View style={styles.dropdownContainer}>
                <FlatList
                  data={["Machine", "Cable", "Dumbbell", "Barbell", "Bodyweight"]}
                  keyExtractor={(item) => item}
                  style={styles.dropdownList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setEquipmentType(item);
                        openDropdown('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Compound Toggle */}
          <View style={styles.inputCard}>
            <TouchableOpacity
              style={styles.compoundToggle}
              onPress={() => setIsCompound(!isCompound)}
              activeOpacity={0.7}
            >
              <View style={styles.toggleContainer}>
                <View style={[styles.toggleSwitch, isCompound && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleThumb, isCompound && styles.toggleThumbActive]} />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleLabel}>Compound Exercise</Text>
                  <Text style={styles.toggleDescription}>
                    {isCompound ? "Multi-joint movement" : "Single-joint movement"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Add Button */}
                      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.submitButtonText}>Add Exercise</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  content: {
    flex: 1,
    padding: 12,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    flex: 0.48,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#F8F8F8",
    fontFamily: 'Inter',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    backgroundColor: "#F8F8F8",
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownActive: {
    borderColor: "#00B8A9",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#00B8A9",
    backgroundColor: "#fff",
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 120,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownList: {
    maxHeight: 90,
  },
  dropdownText: {
    fontSize: 16,
    color: "#999",
    flex: 1,
    fontFamily: 'Inter',
  },
  selectedText: {
    color: "#000",
    fontWeight: "600",
    fontFamily: 'Inter',
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#000",
    fontFamily: 'Inter',
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#00B8A9",
    borderColor: "#00B8A9",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 6,
    marginVertical: 4,
    fontSize: 15,
    color: "#000",
    backgroundColor: "#F8F8F8",
    fontFamily: 'Inter',
  },
  compoundToggle: {
    backgroundColor: "#F8F8F8",
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleSwitch: {
    width: 34,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E0E0E0",
    marginRight: 10,
    justifyContent: "center",
    position: "relative",
  },
  toggleSwitchActive: {
    backgroundColor: "#00B8A9",
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    position: "absolute",
    left: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    left: 18,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 1,
    fontFamily: 'Inter',
  },
  toggleDescription: {
    fontSize: 11,
    color: "#666",
    lineHeight: 14,
    fontFamily: 'Inter',
  },
  submitButton: {
    backgroundColor: "#00B8A9",
    paddingVertical: 20,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 4,
    letterSpacing: 0.2,
    fontFamily: 'Inter',
  },
});