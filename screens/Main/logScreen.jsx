import React from 'react';
import PopupModal from "../../components/PopupModal";
import { useSettings } from "../../context/Settings/SettingsContext.js";
import Ionicons from '@expo/vector-icons/Ionicons'; // ✅ Correct import
import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import NetInfo from '@react-native-community/netinfo';
import Fab from '../../components/Fab';
import { useWorkoutContext } from '../../context/WorkoutsV2/WorkoutContext.js';
import { useBilling } from '../../context/Billing/BillingContext.js';
import CustomHeader from '../../components/CustomHeader';
import LogScreen2 from "./workoutScreens/workoutsScreen.jsx"
import NutritionScreen from './nutritionScreens/nutritionScreen.jsx'
import { useNavigation } from "@react-navigation/native";
import AddNutritionPopup from './nutritionScreens/addNutritionPopup.jsx'
import { useRoute } from "@react-navigation/native";
import ArchivedPopup from '../../components/WorkoutComponents/ArchivedPopup.jsx';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SearchFoodDBPopup from './nutritionScreens/searchFoodDBPopup.jsx'
import SavedFoodsPopup from './nutritionScreens/savedFoodsPopup.jsx'
import { Fragment } from 'react';

export default function LogScreen() {
  //Settings Context Functions
  const { mode} = useSettings();
  //Billing Context Functions
  const { hasPremium } = useBilling();
  //Navigation
  const navigation = useNavigation();
  //Route
  const route = useRoute();
  //Photo URI
  const photoUri = route.params?.photoUri;
  const cameraMode = route.params?.cameraMode;
  const barcodeData = route.params?.barcodeData;
  //Workout Name State
  const [workoutName, setWorkoutName] = useState('');
  //Workout Context Functions
  const {workouts, addWorkout, reorderWorkouts} = useWorkoutContext();
  //Workout popup visibility states
  const [addWorkoutVisible, setAddWorkoutVisible] = useState(false)
  const [archivedWorkoutsVisible, setArchivedWorkoutsVisible] = useState(false)
  //Nutrition popup visibility states
  const [addNutritionVisible, setAddNutritionVisible] = useState(false)
  const [foodDatabaseVisible, setFoodDatabaseVisible] = useState(false)
  const [savedFoodsVisible, setSavedFoodsVisible] = useState(false)
  
  //WiFi Status
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    // Set up listener for network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    
    return () => unsubscribe();
  }, []);

  //Function to handle if user doesnt have premium or is not connected to internet
  function handleNotPremiumOrConnected(connected) {
    if (!connected) {
      Alert.alert('No internet connection', 'Please connect to the internet to use this feature.');
    } else {
      navigation.navigate('Subscription');
    }
  }
  
  //Function to add a workout
  function handleAddWorkout(inputName) {
    addWorkout(inputName);
    setWorkoutName('');
    setAddWorkoutVisible(false);
  }

  //Basically just a dynamic fab button thats on top of the workoutScreen and nutritionScreen
  return (
    <>
      <CustomHeader/>
      {mode === true ? <LogScreen2/> : <NutritionScreen photoUri={photoUri} cameraMode={cameraMode} barcodeData={barcodeData}/>}
      <Fab tabBarShown={true}>
        {mode === true
          ? [
              // Add Workout Button
              <TouchableOpacity
                key="add-workout"
                style={[styles.fabButtons, { backgroundColor: '#2D9CFF' }]}
                onPress={() => setAddWorkoutVisible(true)}
              >
                <Ionicons
                  name='add'
                  size={35}
                  color='white'
                  shadowColor='black'
                  shadowRadius={4}
                  shadowOpacity={0.4}
                />
                <PopupModal
                  modalVisible={addWorkoutVisible}
                  setModalVisible={setAddWorkoutVisible}
                >
                  <Text style={{ marginBottom: 20, textAlign: 'center', color: 'white', fontFamily: 'Inter_500Medium', fontSize: 20 }}>
                    Enter Workout
                  </Text>
                  <TextInput
                    placeholder="Workout name"
                    placeholderTextColor="grey"
                    value={workoutName}
                    onChangeText={setWorkoutName}
                    style={{
                      borderWidth: 1,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      marginBottom: 20,
                      width: '100%',
                      color: 'white',
                      backgroundColor: '#1A1A1A',
                      borderRadius: 10,
                      borderWidth: 0.3,
                      borderColor: 'grey',
                    }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: '102%',
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.addAndCloseButton, {backgroundColor: 'grey'}]}
                      onPress={() => setAddWorkoutVisible(false)}
                    >
                      <Text style={styles.addAndCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.addAndCloseButton}
                      onPress={() => handleAddWorkout(workoutName)}
                    >
                      <Text style={styles.addAndCloseButtonText}>Add</Text>
                    </TouchableOpacity>
                    
                  </View>
                  
                </PopupModal>
              </TouchableOpacity>,

              // View Archived Workouts Button
              <TouchableOpacity
                key="archive"
                style={[styles.fabButtons, { backgroundColor: '#2D9CFF' }]}
                onPress={() => setArchivedWorkoutsVisible(true)}
              >
                {/* Archived Workouts Popup */}
                <ArchivedPopup
                  visible={archivedWorkoutsVisible}
                  data={workouts.filter((item) => item.archived && !item.deleted)}
                  onClose={() => setArchivedWorkoutsVisible(false)}
                  reorderWorkouts={reorderWorkouts}
                  isWorkout={true}
                  function2={() => {}} // No function needed for archived items
                  moveMode={false}
                />
                <Ionicons
                  name='archive-outline'
                  size={35}
                  color='white'
                  shadowColor='black'
                  shadowRadius={4}
                  shadowOpacity={0.2}
                />
              </TouchableOpacity>,

              //Coming Soon - AI Workout Generator (react fragment to even out the buttons)
              <Fragment key="ai-workout-generator-placeholder"></Fragment>,
              //Coming Soon - Workout Scheduler (react fragment to even out the buttons)
              <Fragment key="workout-scheduler-placeholder"></Fragment>,
              //<Fragment key="workout-scheduler-placeholder"></Fragment>
              
            ]
          : [
              //Add Nutrition Button
              <TouchableOpacity
                key="add-nutrition"
                style={[styles.fabButtons, { backgroundColor: '#4CD964' }]}
                onPress={() => setAddNutritionVisible(!addNutritionVisible)}
              >
                <Ionicons
                  name='add'
                  size={35}
                  color='#FFFFFF'
                  shadowColor='white'
                  shadowRadius={4}
                  shadowOpacity={0.2}
                />
                <AddNutritionPopup
                  visible={addNutritionVisible}
                  onClose={() => setAddNutritionVisible(false)}
                  title={"Nutrition"}
                />
              </TouchableOpacity>,

              //Camera Button
              <TouchableOpacity
                key="camera"
                style={[styles.fabButtons, { backgroundColor: '#4CD964', opacity: (hasPremium && isConnected) ? 1 : 0.5 }]}
                activeOpacity={0.7}
                onPress={() => (hasPremium && isConnected) ? setTimeout(() => {navigation.navigate('CameraScreen')}, 600) : handleNotPremiumOrConnected(isConnected)}
              >
                <Ionicons
                  name='camera'
                  size={35}
                  color='#FFFFFF'
                  shadowColor='white'
                  shadowRadius={4}
                  shadowOpacity={0.2}
                />
              </TouchableOpacity>,

              //Food Database Button
              <TouchableOpacity
                key="food-database"
                style={[styles.fabButtons, { backgroundColor: '#4CD964', opacity: (hasPremium && isConnected) ? 1 : 0.5 }]}
                activeOpacity={0.7}
                onPress={() => (hasPremium && isConnected) ? setFoodDatabaseVisible(!foodDatabaseVisible) : handleNotPremiumOrConnected(isConnected)}
              >
                <MaterialCommunityIcons
                  name='database-search'
                  size={35}
                  color='#FFFFFF'
                  shadowColor='white'
                  shadowRadius={4}
                  shadowOpacity={0.2}
                />
                <SearchFoodDBPopup
                  visible={foodDatabaseVisible}
                  onClose={() => setFoodDatabaseVisible(false)}
                />
              </TouchableOpacity>,

              //Saved Foods Button
              <TouchableOpacity
                key="saved-foods"
                style={[styles.fabButtons, { backgroundColor: '#4CD964' }]}
                onPress={() => setSavedFoodsVisible(!savedFoodsVisible)}
              >
                <Ionicons
                  name='bookmark'
                  size={35}
                  color='#FFFFFF'
                  shadowColor='white'
                  shadowRadius={4}
                  shadowOpacity={0.2}
                />
                <SavedFoodsPopup
                  visible={savedFoodsVisible}
                  onClose={() => setSavedFoodsVisible(false)}
                />
              </TouchableOpacity>  
            ]
        }
      </Fab>
    </>
  );
}

const styles = StyleSheet.create({
  fabButtons: {
    height: 60,
    width: 60,
    borderRadius: 40,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'black',
    zIndex: 10,
  },
  addAndCloseButton: {
    backgroundColor: "#2D9CFF",
    flex: 1,
    marginTop: 5,
    marginHorizontal: 5,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderColor: "black",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  addAndCloseButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
