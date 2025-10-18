import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Octicons from '@expo/vector-icons/Octicons';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";

// Import Amplify configuration first (now in AuthContext)
import "../context/AuthContextFunctions/amplifyConfig";

// Context Providers
import { AuthProvider, useAuthContext } from "../context/AuthContextFunctions/AuthContext";
import { SettingsProvider, useSettings } from "../context/SettingsContext";
import { WorkoutProvider, useWorkoutContext } from "../context/WorkoutContextFunctions/WorkoutContext";
import { NutritionProvider, useNutritionContext } from "../context/NutritionContext/NutritionContext";

// Screens
import WelcomeScreen from "./WelcomeScreen";
import LoginScreen from "./Auth/LoginScreen";
import SignupScreen from "./Auth/SignupScreen";
import ConfirmSignupScreen from "./Auth/ConfirmSignupScreen";
import LogScreen from "./Main/logScreen";
import ProgressScreen from "./Main/progressScreen";
import SettingsScreen from "./Settings/Settings";
import OnboardingScreen1 from "./Onboarding/OnboardingScreen1";
import OnboardingScreen2 from "./Onboarding/OnboardingScreen2";
import OnboardingScreen4 from "./Onboarding/OnboardingScreen4";
import OnboardingScreen6 from "./Onboarding/OnboardingScreen6";
import OnboardingScreen8 from "./Onboarding/OnboardingScreen8";
import OnboardingScreen10 from "./Onboarding/OnboardingScreen10";
import OnboardingScreen11 from "./Onboarding/OnboardingScreen11";
import OnboardingScreen12 from "./Onboarding/OnboardingScreen12";

import LoadingScreen from "./LoadingScreen";
import WiFiStatusBanner from "../components/WiFiStatusBanner";

// Other screens
import WorkoutDetails from "./Main/WorkoutLogScreens/exercisesScreen";
import LogDetails from "./Main/WorkoutLogScreens/logsScreen";
import ProfileScreen from "./Settings/SettingsOptions/Profile";
import TrainingFrequencyScreen from "./Settings/SettingsOptions/TrainingFrequency";
import PrivacyScreen from "./Settings/SettingsOptions/Privacy";
import AboutScreen from "./Settings/SettingsOptions/About";
import SupportScreen from "./Settings/SettingsOptions/Support";
import ChangePasswordScreen from "./Settings/SettingsOptions/AccountSettings/ChangePassword";
import UserExercisesScreen from "./Settings/SettingsOptions/UserExercises/UserExercises";
import AddUserExerciseScreen from "./Settings/SettingsOptions/UserExercises/AddUserExercise";
import DeleteAccountScreen from "./Settings/SettingsOptions/AccountSettings/DeleteAccount";
import CameraScreen from "./Camera";
import AdjustMacrosScreen from "./Settings/SettingsOptions/AdjustMacros/AdjustMacros";
import SetMacrosScreen from "./Settings/SettingsOptions/AdjustMacros/SetMacros";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ============================================================================
// TAB NAVIGATOR
// ============================================================================

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconSize = focused ? 28 : 24;

          if (route.name === "Log") {
            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <FontAwesome6 name={focused ? "pencil" : "pencil"} size={iconSize} color={color} />
              </View>
            );
          } else if (route.name === "Progress") {
            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Octicons name={focused ? "graph" : "graph"} size={iconSize} color={color} />
              </View>
            );
          } else if (route.name === "Account") {
            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={focused ? "person" : "person-outline"} size={iconSize} color={color} />
              </View>
            );
          }
        },

        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          paddingBottom: 4,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#121212",
          height: 100,
          paddingTop: 10,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 8,
          borderTopWidth: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Account" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ============================================================================
// MAIN APP NAVIGATION
// ============================================================================

function AuthenticatedApp() {
  const { isAuthenticated, loading: authLoading, user } = useAuthContext();
  const { loading: settingsLoading } = useSettings();
  const { loading: workoutLoading } = useWorkoutContext();
  const { loading: nutritionLoading } = useNutritionContext();
  
  // Check if onboarding is completed (access settings from user object)
  const onboardingCompleted = user?.settings?.onboardingCompleted;

  // Only render the navigator after authLoading is false
  if (authLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName="Welcome"
        >
        {!isAuthenticated ? (
          // Auth screens when not authenticated
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ConfirmSignup" component={ConfirmSignupScreen} />
          </>
        ) : 
        (settingsLoading || workoutLoading || nutritionLoading) ? (
          // Loading screen while contexts are loading
          <Stack.Screen name="Loading" component={LoadingScreen} initialParams={{ message: "Loading..." }} />
        ): 
        onboardingCompleted ? (
          // Main app screens when authenticated and onboarding completed
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="WorkoutDetails" component={WorkoutDetails} options={{ title: "Exercises", ...styles, animation: 'slide_from_bottom', animationDuration: 350,}} />
            <Stack.Screen name="LogDetails" component={LogDetails} options={{ title: "Logs", ...styles }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile", ...styles }} />
            <Stack.Screen name="TrainingFrequency" component={TrainingFrequencyScreen} options={{ title: "Training Frequency", ...styles }} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: "Privacy", ...styles }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ title: "About", ...styles }} />
            <Stack.Screen name="Support" component={SupportScreen} options={{ title: "Support", ...styles }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: "ChangePassword", ...styles }} />
            <Stack.Screen name="UserExercisesScreen" component={UserExercisesScreen} options={{ title: "UserExercisesScreen", ...styles }} />
            <Stack.Screen name="AddUserExercise" component={AddUserExerciseScreen} options={{ title: "AddUserExercise", ...styles }} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: "DeleteAccount", ...styles }} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} options={{ title: "CameraScreen", ...styles }} />
            <Stack.Screen name="AdjustMacros" component={AdjustMacrosScreen} options={{ title: "AdjustMacrosScreen", ...styles }} />
            <Stack.Screen name="SetMacros" component={SetMacrosScreen} options={{ title: "SetMacrosScreen", ...styles }} />
          </>
        ) : (
          // Onboarding screens when authenticated but onboarding not completed
          <>
            <Stack.Screen name="Onboarding1" component={OnboardingScreen1} />
            <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
            <Stack.Screen name="Onboarding4" component={OnboardingScreen4} />
            <Stack.Screen name="Onboarding6" component={OnboardingScreen6} />
            <Stack.Screen name="Onboarding8" component={OnboardingScreen8} />
            <Stack.Screen name="Onboarding10" component={OnboardingScreen10} />
            <Stack.Screen name="Onboarding11" component={OnboardingScreen11} />
            <Stack.Screen name="Onboarding12" component={OnboardingScreen12} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    
    {/* WiFi Status Banner - shows when offline */}
    <WiFiStatusBanner />
    </>
  );
}



function AppContent() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <WorkoutProvider>
          <NutritionProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <AuthenticatedApp />
            </GestureHandlerRootView>
          </NutritionProvider>
        </WorkoutProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}



const styles = {
  headerStyle: {
    backgroundColor: '#121212',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

export default function App() {
  return <AppContent />;
}
