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
import "../context/Auth/amplifyConfig";

// Context Providers
import { AuthProvider, useAuthContext } from "../context/Auth/AuthContext";
import { SettingsProvider, useSettings } from "../context/SettingsContext";
import { WorkoutProvider, useWorkoutContext } from "../context/Workouts/WorkoutContext";
import { NutritionProvider, useNutritionContext } from "../context/Nutrition/NutritionContext";

// Screens
import WelcomeScreen from "./welcomeScreen";
import LogScreen from "./main/logScreen";
import ProgressScreen from "./main/progressScreen";
import SettingsScreen from "./settings/settings";
import OnboardingScreen1 from "./onboarding/onboardingScreen1";
import OnboardingScreen2 from "./onboarding/onboardingScreen2";
import OnboardingScreen4 from "./onboarding/onboardingScreen4";
import OnboardingScreen6 from "./onboarding/onboardingScreen6";
import OnboardingScreen8 from "./onboarding/onboardingScreen8";
import OnboardingScreen10 from "./onboarding/onboardingScreen10";
import OnboardingScreen11 from "./onboarding/onboardingScreen11";
import OnboardingScreen12 from "./onboarding/onboardingScreen12";

import LoadingScreen from "./loadingScreen";
import WiFiStatusBanner from "../components/WiFiStatusBanner";

// Other screens
import WorkoutDetails from "./main/workoutScreens/exercisesScreen";
import LogDetails from "./main/workoutScreens/logsScreen";
import ProfileScreen from "./settings/SettingsOptions/profile";
import TrainingFrequencyScreen from "./settings/SettingsOptions/trainingFrequency";
import PrivacyScreen from "./settings/SettingsOptions/privacy";
import AboutScreen from "./settings/SettingsOptions/about";
import SupportScreen from "./settings/SettingsOptions/support";
import UserExercisesScreen from "./settings/SettingsOptions/userExercises/userExercises";
import AddUserExerciseScreen from "./settings/SettingsOptions/userExercises/addUserExercise";
import AddExerciseScreen1 from "./settings/SettingsOptions/userExercises/AddExerciseScreen1";
import AddExerciseScreen2 from "./settings/SettingsOptions/userExercises/AddExerciseScreen2";
import AddExerciseScreen3 from "./settings/SettingsOptions/userExercises/AddExerciseScreen3";
import AddExerciseScreen4 from "./settings/SettingsOptions/userExercises/AddExerciseScreen4";
import CameraScreen from "./camera";
import AdjustMacrosScreen from "./settings/SettingsOptions/adjustMacros/adjustMacros";
import SetMacrosScreen from "./settings/SettingsOptions/adjustMacros/setMacros";

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
            <Stack.Screen name="UserExercisesScreen" component={UserExercisesScreen} options={{ title: "UserExercisesScreen", ...styles }} />
            <Stack.Screen name="AddUserExercise" component={AddUserExerciseScreen} options={{ title: "AddUserExercise", ...styles }} />
            <Stack.Screen name="AddExerciseScreen1" component={AddExerciseScreen1} options={{ title: "Add Exercise", ...styles }} />
            <Stack.Screen name="AddExerciseScreen2" component={AddExerciseScreen2} options={{ title: "Add Exercise", ...styles }} />
            <Stack.Screen name="AddExerciseScreen3" component={AddExerciseScreen3} options={{ title: "Add Exercise", ...styles }} />
            <Stack.Screen name="AddExerciseScreen4" component={AddExerciseScreen4} options={{ title: "Add Exercise", ...styles }} />
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
