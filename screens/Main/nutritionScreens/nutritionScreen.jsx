import {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, FlatList, TouchableOpacity, Modal, TextInput, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FoodSearch from '../../../components/FoodSearch';
import { useNutritionContext } from '../../../context/Nutrition/NutritionContext';
import { Image } from 'react-native';
import WeightUpdateModal from '../../../components/WeightModal';
import EditNutritionModal from '../../../components/EditNutritionModal';
import ViewIngredients from '../../../components/ViewIngredients';
import DatePickerModal from '../../../components/DatePickerModal';
import { useSettings } from '../../../context/SettingsContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getLocalDateKey } from '../../../utils/date';

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
          onPress: () => deleteNutrition(item.id),
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

  const handleSaveEdit = () => {
    if (editingItem) {
      editNutrition(
        editingItem.id,
        editName,
        parseInt(editProtein) || 0,
        parseInt(editCarbs) || 0,
        parseInt(editFats) || 0,
        parseInt(editCalories) || 0
      );
      setShowEditModal(false);
      setEditingItem(null);
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
    return(
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.headerRight}>
            <View style={styles.caloriesBadge}>
              <Text style={styles.caloriesText}>{item.calories} cal</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.bookmarkButton}
                onPress={() => {
                  const newSaved = !item.saved;
                  editNutrition(
                    item.id,
                    item.name,
                    item.protein,
                    item.carbs,
                    item.fats,
                    item.calories,
                    newSaved // Pass the new saved value
                  );
                }}
              >
                <Ionicons 
                  name={item.saved ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={item.saved ? "gold" : "white"} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress(item)} style={styles.menuButton}>
                <Ionicons name="ellipsis-vertical" size={20} color={"white"} />
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
              <Text style={styles.sectionTitle}>Current Weight</Text>
              <TouchableOpacity 
                style={styles.weightCard}
                onPress={() => setShowWeightModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.weightInfo}>
                  <View style={styles.weightDisplay}>
                    <Text style={styles.weightValue}>{bodyWeight}</Text>
                    <Text style={styles.weightUnit}>{unit ? 'lbs' : 'kg'}</Text>
                  </View>
                  <Text style={styles.goalWeightText}>Goal: {goalWeight} {unit ? 'lbs' : 'kg'}</Text>
                </View>
                <View style={styles.weightActions}>
                  
                    <Text style={styles.updateText}>Tap to update</Text>
                    <Ionicons name="pencil" size={16} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Today's Macros Header */}
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <View flexDirection="row" alignItems="center" gap={2}>
                <Text style={styles.header}>{formatDateForDisplay(selectedDate)}</Text>
                <Ionicons name="calendar-outline" size={23} color="#1A1A1A" />
              </View>
              <Text>Click to change date</Text>
              
            </TouchableOpacity>
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
        onSave={updateIngredientsAndMacros}
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
    backgroundColor: '#F2F2F2',
    paddingBottom: 100
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  weightSection: {
    marginBottom: 20,//
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: 0.3,
    fontFamily: 'Inter_700Bold',
  },
  weightCard: {
    backgroundColor: '#4CD964',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  weightInfo: {
    flex: 1,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  goalWeightText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  weightValue: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
    fontFamily: 'Inter_700Bold',
  },
  weightUnit: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    marginLeft: 4,
    fontFamily: 'Inter_400Regular',
  },
  weightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    fontFamily: 'Inter_400Regular',
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 14,
    padding:10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
    fontFamily: 'Inter_700Bold',
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
    backgroundColor: '#80E69A',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth:1.3,
    borderColor: 'black',
    borderLeftWidth: 6,
    borderLeftColor: 'black',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    marginRight: 12,
    fontFamily: 'Inter_700Bold',
  },
  caloriesBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'black',
  },
  caloriesText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'black',
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
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'black',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
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
    color: '#1A1A1A',
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
    backgroundColor: 'black',
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
});