import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function Log(props) {
  const isUnsynced = props.currItem?.synced === false;
  
  return (
    <View style={[
      styles.logButton, 
      { opacity: props.isActive ? 0.8 : 1 },
      isUnsynced && styles.logButtonUnsynced
    ]}>
      <TouchableOpacity style={styles.textArea} onPress={props.function}>
        <Text
          style={[
            styles.logText, 
            {fontFamily: props.bold ? "Inter_700Bold" : "Inter_400Regular"},
            isUnsynced && styles.logTextUnsynced
          ]}
        >
          {typeof props.currItem === "string"
            ? props.currItem || "Unnamed Workout"
            : props.currItem?.name || "Unnamed Workout"}
        </Text>
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
    backgroundColor: "#2D9CFF",
    height: 72,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.3,
    borderColor: "black",
    borderLeftWidth: 6,
    borderLeftColor: 'black',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  logButtonUnsynced: {
    backgroundColor: "#9CA3AF", // Grey color for unsynced
    borderColor: "#6B7280", // Darker grey border
    borderLeftColor: "#6B7280", // Darker grey left border
    shadowColor: "#9CA3AF",
  },
  textArea: {
    flex: 1,
    justifyContent: "center",
  },
  logText: {
    color: "white",
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    fontWeight: '500',
  },
  logTextUnsynced: {
    color: "#F3F4F6", // Light grey text for unsynced
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


