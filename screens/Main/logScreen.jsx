import PopupModal from "../../components/PopupModal.jsx";
import { useSettings } from "../../context/SettingsContext.js";
import Ionicons from '@expo/vector-icons/Ionicons'; // ✅ Correct import
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Pressable} from "react-native";
import Fab from '../../components/Fab.jsx';
import { useWorkoutContext } from '../../context/Workouts/WorkoutContext.js';
import { useWorkoutContext as useWorkoutContextV2 } from '../../context/WorkoutsV2/WorkoutContext.js';
import CustomHeader from '../../components/CustomHeader.jsx';
import LogScreen2 from "./workoutScreens/workoutsScreen.jsx"
import NutritionScreen from './nutritionScreens/nutritionScreen.jsx'
import { useNavigation } from "@react-navigation/native";
import AddNutritionPopup from './nutritionScreens/addNutritionPopup.jsx'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import ArchivedPopup from '../../components/ArchivedPopup.jsx';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SearchFoodDBPopup from './nutritionScreens/searchFoodDBPopup.jsx'
import SavedFoodsPopup from './nutritionScreens/savedFoodsPopup.jsx'
import { Fragment } from 'react';




export default function LogScreen() {
  const { mode, setMode} = useSettings();
  const navigation = useNavigation();
  const route = useRoute();
  const photoUri = route.params?.photoUri;
  const cameraMode = route.params?.cameraMode;
  const barcodeData = route.params?.barcodeData;
  
  const [workoutName, setWorkoutName] = useState('');
  const {workouts, addWorkout, resetContextState, reorderWorkouts, unarchiveWorkout, deleteWorkout} = useWorkoutContext();
  
  // V2 Context - now using for main add button
  const {workouts: workoutsV2, addWorkout: addWorkoutV2, loading: loadingV2} = useWorkoutContextV2();
  
  const [addWorkoutVisible, setAddWorkoutVisible] = useState(false)
  function handleAddWorkout(inputName) {
      console.log('🚀 Adding workout with V2 context:', inputName);
      console.log('📊 Current V2 workouts count:', workoutsV2.length);
      addWorkoutV2(inputName); // Now using V2!
      setWorkoutName(''); // clear input
      setAddWorkoutVisible(false); // close modal
  }

  // V2 Test function
  const handleAddWorkoutV2 = async () => {
    try {
      console.log('🚀 Testing V2 Add Workout...');
      const startTime = performance.now();
      
      await addWorkoutV2('Test Workout V2 - ' + new Date().toLocaleTimeString());
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`✅ V2 Workout added in ${duration.toFixed(2)}ms`);
      console.log('📊 V2 Workouts count:', workoutsV2.length);
    } catch (error) {
      console.error('❌ V2 Error adding workout:', error);
    }
  };

  const [addNutritionVisible, setAddNutritionVisible] = useState(false)
  const [archivedWorkoutsVisible, setArchivedWorkoutsVisible] = useState(false)
  const [foodDatabaseVisible, setFoodDatabaseVisible] = useState(false)
  const [savedFoodsVisible, setSavedFoodsVisible] = useState(false)

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
                style={[styles.fabButtons, { backgroundColor: '#007bff' }]}
                onPress={() => setAddWorkoutVisible(true)}
              >
                <Ionicons
                  name='add'
                  size={40}
                  color='white'
                  shadowColor='black'
                  shadowRadius={4}
                  shadowOpacity={0.4}
                />
                <PopupModal
                  modalVisible={addWorkoutVisible}
                  setModalVisible={setAddWorkoutVisible}
                  creatingWorkout={true}
                  handleAddWorkout={handleAddWorkout}
                  workoutName={workoutName}
                >
                  <Text style={{ marginBottom: 10, textAlign: 'center' }}>
                    Enter Workout
                  </Text>
                  <TextInput
                    placeholder="Workout name"
                    value={workoutName}
                    onChangeText={setWorkoutName}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      marginBottom: 10,
                      width: '100%',
                    }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 5 ,
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
                style={[styles.fabButtons, { backgroundColor: '#B0B0B0' }]}
                onPress={() => setArchivedWorkoutsVisible(true)}
              >
                {/* Archived Workouts Popup */}
                <ArchivedPopup
                  visible={archivedWorkoutsVisible}
                  data={workouts.filter((item) => item.archived)}
                  onClose={() => setArchivedWorkoutsVisible(false)}
                  reorderWorkouts={reorderWorkouts}
                  isWorkout={true}
                  function2={() => {}} // No function needed for archived items
                  moveMode={false}
                />
                <Ionicons
                  name='archive-outline'
                  size={40}
                  color='white'
                  shadowColor='black'
                  shadowRadius={4}
                  shadowOpacity={0.2}
                />
              </TouchableOpacity>,

              // V2 Test Button
              <TouchableOpacity
                key="test-v2"
                style={[styles.fabButtons, { backgroundColor: '#FF6B35' }]}
                disabled={loadingV2}
              >
                <Ionicons
                  name='flash'
                  size={35}
                  color='white'
                  shadowColor='black'
                  shadowRadius={4}
                  shadowOpacity={0.4}
                />
              </TouchableOpacity>,

              //Coming Soon - AI Workout Generator (react fragment to even out the buttons)
              <Fragment key="ai-workout-generator-placeholder"></Fragment>,
              //Coming Soon - Workout Scheduler (react fragment to even out the buttons)
              //<Fragment key="workout-scheduler-placeholder"></Fragment>

              
            ]
          : [
              //Add Nutrition Button
              <TouchableOpacity
                key="add-nutrition"
                style={[styles.fabButtons, { backgroundColor: '#00C853' }]}
                onPress={() => setAddNutritionVisible(!addNutritionVisible)}
              >
                <Ionicons
                  name='add'
                  size={40}
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
                style={[styles.fabButtons, { backgroundColor: '#FF4081' }]}
                onPress={() => {setTimeout(() => {navigation.navigate('CameraScreen')}, 600) }}
              >
                <Ionicons
                  name='camera'
                  size={40}
                  color='#FFFFFF'
                  shadowColor='white'
                  shadowRadius={4}
                  shadowOpacity={0.2}
                />
              </TouchableOpacity>,

              //Food Database Button
              <TouchableOpacity
                key="food-database"
                style={[styles.fabButtons, { backgroundColor: '#4FC3F7' }]}
                onPress={() => setFoodDatabaseVisible(!foodDatabaseVisible)}
              >
                <MaterialCommunityIcons
                  name='database-search'
                  size={40}
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
                style={[styles.fabButtons, { backgroundColor: 'gold' }]}
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
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    color: "black",
  },
  fabButtons: {
    height: 60,
    width: 60,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  addAndCloseButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  comingSoonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
    fontFamily: "Inter_600SemiBold",
  }
});
