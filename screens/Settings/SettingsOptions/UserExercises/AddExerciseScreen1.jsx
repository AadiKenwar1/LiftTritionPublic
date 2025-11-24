import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomHeader from "../../../../components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";

export default function AddExerciseScreen1() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [isCompound, setIsCompound] = useState(false);

  const handleNext = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert("Please enter an exercise name.");
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
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Step 1 of 4</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '25%' }]} />
            </View>
          </View>

          {/* Exercise Name & Compound Toggle */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Exercise Name</Text>
            <TextInput
              placeholder="Enter exercise name"
              placeholderTextColor="#8E8E93"
              value={name}
              onChangeText={setName}
              style={styles.textInput}
              autoFocus
            />
            
            <View style={styles.compoundToggleContainer}>
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
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: 20,
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
  inputCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 0,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  inputLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  textInput: {
    borderWidth: 0.3,
    borderColor: "grey",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "white",
    backgroundColor: "#242424",
    fontFamily: 'Inter_400Regular',
  },
  compoundToggleContainer: {
    marginTop: 16,
  },
  compoundToggle: {
    backgroundColor: "#242424",
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.3,
    borderColor: "grey",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1A1A1A",
    marginRight: 16,
    justifyContent: "center",
    position: "relative",
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  toggleSwitchActive: {
    backgroundColor: "#2D9CFF",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  toggleDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  nextButton: {
    backgroundColor: "#2D9CFF",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'black',
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
