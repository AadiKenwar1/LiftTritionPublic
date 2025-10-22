import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
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
              What equipment will you use for "{exerciseData.name}"?
            </Text>
          </View>

          <FlatList
            data={equipmentTypes}
            keyExtractor={(item) => item.id}
            style={styles.equipmentList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
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
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

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
    backgroundColor: "#F2F2F2",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 10,
  },
  progressContainer: {
    marginBottom: 15,
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
    marginBottom: 15,
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
    textAlign: "center",
  },
  equipmentList: {
    flex: 1,
    marginBottom: 20,
  },
  equipmentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  equipmentCardSelected: {
    borderColor: "#00B8A9",
    backgroundColor: "#F0FDFA",
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
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  equipmentIconSelected: {
    backgroundColor: "#00B8A9",
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
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
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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
