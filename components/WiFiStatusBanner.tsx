import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface WiFiStatusBannerProps {
  // No props needed - component manages all state internally
}

export default function WiFiStatusBanner({}: WiFiStatusBannerProps) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? true);
      setConnectionType(state.type);
    });

    // Set up listener for network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
      setConnectionType(state.type);
    });
    
    return () => unsubscribe();
  }, []);

  // Pulsing animation effect
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim]);
  
  // Don't show icon if connected
  if (isConnected) return null;
  
  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: pulseAnim }}>
        <MaterialIcons 
          name="wifi-off" 
          size={200} 
          color="red" 
          style={styles.icon}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    // Icon styling if needed
  },
});

