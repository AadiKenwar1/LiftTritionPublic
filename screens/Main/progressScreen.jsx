import { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    ScrollView,
    Dimensions,
} from 'react-native';
import LogLineChart from '../../components/Charts/LogChart/LogLineChart';
import MetricLineChart from '../../components/Charts/MetricsChart/MetricLineChart';
import FatigueMeter from '../../components/FatigueMeter';
import CustomHeader from '../../components/CustomHeader';
import ProgressWheel from '../../components/ProgressWheel';
import { useSettings } from '../../context/SettingsContext';
import { useNutritionContext } from '../../context/Nutrition/NutritionContext';
import { useWorkoutContext } from '../../context/Workouts/WorkoutContext';
import { useWorkoutContext as useWorkoutContextV2 } from '../../context/WorkoutsV2/WorkoutContext';

const { width: screenWidth } = Dimensions.get('window');
export default function ProgressScreen() {
    const {mode, calorieGoal, proteinGoal, carbsGoal, fatsGoal} = useSettings()
    const {getTodaysMacro} = useNutritionContext()
    // V1 Context (keeping for reference)
    const {fatigueTodayPercent: fatigueTodayPercentV1, fatigueLast3DaysPercent: fatigueLast3DaysPercentV1, fatigueLast6DaysPercent: fatigueLast6DaysPercentV1, fatigueLast9DaysPercent: fatigueLast9DaysPercentV1} = useWorkoutContext()
    
    // V2 Context - now using for main functionality
    const {getFatigueForLastXDays, loading: loadingV2} = useWorkoutContextV2()
    
    // Calculate V2 fatigue percentages
    console.log('🚀 Calculating fatigue with V2 context');
    const fatigueTodayPercent = getFatigueForLastXDays(1);
    const fatigueLast3DaysPercent = getFatigueForLastXDays(3);
    const fatigueLast6DaysPercent = getFatigueForLastXDays(6);
    const fatigueLast9DaysPercent = getFatigueForLastXDays(9);
    
    console.log('📊 V2 Fatigue percentages:', {
      today: fatigueTodayPercent,
      last3Days: fatigueLast3DaysPercent,
      last6Days: fatigueLast6DaysPercent,
      last9Days: fatigueLast9DaysPercent
    });

    const todaysCalories = getTodaysMacro("calories");
    const calPercent = (todaysCalories / calorieGoal) * 100;
    const todaysProtein = getTodaysMacro('protein')
    const proteinPercent = (todaysProtein / proteinGoal) * 100
    const todaysCarbs = getTodaysMacro('carbs')
    const carbsPercent = (todaysCarbs / carbsGoal) * 100
    const todaysFats = getTodaysMacro('fats')
    const fatsPercent = (todaysFats / fatsGoal) * 100

    function fatigueFeedback(){
        if (fatigueTodayPercent > 75){
            return "You trained hard today, nice work! Make sure to get enough rest and recovery."
        }
        else if (fatigueTodayPercent > 50){
            return "Solid work today! Some rest and recovery and you'll be back in no time."
        }
        else if (fatigueTodayPercent > 25){
            return "Good work today! You had a light training session."
        }
        else if (fatigueTodayPercent > 0){
            return "Very light training session so far. Great if your goal is recovery or light training."
        }
        else{
            return "No training today. Seems like the focus is on rest and recovery."
        }

    }

    //console.log("todays fatigue " + fatigueTodayPercent)

    return (
        <>
            <CustomHeader />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>
                {/**Card One */}
                <View style={styles.rectangularCard}>
                    {mode === true? <ProgressWheel percent={fatigueTodayPercent} /> : <ProgressWheel percent={calPercent} />}
                    <View style={styles.textContainer}>
                        <Text style={{fontSize:18, fontFamily:'Inter_700Bold', fontWeight: 'bold', textAlign:'center', flexShrink: 1}} numberOfLines={2} adjustsFontSizeToFit>{mode === true? "Todays Fatigue" : "Todays Calories:"}</Text>
                        {mode === false && <Text style={{fontSize:18, fontFamily:'Inter_700Bold', fontStyle:'italic', textAlign:'center', fontWeight: '600', flexShrink: 1}} numberOfLines={2} adjustsFontSizeToFit> {todaysCalories}/{calorieGoal}</Text>}
                        {mode === false && <Text style={{fontSize:12, fontFamily:'Inter_400Regular', textAlign:'center', fontWeight: '500', flexShrink: 1}} numberOfLines={5} adjustsFontSizeToFit>You have {calorieGoal - todaysCalories} calories to go!</Text>}
                        {mode === true && <Text style={{fontSize:12, fontFamily:'Inter_400Regular', textAlign:'center', fontWeight: '500', flexShrink: 1}} numberOfLines={5} adjustsFontSizeToFit>{fatigueFeedback()}</Text>}
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }}>
                    <View style={styles.oneThirdSquareCard} >
                        <Text style={styles.oneThirdTopText}> {mode === true? "Fatigue ": "Todays Protein"}</Text>
                        <ProgressWheel percent={mode === true? fatigueLast3DaysPercent : proteinPercent} size={75} strokeWidth={7} fontSize={20}/>
                        <Text style={styles.oneThirdBottomText}> {mode === true? "Last 3 days" : todaysProtein + "/"  + proteinGoal}</Text>
                    </View>
                    <View style={styles.oneThirdSquareCard} >
                        <Text style={styles.oneThirdTopText}> {mode === true? "Fatigue ": "Todays Carbs"}</Text>
                        <ProgressWheel percent={mode === true? fatigueLast6DaysPercent : carbsPercent} size={75} strokeWidth={7} fontSize={20}/>
                        <Text style={styles.oneThirdBottomText}> {mode === true? "Last 6 days" : todaysCarbs+ "/"  + carbsGoal}</Text>
                    </View>
                    <View style={styles.oneThirdSquareCard} >
                        <Text style={styles.oneThirdTopText}> {mode === true? "Fatigue ": "Todays Fats"}</Text>
                        <ProgressWheel percent={mode === true? fatigueLast9DaysPercent : fatsPercent} size={75} strokeWidth={7} fontSize={20}/>
                        <Text style={styles.oneThirdBottomText}> {mode === true? "Last 9 days" : todaysFats + "/"  + fatsGoal}</Text>
                    </View>
                </View>

                {/*Card Two */}
                <View alignSelf={'center'} marginTop={5}>
                    <SafeAreaView>
                        <MetricLineChart />
                    </SafeAreaView>
                </View>

                {/*Card Three */}
                <View alignSelf={'center'} marginTop={5}>
                    <SafeAreaView>
                        <LogLineChart />
                    </SafeAreaView>
                </View>

            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    rectangularCard: {
        width: screenWidth - 32,
        height: (screenWidth - 32) / 2.5,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 10,
        padding: 20,
        alignSelf: 'center',
        alignItems: 'center',
        flexDirection:'row',
        gap:10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1.3,
        borderColor: 'black',
        borderBottomWidth: 4,
        borderBottomColor: 'black',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16
        
    },
    textContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: 10,
        marginTop:-10,
        gap:5,
        flex: 1,
        paddingRight: 10
    },
    oneThirdSquareCard: {
        width: (screenWidth - 32 - 20) / 3,
        height: (screenWidth - 32) / 2.5,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 5,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1.3,
        borderColor: 'black',
        borderBottomWidth: 4,
        borderBottomColor: 'black',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16
    },
    oneThirdTopText:{
        fontSize:12, 
        fontFamily:'Inter_700Bold', 
        fontStyle:'italic', 
        marginBottom:5, 
        textAlign:'center',
        fontWeight: 'bold',
    },
    oneThirdBottomText:{
        fontSize:12, 
        fontFamily:'Inter_700Bold', 
        fontStyle:'italic', 
        marginTop:5, 
        textAlign:'center',
        fontWeight: 'bold',
    },
    squareCard: {
        width: screenWidth - 32,
        height: screenWidth -32,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 16,
        padding: 20,
        justifyContent: 'center',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#e1e8ed',
        
    },

    cardTitle: {
        fontSize: 24,
        fontFamily: 'Inter_700Bold',
        color: '#1a202c',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#4a5568',
        textAlign: 'center',
        lineHeight: 22,
    },

    viewLogButton: {
        backgroundColor: 'orange',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        margin: 20,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    viewLogButtonText: {
        color: 'black',
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
        textTransform: 'uppercase',
        
    },
    noLog: {
        color: 'black',
        fontFamily: 'Inter_600SemiBold',
        textAlign: 'center',
        marginTop: 210,
        fontSize: 20,
    },
});
