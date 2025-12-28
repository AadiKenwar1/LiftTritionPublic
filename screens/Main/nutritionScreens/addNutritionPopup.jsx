import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect} from 'react';
import { askOpenAI } from '../../../utils/openAI';
import { useNutritionContext } from '../../../context/Nutrition/NutritionContext';
import { useBilling } from '../../../context/Billing/BillingContext.js';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export default function AddNutritionScreen(props) {

  //addNutrition and has Premium to check if AI macro generation is available
  const {addNutrition} = useNutritionContext()
  const { hasPremium } = useBilling();
  //Navigation to navigate to subscription screen
  const navigation = useNavigation();
  //User meal input
  const [mainInput, setMainInput] = useState('');
  //Macros state - use empty strings for blank initial state
  const [cals, setCals] = useState('')
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  // Loading states for individual macros
  const [loadingCals, setLoadingCals] = useState(false);
  const [loadingProtein, setLoadingProtein] = useState(false);
  const [loadingCarbs, setLoadingCarbs] = useState(false);
  const [loadingFats, setLoadingFats] = useState(false);

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




  async function handleGenerateMacros(macroType){
    if (!mainInput.trim()) return '0';

    const question = `Using USDA nutrition data or widely accepted nutritional standards, estimate the total grams of ${macroType} in the following meal: "${mainInput}". 
  Give only a number as the response, no units or explanation. Assume common serving sizes.`;

    try {
      const aiResponse = await askOpenAI(question);
      console.log(aiResponse)
      const cleanValue = parseInt(aiResponse.match(/\d+/)?.[0] || '0', 10);
      return cleanValue.toString();
    } catch (error) {
      console.error(`Error generating ${macroType}:`, error);
      return '0';
    }
  };

  async function handleGenerateSpecificMacro(macroType) {
    if (!mainInput.trim()) return;
    // Set loading state to true for macro type being generating
    switch(macroType) {
      case 'calories':
        setLoadingCals(true);
        break;
      case 'protein':
        setLoadingProtein(true);
        break;
      case 'carbs':
        setLoadingCarbs(true);
        break;
      case 'fats':
        setLoadingFats(true);
        break;
    }

    try {
      const generatedValue = await handleGenerateMacros(macroType);
      const generatedNum = parseInt(generatedValue, 10) || 0;
      
      // Update the specific macro value - treat empty string as 0
      switch(macroType) {
        case 'calories':
          setCals((prev) => {
            const prevNum = parseInt(prev, 10) || 0;
            return (prevNum + generatedNum).toString();
          });
          break;
        case 'protein':
          setProtein((prev) => {
            const prevNum = parseInt(prev, 10) || 0;
            return (prevNum + generatedNum).toString();
          });
          break;
        case 'carbs':
          setCarbs((prev) => {
            const prevNum = parseInt(prev, 10) || 0;
            return (prevNum + generatedNum).toString();
          });
          break;
        case 'fats':
          setFats((prev) => {
            const prevNum = parseInt(prev, 10) || 0;
            return (prevNum + generatedNum).toString();
          });
          break;
      }
    } finally {
      // Set loading state to false to indicate generation is complete
      switch(macroType) {
        case 'calories':
          setLoadingCals(false);
          break;
        case 'protein':
          setLoadingProtein(false);
          break;
        case 'carbs':
          setLoadingCarbs(false);
          break;
        case 'fats':
          setLoadingFats(false);
          break;
      }
    }
  }

  //Function to reset the macros and user meal input
  function handleReset(){
    setCals('')
    setProtein('')
    setCarbs('')
    setFats('')
    setMainInput('')
  }

  //Function to add the macros to nutrtion data
  function handleAdd(){
    const name = mainInput 
    addNutrition(
      name,
      parseInt(protein, 10) || 0,
      parseInt(carbs, 10) || 0,
      parseInt(fats, 10) || 0,
      parseInt(cals, 10) || 0
    );
    handleReset();
  }

  //Function to handle if user doesnt have premium or is not connected to internet
  function handleNotPremiumOrConnected(connected){
    if (!connected) {
      Alert.alert('No internet connection', 'Please connect to the internet to use this feature.');
    }
    else{
      navigation.navigate('Subscription');
      props.onClose();
    }
  }


  function content(){
    //Header containing the title and subtitle
    const header = (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Manual Nutrition Entry</Text>
        <Text style={styles.headerSubtitle}>Enter your meal details manually or use AI to help generate nutritional values</Text>
      </View>
    )
    //Footer containing the macro inputs, AI buttons, reset button, and close button
    const footer = (
      <>
      {/* Macro Inputs */}
      <View style={styles.macroInputsContainer}>
        <View style={styles.inputRow}>

          {/* Calories Input */}
          <Text style={styles.label}>Calories</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.macroInput}
              placeholder=""
              value={loadingCals ? "Generating..." : cals}
              onChangeText={setCals}
              keyboardType="numeric"
              editable={!loadingCals}
            />
            {loadingCals && (
              <ActivityIndicator 
                size="small" 
                color="#D94CC4" 
                style={styles.loadingIcon}
              />
            )}
          </View>
          <TouchableOpacity 
            style={[styles.aiButton, (loadingCals || !hasPremium || !isConnected ) && styles.aiButtonDisabled]} 
            onPress={() => (hasPremium && isConnected) ? handleGenerateSpecificMacro('calories') : handleNotPremiumOrConnected(isConnected)}
            disabled={loadingCals}
          >
            <LinearGradient
              colors={['#C63DE8', '#D94CC4', '#E55AB0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientAiButton}
            >
              <Ionicons name="sparkles-sharp" size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Protein Input */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>Protein</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.macroInput}
              placeholder=""
              value={loadingProtein ? "Generating..." : protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              editable={!loadingProtein}
            />
            {loadingProtein && (
              <ActivityIndicator 
                size="small" 
                color="#D94CC4" 
                style={styles.loadingIcon}
              />
            )}
          </View>
          <TouchableOpacity 
            style={[styles.aiButton, (loadingProtein || !hasPremium || !isConnected) && styles.aiButtonDisabled]} 
            onPress={() => (hasPremium && isConnected) ? handleGenerateSpecificMacro('protein') : handleNotPremiumOrConnected(isConnected)}
            disabled={loadingProtein}
          >
            <LinearGradient
              colors={['#C63DE8', '#D94CC4', '#E55AB0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientAiButton}
            >
              <Ionicons name="sparkles-sharp" size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Carbs Input */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>Carbs</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.macroInput}
              placeholder=""
              value={loadingCarbs ? "Generating..." : carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              editable={!loadingCarbs}
            />
            {loadingCarbs && (
              <ActivityIndicator 
                size="small" 
                color="#D94CC4" 
                style={styles.loadingIcon}
              />
            )}
          </View>
          <TouchableOpacity 
            style={[styles.aiButton, (loadingCarbs || !hasPremium || !isConnected) && styles.aiButtonDisabled]} 
            onPress={() => (hasPremium && isConnected) ? handleGenerateSpecificMacro('carbs') : handleNotPremiumOrConnected(isConnected)}
            disabled={loadingCarbs}
          >
            <LinearGradient
              colors={['#C63DE8', '#D94CC4', '#E55AB0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientAiButton}
            >
              <Ionicons name="sparkles-sharp" size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Fats Input */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>Fats</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.macroInput}
              placeholder=""
              value={loadingFats ? "Generating..." : fats}
              onChangeText={setFats}
              keyboardType="numeric"
              editable={!loadingFats}
            />
            {loadingFats && (
              <ActivityIndicator 
                size="small" 
                color="#D94CC4" 
                style={styles.loadingIcon}
              />
            )}
          </View>
          <TouchableOpacity 
            style={[styles.aiButton, (loadingFats || !hasPremium || !isConnected) && styles.aiButtonDisabled]} 
            onPress={() => (hasPremium && isConnected) ? handleGenerateSpecificMacro('fats') : handleNotPremiumOrConnected(isConnected)}
            disabled={loadingFats}
          >
            <LinearGradient
              colors={['#C63DE8', '#D94CC4', '#E55AB0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientAiButton}
            >
              <Ionicons name="sparkles-sharp" size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      {/* Close and Add Macros Buttons */}
      <View flexDirection="row" gap={5} alignItems="center" justifyContent='center'>
        <TouchableOpacity style={styles.closeButton} onPress={() => { handleReset(); props.onClose(); }}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text style={styles.buttonText}>Add Macros</Text>
        </TouchableOpacity>
      </View>
      </>
    )
    //Return header + text input for user meal input + footer
    return (
      <>
        {header}
        <TextInput
          style={styles.mainInput}
          placeholder="Enter your meal or food description, e.g: Taco with chicken, cheese, and rice. "
          placeholderTextColor="#9CA3AF" // e.g., Tailwind gray-400
          value={mainInput}
          onChangeText={setMainInput}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
        {footer}
      </>
    )
  }

  //Return modal displaying the content
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            <View>{content()}</View>
          </View>
        </View>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
    
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    height: '70%',
    backgroundColor: '#242424',
    borderRadius: 16,
    padding:20,
    elevation: 10,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: 'grey',

  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    color: 'white',
  },
  close: {
    fontSize: 22,
    fontWeight: 'bold',
    right: 0,
    position: 'absolute',
    fontFamily: 'Inter_700Bold',
    color: 'white',
  },
  content: {
    flex: 1,
    marginTop: 0,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    fontFamily: 'Inter_700Bold',
  },
  headerSubtitle: {
    fontSize: 14,
      color: 'white',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  modeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'white', // light gray
    padding: 4,
    borderRadius: 10,
    gap: 5,
  },

  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  activeModeButton: {
    backgroundColor: '#4CD964', // indigo
  },

  modeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563', // gray-700
    fontFamily: 'Inter_500Medium',
  },

  activeModeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  mainInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    marginBottom: 15,
    minHeight: 80,
    width: '99%',
    alignSelf: 'center',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
    fontFamily: 'Inter_400Regular',
    color:"white"
  },
  macroInputsContainer: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    width: 70,
    fontFamily: 'Inter_500Medium',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
    marginRight: 5,
  },
  macroInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    marginLeft: 0,
    elevation: 4,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
    fontFamily: 'Inter_400Regular',
    color:"white"
  },
  loadingIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  aiButton: {
    borderRadius: 10,
    width:45,
    height:45,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
    overflow: 'hidden',
  },
  gradientAiButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  aiButtonDisabled: {
    opacity: 0.4,
  },
  addButton: {
    backgroundColor: '#4CD964',
    width:"50%",
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0.8,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  closeButton: {
    backgroundColor: '#888888',
    width:"50%",
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0.8,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  


});