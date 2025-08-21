import React from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useWorkoutContext } from "../../../../context/WorkoutContextFunctions/WorkoutContext";
import CustomHeader from "../../../../components/CustomHeader";
import { Entypo, Ionicons } from "@expo/vector-icons";

export default function UserExercises() {
  const navigation = useNavigation();
  const { setExerciseLibrary, userExercises, setUserExercises } = useWorkoutContext();

  const handleDelete = (exerciseName) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${exerciseName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setUserExercises((prev) =>
              prev.filter((exercise) => exercise.name !== exerciseName),
            );
            setExerciseLibrary((prev) => {
              const newExercises = { ...prev };
              delete newExercises[exerciseName];
              return newExercises;
            });
            Alert.alert("Deleted", `"${exerciseName}" has been removed.`);
          },
        },
      ],
    );
  };

  return (
    <>
      <CustomHeader title="Your Exercises" showBack />

      <View style={styles.container}>
        <FlatList
          data={userExercises}
          keyExtractor={(item, index) => item.name || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="barbell-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No exercises added yet</Text>
              <Text style={styles.emptySubText}>
                Start building your custom workout library
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardContent}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <View style={styles.muscleContainer}>
                    <View style={styles.muscleTag}>
                      <Text style={styles.muscleLabel}>PRIMARY</Text>
                      <Text style={styles.muscleValue}>{item.mainMuscle}</Text>
                    </View>
                    {item.accessoryMuscles && item.accessoryMuscles.length > 0 && (
                      <View style={styles.muscleTag}>
                        <Text style={styles.muscleLabel}>SECONDARY</Text>
                        <Text style={styles.muscleValue}>
                          {item.accessoryMuscles.join(", ")}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(item.name)}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >
                  <Entypo name="trash" size={18} color="#ff4d4f" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
        
        {/* FAB Button */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('AddUserExercise')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingTop: 24,
    paddingBottom: 100, // Add bottom padding to account for FAB
  },
  fabButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#00B8A9",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    borderWidth: 2,
    borderColor: 'black',
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    color: "#000",
    fontWeight: "700",
    fontFamily: "Inter",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Inter",
    textAlign: "center",
    lineHeight: 22,
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "black",
    borderBottomWidth: 4,
    borderBottomColor: "black",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter",
    color: "#000",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  muscleContainer: {
    gap: 12,
    marginBottom: 16,
  },
  muscleTag: {
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#00B8A9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  muscleLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter",
    color: "#666",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  muscleValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    fontFamily: "Inter",
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: 12,
  },
  detailItem: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    fontFamily: "Inter",
  },
  deleteButton: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ff4d4f",
    borderBottomWidth: 3,
    borderBottomColor: "#ff4d4f",
  },
  separator: {
    height: 16,
  },
});