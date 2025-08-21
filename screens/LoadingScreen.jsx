import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// ============================================================================
// LOADING SCREEN COMPONENT
// ============================================================================
// A reusable loading screen component used throughout the application
// for consistent loading states and user experience.

/**
 * LoadingScreen Component
 * 
 * Displays a loading screen with customizable message and styling.
 * Used during authentication checks, data loading, and other async operations.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display (default: "Loading...")
 * @param {string} props.backgroundColor - Background color (default: "#0A192F")
 * @param {string} props.textColor - Text color (default: "white")
 * @param {boolean} props.showSpinner - Whether to show activity indicator (default: true)
 * @returns {JSX.Element} Loading screen component
 */
export default function LoadingScreen({ 
  message = "Loading...", 
  backgroundColor = "#0A192F",
  textColor = "white",
  showSpinner = true 
}) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {showSpinner && (
        <ActivityIndicator 
          size="large" 
          color={textColor} 
          style={styles.spinner}
        />
      )}
      <Text style={[styles.text, { color: textColor }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 