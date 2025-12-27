import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useAuthContext } from "../../../context/Auth/AuthContext";
import { useSettings } from "../../../context/Settings/SettingsContext";
import CustomHeader from "../../../components/CustomHeader";

export default function ProfileScreen() {
  const { user, signOut, deleteAccount } = useAuthContext();
  const { birthDate, height, bodyWeight, unit, resetSettings } = useSettings();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
                        resetSettings();
                        Alert.alert(
                          "Account Deleted",
                          "Your account has been permanently deleted.",
                          [{ text: "OK" }]
                        );
                        // Navigation will be handled automatically by the auth state change
                      } else {
                        console.error('❌ Account deletion failed:', result.error);
                        if (result.code === 'NO_INTERNET') {
                          Alert.alert(
                            "No Internet Connection",
                            result.error || "Please connect to the internet to delete your account.",
                            [{ text: "OK" }]
                          );
                        } else {
                          Alert.alert(
                            "Deletion Failed",
                            result.error || "Failed to delete account. Please try again.",
                            [{ text: "OK" }]
                          );
                        }
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

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Your data will be backed up to the cloud before signing out. You must have an internet connection.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          onPress: async () => {
            setIsSigningOut(true);
            try {
              const result = await signOut();
              
              if (result.success) {
                // Contexts will automatically clear when user becomes null
                resetSettings();
                Alert.alert(
                  "Signed Out",
                  "You have been signed out successfully. Your data has been backed up.",
                  [{ text: "OK" }]
                );
              } else {
                if (result.code === 'NO_INTERNET') {
                  Alert.alert(
                    "No Internet Connection",
                    result.error || "Please connect to the internet to sign out and backup your data.",
                    [{ text: "OK" }]
                  );
                } else {
                  Alert.alert(
                    "Sign Out Failed",
                    result.error || "Failed to sign out. Please try again.",
                    [{ text: "OK" }]
                  );
                }
              }
            } catch (error) {
              console.error('❌ Sign out error:', error);
              Alert.alert(
                "Error",
                "An unexpected error occurred. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setIsSigningOut(false);
            }
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
      <View style={styles.container} >
      
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
          <TouchableOpacity 
            style={[styles.actionButton, isSigningOut && styles.actionButtonDisabled]} 
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[styles.actionButtonText, styles.loadingText]}>Backing up...</Text>
              </View>
            ) : (
              <Text style={styles.actionButtonText}>Sign Out</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteAccount}>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#242424',
    flex: 1,

  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'black',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'black',
    borderColor: 'grey',

  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '700',
  },
  value: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Inter_700Bold',
    
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  deleteButton: {
    backgroundColor: '#1A1A1A',
  },
  deleteButtonText: {
    color: 'red',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 0,
  },
});