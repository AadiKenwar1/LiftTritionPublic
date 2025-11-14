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
import getStyles from "./CSS";
import { smoothData } from "../smoothData";
import { insightText, generateGraphInfoDesc, getFocusedText } from "./LogChartFunctions";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import TextOnlyModal from "../TextOnlyModal";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';



const { width: screenWidth } = Dimensions.get('window');


export default function LogLineChart(props) {
  const {mode, bodyWeight, goalWeight, unit, lastExercise} = useSettings()
  const styles = getStyles(mode)

  // Context - using for main functionality
  const {getLiftLogs, formatForChart, workouts, getExerciseNames, loading} = useWorkoutContext()
  const {getMacroForLast30Days, nutritionData} = useNutritionContext()

  const [selectedLift, setSelectedLift] = useState(lastExercise || "Barbell Bench Press")
  const [selectedMacro, setSelectedMacro] = useState("Protein")


  const [selectModalVisible, setSelectModalVisible] = useState(false)
  const [selectedData, setSelectedData] = useState(10);
  
  const [logData, setLogData] = useState([]);
  useEffect(() => {
      console.log('🚀 Getting lift logs with V2 context:', selectedLift);
      const logs = getLiftLogs(selectedLift);
      console.log('📊 V2 logs found:', logs.length);
      setLogData(logs);
    }, [selectedLift, workouts, lastExercise]);

  const dependency = mode === true? logData : [nutritionData]
  const chartData = useMemo(() => {
    return (mode === true? formatForChart(logData) : getMacroForLast30Days(selectedMacro.charAt(0).toLowerCase() + selectedMacro.slice(1)))
  }, [dependency, selectedMacro, selectedLift]);


  const slicedData = useMemo(() => {
    return chartData.slice(0,selectedData)
  }, [chartData])
  

  //Lift data chart data
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


  const weightGoalType = useMemo(() => {
    if (bodyWeight === goalWeight) {
      return "maintain";
    } 
    else if (bodyWeight > goalWeight) {
      return "loss";
    }
    else {
      return "gain";
    }
  }, [bodyWeight, goalWeight]);

  //Insight Button and Text
  const [insightVisible, setInsightVisible] = useState(false);
  const insight = useMemo(() => {
    return insightText(mode, slicedData, selectedLift, selectedMacro, weightGoalType, goalWeight, unit);
  }, [slicedData, selectedLift, selectedMacro, weightGoalType]);


  //Info Button and Text
  const [infoVisible, setInfoVisible] = useState(false);
  const graphInfoDesc = useMemo(() => {
    return generateGraphInfoDesc(mode, selectedData);
  }, [mode, selectedData]);

  
  const [focusedPoint, setFocusedPoint] = useState(null)
  const [focusedModalVisible, setFocusedModalVisible] = useState(false)
  useEffect(() => {
    if (focusedPoint) {
      setFocusedModalVisible(true)
    }
  }, [focusedPoint])
  const focusedText = useMemo(() => {
    return getFocusedText(mode, selectedData, focusedPoint, selectedMacro);
  }, [mode, selectedData, focusedPoint]);

  
  return (
    <View style={styles.container}>
      <View style={{flexDirection: "row"}}></View>
              <TouchableOpacity style={styles.changeSelected} onPress={() => setSelectModalVisible(true)}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.changeSelectedText}>{ mode=== true? selectedLift : selectedMacro} Progress</Text>
            <Ionicons name="caret-down" size={16} color="white"/>
          </View>
        </TouchableOpacity>
      <PopupModal
        modalVisible={selectModalVisible}
        setModalVisible={setSelectModalVisible}
      >
        <ItemSelector
          selectedItem={mode === true? selectedLift: selectedMacro}
          setSelectedItem={mode === true? setSelectedLift: setSelectedMacro}
          function={setSelectModalVisible}
        
        />
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => setSelectModalVisible(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </PopupModal>
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
          style={styles.insightButton}
          onPress={() => setInsightVisible(true)}
        >
          <MaterialCommunityIcons name="brain" size={30} color="#FF69B4" />
        </TouchableOpacity>


        {insightVisible && <TextOnlyModal
          title="Insights"
          text={insight}
          onClose={() => setInsightVisible(false)}
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
          dataPointsColor={mode === true? "#2D9CFF": "#4CD964"} // outline color
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
            // Ensure we're using the correct data point from displayedData
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
          <Text style={styles.dataSelectorText}>{mode === true? "Last 10 Lifts" : "Last 10 Days"}</Text>
        </Pressable>

        <Pressable
          style={
            selectedData === 20
              ? styles.dataSelectorButtonClicked
              : styles.dataSelectorButton
          }
          onPress={() => setSelectedData(20)}
        >
          <Text style={styles.dataSelectorText}>{mode === true? "Last 20 Lifts" : "Last 20 Days"}</Text>
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
          <Text style={styles.dataSelectorText}>{mode === true? "Last 30 Lifts" : "Last 30 Days"}</Text>
        </Pressable>
      </View>
      </>
        )}

        {/*<Text style={{textAlign: 'center', color:'black', fontSize:14, marginTop: 8}}>{insight}</Text>*/}
        
        {slicedData.length === 0 && 
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24}}>
          <Ionicons name="alert-circle-outline" size={48} color="grey" style={{marginBottom: 12}} />
          <Text style={{textAlign: 'center', color:'grey', fontSize:24, fontWeight: '600'}}>
            No Data Available
          </Text>
          {}
          <Text style={{textAlign: 'center', color:'grey', fontSize:16, marginTop: 8}}>
           {mode === true? "Start logging your exercises to see these graphs": "Start logging your nutrition to see these graphs"}!
          </Text>
        </View>
        
        }
    </View>
  );
}

