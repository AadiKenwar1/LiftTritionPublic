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
import { useWorkoutContext } from "../../../../context/WorkoutsV2/WorkoutContext";
import { useAuthContext } from "../../../../context/Auth/AuthContext";
import { generateClient } from '@aws-amplify/api';
import { deleteUserExercise } from "../../../../graphql/mutations";
import CustomHeader from "../../../../components/CustomHeader";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Dumbbell } from 'lucide-react-native';


export default function UserExercises() {
  const navigation = useNavigation();
  const { user } = useAuthContext();
  const { setExerciseLibrary, userExercises, setUserExercises, deleteUserExercise } = useWorkoutContext();
  const client = generateClient();

  const handleDelete = (exerciseName) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${exerciseName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Find the exercise to get its ID
              const exerciseToDelete = userExercises.find(ex => ex.name === exerciseName);
              
              if (exerciseToDelete && exerciseToDelete.id) {
                // Use V2 deleteUserExercise function
                await deleteUserExercise(exerciseToDelete.id, exerciseName);
                console.log('🚀 Deleted user exercise with V2 context:', exerciseName);
              }
              
              Alert.alert("Deleted", `"${exerciseName}" has been removed.`);
            } catch (error) {
              console.error("Error deleting exercise:", error);
              Alert.alert("Error", "Failed to delete exercise. Please try again.");
            }
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
          data={userExercises.filter(item => !item.deleted)}
          keyExtractor={(item, index) => item.name || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.rotatedIcon}>
                <Dumbbell size={64} color="#8E8E93"/>
              </View>
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
          onPress={() => navigation.navigate('AddExerciseScreen1')}
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
    backgroundColor: "#242424",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  listContainer: {
    paddingTop: 24,
    paddingBottom: 100, // Add bottom padding to account for FAB
  },
  fabButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#00B8A9",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'black',
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  rotatedIcon: {
    transform: [{ rotate: '45deg' }],
  },
  emptyText: {
    fontSize: 20,
    color: "white",
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: "#8E8E93",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  exerciseCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
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
    fontFamily: "Inter_700Bold",
    color: "white",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  muscleContainer: {
    gap: 12,
    marginBottom: 16,
  },
  muscleTag: {
    backgroundColor: "#242424",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.3,
    borderColor: "grey",
  },
  muscleLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  muscleValue: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: 12,
  },
  detailItem: {
    backgroundColor: "#242424",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  detailLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  deleteButton: {
    padding: 12,
    backgroundColor: "#242424",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.3,
    borderColor: "#ff4d4f",
  },
  separator: {
    height: 16,
  },
});