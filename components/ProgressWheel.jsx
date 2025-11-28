import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useSettings } from "../context/Settings/SettingsContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProgressWheel({
  percent = 0,
  size = 120,
  strokeWidth = 12,
  duration = 1000,
  backgroundColor = "#F0F0F0",
  textColor = "white",
  fontSize = 32,
}) {
  // Validate and sanitize the percent value
  const sanitizedPercent = isNaN(percent) || !isFinite(percent) ? 0 : Math.max(0, Math.min(100, percent));
  const { mode } = useSettings();

  // Define gradient stops for modern fitness app colors
  const workoutStops = [
    { offset: "100%", color: "#264653" },
    { offset: "75%", color: "#143D66" },
    { offset: "50%", color: "#1B5E9B" },
    { offset: "25%", color: "#2178C7" },
    { offset: "0%", color: "#2D9CFF" },


  ];

  const nutritionStops = [
    { offset: "0%", color: "#4CD964" },
    { offset: "50%", color: "#66D977" },
    { offset: "100%", color: "#81C784" }
  ];

  const gradientStops = mode ? workoutStops : nutritionStops;

  // Animated values
  const animatedValue = useRef(new Animated.Value(0)).current;
  const numberValue = useRef(new Animated.Value(0)).current;

  const [displayPercent, setDisplayPercent] = useState(Math.round(sanitizedPercent));

  useEffect(() => {
    const clampedPercent = Math.min(sanitizedPercent, 100);

    Animated.timing(animatedValue, {
      toValue: clampedPercent,
      duration,
      useNativeDriver: false,
    }).start();

    numberValue.setValue(displayPercent);
    Animated.timing(numberValue, {
      toValue: sanitizedPercent,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = numberValue.addListener(({ value }) => {
      setDisplayPercent(Math.round(value));
    });

    return () => {
      numberValue.removeListener(listener);
    };
  }, [sanitizedPercent, duration]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="100%" y1="50%" x2="0%" y2="0%">
            {gradientStops.map((stop, index) => (
              <Stop
                key={index}
                offset={stop.offset}
                stopColor={stop.color}
              />
            ))}
          </LinearGradient>
        </Defs>

        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <AnimatedCircle
          stroke="url(#grad)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      <View style={styles.percentContainer}>
        <Text style={[styles.percentText, { color: textColor, fontSize }]}>
          {displayPercent}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  percentContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentText: {
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});
