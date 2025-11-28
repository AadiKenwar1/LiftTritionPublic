import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomHeader from "../../../../components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";

const equipmentTypes = [
  { id: "Machine", name: "Machine", icon: "fitness" },
  { id: "Cable", name: "Cable", icon: "link" },
  { id: "Dumbbell", name: "Dumbbell", icon: "barbell" },
  { id: "Barbell", name: "Barbell", icon: "barbell" },
  { id: "Bodyweight", name: "Bodyweight", icon: "body" },
];

export default function AddExerciseScreen2() {
  const navigation = useNavigation();
  const route = useRoute();
  const { exerciseData } = route.params;
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const handleNext = () => {
    if (!selectedEquipment) {
      alert("Please select an equipment type.");
      return;
    }
    
    navigation.navigate("AddExerciseScreen3", {
      exerciseData: {
        ...exerciseData,
        equipmentType: selectedEquipment,
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <>
      <CustomHeader title="Select Equipment" showBack />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Step 2 of 4</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.headerSubtitle}>
              What equipment will this exercise use?
            </Text>
          </View>

          <View style={styles.equipmentList}>
            {equipmentTypes.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={[
                    styles.equipmentCard,
                    selectedEquipment === item.id && styles.equipmentCardSelected,
                  ]}
                  onPress={() => setSelectedEquipment(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.equipmentContent}>
                    <View style={[
                      styles.equipmentIcon,
                      selectedEquipment === item.id && styles.equipmentIconSelected,
                    ]}>
                      <Ionicons 
                        name={item.icon} 
                        size={24} 
                        color={selectedEquipment === item.id ? "#fff" : "#00B8A9"} 
                      />
                    </View>
                    <Text style={[
                      styles.equipmentName,
                      selectedEquipment === item.id && styles.equipmentNameSelected,
                    ]}>
                      {item.name}
                    </Text>
                  </View>
                  {selectedEquipment === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#00B8A9" />
                  )}
                </TouchableOpacity>
                {index < equipmentTypes.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>


            <TouchableOpacity 
              style={[
                styles.nextButton,
                !selectedEquipment && styles.nextButtonDisabled
              ]} 
              onPress={handleNext}
              disabled={!selectedEquipment}
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
    backgroundColor: "#242424",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 20,
  },
  progressContainer: {
    marginBottom: 15,
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
    backgroundColor: "#00B8A9",
    borderRadius: 2,
  },
  headerContainer: {
    marginBottom: 15,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  equipmentList: {
    marginBottom: 20,
  },
  equipmentCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding:18,
    borderWidth: 0.3,
    borderColor: "grey",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  equipmentCardSelected: {
    borderColor: "#00B8A9",
    backgroundColor: "#1A1A1A",
  },
  equipmentContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  equipmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  equipmentIconSelected: {
    backgroundColor: "#00B8A9",
    borderColor: "#00B8A9",
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    fontFamily: "Inter_600SemiBold",
  },
  equipmentNameSelected: {
    color: "#00B8A9",
  },
  separator: {
    height: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#8E8E93",
    marginLeft: 4,
    fontFamily: "Inter_400Regular",
  },
  nextButton: {
    backgroundColor: "#00B8A9",
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
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
