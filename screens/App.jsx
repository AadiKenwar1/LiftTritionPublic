import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Octicons from '@expo/vector-icons/Octicons';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, View } from "react-native";
import Constants from "expo-constants";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Import Amplify configuration first (now in AuthContext)
import "../context/Auth/amplifyConfig";

// Context Providers
import { AuthProvider, useAuthContext } from "../context/Auth/AuthContext";
import { SettingsProvider, useSettings } from "../context/Settings/SettingsContext";
import { WorkoutProvider, useWorkoutContext } from "../context/WorkoutsV2/WorkoutContext";
import { NutritionProvider, useNutritionContext } from "../context/Nutrition/NutritionContext";
import { BillingProvider, useBilling } from "../context/Billing/BillingContext";
import { useSyncManager } from "../context/database";

// Screens
import WelcomeScreen from "./welcomeScreen";
import LogScreen from "./main/logScreen";
import ProgressScreen from "./main/progressScreen";
import SettingsScreen from "./settings/settings";
import OnboardingScreen1 from "./onboarding/onboardingScreen1";
import OnboardingScreen2 from "./onboarding/onboardingScreen2";
import OnboardingScreen3 from "./onboarding/onboardingScreen3";
import OnboardingScreen4 from "./onboarding/onboardingScreen4";
import OnboardingScreen5 from "./onboarding/onboardingScreen5";
import OnboardingScreen6 from "./onboarding/onboardingScreen6";
import OnboardingScreen7 from "./onboarding/onboardingScreen7";
import OnboardingScreen8 from "./onboarding/onboardingScreen8";
import OnboardingScreen9 from "./onboarding/onboardingScreen9";

import LoadingScreen from "./loadingScreen";

// Other screens
import WorkoutDetails from "./main/workoutScreens/exercisesScreen";
import LogDetails from "./main/workoutScreens/logsScreen";
import ProfileScreen from "./settings/SettingsOptions/profile";
import TrainingFrequencyScreen from "./settings/SettingsOptions/trainingFrequency";
import PrivacyScreen from "./settings/SettingsOptions/privacy";
import AboutScreen from "./settings/SettingsOptions/about";
import SupportScreen from "./settings/SettingsOptions/support";
import SubscriptionScreen from "./settings/SettingsOptions/subscription";
import UserExercisesScreen from "./settings/SettingsOptions/userExercises/userExercises";
import AddExerciseScreen1 from "./settings/SettingsOptions/userExercises/AddExerciseScreen1";
import AddExerciseScreen2 from "./settings/SettingsOptions/userExercises/AddExerciseScreen2";
import AddExerciseScreen3 from "./settings/SettingsOptions/userExercises/AddExerciseScreen3";
import AddExerciseScreen4 from "./settings/SettingsOptions/userExercises/AddExerciseScreen4";
import CameraScreen from "./main/nutritionScreens/camera";
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
  const { loaded: workoutLoaded } = useWorkoutContext();
  const { loaded: nutritionLoaded } = useNutritionContext();
  const { loaded: billingLoaded } = useBilling();
  
  // Centralized sync manager - handles all syncing
  useSyncManager();
  
  // Check if onboarding is completed (access settings from user object)
  const onboardingCompleted = user?.settings?.onboardingCompleted;

  // Only render the navigator after authLoading is false
  if (authLoading) {
    return <LoadingScreen />;
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
        (settingsLoading || !workoutLoaded || !nutritionLoaded || !billingLoaded) ? (
          // Loading screen while contexts are loading
          <Stack.Screen name="Loading" component={LoadingScreen} />
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
            <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: "Manage Subscription", ...styles }} />
            <Stack.Screen name="UserExercisesScreen" component={UserExercisesScreen} options={{ title: "UserExercisesScreen", ...styles }} />
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
            <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
            <Stack.Screen name="Onboarding4" component={OnboardingScreen4} />
            <Stack.Screen name="Onboarding5" component={OnboardingScreen5} />
            <Stack.Screen name="Onboarding6" component={OnboardingScreen6} />
            <Stack.Screen name="Onboarding7" component={OnboardingScreen7} />
            <Stack.Screen name="Onboarding8" component={OnboardingScreen8} />
            <Stack.Screen name="Onboarding9" component={OnboardingScreen9} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    
    {/* WiFi Status Banner - shows when offline */}
    
    </>
  );
}



function AppContent() {
  const { user, loading: authLoading } = useAuthContext();

  useEffect(() => {
    let apiKey;

    if (Platform.OS === "ios") {
      apiKey = Constants.expoConfig?.extra?.REVENUECAT_API_KEY_IOS;
    } else if (Platform.OS === "android") {
      apiKey = Constants.expoConfig?.extra?.REVENUECAT_API_KEY_ANDROID;
    }

    if (!apiKey) {
      console.warn("Missing RevenueCat API key for this platform.");
      return;
    }

    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey });
  }, []);

  return (
    <BillingProvider>
      <SettingsProvider>
        <WorkoutProvider>
          <NutritionProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <AuthenticatedApp />
            </GestureHandlerRootView>
          </NutritionProvider>
        </WorkoutProvider>
      </SettingsProvider>
    </BillingProvider>
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
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <LoadingScreen message="Loading fonts..." />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

