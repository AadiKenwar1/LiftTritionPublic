import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import CustomIcon from '../components/CustomIcon';
import { useAuthContext } from '../context/AuthContextFunctions/AuthContext';

export default function WelcomeScreen() {
  const { signInWithApple, loading } = useAuthContext();
  const navigation = useNavigation();

  const handleSignInWithApple = async () => {
    try {
      const result = await signInWithApple();
      if (result.success) {
        // Navigate to main app or onboarding based on your flow
      } else {
        Alert.alert('Sign In Failed', result.error || 'Please try again');
      }
    } catch (error) {
      console.log('Error signing in with Apple:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleGetStarted = () => {
    navigation.navigate('Onboarding1');
  };

  const handleAlreadyHaveAccount = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>LiftTrition</Text>
        <Text style={styles.subtitle}>Log · Lift · Fuel · Progress</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.getStartedButton, { backgroundColor: '#000000' }, loading && styles.buttonDisabled]} 
          onPress={handleSignInWithApple}
          disabled={loading}
        >
          <Text style={[styles.getStartedButtonText]}>
            {loading ? 'Signing In...' : 'Sign in with Apple'}
          </Text>
          {!loading && <AntDesign name="apple1" size={20} color="white" />}
        </TouchableOpacity>


        <TouchableOpacity style={styles.loginButton} onPress={handleAlreadyHaveAccount}>
          <Text style={styles.loginButtonText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  title: {
    fontSize: 62,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 18,
    color: 'black',
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: 'Inter_400Regular',
  },
  buttonContainer: {
    justifyContent: 'center',
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00B8A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    marginRight: 8,
    fontFamily: 'Inter_700Bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#00B8A9',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
}); 