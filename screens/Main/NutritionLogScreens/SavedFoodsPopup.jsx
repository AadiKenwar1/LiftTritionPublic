import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNutritionContext } from '../../../context/NutritionContext/NutritionContext';

export default function SavedFoodsPopup(props) {
  const { addNutrition, nutritionData, setNutritionData } = useNutritionContext();

  const savedItems = nutritionData.filter(item => item.saved);

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
              {savedItems.length > 0 ? (
                <FlatList
                  data={savedItems}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.savedItem}>
                      <View style={styles.savedItemHeader}>
                        <Text style={styles.savedItemName}>{item.name}</Text>
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
                        <TouchableOpacity 
                          style={[styles.savedItemAddButton, { borderWidth: 2, borderColor: 'black', borderRadius: 30, backgroundColor: 'white' }]}
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
                          <Ionicons name="add" size={30} color="black"/>
                        </TouchableOpacity>
   
                        <TouchableOpacity 
                          style={[styles.savedItemAddButton, { backgroundColor: '#FF3B30', borderWidth: 2, borderColor: 'black', borderRadius: 15 }]}
                          onPress={() => {
                            setNutritionData(prevData => 
                              prevData.map(nutritionItem => 
                                nutritionItem.id === item.id 
                                  ? { ...nutritionItem, saved: false }
                                  : nutritionItem
                              )
                            );
                            Alert.alert('Removed', 'Item removed from saved foods!');
                          }}
                        >
                          <Ionicons name="trash" size={30} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptySavedContainer}>
                  <Ionicons name="bookmark-outline" size={48} color="#8E8E93" />
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    height: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    marginBottom: 0
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
  savedContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 0,
  },
  savedItem: {
    backgroundColor: 'gold',
    borderRadius: 12,
    padding: 12,
    minHeight: 200,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1.3,
    borderColor: 'black',
    borderLeftWidth: 4,
    borderLeftColor: 'black',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  savedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savedItemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedItemName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Inter_700Bold',
    
  },
  savedItemCaloriesBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'black',
  },
  savedItemCaloriesText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'black',
    letterSpacing: 0.3,
    fontFamily: 'Inter_700Bold',
  },
  savedItemMacrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'black',
  },
  savedItemMacroItem: {
    alignItems: 'center',
    flex: 1,
  },
  savedItemMacroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
    fontFamily: 'Inter_700Bold',
  },
  savedItemMacroLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter_500Medium',
  },
  savedItemAddButton: {
    padding: 4,
    borderRadius: 8,
  },
  savedItemButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 20,
    paddingVertical: 8,
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
    color: '#1f2937',
    marginTop: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySavedSubtext: {
    fontSize: 14,
    color: '#6b7280',
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
