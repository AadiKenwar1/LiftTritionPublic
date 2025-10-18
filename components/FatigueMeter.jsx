// React imports
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

// Custom hook for getting workout data from context
import { useWorkoutContext } from "../context/Workouts/WorkoutContext";

// Import the generic progress wheel component
import ProgressWheel from "./ProgressWheel";

// Get device screen width for sizing
const { width: screenWidth } = Dimensions.get('window');

export default function FatigueMeter(props) {
  // Pull functions and data from WorkoutContext
  const { getFatigueZone, getFatigueHistory, userLevel, workouts } = useWorkoutContext();

  // State for fatigue percentage (0-100)
  const [percent, setPercent] = useState(0);

  // State for zone data returned by getFatigueZone (label, advice, etc.)
  const [zoneData, setZoneData] = useState();

  // State to track if there is any fatigue log data
  const [hasLogs, setHasLogs] = useState(false);

  // Wheel visual settings
  const size = screenWidth - 250;
  const strokeWidth = 13;
  const days = props.days || 1;

  // When workouts, days, or userLevel change, recompute fatigue
  useEffect(() => {
    const history = getFatigueHistory(days);
    const totalFatigue = history.reduce((sum, entry) => sum + entry.label, 0);
    const avgFatigue = totalFatigue / days;
    const data = getFatigueZone(totalFatigue, userLevel, props.days);
    setZoneData(data);

    // Normalize percent value (max 100)
    const fatiguePercent = Math.min((avgFatigue / 10000) * 100, 100);
    setPercent(fatiguePercent);

    // Determine if we have any data
    setHasLogs(totalFatigue > 0);
  }, [workouts, days, userLevel]);

  // If there's no zoneData yet (still loading), show a placeholder message
  if (!zoneData) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#aaa" }}>
          No fatigue data yet. Start logging to see metrics!
        </Text>
      </View>
    );
  }

  // Destructure details from zoneData
  const { zone, label, advice } = zoneData;

  // Define color gradients for each zone level
  const zoneColorMap = {
    low: ["#00BFA6", "#1DE9B6"],
    moderate: ["#2196F3", "#64B5F6"],
    high: ["#7E57C2", "#B39DDB"],
    veryHigh: ["#5C6BC0", "#3F51B5"],
  };

  // Pick gradient colors for current zone
  const [startColor, endColor] = zoneColorMap[zone] || ["#ccc", "#999"];

  // Set dynamic text label and empty state message
  const displayLabel = days === 1 ? "Today's Fatigue" : `Fatigue (Last ${days} Days)`;
  const noLogsMessage = days === 1 ? "No logs for today" : `No logs in the last ${days} days`;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left side: Progress Wheel */}
        <ProgressWheel
          size={size}
          strokeWidth={strokeWidth}
          percent={percent}
          startColor={startColor}
          endColor={endColor}
          duration={1000}
          text={hasLogs ? `${Math.round(percent)}%` : "--"}
          textColor={props.card ? "white" : "black"}
        />

        {/* Right side: Text info */}
        <View style={styles.textContainer}>
          <Text style={styles.label}>{displayLabel}</Text>
          {hasLogs ? (
            <>
              <Text style={styles.zoneText}>{label}</Text>
              <Text style={styles.advice}>{advice}</Text>
            </>
          ) : (
            <Text style={styles.noLogs}>{noLogsMessage}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// Styles for layout
const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',             // Horizontal layout: wheel on left, text on right
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  textContainer: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    color: "#000",
  },
  zoneText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  advice: {
    fontSize: 14,
    color: "#666",
  },
  noLogs: {
    fontSize: 14,
    color: "#888",
  },
});
