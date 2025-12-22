import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFoodSearchResults, getFoodDetails } from '../utils/foodCache';

let debounceTimer;

// FoodSearch component provides a search bar and results list for searching foods using Open Food Facts API
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

  // Clear the search bar and results
  function handleClearSearch() {
    setQuery('');
    setResults([]);
  }

  return (
    <View style={styles.container}>
      {/* Results list and search bar */}
      <View style={{backgroundColor: "#242424", marginBottom:15 }}>
        <FlatList
          data={query ? results : []}
          ListHeaderComponent={
              <>
                  {props.header}
                  <View style={styles.inputContainer}>
                      <TextInput
                          style={styles.input}
                          placeholder="e.g: McDonalds Cheeseburger"
                          placeholderTextColor="#9CA3AF"
                          value={query}
                          onChangeText={setQuery}
                      />
                      {query.length > 0 && (
                          <TouchableOpacity
                              style={styles.clearButton}
                              onPress={handleClearSearch}
                          >
                              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                          </TouchableOpacity>
                      )}
                  </View>
                  {loading && <ActivityIndicator size="small" color="#D94CC4" style={{ marginBottom: 10 }} />}
              </>
          }
          ItemSeparatorComponent={() => (
              <View style={{ height: 4, backgroundColor: 'transparent' }} />
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
              <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 20, marginBottom: 20, fontFamily: 'Inter_400Regular' }}>
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
        <ActivityIndicator size="small" color="#D94CC4" style={{ marginTop: 10 }} />
      )}
    </View>
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
    borderRadius: 12,
    padding: 16,
    paddingRight: 50, // Add space for the clear button
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
    fontFamily: 'Inter_400Regular',
    color: 'white',
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
    backgroundColor: '#1A1A1A',
    padding: 12,
    marginHorizontal: 2,
    marginVertical: 2,
    borderRadius: 8,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  brand: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});
