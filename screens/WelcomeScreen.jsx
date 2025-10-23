import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import CustomIcon from '../components/CustomIcon';
import { useAuthContext } from '../context/Auth/AuthContext';

export default function WelcomeScreen() {
  const { signInWithApple, loading } = useAuthContext();
  const navigation = useNavigation();


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


        <TouchableOpacity 
          style={[styles.getStartedButton, { backgroundColor: '#00B8A9' }, loading && styles.buttonDisabled]} 
          onPress={signInWithApple}
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
    color: '#00B8A9',
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