import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, FlatList, Alert, ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { askOpenAI } from '../../../utils/openAI';
import { ScrollView } from 'react-native-gesture-handler';
import { useNutritionContext } from '../../../context/Nutrition/NutritionContext';

export default function AddNutritionScreen(props) {

  const [mode, setMode] = useState(0) // 0 = manual
  const [mainInput, setMainInput] = useState('');
  const [cals, setCals] = useState(0)
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const {addNutrition, nutritionData} = useNutritionContext()

  // Loading states for individual macros
  const [loadingCals, setLoadingCals] = useState(false);
  const [loadingProtein, setLoadingProtein] = useState(false);
  const [loadingCarbs, setLoadingCarbs] = useState(false);
  const [loadingFats, setLoadingFats] = useState(false);




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

    // Set loading state for specific macro
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
      
      // Update the specific macro value
      switch(macroType) {
        case 'calories':
          setCals((prev) => parseInt(prev,10) + parseInt(generatedValue, 10));
          break;
        case 'protein':
          setProtein((prev) => (parseInt(prev,10) + parseInt(generatedValue, 10)).toString());
          break;
        case 'carbs':
          setCarbs((prev) => parseInt(prev,10) + parseInt(generatedValue, 10));
          break;
        case 'fats':
          setFats((prev) => parseInt(prev,10) + parseInt(generatedValue, 10));
          break;
      }
    } finally {
      // Clear loading state
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


  async function handleAIGenerate(){
    const generatedCals = await handleGenerateMacros('calories')
    const generatedProtein = await handleGenerateMacros('protein')
    const generatedCarbs = await handleGenerateMacros('carbs')
    const generatedFats = await handleGenerateMacros('fats')
    setCals(generatedCals)
    setProtein(generatedProtein)
    setCarbs(generatedCarbs)
    setFats(generatedFats)
  }

  function handleReset(){
    setCals(0)
    setProtein(0)
    setCarbs(0)
    setFats(0)
    setMainInput('')
  }



  function handleAdd(){
    const name = mainInput ;

    addNutrition(
      name,
      parseInt(protein, 10) || 0,
      parseInt(carbs, 10) || 0,
      parseInt(fats, 10) || 0,
      parseInt(cals, 10) || 0
    );

    setMainInput('');
    setCals(0);
    setProtein(0);
    setCarbs(0);
    setFats(0);
  }


  function content(){
    const header = (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Manual Nutrition Entry</Text>
        <Text style={styles.headerSubtitle}>Enter your meal details manually or use AI to help generate macros</Text>
      </View>
    )

    const footer = (
      <>
      {/* Macro Inputs */}
      <View style={styles.macroInputsContainer}>
        <View style={styles.inputRow}>

          <Text style={styles.label}>Calories</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.macroInput}
              placeholder=""
              value={loadingCals ? "Generating..." : cals.toString()}
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
          {mode === 0 &&
          <TouchableOpacity 
            style={[styles.aiButton, loadingCals && styles.aiButtonDisabled]} 
            onPress={() => handleGenerateSpecificMacro('calories')}
            disabled={loadingCals}
          >
            <Ionicons name="sparkles-sharp" size={18} color="#ffffff" />
          </TouchableOpacity>
          }
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Protein</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.macroInput}
              placeholder=""
              value={loadingProtein ? "Generating..." : protein.toString()}
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
          {mode === 0 &&
          <TouchableOpacity 
            style={[styles.aiButton, loadingProtein && styles.aiButtonDisabled]} 
            onPress={() => handleGenerateSpecificMacro('protein')}
            disabled={loadingProtein}
          >
            <Ionicons name="sparkles-sharp" size={18} color="#ffffff" />
          </TouchableOpacity>
          }
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.label}>Carbs</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.macroInput}
              placeholder=""
              value={loadingCarbs ? "Generating..." : carbs.toString()}
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
          {mode === 0 &&
          <TouchableOpacity 
            style={[styles.aiButton, loadingCarbs && styles.aiButtonDisabled]} 
            onPress={() => handleGenerateSpecificMacro('carbs')}
            disabled={loadingCarbs}
          >
            <Ionicons name="sparkles-sharp" size={18} color="#ffffff" />
          </TouchableOpacity>
          }
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.label}>Fats</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.macroInput}
              placeholder=""
              value={loadingFats ? "Generating..." : fats.toString()}
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
          {mode === 0 &&
          <TouchableOpacity 
            style={[styles.aiButton, loadingFats && styles.aiButtonDisabled]} 
            onPress={() => handleGenerateSpecificMacro('fats')}
            disabled={loadingFats}
          >
            <Ionicons name="sparkles-sharp" size={18} color="#ffffff" />
          </TouchableOpacity>
          }
        </View>
      </View>



      <View flexDirection="row" gap={5} alignItems="center" justifyContent='center'>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text style={styles.buttonText}>Add Macros</Text>
        </TouchableOpacity>
      </View>
      </>
    )

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
            
            {mode === 0 ? <View>{content()}</View> : content()}
            

            
          </View>
          
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
    
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding:20,
    elevation: 10,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: 'black',

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  close: {
    fontSize: 22,
    fontWeight: 'bold',
    right: 0,
    position: 'absolute',
    fontFamily: 'Inter_700Bold',
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 5,
    fontFamily: 'Inter_700Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
    borderColor: 'black',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
    minHeight: 80,
    width: '99%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    fontFamily: 'Inter_400Regular',
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
    color: '#1a202c',
    width: 70,
    fontFamily: 'Inter_600SemiBold',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
    marginRight: 5,
  },
  macroInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginLeft: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 2.5,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    fontFamily: 'Inter_400Regular',
  },
  loadingIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  aiButton: {
    backgroundColor: '#D94CC4',
    borderRadius: 10,
    width:45,
    height:45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  aiButtonDisabled: {
    backgroundColor: '#B8B8B8',
    opacity: 0.6,
  },
  generateButton: {
    backgroundColor: '#D94CC4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4CD964',
    width:"49%",
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  closeButton: {
    backgroundColor: '#888888',
    width:"100%",
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: -10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  resetButton: {
    backgroundColor: 'red',
    width:"49%",
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  


});