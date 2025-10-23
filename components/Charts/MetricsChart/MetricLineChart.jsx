import { useMemo, useState, useEffect} from "react";
import { View, StyleSheet, Alert, Pressable, Text} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Dimensions} from "react-native";
import InfoModal from "../../InfoModal";
import PopupModal from "../../PopupModal";
import ExerciseSelector from "../../ExerciseSelector";
import { useWorkoutContext } from "../../../context/WorkoutsV2/WorkoutContext";
import { useNutritionContext } from "../../../context/Nutrition/NutritionContext";
import ItemSelector from '../../ItemSelector'
import { useSettings } from "../../../context/SettingsContext";
import { formatDateForDisplay } from "../../../utils/date";
import getStyles from "./CSS";
import { smoothData } from "../smoothData";
import { getFocusedText, generateGraphInfoDesc } from "./MetricChartFunctions";
import TextOnlyModal from "../TextOnlyModal";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { generateInsightText } from "./MetricChartFunctions";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';


const { width: screenWidth } = Dimensions.get('window');


export default function MetricLineChart(props) {
  const {mode, weightProgress, unit, formatWeightChart} = useSettings()
  const styles = getStyles(mode)

  // Context - using for main functionality
  const {setChart, volumeChart, logsByDateObj, loading} = useWorkoutContext()
  const {getMacroForLast30Days, nutritionData} = useNutritionContext()

  // FIXED: Simplified state to prevent visual glitch - use button positions instead of metric names
  const [selectedButton, setSelectedButton] = useState("Button1") // Always start with Button1
  const [selectedData, setSelectedData] = useState(10);
  
  const [volumeChartData, setVolumeChartData] = useState([])
  const [setChartData, setSetChartData] = useState([])
  const [weightProgressData, setWeightProgressData] = useState([])
  const [calorieProgressData, setCalorieProgressData] = useState([])

  useEffect(() => {
    console.log('🚀 Updating charts with V2 context');
    console.log('📊 V2 logs count:', logsByDateObj ? Object.keys(logsByDateObj).length : 0);
    setVolumeChartData(volumeChart())
    setSetChartData(setChart())
  }, [logsByDateObj]);

  useEffect(() => {
    const formattedData = formatWeightChart();
    // Always use formatted data to show gaps filled to today
    setWeightProgressData(formattedData);
  }, [weightProgress])

  useEffect(() => {
    // Debug: Log nutritionData and macro chart data
    console.log('nutritionData:', nutritionData);
    const macroData = getMacroForLast30Days("calories");
    console.log('macro chart data:', macroData);
    setCalorieProgressData(macroData)
  }, [nutritionData])

  const chartData = useMemo(() => {
    if (mode === true) {
      // Lift mode - Button1 = Volume, Button2 = Sets
      return selectedButton === "Button1" ? volumeChartData : setChartData;
    } else {
      // Macro mode - Button1 = Bodyweight, Button2 = Calories
      return selectedButton === "Button1" ? weightProgressData : calorieProgressData;
    }
  }, [mode, selectedButton, volumeChartData, setChartData, weightProgressData, calorieProgressData]);

  const slicedData = useMemo(() => {
    return chartData.slice(0, selectedData)
  }, [chartData, selectedData])
  
  //Metric data chart data
  const displayedData = useMemo(() => {
    if (selectedData == 10) {
      return slicedData;
    } else if (selectedData === 20) {
      return slicedData.length >= 2 ? smoothData(slicedData, 2) : slicedData;
    } else {
      if (slicedData.length == 2) {
        return smoothData(slicedData, 2);
      } else if (slicedData.length >= 3) {
        return smoothData(slicedData, 3);
      } else {
        return slicedData;
      }
    }
  }, [selectedData, slicedData]);

  const minValue = useMemo(() => {
    if (displayedData.length === 0) return 0;
    return Math.min(...displayedData.map((item) => item.value));
  }, [displayedData]);


  //Info Button and Text
  const [infoVisible, setInfoVisible] = useState(false);
  // Get the actual metric name based on button position and mode
  const actualMetric = useMemo(() => {
    if (mode === true) {
      return selectedButton === "Button1" ? "Volume" : "Sets";
    } else {
      return selectedButton === "Button1" ? "Bodyweight" : "Calories";
    }
  }, [mode, selectedButton]);

  let graphInfoDesc = useMemo(() => {
    return generateGraphInfoDesc(mode, selectedData, actualMetric);
  }, [mode, selectedData, actualMetric]);

  //Focused Button and Text
  const [focusedPoint, setFocusedPoint] = useState(null)
  const [focusedModalVisible, setFocusedModalVisible] = useState(false)
  useEffect(() => {
    if (focusedPoint) {
      setFocusedModalVisible(true)
    }
  }, [focusedPoint])
  const focusedText = useMemo(() => {
    return getFocusedText(mode, selectedData, focusedPoint, actualMetric, unit);
  }, [mode, selectedData, focusedPoint, actualMetric, unit]);

  //Insight Button and Text
  const [insightModalVisible, setInsightModalVisible] = useState(false)
  const insightText = useMemo(() => {
    return generateInsightText(mode, slicedData, actualMetric);
  }, [mode, slicedData, actualMetric]);

  console.log("selectedButton: " + selectedButton + ", actualMetric: " + actualMetric)
  
  return (
    <View style={styles.container}>
      <View style={styles.metricSelectorContainer}>
        
        {/* FIXED: Simplified button logic - use Button1/Button2 positions, only text changes with mode */}
        <Pressable 
          style={selectedButton === "Button1" ? styles.metricSelectorButtonSelected : styles.metricSelectorButton}
          onPress={() => setSelectedButton("Button1")}
        >
          <Text style={selectedButton === "Button1" ? styles.metricSelectorTextSelected : styles.metricSelectorText}>
            {mode === true ? "Total Volume" : "Bodyweight"}
          </Text>
        </Pressable>
        <Pressable 
          style={selectedButton === "Button2" ? styles.metricSelectorButtonSelected : styles.metricSelectorButton}
          onPress={() => setSelectedButton("Button2")}
        >
          <Text style={selectedButton === "Button2" ? styles.metricSelectorTextSelected : styles.metricSelectorText}>
            {mode === true ? "Total Sets" : "Calories"}
          </Text>
        </Pressable>
      </View>

      {slicedData.length !== 0 && (
      <>
      <View style={styles.innerContainer}>
        
        {/**Help Button */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setInfoVisible(true)}
        >
          <FontAwesome name="question-circle-o" size={30} color="#333333" />
        </TouchableOpacity>
        {infoVisible && <TextOnlyModal
          title="What Is This Graph?"
          text={graphInfoDesc}
          onClose={() => setInfoVisible(false)}
        />}

        {/**Insight Button */}
        <TouchableOpacity
          style={styles.insightButton} onPress={() => setInsightModalVisible(true)}
        >
          <MaterialCommunityIcons name="brain" size={30} color="#FF69B4" />
        </TouchableOpacity>

        {insightModalVisible && <TextOnlyModal
          title="Insights"
          text={insightText}
          onClose={() => setInsightModalVisible(false)}
        />}


        <LineChart
          data={displayedData}
          height={screenWidth-32 - 130}
          width={screenWidth-32}
          showFractionalValues={false}
          spacing={20}
          initialSpacing={20}
          endSpacing={40}
          color={mode === true ? "#2D9CFF" : '#4CD964'}
          thickness={2}
          yAxisTextStyle={{ color: 'black'}}
          xAxisLabelTextStyle={{ color: "red", fontSize:12, opacity: 0 }}
          yAxisColor={"black"}
          xAxisLabelsVerticalShift={5}
          xAxisColor={"black"}
          noOfSections={4}
          yAxisOffset={Math.floor(minValue * 0.6)}
          //showXAxisIndices
          //hideAxesAndRules
          //hideYAxisText
          yAxisLabelWidth={40}
          yAxisThickness={2}
          xAxisThickness={2}
          hideRules
          isAnimated={false}
          showDataPoint={selectedData <= 10}
          dataPointsColor={mode === true ? "#2D9CFF" : '#4CD964'} // outline color
          dataPointsRadius={6} // outer circle size
          dataPointsWidth={3} // inner filled dot (leave smaller)
          dataPointsShape="circle"
          showRules
          //rotateLabel
          yAxisLabelContainerStyle={{ marginTop: 1 }}
          // 🔥 Enable focus
          focusEnabled
          showTextOnFocus
          showDataPointLabelOnFocus
          // Optional: Style focused point
          focusedDataPointColor={"green"}
          focusedDataPointRadius={10}
          onFocus={(item, index) => {
            const actualDataPoint = displayedData[index];
            setFocusedPoint(actualDataPoint)
          }}
        />

        {focusedModalVisible && <TextOnlyModal title="Data Point Details" text={focusedText} onClose={() => {
           setFocusedModalVisible(false);
           setFocusedPoint(null);
         }} />}
      </View>

      <View style={styles.dataSelector}>
        <Pressable
          style={
            selectedData === 10
              ? styles.dataSelectorButtonClicked
              : styles.dataSelectorButton
          }
          marginRight={10}
          onPress={() => setSelectedData(10)}
        >
          <Text style={styles.dataSelectorText}>
            {mode === true ? "Last 10 Lifts" : "Last 10 Days"}
          </Text>
        </Pressable>

        <Pressable
          style={
            selectedData === 20
              ? styles.dataSelectorButtonClicked
              : styles.dataSelectorButton
          }
          onPress={() => setSelectedData(20)}
        >
          <Text style={styles.dataSelectorText}>
            {mode === true ? "Last 20 Lifts" : "Last 20 Days"}
          </Text>
        </Pressable>

        <Pressable
          style={
            selectedData === 30
              ? styles.dataSelectorButtonClicked
              : styles.dataSelectorButton
          }
          marginLeft={10}
          onPress={() => setSelectedData(30)}
        >
          <Text style={styles.dataSelectorText}>
            {mode === true ? "Last 30 Lifts" : "Last 30 Days"}
          </Text>
        </Pressable>
      </View>
      </>
        )}
        
        {slicedData.length === 0 && 
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24}}>
          <Ionicons name="alert-circle-outline" size={48} color="grey" style={{marginBottom: 12}} />
          <Text style={{textAlign: 'center', color:'grey', fontSize:24, fontWeight: '600'}}>
            No Data Available
          </Text>
          <Text style={{textAlign: 'center', color:'grey', fontSize:16, marginTop: 8}}>
          {mode === true? "Start logging your exercises to see these graphs": "Start logging your nutrition to see these graphs"}!
          </Text>
        </View>
        
        }
    </View>
  );
}

