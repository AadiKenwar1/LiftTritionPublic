import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Pressable } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useNutritionContext } from '../../../context/Nutrition/NutritionContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Nut } from 'lucide-react-native';

export default function SavedFoodsPopup(props) {
  //Nutrition Context Functions
  const { addNutrition, nutritionData, editNutrition } = useNutritionContext();
  //Filter saved items from nutritionData (exclude deleted items)
  const savedItems = nutritionData.filter(item => item.saved && !item.deleted);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Saved Foods</Text>
              <Text style={styles.headerSubtitle}>Quickly add your bookmarked nutrition items</Text>
            </View>

            {/* Saved Items List */}
            <View style={styles.savedContainer}>
              {/* If there are saved items, show the list, else show the empty container */}
              {savedItems.length > 0 ? (
                <FlatList
                  data={savedItems}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.savedItem}>
                      <View style={styles.savedItemHeader}>
                        <View style={styles.savedItemNameContainer}>
                          <Pressable style={styles.savedItemIconContainer}>
                            <LinearGradient
                              colors={['#2ECC71', '#4CD964', '#5DE87A']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 0, y: 1 }}
                              style={styles.savedItemIconGradient}
                            >
                              <Nut size={20} color="white" />
                            </LinearGradient>
                          </Pressable>
                        <Text style={styles.savedItemName}>{item.name}</Text>
                        </View>
                        <View style={styles.savedItemHeaderRight}>
                          <View style={styles.savedItemCaloriesBadge}>
                            <Text style={styles.savedItemCaloriesText}>{item.calories} cal</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.savedItemMacrosGrid}>
                        <View style={styles.savedItemMacroItem}>
                          <Text style={styles.savedItemMacroValue}>{item.protein}g</Text>
                          <Text style={styles.savedItemMacroLabel}>Protein</Text>
                        </View>
                        <View style={styles.savedItemMacroItem}>
                          <Text style={styles.savedItemMacroValue}>{item.carbs}g</Text>
                          <Text style={styles.savedItemMacroLabel}>Carbs</Text>
                        </View>
                        <View style={styles.savedItemMacroItem}>
                          <Text style={styles.savedItemMacroValue}>{item.fats}g</Text>
                          <Text style={styles.savedItemMacroLabel}>Fats</Text>
                        </View>
                      </View>
                      
                      <View style={styles.savedItemButtonContainer}>
                        {/* Add Nutrition Item Button */}
                        <TouchableOpacity 
                          style={styles.savedItemAddButton}
                          onPress={() => {
                            addNutrition(
                              item.name,
                              item.protein,
                              item.carbs,
                              item.fats,
                              item.calories
                            );
                            Alert.alert('Added', 'Nutrition item added to your log!');
                          }}
                        >
                          <Ionicons name="add" size={24} color="white"/>
                        </TouchableOpacity>

                        {/* Delete Nutrition Item Button */}
                        <TouchableOpacity 
                          style={styles.savedItemDeleteButton}
                          onPress={async () => {
                            try {
                              await editNutrition(
                                item.id,
                                item.name,
                                item.protein,
                                item.carbs,
                                item.fats,
                                item.calories,
                                false // Set saved to false - this persists to database
                              );
                            } catch (error) {
                              console.error('Error removing item from saved foods:', error);
                            }
                          }}
                        >
                          <Entypo name="trash" size={18} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptySavedContainer}>
                  <Ionicons name="bookmark-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptySavedText}>No saved items yet</Text>
                  <Text style={styles.emptySavedSubtext}>Bookmark nutrition items to see them here</Text>
                </View>
              )}
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    padding: 20,
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
  savedContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 0,
  },
  savedItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  savedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  savedItemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  savedItemIconContainer: {
    marginRight: 12,
  },
  savedItemIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.3,
    borderColor: 'black',
  },
  savedItemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    fontFamily: 'Inter_700Bold',
  },
  savedItemCaloriesBadge: {
    backgroundColor: '#242424',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  savedItemCaloriesText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
    fontFamily: 'Inter_700Bold',
  },
  savedItemMacrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#242424',
    borderRadius: 12,
    borderWidth: 0.3,
    borderColor: 'grey',
    marginBottom: 16,
  },
  savedItemMacroItem: {
    alignItems: 'center',
    flex: 1,
  },
  savedItemMacroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  savedItemMacroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter_500Medium',
  },
  savedItemButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  savedItemAddButton: {
    backgroundColor: '#4CD964',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedItemDeleteButton: {
    backgroundColor: '#FF3B30',
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySavedContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    flex: 1,
    justifyContent: 'center',
  },
  emptySavedText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySavedSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  closeButton: {
    backgroundColor: '#888888',
    width: "100%",
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 0,
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
