import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, SimpleLineIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

/**
 * CustomIcon Component - Renders four stacked icons (barbell, bowl, graph, fork)
 * 
 * This component renders:
 * - Barbell (Ionicons) - White color - Bottom layer
 * - Bowl (MaterialCommunityIcons) - White color - Middle layer  
 * - Graph (SimpleLineIcons) - Black color - Top layer
 * - Fork (MaterialCommunityIcons) - Black color - Top layer
 */
const CustomIcon = ({ 
  size = 120, // Size of the icons
  containerStyle, // Additional styles for the container
  // Positioning props for each icon
  dumbbellTop = -10,
  dumbbellLeft = 0,
  dumbbellRotation = 50,
  graphTop = 60,
  graphLeft = 3.7,
  graphRotation = 10,
  forkTop = -15,
  forkLeft = 5,
  forkRotation = 0,
  circleTop = 75,
  circleLeft = 18,
  circleRotation = 0
}) => {
  // Calculate center offset (half the icon size)
  const centerOffset = -(size / 2);
  return (
    <View style={[styles.container, containerStyle]}>
             {/* Barbell - Bottom layer */}
       <Ionicons 
         name="barbell-outline" 
         size={size} 
         color="white" 
         style={[
           styles.icon, 
           { 
             zIndex: 1,
             top: centerOffset + dumbbellTop,
             left: centerOffset + dumbbellLeft,
             transform: [{ rotate: `${dumbbellRotation}deg` }]
           }
         ]}
       />
       
       
       {/* Graph - Middle layer */}
       <SimpleLineIcons 
         name="graph" 
         size={size} 
         color="red" 
         style={[
           styles.icon, 
           { 
             zIndex: 0,
             top: centerOffset + graphTop,
             left: centerOffset + graphLeft,
             transform: [{ rotate: `${graphRotation}deg` }]
           }
         ]}
       />


        {/* Fork - Top layer */}
        <MaterialCommunityIcons 
          name="silverware-fork" 
          size={size}
          color="white" 
          style={[
            styles.icon, 
            { 
              zIndex: 2,
              top: centerOffset + forkTop,
              left: centerOffset + forkLeft,
              transform: [{ rotate: `${forkRotation}deg` }]
            }
          ]}
        />

        {/* Circle - Top layer */}
        <FontAwesome 
          name="circle" 
          size={size*0.2}
          color="white" 
          style={[
            styles.icon, 
            { 
              zIndex: 3,
              top: centerOffset + circleTop,
              left: centerOffset + circleLeft,
              transform: [{ rotate: `${circleRotation}deg` }]
            }
          ]}
        />
     </View>

     
    
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    position: 'absolute'
  }
});

export default CustomIcon; 