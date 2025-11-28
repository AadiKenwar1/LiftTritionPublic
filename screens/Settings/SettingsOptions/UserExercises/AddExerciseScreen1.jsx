import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard, 
  TouchableWithoutFeedback,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../../../components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";
import { Dumbbell } from 'lucide-react-native';
import { useWorkoutContext } from "../../../../context/WorkoutsV2/WorkoutContext";

export default function AddExerciseScreen1() {
  const navigation = useNavigation();
  const { exerciseLibrary } = useWorkoutContext();
  const [name, setName] = useState("");
  const [isCompound, setIsCompound] = useState(false);

  const handleNext = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Error", "Please enter an exercise name.");
      return;
    }

    // Duplicate checking logic
    const normalizedInput = trimmedName.toLowerCase();
    const existingNames = Object.keys(exerciseLibrary).map((name) => name.toLowerCase());
    
    if (existingNames.includes(normalizedInput)) {
      Alert.alert("Duplicate Exercise", "An exercise with this name already exists.");
      return;
    }
    
    navigation.navigate("AddExerciseScreen2", {
      exerciseData: {
        name: trimmedName,
        isCompound,
      },
    });
  };

  return (
    <>
      <CustomHeader title="Add Exercise" showBack />
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
          {/* Header Section */}


          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Step 1 of 4</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '25%' }]} />
            </View>
          </View>

          {/* Exercise Name Card */}
          <View style={styles.inputCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="text-outline" size={24} color="#00B8A9" />
              <Text style={styles.inputLabel}>Exercise Name</Text>
            </View>
            <Text style={styles.inputDescription}>
              Give your exercise a clear, descriptive name
            </Text>
            <TextInput
              placeholder="e.g., Barbell Bench Press"
              placeholderTextColor="#8E8E93"
              value={name}
              onChangeText={setName}
              style={styles.textInput}
            />
          </View>

          {/* Compound Toggle Card */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleCardHeader}>
              <Ionicons name="body-outline" size={24} color="#00B8A9" />
              <View style={styles.toggleHeaderText}>
                <Text style={styles.toggleCardTitle}>Exercise Type</Text>
                <Text style={styles.toggleCardDescription}>
                  Select the movement pattern for your exercise
                </Text>
              </View>
            </View>
            
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
                  Compound exercises work multiple muscle groups, while isolation exercises target a single muscle.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>



          {/* Next Button */}
          <TouchableOpacity 
            style={[
              styles.nextButton,
              !name.trim() && styles.nextButtonDisabled
            ]} 
            onPress={handleNext}
            disabled={!name.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#1A1A1A",
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00B8A9",
    borderRadius: 3,
  },
  inputCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 18,
    color: 'white',
    marginLeft: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  inputDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 0.3,
    borderColor: "grey",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "white",
    backgroundColor: "#242424",
    fontFamily: 'Inter_400Regular',
    minHeight: 52,
  },
  toggleCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  toggleCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  toggleHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  toggleCardTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  toggleCardDescription: {
    fontSize: 14,
    color: "#8E8E93",
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  compoundToggle: {
    backgroundColor: "#242424",
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.3,
    borderColor: "grey",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleSwitch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1A1A1A",
    marginRight: 16,
    justifyContent: "center",
    position: "relative",
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  toggleSwitchActive: {
    backgroundColor: "#00B8A9",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    position: "absolute",
    left: 2,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleThumbActive: {
    left: 24,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "white",
    marginBottom: 6,
    fontFamily: 'Inter_600SemiBold',
  },
  toggleDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: "#00B8A9",
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'black',
    minHeight: 56,
  },
  nextButtonDisabled: {
    backgroundColor: "#1A1A1A",
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
    letterSpacing: 0.5,
    fontFamily: 'Inter_700Bold',
  },
});
