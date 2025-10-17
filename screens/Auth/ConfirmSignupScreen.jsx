import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useAuthContext } from "../../context/AuthContextFunctions/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this function to log AsyncStorage contents
async function logAmplifyTokens() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const allItems = await AsyncStorage.multiGet(allKeys);
    console.log('[DEBUG] AsyncStorage contents:', allItems);
  } catch (e) {
    console.log('[DEBUG] Error reading AsyncStorage:', e);
  }
}

export default function ConfirmSignupScreen() {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { user, loading: authLoading } = useAuthContext();
  
  const email = route.params?.email || "";
  const password = route.params?.password || "";
  
  // Safety check for missing credentials
  if (!email || !password) {
    console.warn('ConfirmSignupScreen: Missing email or password in route params');
  }

  const [waitingForUser, setWaitingForUser] = useState(false);

  const handleConfirmSignup = async () => {
    if (!confirmationCode.trim()) {
      Alert.alert("Error", "Please enter the confirmation code");
      return;
    }

    setLoading(true);
    const result = await confirmSignup(email, confirmationCode);
    
    // After successful confirmSignup and signin, do NOT call checkAuthState or add a delay.
    // Just wait for user/isAuthenticated from context (which will update via Hub event).
    if (result.success) {
      const loginResult = await signin(email, password);
      if (loginResult.success) {
        // No need to call checkAuthState or setTimeout here.
        // AuthContext will update user state via Hub event.
        setLoading(false);
      } else {
        console.log('Auto-login failed, redirecting to login screen');
        Alert.alert("Email Confirmed", "Your email has been confirmed successfully. Please sign in with your credentials.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]);
      }
    } else {
      setLoading(false);
      Alert.alert("Error", result.error);
    }
  };

  // Wait for user.userId to be present before showing success message
  useEffect(() => {
    if (waitingForUser && user && user.userId) {
      setWaitingForUser(false);
      console.log('[DEBUG] ConfirmSignupScreen: Received userId:', user.userId);
      Alert.alert("Welcome!", "Your account has been confirmed and you're now signed in!", [
        {
          text: "Continue",
          onPress: () => {
            console.log('User confirmed account and logged in successfully');
          },
        },
      ]);
    }
  }, [waitingForUser, user]);

  const handleResendCode = async () => {
    setResendLoading(true);
    const result = await resendConfirmationCode(email);
    setResendLoading(false);

    if (result.success) {
      Alert.alert("Success", result.message);
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Confirm Your Email</Text>
          
          <Text style={styles.description}>
            We've sent a confirmation code to
          </Text>
          <Text style={styles.email}>{email}</Text>

          <Text style={styles.instruction}>
            Enter the 6-digit code to verify your account
          </Text>

          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              You have ten minutes to confirm your email
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="000000"
              value={confirmationCode}
              onChangeText={setConfirmationCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, (loading || waitingForUser || authLoading) && styles.buttonDisabled]}
            onPress={handleConfirmSignup}
            disabled={loading || waitingForUser || authLoading}
          >
            <Text style={styles.confirmButtonText}>
              {(loading || waitingForUser || authLoading) ? "Confirming..." : "Confirm Account"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.resendText}>
            Didn't receive the code?
          </Text>

          <TouchableOpacity
            style={[styles.resendButton, resendLoading && styles.buttonDisabled]}
            onPress={handleResendCode}
            disabled={resendLoading}
          >
            <Text style={styles.resendButtonText}>
              {resendLoading ? "Sending..." : "Resend Code"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.backToLoginText}>
              Back to Login
            </Text>
          </TouchableOpacity>

          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              If you leave the app or this page you will not be able to sign up with this email for 15 minutes
            </Text>
          </View>
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  email: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00B8A9',
    textAlign: 'center',
    marginBottom: 30,
  },
  instruction: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
    maxWidth: 280,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#F8F9FA',
    color: '#1A1A1A',
    padding: 18,
    borderRadius: 12,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#00B8A9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resendText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  resendButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  resendButtonText: {
    color: '#00B8A9',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLogin: {
    marginTop: 10,
  },
  backToLoginText: {
    color: '#00B8A9',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    position: 'absolute',
    bottom: 50,
    left: 20,
  },
  backButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  disclaimerContainer: {
    backgroundColor: '#F8D7DA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  disclaimerText: {
    color: '#721C24',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
}); 