import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomHeader from "../../../components/CustomHeader";

export default function About() {
  return (
    <>
      <CustomHeader title={"About LiftLyzer"} showBack />
      <View style={styles.container}>
        <Text style={styles.heading}>Lift, Log, Analyze</Text>
        <Text style={styles.text}>
          LiftLyzer was built for gym-goers who want a clean, no-nonsense way to
          track their workouts. We believe tracking your progress should be
          simple, fast, and fully under your control—without the clutter and
          distractions found in many other fitness apps.
        </Text>
        <Text style={styles.text}>
          With LiftLyzer, you get the tools you need to log your workouts and
          the insights required to keep making progress. No fluff—just the data
          that matters, so you can focus on lifting smarter and getting
          stronger.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "black",
  },
  text: {
    fontSize: 14,
    color: "black",
    lineHeight: 20,
    marginBottom: 10,
  },
});
