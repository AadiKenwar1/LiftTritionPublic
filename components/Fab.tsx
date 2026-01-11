import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useSettings } from '../context/Settings/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';

interface FabProps {
  // Required props
  children: React.ReactNode;
  // Optional props
  tabBarShown?: boolean;
}

function FloatingActionMenu({ children, tabBarShown }: FabProps) {
  const { mode } = useSettings();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [buttonWidths, setButtonWidths] = useState<Record<number, number>>({});
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Store an Animated.Value for each child
  const opacityValues = useRef<Animated.Value[]>([]);

  // Initialize the animated values based on number of children
  useEffect(() => {
    const childrenCount = React.Children.count(children);
    
    // Only create new animated values if we don't have enough
    while (opacityValues.current.length < childrenCount) {
      opacityValues.current.push(new Animated.Value(0));
    }
    
    // Trim excess values if we have too many
    if (opacityValues.current.length > childrenCount) {
      opacityValues.current = opacityValues.current.slice(0, childrenCount);
    }
    
    // Mark as initialized after a brief delay to ensure smooth initial state
    if (!isInitialized) {
      setTimeout(() => setIsInitialized(true), 50);
    }
  }, [children, isInitialized]);

  const toggleMenu = () => setIsOpen(prev => !prev);

  useEffect(() => {
    // Only animate if we have animated values and are initialized
    if (opacityValues.current.length > 0 && isInitialized) {
      const anims = opacityValues.current.map(opacity =>
        Animated.timing(opacity, {
          toValue: isOpen ? 1 : 0,
          duration: 100,
          useNativeDriver: true,
        })
      );
      Animated.parallel(anims).start();
    }
  }, [isOpen, isInitialized]);

  const handleLayout = (e: LayoutChangeEvent, index: number) => {
    const width = e.nativeEvent.layout.width;
    setButtonWidths(prev => ({ ...prev, [index]: width }));
  };

  return (
    <View style={[styles.container, { bottom: tabBarShown ? 115 : 40 }]}>
      {React.Children.map(children, (child, index) => {
        const width = buttonWidths[index] || 60;
        const xOffset = (80 - width) / 2;
        const verticalSpacing = 67; // consistent spacing between buttons
        const bottomOffset = tabBarShown ? 20 + (index + 1) * verticalSpacing : 20 + (index + 1) * verticalSpacing;

        // Ensure we have an animated value for this index
        const opacityValue = opacityValues.current[index] || new Animated.Value(0);

        return (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              bottom: bottomOffset,
              right: xOffset,
              opacity: opacityValue,
            }}
            onLayout={(e) => handleLayout(e, index)}
            pointerEvents={isOpen ? "auto" : "none"}
          >
            {child}
          </Animated.View>
        );
      })}

      <Pressable style={styles.fab} onPress={toggleMenu}>
        <LinearGradient
          colors={mode === true ? ['#1A7FE0', '#2D9CFF', '#3DAFFF'] : ['#3CB855', '#4CD964', '#5CE073']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientFab}
        >
          <Entypo
            name={isOpen ? 'cross' : 'dots-three-vertical'}
            size={28}
            color="white"
          />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 15,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  fab: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 0.3,
    borderColor: 'grey',
    overflow: 'hidden',
  },
  gradientFab: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingActionMenu;

