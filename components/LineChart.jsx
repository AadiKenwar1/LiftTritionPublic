import { useMemo, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import InfoModal from "./InfoModal";

export default function LogLineChart(props) {

  function smoothData(data, k) {
    const n = data.length;
    const trimmedLength = n - (n % k); // trim end to make divisible by k
    const trimmed = data.slice(0, trimmedLength);
    const smoothed = [];

    for (let i = 0; i < trimmedLength; i += k) {
      const group = trimmed.slice(i, i + k);
      const average = group.reduce((sum, point) => sum + point.value, 0) / k;

      smoothed.push({
        //label: `${group[0].label} -\n${group[group.length - 1].label}`,
        label: "",
        value: average,
      });
    }
    return smoothed;
  }

  const displayedData = useMemo(() => {
    if (props.selectedData == 10) {
      return props.data;
    } else if (props.selectedData === 20) {
      return props.data.length >= 2 ? smoothData(props.data, 2) : props.data;
    } else {
      if (props.data.length == 2) {
        return smoothData(props.data, 2);
      } else if (props.data.length >= 3) {
        return smoothData(props.data, 3);
      } else {
        return props.data;
      }
    }
  }, [props.selectedData, props.data]);

  const minValue = useMemo(() => {
    if (displayedData.length === 0) return 0;
    return Math.min(...displayedData.map((item) => item.value));
  }, [displayedData]);

  const yAxisLabels = useMemo(() => {
    if (displayedData.length === 0) return [];

    const max = Math.max(...displayedData.map((item) => item.value));
    const min = Math.floor(minValue * 0.6);
    const range = max - min;
    const step = Math.ceil(range / 4);

    return Array.from({ length: 5 }, (_, i) => (min + i * step).toString());
  }, [displayedData, minValue]);

  //Info Button
  const [infoVisible, setInfoVisible] = useState(false);
  let graphInfoDesc = "";
  if (props.selectedData === 10) {
    graphInfoDesc =
      "\nThis graph displays your estimated 1 rep max for your last 10 lifting sessions";
  } else if (props.selectedData === 20) {
    graphInfoDesc =
      "\nThis graph displays your estimated 1 rep max for your last 20 lifting sessions.\n\nData is smoothed for every two lifting sessions";
  } else {
    graphInfoDesc =
      "\nThis graph displays your estimated 1 rep max for your last 30 lifting sessions.\n\nData is smoothed for every three lifting sessions";
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setInfoVisible(true)}
        >
          <Ionicons name="help-circle-outline" size={24} color="white" />
        </TouchableOpacity>

        <InfoModal
          visible={infoVisible}
          onClose={() => setInfoVisible(false)}
          title="What Is This Graph?"
          text={graphInfoDesc}
        />

        <LineChart
          data={displayedData}
          height={200}
          width={320}
          spacing={20}
          initialSpacing={20}
          endSpacing={40}
          color="#00CFFF"
          thickness={2}
          yAxisTextStyle={{ color: 'red' }}
          xAxisLabelTextStyle={{ color: "red" }}
          yAxisColor={"red"}
          xAxisColor={"red"}
          noOfSections={4}
          yAxisOffset={Math.floor(minValue * 0.6)}
          //showXAxisIndices
          //hideAxesAndRules
          //hideYAxisText
          yAxisLabelWidth={35}
          yAxisThickness={2}
          xAxisThickness={2}
          yAxisLabelTexts={yAxisLabels}
          hideRules
          isAnimated={false}
          showDataPoint={props.selectedData <= 10}
          dataPointsColor={"yellow"} // outline color
          dataPointsRadius={6} // outer circle size
          dataPointsWidth={3} // inner filled dot (leave smaller)
          dataPointsShape="circle"
          showRules
          rotateLabel
          yAxisLabelContainerStyle={{ marginTop: 1 }}
          // 🔥 Enable focus
          focusEnabled
          showStripOnFocus
          showTextOnFocus
          showDataPointLabelOnFocus
          // Optional: Style focused point
          focusedDataPointColor={"green"}
          focusedDataPointRadius={6}
          focusedDataPointShape="circle" // or "rect"
          focusedDataPointWidth={12}
          focusedDataPointHeight={12}
          onFocus={(item, index) => {
            const day = item.label.replace("\n", "/"); // "May 25"
            const weight = item.value;
            console.log(
              `Focused on: ${day}, 1RM: ${weight + Math.floor(minValue * 0.6)} lbs`,
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
    margin: 10,
    backgroundColor: "orange",
    borderRadius: 20,
    paddingTop: 15,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 20,
    borderColor: "red",
    borderWidth: 1,

    // ✅ Shadow for iOS
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,

    // ✅ Elevation for Android
    elevation: 8,
  },
  innerContainer: {
    overflow: "hidden",
    height: 230,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  helpButton: {
    position: "absolute",
    top: 0,
    right: 1,
    zIndex: 1,
  },
})