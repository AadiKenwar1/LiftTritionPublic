import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "../../../context/AuthContextFunctions/AuthContext";
import { useSettings } from "../../../context/SettingsContext";
import CustomHeader from "../../../components/CustomHeader";
import { useNutritionContext } from "../../../context/NutritionContext/NutritionContext";
import { useWorkoutContext } from "../../../context/WorkoutContextFunctions/WorkoutContext";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, clearSessionAndState, deleteAccount } = useAuthContext(); // assumes user object has email
  const { birthDate, height, bodyWeight, unit, resetSettings } = useSettings();
  const { resetNutritionContext } = useNutritionContext();
  const { resetWorkoutContext } = useWorkoutContext();

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            resetNutritionContext();
            resetWorkoutContext();
            resetSettings();
            console.log('✅ Logout successful');
            // Navigation will be handled automatically by the auth state change
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "⚠️ This action cannot be undone. All your data will be permanently deleted.\n\nAre you absolutely sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            // Second confirmation for extra safety
            Alert.alert(
              "Final Confirmation",
              "This is your last chance to cancel. Your account and all data will be permanently deleted.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Permanently Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      console.log('🗑️ Starting account deletion...');
                      const result = await deleteAccount();
                      
                      if (result.success) {
                        console.log('✅ Account deleted successfully');
                        resetNutritionContext();
                        resetWorkoutContext();
                        resetSettings();
                        Alert.alert(
                          "Account Deleted",
                          "Your account has been permanently deleted.",
                          [{ text: "OK" }]
                        );
                        // Navigation will be handled automatically by the auth state change
                      } else {
                        console.error('❌ Account deletion failed:', result.error);
                        Alert.alert(
                          "Deletion Failed",
                          result.error || "Failed to delete account. Please try again.",
                          [{ text: "OK" }]
                        );
                      }
                    } catch (error) {
                      console.error('❌ Account deletion error:', error);
                      Alert.alert(
                        "Error",
                        "An unexpected error occurred. Please try again.",
                        [{ text: "OK" }]
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Format birthdate if present
  let birthDateString = birthDate
    ? new Date(birthDate).toLocaleDateString()
    : "Not set";

  return (
    <>
      <CustomHeader title="Profile" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || "Not available"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Birthdate</Text>
          <Text style={styles.value}>{birthDateString}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Height</Text>
          <Text style={styles.value}>{height ? `${height} ${unit ? "in" : "cm"}` : "Not set"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>{bodyWeight ? `${bodyWeight} ${unit ? "lbs" : "kg"}` : "Not set"}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={clearSessionAndState}>
            <Text style={styles.actionButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteAccount}>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F2F2F2',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#000',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'black',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

  },
  label: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '700',
  },
  value: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'Inter_700Bold',
    
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  deleteButton: {
    borderColor: '#ff4d4f',
    backgroundColor: '#fff',
    borderBottomColor: '#ff4d4f',
  },
  deleteButtonText: {
    color: '#ff4d4f',
  },
});