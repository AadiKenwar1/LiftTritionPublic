import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuthContext } from '../context/Auth/AuthContext';
import LiftTritionIcon from '../assets/LiftTrition_SVG_Icon.svg';

export default function WelcomeScreen() {
  const { signInWithApple, loading } = useAuthContext();

  const handleSignIn = async () => {
    const result = await signInWithApple();
    if (!result.success) {
      if (result.code === 'NO_INTERNET') {
        Alert.alert(
          "No Internet Connection",
          result.error || "Please connect to the internet to sign in.",
          [{ text: "OK" }]
        );
      } else if (result.code !== 'ERR_CANCELED') {
        // Don't show alert if user canceled
        Alert.alert(
          "Sign In Failed",
          result.error || "Failed to sign in. Please try again.",
          [{ text: "OK" }]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LiftTritionIcon width={200} height={200} />
        <Text style={styles.title}>LiftTrition</Text>
        <Text style={styles.subtitle}>Simple Tracking. Real Progress</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>


        <TouchableOpacity 
          style={[styles.getStartedButton, loading && styles.buttonDisabled]} 
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={[styles.getStartedButtonText]}>
            {loading ? 'Signing In...' : 'Sign in with Apple'}
          </Text>
          {!loading && <AntDesign name="apple1" size={20} color="white" />}
        </TouchableOpacity>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 30,
  },
  title: {
    fontSize: 62,
    fontWeight: '800',
    color: '#00B8A9',
    marginTop: 0,
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#00B8A9',
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: 'Inter_600Regular',
  },
  buttonContainer: {
    justifyContent: 'center',
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  getStartedButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    marginRight: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
}); 