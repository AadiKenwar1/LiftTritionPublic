import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomHeader from "../../../../components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";

const allMuscles = [
  "Upper Chest", "Lower Chest", "Front Deltoid", "Side Deltoid", "Rear Deltoid",
  "Bicep Long Head", "Bicep Short Head", "Brachialis", "Tricep Long Head",
  "Tricep Medial Head", "Tricep Lateral Head", "Forearm", "Glutes", "Quads",
  "Hamstrings", "Calves", "Adductors", "Abductors", "Abs", "Obliques",
  "Upper Back", "Lats", "Lower Back", "Traps",
];

export default function AddExerciseScreen3() {
  const navigation = useNavigation();
  const route = useRoute();
  const { exerciseData } = route.params;
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [searchText, setSearchText] = useState("");

  const filteredMuscles = allMuscles.filter(muscle =>
    muscle.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleNext = () => {
    if (!selectedMuscle) {
      alert("Please select a primary muscle.");
      return;
    }
    
    navigation.navigate("AddExerciseScreen4", {
      exerciseData: {
        ...exerciseData,
        mainMuscle: selectedMuscle,
      },
    });
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
            <Text style={styles.progressText}>Step 3 of 4</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Select Primary Muscle</Text>
            <Text style={styles.headerSubtitle}>
              What is the main muscle group for "{exerciseData.name}"?
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search muscles..."
              placeholderTextColor="#999"
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
                  selectedMuscle === item && styles.muscleCardSelected,
                ]}
                onPress={() => setSelectedMuscle(item)}
                activeOpacity={0.7}
              >
                <View style={styles.muscleContent}>
                  <View style={[
                    styles.muscleIcon,
                    selectedMuscle === item && styles.muscleIconSelected,
                  ]}>
                    <Ionicons 
                      name="fitness" 
                      size={20} 
                      color={selectedMuscle === item ? "#fff" : "#00B8A9"} 
                    />
                  </View>
                  <Text style={[
                    styles.muscleName,
                    selectedMuscle === item && styles.muscleNameSelected,
                  ]}>
                    {item}
                  </Text>
                </View>
                {selectedMuscle === item && (
                  <Ionicons name="checkmark-circle" size={24} color="#00B8A9" />
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={20} color="#666" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.nextButton,
                !selectedMuscle && styles.nextButtonDisabled
              ]} 
              onPress={handleNext}
              disabled={!selectedMuscle}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
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
    backgroundColor: "#F2F2F2",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00B8A9",
    borderRadius: 2,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    fontFamily: "Inter_700Bold",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    fontFamily: "Inter_400Regular",
  },
  muscleList: {
    flex: 1,
    marginBottom: 20,
  },
  muscleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  muscleCardSelected: {
    borderColor: "#00B8A9",
    backgroundColor: "#F0FDFA",
  },
  muscleContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  muscleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  muscleIconSelected: {
    backgroundColor: "#00B8A9",
  },
  muscleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Inter_600SemiBold",
  },
  muscleNameSelected: {
    color: "#00B8A9",
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
    color: "#666",
    marginLeft: 4,
    fontFamily: "Inter_400Regular",
  },
  nextButton: {
    backgroundColor: "#00B8A9",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  nextButtonDisabled: {
    backgroundColor: "#CCC",
    borderColor: "#999",
    borderBottomColor: "#999",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
    fontFamily: "Inter_700Bold",
  },
});



