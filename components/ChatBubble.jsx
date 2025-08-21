import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default ChatBubble = (props) => {

  return (
    <View style={styles.container}>
      {/* Icon and Name */}
      <View style={styles.iconContainer}>
        <Image
          source={require("../assets/sharkAvatar.png")} // Or use props.avatarUri for dynamic images
          style={styles.avatar}
        />
        <Text style={styles.nameText}>LiftAI</Text>
      </View>

      {/* Bubble + Tail */}
      <View style={styles.bubbleContainer}>
        <View style={styles.tail} />
        <View style={styles.bubble}>
          <Text style={styles.text}>{props.text}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
  },
  iconContainer: {
    alignItems: "center",
    marginRight: -5,
    width: 50, // Fixed width for icon+name block
  },
  nameText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    marginTop: 4,
    textAlign: "center",
  },
  bubbleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tail: {
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: "transparent",
    borderBottomWidth: 10,
    borderBottomColor: "transparent",
    borderRightWidth: 10,
    borderRightColor: theme.defaultButtonBackground,
    marginTop: 10,
    marginRight: -3,
  },
  bubble: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.defaultButtonBackground,
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: "90%",
  },
  text: {
    fontSize: 13,
    color: "#333",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18, // makes it perfectly round
  },
})
