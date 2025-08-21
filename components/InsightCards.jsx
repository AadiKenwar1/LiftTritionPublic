// components/Card.js
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import { Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;
const horizontalPadding = 32; // total horizontal padding/margin
const gutter = 16; // space between cards
const cardSize = (screenWidth - horizontalPadding - gutter) / 2;

export default function Card(props) {


  return <View style={[styles.card, props.style]}>{props.cardContents}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: cardSize,
    height: cardSize, // square
    backgroundColor: "red",
    borderRadius: 16,
    padding: 0,
    margin: 0,
    justifyContent: "center",
    alignItems: "center",

    // Shadow
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6, // Android
  },
})
