import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';

function FloatingActionMenu (props){
  const {mode} = useSettings()
  const [isOpen, setIsOpen] = useState(false);
  const [buttonWidths, setButtonWidths] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Store an Animated.Value for each child
  const opacityValues = useRef([]);

  // Initialize the animated values based on number of children
  useEffect(() => {
    const childrenCount = React.Children.count(props.children);
    
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
  }, [props.children, isInitialized]);

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

  const handleLayout = (e, index) => {
    const width = e.nativeEvent.layout.width;
    setButtonWidths(prev => ({ ...prev, [index]: width }));
  };

  return (
    <View style={[styles.container, { bottom: props.tabBarShown ? 115 : 40 }]}>
      {React.Children.map(props.children, (child, index) => {
        const width = buttonWidths[index] || 60;
        const xOffset = (80 - width) / 2;
        const verticalSpacing = 67 // consistent spacing between buttons
        const bottomOffset = props.tabBarShown? 20 + (index + 1) * verticalSpacing: 20 + (index + 1) * verticalSpacing

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
            onLayout={e => handleLayout(e, index)}
            pointerEvents={isOpen ? "auto" : "none"}
            >
            {child}
            </Animated.View>
        );
        })}


      <TouchableOpacity style={[styles.fab, {backgroundColor: mode === true? "#2D9CFF": "#4CD964"}]} onPress={toggleMenu}>
        <Entypo
          name={isOpen ? 'cross' : 'dots-three-vertical'}
          size={28}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

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
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
  },
});

export default FloatingActionMenu;
