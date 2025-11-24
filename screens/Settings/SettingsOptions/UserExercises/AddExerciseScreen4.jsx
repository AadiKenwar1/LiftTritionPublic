import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useWorkoutContext } from "../../../../context/WorkoutsV2/WorkoutContext";
import { useAuthContext } from "../../../../context/Auth/AuthContext";
import CustomHeader from "../../../../components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";

const allMuscles = [
  "Upper Chest", "Lower Chest", "Front Deltoid", "Side Deltoid", "Rear Deltoid",
  "Bicep Long Head", "Bicep Short Head", "Brachialis", "Tricep Long Head",
  "Tricep Medial Head", "Tricep Lateral Head", "Forearm", "Glutes", "Quads",
  "Hamstrings", "Calves", "Adductors", "Abductors", "Abs", "Obliques",
  "Upper Back", "Lats", "Lower Back", "Traps",
];

export default function AddExerciseScreen4() {
  const navigation = useNavigation();
  const route = useRoute();
  const { exerciseData } = route.params;
  const { addUserExercise, exerciseLibrary } = useWorkoutContext();
  
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Filter out the primary muscle from the list
  const availableMuscles = allMuscles.filter(muscle => muscle !== exerciseData.mainMuscle);
  const filteredMuscles = availableMuscles.filter(muscle =>
    muscle.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleMuscle = (muscle) => {
    if (selectedMuscles.includes(muscle)) {
      setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
    } else {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

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

  const handleSave = async () => {
    // PRESERVE: Input validation and sanitization
    const trimmedName = exerciseData.name.trim();
    
    if (!trimmedName) {
      Alert.alert("Error", "Please enter an exercise name.");
      return;
    }

    if (selectedMuscles.length === 0) {
      Alert.alert("Error", "Please select at least one accessory muscle.");
      return;
    }

    // PRESERVE: Duplicate checking logic
    const normalizedInput = trimmedName.toLowerCase();
    const existingNames = Object.keys(exerciseLibrary).map((name) => name.toLowerCase());
    
    if (existingNames.includes(normalizedInput)) {
      Alert.alert("Duplicate Exercise", "An exercise with this name already exists.");
      return;
    }

    // PRESERVE: Fatigue factor calculation
    const fatigueFactor = estimateFatigueFactor({
      mainMuscle: exerciseData.mainMuscle,
      accessoryMuscles: selectedMuscles,
      isCompound: exerciseData.isCompound,
      equipmentType: exerciseData.equipmentType,
    });

    try {
      // Use the robust V2 context function with all the calculated data
      await addUserExercise({
        name: trimmedName, // Use trimmed name
        isCompound: exerciseData.isCompound,
        fatigueFactor, // Use calculated fatigue factor
        userMax: 0,
        mainMuscle: exerciseData.mainMuscle,
        accessoryMuscles: selectedMuscles,
      });

      Alert.alert("Success", "Exercise added successfully!", [
        { text: "OK", onPress: () => navigation.navigate("UserExercisesScreen") }
      ]);
    } catch (error) {
      console.error("Error saving exercise:", error);
      Alert.alert("Error", "Failed to save exercise. Please try again.");
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <>
      <CustomHeader title="Add Exercise" showBack />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Step 4 of 4</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Select Secondary Muscles</Text>
            <Text style={styles.headerSubtitle}>
              Which other muscles are worked by "{exerciseData.name}"? (Optional)
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search muscles..."
              placeholderTextColor="#8E8E93"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <FlatList
            data={filteredMuscles}
            keyExtractor={(item) => item}
            style={styles.muscleList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.muscleCard,
                  selectedMuscles.includes(item) && styles.muscleCardSelected,
                ]}
                onPress={() => toggleMuscle(item)}
                activeOpacity={0.7}
              >
                <View style={styles.muscleContent}>
                  <View style={[
                    styles.checkbox,
                    selectedMuscles.includes(item) && styles.checkboxChecked,
                  ]}>
                    {selectedMuscles.includes(item) && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                  <View style={[
                    styles.muscleIcon,
                    selectedMuscles.includes(item) && styles.muscleIconSelected,
                  ]}>
                    <Ionicons 
                      name="fitness" 
                      size={16} 
                      color={selectedMuscles.includes(item) ? "#fff" : "#2D9CFF"} 
                    />
                  </View>
                  <Text style={[
                    styles.muscleName,
                    selectedMuscles.includes(item) && styles.muscleNameSelected,
                  ]}>
                    {item}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={20} color="#8E8E93" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#242424",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#1A1A1A",
    borderRadius: 2,
    overflow: "hidden",
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2D9CFF",
    borderRadius: 2,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    fontFamily: "Inter_700Bold",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 0.3,
    borderColor: "grey",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "white",
    fontFamily: "Inter_400Regular",
  },
  muscleList: {
    flex: 1,
    marginBottom: 20,
  },
  muscleCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.3,
    borderColor: "grey",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  muscleCardSelected: {
    borderColor: "#2D9CFF",
    backgroundColor: "#1A1A1A",
  },
  muscleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 0.3,
    borderColor: "grey",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#242424",
  },
  checkboxChecked: {
    backgroundColor: "#2D9CFF",
    borderColor: "#2D9CFF",
  },
  muscleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  muscleIconSelected: {
    backgroundColor: "#2D9CFF",
    borderColor: "#2D9CFF",
  },
  muscleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    flex: 1,
    fontFamily: "Inter_600SemiBold",
  },
  muscleNameSelected: {
    color: "#2D9CFF",
  },
  separator: {
    height: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#8E8E93",
    marginLeft: 4,
    fontFamily: "Inter_400Regular",
  },
  saveButton: {
    backgroundColor: "#2D9CFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'black',
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    fontFamily: "Inter_700Bold",
  },
});
