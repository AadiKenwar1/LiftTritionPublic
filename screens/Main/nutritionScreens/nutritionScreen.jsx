import {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, FlatList, TouchableOpacity, Modal, TextInput, Alert, Pressable} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FoodSearch from '../../../components/FoodSearch';
import { useNutritionContext } from '../../../context/Nutrition/NutritionContext';
import { Image } from 'react-native';
import WeightUpdateModal from '../../../components/WeightModal';
import EditNutritionModal from '../../../components/EditNutritionModal';
import ViewIngredients from '../../../components/ViewIngredients';
import DatePickerModal from '../../../components/DatePickerModal';
import { useSettings } from '../../../context/Settings/SettingsContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getLocalDateKey } from '../../../utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import { Nut, Scale } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
export default function NutritionScreen({photoUri, cameraMode, barcodeData}) {

  const {bodyWeight, unit, goalWeight} = useSettings()
  // Get all nutrition context functions and the current analyzing state
  // currentlyAnalyzing will be the photo URI if analysis is in progress, or null if not
  const {nutritionData, setNutritionData, getTodaysMacro, getMacroForDate, getTodaysLogs, getLogsForDate, addNutritionFromPhoto, addNutritionFromLabel, addNutritionFromBarcode, analyzeAndAddNutritionFromPhotoUri, deleteNutrition, editNutrition, updateIngredientsAndMacros, currentlyAnalyzing} = useNutritionContext()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [todaysLogs, setTodaysLogs] = useState(getTodaysLogs())
  const [todaysProtein, setTodaysProtein] = useState(getTodaysMacro('protein'))
  const [todaysCarbs, setTodaysCarbs] = useState(getTodaysMacro('carbs'))
  const [todaysFats, setTodaysFats] = useState(getTodaysMacro('fats'))

  // Weight management state
  const [showWeightModal, setShowWeightModal] = useState(false);
  
  // Date picker modal state
  const [showDatePicker, setShowDatePicker] = useState(false);

  const today = getLocalDateKey() === getLocalDateKey(selectedDate)


  useEffect(() => {
    // Check if selected date is today
    const today = new Date()
    const isToday = selectedDate.toDateString() === today.toDateString()
    
    if (isToday) {
      setTodaysProtein(getTodaysMacro('protein'))
      setTodaysCarbs(getTodaysMacro('carbs'))
      setTodaysFats(getTodaysMacro('fats'))
      setTodaysLogs(getTodaysLogs())
    } else {
      setTodaysProtein(getMacroForDate('protein', selectedDate))
      setTodaysCarbs(getMacroForDate('carbs', selectedDate))
      setTodaysFats(getMacroForDate('fats', selectedDate))
      setTodaysLogs(getLogsForDate(selectedDate))
    }
  }, [nutritionData, selectedDate])

  // Effect to handle photo/barcode analysis when new data comes in
  // This runs whenever photoUri, cameraMode, or barcodeData changes
  // Note: The analyzing state is now managed by the context (currentlyAnalyzing)
  // This ensures the analyzing message persists across mode switches
  useEffect(() => {
    // Only proceed if we have photo or barcode data to analyze
    if (photoUri || barcodeData) {
      // Determine which analysis function to call based on camera mode
      console.log('Camera mode:', cameraMode);
      let analysisPromise;
      
      switch (cameraMode) {
        case 'WIDE':
          // Picture mode - general food analysis with ingredients
          console.log('Calling addNutritionFromPhoto for WIDE mode');
          analysisPromise = addNutritionFromPhoto(photoUri);
          break;
        case 'TALL':
          // Nutrition Label mode - precise label reading
          console.log('Calling addNutritionFromLabel for TALL mode');
          analysisPromise = addNutritionFromLabel(photoUri);
          break;
        case 'BARCODE':
          // Barcode mode - product identification
          console.log('Calling addNutritionFromBarcode for BARCODE mode');
          analysisPromise = addNutritionFromBarcode(barcodeData);
          break;
        default:
          // Default to picture mode for backward compatibility
          console.log('Calling addNutritionFromPhoto for default mode');
          analysisPromise = addNutritionFromPhoto(photoUri);
          break;
      }
      
      // Note: We no longer need to manage isAnalyzing state here
      // The context now handles the analyzing state automatically via currentlyAnalyzing
      // This ensures the analyzing message persists across mode switches and component re-renders
    }
  }, [photoUri, cameraMode, barcodeData]);

  const handleMenuPress = (item) => {
    Alert.alert(
      item.name,
      ``,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Edit',
          onPress: () => openEditModal(item),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNutrition(item.id);
            } catch (error) {
              Alert.alert("Error", "Failed to delete nutrition entry. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFats, setEditFats] = useState('');
  const [editCalories, setEditCalories] = useState('');

  // View Ingredients modal state
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [viewingIngredientsItem, setViewingIngredientsItem] = useState(null);

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditProtein(item.protein.toString());
    setEditCarbs(item.carbs.toString());
    setEditFats(item.fats.toString());
    setEditCalories(item.calories.toString());
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editingItem) {
      try {
        await editNutrition(
          editingItem.id,
          editName,
          parseInt(editProtein) || 0,
          parseInt(editCarbs) || 0,
          parseInt(editFats) || 0,
          parseInt(editCalories) || 0
        );
        setShowEditModal(false);
        setEditingItem(null);
      } catch (error) {
        Alert.alert("Error", "Failed to update nutrition entry. Please try again.");
      }
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const formatDateForDisplay = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return "Today's Nutrition";
    } else {
      const options = { month: 'long', day: 'numeric', year: 'numeric' };
      return `${date.toLocaleDateString('en-US', options)}`;
    }
  };



  function renderItem({item}){
    const isUnsynced = item?.synced === false;
    
    return(
      <View style={[
        styles.itemContainer, 
        isUnsynced && styles.itemContainerUnsynced
      ]}>
        <View style={styles.itemHeader}>
          <View style={styles.nameContainer}>
            <Pressable style={styles.iconContainer}>
              <LinearGradient
                colors={['#2ECC71', '#4CD964', '#5DE87A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.iconGradient}
              >
                <Nut size={20} color="white" />
              </LinearGradient>
            </Pressable>
            <Text style={styles.name}>{item.name}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.caloriesBadge}>
              <Text style={styles.caloriesText}>{item.calories} cal</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.bookmarkButton}
                onPress={async () => {
                  try {
                    const newSaved = !item.saved;
                    await editNutrition(
                      item.id,
                      item.name,
                      item.protein,
                      item.carbs,
                      item.fats,
                      item.calories,
                      newSaved // Pass the new saved value
                    );
                  } catch (error) {
                    Alert.alert("Error", "Failed to update bookmark status. Please try again.");
                  }
                }}
              >
                <Ionicons 
                  name={item.saved ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={item.saved ? "gold" : "white"} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress(item)} style={styles.menuButton}>
                <Ionicons name="pencil" size={20} color={"white"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.macrosGrid}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.fats}g</Text>
            <Text style={styles.macroLabel}>Fats</Text>
          </View>
        </View>
        {item.isPhoto && (
          <View style={styles.photoIndicator}>
            <View style={styles.photoInfo}>
              <Ionicons name="camera" size={14} color="white" />
              <Text style={styles.photoText}>Taken by Photo</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewIngredientsButton}
              onPress={() => {
                setViewingIngredientsItem(item);
                setShowIngredientsModal(true);
              }}
            >
              <Text style={styles.viewIngredientsText}>View Ingredients</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ) 
  };

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Current Weight Section */}
            <View style={styles.weightSection}>
              <TouchableOpacity 
                style={styles.weightCard}
                onPress={() => setShowWeightModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.weightCardContent}>
                  <View style={styles.weightCardLeft}>
                    <Pressable style={styles.weightIconContainer}>
                      <LinearGradient
                        colors={['#2ECC71', '#4CD964', '#5DE87A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.weightIconGradient}
                      >
                        <Scale size={18} color="white" />
                      </LinearGradient>
                    </Pressable>
                    <View style={styles.weightInfo}>
                      <Text style={styles.sectionTitle}>Current Weight</Text>
                      <View style={styles.weightDisplay}>
                        <Text style={styles.weightValue}>{bodyWeight}</Text>
                        <Text style={styles.weightUnit}>{unit ? 'lbs' : 'kg'}</Text>
                      </View>
                      <Text style={styles.goalWeightText}>Goal: {goalWeight} {unit ? 'lbs' : 'kg'}</Text>
                    </View>
                  </View>
                  <Ionicons name="pencil" size={20} color="white" />
                </View>
              </TouchableOpacity>
            </View>
            {/* Today's Macros Header */}
            <Pressable 
              style={styles.headerButton}
              onPress={() => setShowDatePicker(true)}
            >
              
              <View style={styles.headerContent}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.headerLine} />
                  <View flexDirection="row" alignItems="center" gap={0} paddingHorizontal={2.25}>
                    <Text style={styles.header}>{formatDateForDisplay(selectedDate)}</Text>
                    <Ionicons name="calendar-outline" size={28} color="white" />
                  </View>
                  <View style={styles.headerLine} />
                </View>
              </View>
            </Pressable>
            {/* Show analyzing message when context indicates analysis is in progress */}
            {/* This will persist across mode switches since it's managed by the context */}
            {currentlyAnalyzing && (
              <View style={styles.analyzingContainer}>
                <Text style={styles.analyzingText}>Analyzing photo and adding nutrition entry...</Text>
              </View>
            )}
          </View>
        }
        data={todaysLogs.slice().sort((a, b) => b.time - a.time)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="restaurant" size={60} color="#8E8E93" />
            <Text style={styles.emptyText}>No nutrition logs for {today === true ? "today" : formatDateForDisplay(selectedDate)}</Text>
            <Text style={styles.emptySubtext}>Start tracking your meals to see your progress</Text>
          </View>
        }
      />

      {/* Weight Update Modal */}
      <WeightUpdateModal
        visible={showWeightModal}
        onClose={() => setShowWeightModal(false)}
      />

      {/* Edit Nutrition Modal */}
      <EditNutritionModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        item={editingItem}
        editName={editName}
        setEditName={setEditName}
        editProtein={editProtein}
        setEditProtein={setEditProtein}
        editCarbs={editCarbs}
        setEditCarbs={setEditCarbs}
        editFats={editFats}
        setEditFats={setEditFats}
        editCalories={editCalories}
        setEditCalories={setEditCalories}
      />

      {/* View Ingredients Modal */}
      <ViewIngredients
        visible={showIngredientsModal}
        onClose={() => setShowIngredientsModal(false)}
        ingredients={viewingIngredientsItem?.ingredients || []}
        onSave={async (id, ingredients, totalMacros) => {
          try {
            await updateIngredientsAndMacros(id, ingredients, totalMacros);
          } catch (error) {
            Alert.alert("Error", "Failed to update ingredients and macros. Please try again.");
          }
        }}
        itemId={viewingIngredientsItem?.id}
        currentMacros={{
          protein: viewingIngredientsItem?.protein || 0,
          carbs: viewingIngredientsItem?.carbs || 0,
          fats: viewingIngredientsItem?.fats || 0,
          calories: viewingIngredientsItem?.calories || 0,
        }}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
        initialDate={selectedDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
    paddingBottom: 100
  },
  headerContainer: {
    paddingHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 0,
  },
  weightSection: {
    marginBottom: 30,//
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold',
  },
  weightCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  weightCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  weightIconContainer: {
    marginRight: 12,
  },
  weightIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.3,
    borderColor: 'black',
  },
  weightInfo: {
    flex: 1,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: 4,
  },
  goalWeightText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  weightValue: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
    fontFamily: 'Inter_700Bold',
  },
  weightUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 6,
    fontFamily: 'Inter_500Medium',
  },
  gradientHeader: {
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'black',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3, 
    fontFamily: 'Inter_700Medium',
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'white',
  },
  headerSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    opacity: 0.9,
    fontFamily: 'Inter_500Medium',
    
  },
  analyzingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzingText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_400Regular',
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  itemContainerUnsynced: {
    backgroundColor: '#9CA3AF', // Grey color for unsynced
    borderColor: '#6B7280', // Darker grey border
    borderLeftColor: '#6B7280', // Darker grey left border
    shadowColor: '#9CA3AF',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.3,
    borderColor: 'black',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    fontFamily: 'Inter_700Bold',
  },
  caloriesBadge: {
    backgroundColor: '#242424',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  caloriesText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
    fontFamily: 'Inter_700Bold',
  },
  menuButton: {
    padding: 4,
    borderRadius: 8,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: '#242424',
    borderRadius: 12,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter_400Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  photoIndicator: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  photoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  photoText: {
    fontSize: 12,
    color: "white",
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  viewIngredientsButton: {
    backgroundColor: '#4CD964',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  viewIngredientsText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookmarkButton: {
    padding: 4,
    borderRadius: 8,
  },
  syncStatusIndicator: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});