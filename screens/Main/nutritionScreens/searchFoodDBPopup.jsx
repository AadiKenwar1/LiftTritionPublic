import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, FlatList, Alert, ActivityIndicator} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useState } from 'react';
import FoodSearch from '../../../components/FoodSearch';
import PopupModal from '../../../components/PopupModal';
import { ScrollView } from 'react-native-gesture-handler';
import { useNutritionContext } from '../../../context/Nutrition/NutritionContext';

export default function SearchFoodDBPopup(props) {
  const [cals, setCals] = useState(0)
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const {addNutrition, nutritionData} = useNutritionContext()

  const[addedFood, setAddedFood] = useState([])
  const [showAddedFoodsPopup, setShowAddedFoodsPopup] = useState(false);

  function handleDelete(index) {
    const foodToRemove = addedFood[index];

    // Subtract from parent macros
    setCals((prev) => (0, parseInt(prev, 10) - parseInt(foodToRemove.calories, 10)).toString());
    setProtein((prev) => (0, parseInt(prev, 10) - parseInt(foodToRemove.protein, 10)).toString());
    setCarbs((prev) => (0, parseInt(prev, 10) - parseInt(foodToRemove.carbs, 10)).toString());
    setFats((prev) => (0, parseInt(prev, 10) - parseInt(foodToRemove.fats, 10)).toString());

    // Remove from local addedFood list
    setAddedFood((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAdd(){
    const name = addedFood.map(item => item.name).join(", ");

    addNutrition(
      name,
      parseInt(protein, 10) || 0,
      parseInt(carbs, 10) || 0,
      parseInt(fats, 10) || 0,
      parseInt(cals, 10) || 0
    );

    setCals(0);
    setProtein(0);
    setCarbs(0);
    setFats(0);
    setAddedFood([]);
  }

  function handleReset(){
    setCals(0);
    setProtein(0);
    setCarbs(0);
    setFats(0);
    setAddedFood([]);
  }

  const header = (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Search Food Database</Text>
        <Text style={styles.headerSubtitle}>Search and add branded foods</Text>
      </View>
      
      {/* Macro Summary */}
      <View style={styles.macroSummaryContainer}>
        <Text style={styles.macroSummaryTitle}>Total Macros</Text>
        <View style={styles.macroSummaryGrid}>
          <View style={styles.macroSummaryItem}>
            <Text style={styles.macroSummaryValue}>{cals}</Text>
            <Text style={styles.macroSummaryLabel}>Calories</Text>
          </View>
          <View style={styles.macroSummaryItem}>
            <Text style={styles.macroSummaryValue}>{protein}g</Text>
            <Text style={styles.macroSummaryLabel}>Protein</Text>
          </View>
          <View style={styles.macroSummaryItem}>
            <Text style={styles.macroSummaryValue}>{carbs}g</Text>
            <Text style={styles.macroSummaryLabel}>Carbs</Text>
          </View>
          <View style={styles.macroSummaryItem}>
            <Text style={styles.macroSummaryValue}>{fats}g</Text>
            <Text style={styles.macroSummaryLabel}>Fats</Text>
          </View>
        </View>
      </View>

      {/* Show Added Foods Button */}
      <TouchableOpacity
        style={styles.showAddedFoodsButton}
        onPress={() => setShowAddedFoodsPopup(true)}
      >
        <Ionicons name="list" size={18} color="white" />
        <Text style={styles.showAddedFoodsText}>
          Show Added Foods ({addedFood.length})
        </Text>
      </TouchableOpacity>
    </>
  )

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
              <FoodSearch
                setCals={setCals}
                setProtein={setProtein}
                setCarbs={setCarbs}
                setFats={setFats}
                setAddedFood={setAddedFood}
                header={header}
              />
            </View>
            
            {/* Close Button */}
            <View flexDirection="row" gap={5} alignItems="center" justifyContent='center' marginTop={0} marginBottom={0}>
              <TouchableOpacity style={styles.closeButton} onPress={() => { handleReset(); props.onClose(); }}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Ionicons name="add" size={18} color="#ffffff" />
                <Text style={styles.buttonText}>Add Foods</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Added Foods Popup - Rendered inside main modal to appear on top */}
      <PopupModal
        modalVisible={showAddedFoodsPopup}
        setModalVisible={setShowAddedFoodsPopup}
      >
        <View style={styles.addedFoodsPopupContainer}>
          <Text style={styles.addedFoodsPopupTitle}>Added Foods</Text>
          
          {addedFood.length === 0 ? (
            <Text style={styles.noFoodsText}>No foods added yet</Text>
          ) : (
            <ScrollView style={styles.addedFoodsList} showsVerticalScrollIndicator={false}>
              {addedFood.map((item, index) => (
                <View key={index} style={styles.addedFoodsItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addedFoodsName}>{item.name}</Text>
                    <Text style={styles.addedFoodsMacros}>
                      {item.calories} cal | {item.protein}g P | {item.carbs}g C | {item.fats}g F
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addedFoodsDeleteButton}
                    onPress={() => handleDelete(index)}
                  >
                    <Entypo name="trash" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          
          <TouchableOpacity
            style={styles.closeAddedFoodsButton}
            onPress={() => setShowAddedFoodsPopup(false)}
          >
            <Text style={styles.closeAddedFoodsButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </PopupModal>
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
  showAddedFoodsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#4CD964',
    marginBottom: 10,
    marginTop: 2,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  showAddedFoodsText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 16,
    textAlign: 'center',
  },
  addedFoodsPopupContainer: {
    width: '100%',
    maxHeight: 400,
  },
  addedFoodsPopupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  noFoodsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Inter_400Regular',
  },
  addedFoodsList: {
    maxHeight: 250,
  },
  addedFoodsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
    elevation: 2,
  },
  addedFoodsName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Inter_500Medium',
  },
  addedFoodsMacros: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Inter_400Regular',
  },
  addedFoodsDeleteButton: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 6,
  },
  closeAddedFoodsButton: {
    backgroundColor: 'grey',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
  },
  closeAddedFoodsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  macroSummaryContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  macroSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  macroSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 10,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  macroSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  macroSummaryLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter_500Medium',
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
