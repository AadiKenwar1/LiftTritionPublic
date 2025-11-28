import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LiftTritionIcon from '../assets/LiftTrition_SVG_Icon.svg';

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
 * @param {boolean} props.showSpinner - Whether to show spinning icon (default: true)
 * @returns {JSX.Element} Loading screen component
 */
export default function LoadingScreen({ 
  message = "Loading...", 
  backgroundColor = "#242424",
  textColor = "white",
  showSpinner = true 
}) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showSpinner) {
      // Create continuous rotation animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 750, // 2 seconds for full rotation
          useNativeDriver: true,
        })
      ).start();
    }
  }, [showSpinner]);

  // Interpolate rotation value (0 to 360 degrees)
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {showSpinner && (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <LiftTritionIcon width={120} height={120} />
        </Animated.View>
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
  text: {
    fontSize: 20,
    marginTop: 20,
    fontFamily: 'Inter_500Medium',
  },
}); 