import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFoodSearchResults, getFoodDetails } from '../utils/foodCache';

let debounceTimer;

// FoodSearch component provides a search bar and results list for searching foods using Nutritionix API
export default function FoodSearch(props) {
  // State for search query, results, loading indicators, and added foods
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Debounced search effect: triggers search after user stops typing for 400ms
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      setLoading(true);
      const foods = await getFoodSearchResults(query);
      setResults(foods);
      setLoading(false);
    }, 400);
  }, [query]);

  // Handle selection of a food item: fetch nutrition details and update parent state
  async function handleSelect(item) {
    setFetchingDetails(true);
    const details = await getFoodDetails(item);
    setFetchingDetails(false);

    if (details) {
      Alert.alert(
        details.name,
        `Serving: ${details.servingSize || "N/A"}\nCalories: ${details.calories}\nProtein: ${details.protein}g\nCarbs: ${details.carbs}g\nFats: ${details.fats}g`
      )
      const added = {
        name: details.name,
        calories: details.calories,
        protein: details.protein,
        carbs: details.carbs,
        fats: details.fats,
      }
      props.setAddedFood((prev) => [added, ...prev])
      props.setCals((prev) => (parseInt(prev, 10) + parseInt(details.calories, 10)).toString())
      props.setProtein((prev) => (parseInt(prev, 10) + parseInt(details.protein, 10)).toString())
      props.setCarbs((prev) => (parseInt(prev, 10) + parseInt(details.carbs, 10)).toString())
      props.setFats((prev) => (parseInt(prev, 10) + parseInt(details.fats, 10)).toString())
    } else {
      Alert.alert('Error', 'Could not fetch nutrition info.');
    }
  }

  // Dismiss keyboard and clear results when tapping outside
  function handleOutsideTap() {
    Keyboard.dismiss();
    setResults([]);
  }

  // Clear the search bar and results
  function handleClearSearch() {
    setQuery('');
    setResults([]);
  }

  return (
    <TouchableWithoutFeedback onPress={handleOutsideTap}>
      <View style={styles.container}>
        {/* Results list and search bar */}
        <View style={{backgroundColor: "white", marginBottom:15 }}>
          <FlatList
            data={query ? results : []}
            ListHeaderComponent={
                <>
                    {props.header}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g: McDonalds Cheeseburger"
                            value={query}
                            onChangeText={setQuery}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={handleClearSearch}
                            >
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {loading && <ActivityIndicator size="small" color="#4f46e5" style={{ marginBottom: 10 }} />}
                </>
            }
            ItemSeparatorComponent={() => (
                <View style={{ height: 4, backgroundColor: 'white' }} />
            )}
            // Use a unique key for each item (id + index)
            keyExtractor={(item, index) => {
              const id = item.fdcId || item.tag_id || item.nix_item_id || item.food_name || 'item';
              return `${id}-${index}`;
            }}
            // Render each food search result
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>{item.description}</Text>
                {item.brandName && (
                  <Text style={styles.brand}>{item.brandName}</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              query && !loading ? (
                <Text style={{ color: '#666', textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
                  No results found
                </Text>
              ) : null
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
        {/* Show loading indicator when fetching details */}
        {fetchingDetails && (
          <ActivityIndicator size="small" color="#4f46e5" style={{ marginTop: 10 }} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    paddingRight: 40, // Add space for the clear button
    backgroundColor: '#f3f4f6',
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
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -16 }],
    padding: 5,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  item: {
    backgroundColor: '#f9fafb',
    padding: 10,
    marginHorizontal: 2,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'black',
    borderLeftWidth: 3,
    borderLeftColor: 'black',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  brand: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});
