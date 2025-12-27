import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {Entypo, Ionicons } from '@expo/vector-icons';

export default function ViewIngredients({
  visible,
  onClose,
  ingredients = [],
  onSave,
  itemId,
  currentMacros = { protein: 0, carbs: 0, fats: 0, calories: 0 },
}) {
  const [ingredientList, setIngredientList] = useState([]);
  const [totalMacros, setTotalMacros] = useState(currentMacros);

  // Initialize ingredient list when modal opens
  useEffect(() => {
    if (visible && ingredients.length > 0) {
      // Count occurrences and create ingredient objects
      const ingredientCounts = {};
      ingredients.forEach(ingredient => {
        ingredientCounts[ingredient] = (ingredientCounts[ingredient] || 0) + 1;
      });
      
      // Calculate estimated macros per unit for each ingredient
      const uniqueIngredients = Object.keys(ingredientCounts);
      const totalQuantity = Object.values(ingredientCounts).reduce((sum, qty) => sum + qty, 0);
      
      const ingredientObjects = uniqueIngredients.map((name, index) => {
        const quantity = ingredientCounts[name];
        // Calculate macros per unit (divide by quantity to get per-unit values)
        const proteinPerUnit = Math.round(currentMacros.protein / totalQuantity);
        const carbsPerUnit = Math.round(currentMacros.carbs / totalQuantity);
        const fatsPerUnit = Math.round(currentMacros.fats / totalQuantity);
        const caloriesPerUnit = Math.round(currentMacros.calories / totalQuantity);
        
        return {
          id: Math.random().toString(),
          name,
          quantity: quantity,
          protein: proteinPerUnit.toString(),
          carbs: carbsPerUnit.toString(),
          fats: fatsPerUnit.toString(),
          calories: caloriesPerUnit.toString(),
        };
      });
      
      setIngredientList(ingredientObjects);
    }
  }, [visible, ingredients, currentMacros]);

  // Calculate total macros whenever ingredient list changes
  useEffect(() => {
    const totals = ingredientList.reduce((acc, ingredient) => {
      const quantity = ingredient.quantity || 0;
      const proteinPerUnit = parseInt(ingredient.protein) || 0;
      const carbsPerUnit = parseInt(ingredient.carbs) || 0;
      const fatsPerUnit = parseInt(ingredient.fats) || 0;
      const caloriesPerUnit = parseInt(ingredient.calories) || 0;
      
      return {
        protein: acc.protein + (proteinPerUnit * quantity),
        carbs: acc.carbs + (carbsPerUnit * quantity),
        fats: acc.fats + (fatsPerUnit * quantity),
        calories: acc.calories + (caloriesPerUnit * quantity),
      };
    }, { protein: 0, carbs: 0, fats: 0, calories: 0 });
    
    setTotalMacros(totals);
  }, [ingredientList]);

  const updateIngredient = (id, field, value) => {
    setIngredientList(prev => 
      prev.map(ingredient => 
        ingredient.id === id 
          ? { ...ingredient, [field]: value }
          : ingredient
      )
    );
  };

  const removeIngredient = (id) => {
    setIngredientList(prev => prev.filter(ingredient => ingredient.id !== id));
  };

  const addIngredient = () => {
    const newIngredient = {
      id: Math.random().toString(),
      name: '',
      quantity: 1,
      protein: '0',
      carbs: '0',
      fats: '0',
      calories: '0',
    };
    setIngredientList(prev => [...prev, newIngredient]);
  };

  const adjustQuantity = (id, change) => {
    setIngredientList(prev => 
      prev.map(ingredient => 
        ingredient.id === id 
          ? { ...ingredient, quantity: Math.max(1, (ingredient.quantity || 1) + change) }
          : ingredient
      )
    );
  };

  const handleSave = () => {
    // Validate that all ingredients have names
    const hasEmptyNames = ingredientList.some(ingredient => !ingredient.name.trim());
    if (hasEmptyNames) {
      Alert.alert('Error', 'All ingredients must have names');
      return;
    }

    // Create the updated ingredients array with quantities
    const updatedIngredients = [];
    ingredientList.forEach(ingredient => {
      const quantity = ingredient.quantity || 0;
      for (let i = 0; i < quantity; i++) {
        updatedIngredients.push(ingredient.name);
      }
    });

    // Call the onSave function with updated data
    onSave(itemId, updatedIngredients, totalMacros);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Ingredients</Text>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Total Macros Display */}
            <View style={styles.totalMacrosContainer}>
              <Text style={styles.totalMacrosTitle}>Total Macros</Text>
              <View style={styles.totalMacrosGrid}>
              <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{totalMacros.calories} </Text>
                  <Text style={styles.macroLabel}>Calories</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{totalMacros.protein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{totalMacros.carbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{totalMacros.fats}g</Text>
                  <Text style={styles.macroLabel}>Fats</Text>
                </View>
                
              </View>
            </View>

                         {/* Ingredients List */}
             <View style={styles.ingredientsSection}>
               <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>Ingredients</Text>
               </View>
               
               {ingredientList.map((ingredient, index) => {
                const quantity = ingredient.quantity || 0;
                const proteinPerUnit = parseInt(ingredient.protein) || 0;
                const carbsPerUnit = parseInt(ingredient.carbs) || 0;
                const fatsPerUnit = parseInt(ingredient.fats) || 0;
                const caloriesPerUnit = parseInt(ingredient.calories) || 0;
                
                const totalProtein = proteinPerUnit * quantity;
                const totalCarbs = carbsPerUnit * quantity;
                const totalFats = fatsPerUnit * quantity;
                const totalCalories = caloriesPerUnit * quantity;
                
                return (
                    <View key={ingredient.id} style={styles.ingredientCard}>
                     <View style={styles.ingredientHeader}>
                       <TextInput
                         style={styles.nameInput}
                         value={ingredient.name}
                         onChangeText={(value) => updateIngredient(ingredient.id, 'name', value)}
                         placeholder="Ingredient name"
                         placeholderTextColor="#9CA3AF"
                       />
                       <TouchableOpacity 
                         style={styles.removeButton}
                         onPress={() => removeIngredient(ingredient.id)}
                       >
                         <Entypo name="trash" size={20} color="#FF3B30" />
                       </TouchableOpacity>
                     </View>
                    
                    <View style={styles.quantityRow}>
                      <Text style={styles.inputLabel}>Quantity</Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => adjustQuantity(ingredient.id, -1)}
                        >
                          <Ionicons name="remove" size={16} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{ingredient.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => adjustQuantity(ingredient.id, 1)}
                        >
                          <Ionicons name="add" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                                         <View style={styles.macrosRow}>
                       <View style={styles.macroInput}>
                         <Text style={styles.macroInputLabel}>Protein</Text>
                         <TextInput
                           style={styles.macroTextInput}
                           value={totalProtein.toString()}
                           onChangeText={(value) => {
                             const newValue = parseInt(value) || 0;
                             const newPerUnit = quantity > 0 ? Math.round(newValue / quantity) : 0;
                             updateIngredient(ingredient.id, 'protein', newPerUnit.toString());
                           }}
                           placeholder="0"
                           placeholderTextColor="#9CA3AF"
                           keyboardType="numeric"
                         />
                       </View>
                       <View style={styles.macroInput}>
                         <Text style={styles.macroInputLabel}>Carbs</Text>
                         <TextInput
                           style={styles.macroTextInput}
                           value={totalCarbs.toString()}
                           onChangeText={(value) => {
                             const newValue = parseInt(value) || 0;
                             const newPerUnit = quantity > 0 ? Math.round(newValue / quantity) : 0;
                             updateIngredient(ingredient.id, 'carbs', newPerUnit.toString());
                           }}
                           placeholder="0"
                           placeholderTextColor="#9CA3AF"
                           keyboardType="numeric"
                         />
                       </View>
                       <View style={styles.macroInput}>
                         <Text style={styles.macroInputLabel}>Fats</Text>
                         <TextInput
                           style={styles.macroTextInput}
                           value={totalFats.toString()}
                           onChangeText={(value) => {
                             const newValue = parseInt(value) || 0;
                             const newPerUnit = quantity > 0 ? Math.round(newValue / quantity) : 0;
                             updateIngredient(ingredient.id, 'fats', newPerUnit.toString());
                           }}
                           placeholder="0"
                           placeholderTextColor="#9CA3AF"
                           keyboardType="numeric"
                         />
                       </View>
                       <View style={styles.macroInput}>
                         <Text style={styles.macroInputLabel}>Calories</Text>
                         <TextInput
                           style={styles.macroTextInput}
                           value={totalCalories.toString()}
                           onChangeText={(value) => {
                             const newValue = parseInt(value) || 0;
                             const newPerUnit = quantity > 0 ? Math.round(newValue / quantity) : 0;
                             updateIngredient(ingredient.id, 'calories', newPerUnit.toString());
                           }}
                           placeholder="0"
                           placeholderTextColor="#9CA3AF"
                           keyboardType="numeric"
                         />
                       </View>
                     </View>
                  </View>
                                 );
               })}
               
               {/* Add Button */}
               <View style={styles.addButtonContainer}>
                 <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                   <Ionicons name="add" size={20} color="white" />
                 </TouchableOpacity>
               </View>
             </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    maxHeight: '75%',
    backgroundColor: '#242424',
    marginBottom: 50,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Inter_700Bold',
  },
  modalContent: {
    maxHeight: 600,
  },
  totalMacrosContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  totalMacrosTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  totalMacrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 10,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter_500Medium',
  },
  ingredientsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
  },
  addButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#4CD964',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.3,
    borderColor: 'grey',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  ingredientCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  removeButton: {
    padding: 4,
  },
  inputRow: {
    marginBottom: 12,
  },
  quantityRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginBottom: 6,
    fontFamily: 'Inter_500Medium',
  },
  nameInput: {
    flex: 1,
    borderWidth: 0.3,
    borderColor: 'grey',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    fontFamily: 'Inter_400Regular',
    color: 'white',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 0.3,
    borderColor: 'grey',
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  quantityButton: {
    padding: 8,
    borderRadius: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    paddingHorizontal: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  macroInput: {
    flex: 1,
  },
  macroInputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 4,
    fontFamily: 'Inter_500Medium',
  },
  macroTextInput: {
    borderWidth: 0.3,
    borderColor: 'grey',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#1A1A1A',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    color: 'white',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#888888',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CD964',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
}); 