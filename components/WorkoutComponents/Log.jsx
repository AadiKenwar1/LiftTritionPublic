import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dumbbell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

function Log(props) {
  return (
    <View style={[
      styles.logButton, 
      { opacity: props.isActive ? 0.8 : 1 }
    ]}>
      <Pressable style={styles.iconContainer}>
        <LinearGradient
          colors={['#1A7FE0', '#2D9CFF', '#3DAFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.iconGradient}
        >
          <Dumbbell size={20} color="white" />
        </LinearGradient>
      </Pressable>
      <TouchableOpacity style={styles.textArea} onPress={props.function}>
        <View style={styles.textContainer}>
        <Text
          numberOfLines={3}  // ✅ Required for adjustsFontSizeToFit
          adjustsFontSizeToFit={true}
          minimumFontScale={0.7}
          style={[
            styles.logText, 
            {fontFamily: props.bold ? "Inter_600SemiBold" : "Inter_400Regular"}
          ]}
        >
          {typeof props.currItem === "string"
            ? props.currItem || "Unnamed Workout"
            : props.currItem?.name || "Unnamed Workout"}
        </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={props.onMenuPress} style={styles.menuButton}>
        <Ionicons name="pencil" size={20} color="white" />
      </TouchableOpacity>

      {/* Always show drag handle */}
      <TouchableOpacity
        onLongPress={props.drag}
        style={styles.dragHandle}
        hitSlop={10}
      >
        <Ionicons name="menu" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(Log);

const styles = StyleSheet.create({
   logButton: {
    backgroundColor: "#1A1A1A",
    height: 72,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
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
  textArea: {
    flex: 1,
  },
  textContainer: {
    height: 50,
    justifyContent: "center",
  },
  logText: {
    color: "white",
    fontSize: 20,
    fontWeight: '500',
  },
  menuButton: {
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dragHandle: {
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  
});


