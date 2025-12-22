import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {Dumbbell, CircleUserRound, Apple} from 'lucide-react-native';

export default function Settings() {
    const navigation = useNavigation();



    return (
      <>
          <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.header}>Account Settings</Text>



            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("Profile")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Personal Details</Text>
                  <Text style={styles.settingSubtext}>Update your profile information</Text>
                </View>
                <CircleUserRound size={28} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate("Subscription")}
            >
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Manage Subscription</Text>
                  <Text style={styles.settingSubtext}>Upgrade, restore, or cancel your plan</Text>
                </View>
                <Ionicons name="card-outline" size={28} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("AdjustMacros")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Nutrition Goals</Text>
                  <Text style={styles.settingSubtext}>Adjust your macro targets</Text>
                </View>
                <Apple size={28} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("UserExercisesScreen")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>My Exercises</Text>
                  <Text style={styles.settingSubtext}>Manage your custom exercises</Text>
                </View>
                <Dumbbell size={28} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("TrainingFrequency")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Training Frequency</Text>
                  <Text style={styles.settingSubtext}>Set your workout schedule</Text>
                </View>
                <MaterialCommunityIcons name="calendar-clock" size={28} color="white" />
              </View>
            </TouchableOpacity>


            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("Privacy")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Privacy & Security</Text>
                  <Text style={styles.settingSubtext}>Manage your data and privacy</Text>
                </View>
                <FontAwesome6 name="shield-halved" size={28} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("About")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>About LiftLyzer</Text>
                  <Text style={styles.settingSubtext}>App information and version</Text>
                </View>
                <FontAwesome5 name="info-circle" size={28} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("Support")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Help & Support</Text>
                  <Text style={styles.settingSubtext}>Get help and contact support</Text>
                </View>
                <Entypo name="help-with-circle" size={28} color="white" />
              </View>
            </TouchableOpacity>




          </ScrollView>
      </>
    );
  }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#242424',
        paddingTop: 20,
    },
    header: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 32,
        color: 'white',
        letterSpacing: -0.5,
        fontFamily: 'Inter_700Bold',
        marginTop: 40,
    },
    settingRow: {
        backgroundColor: '#1A1A1A',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth:1,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        borderWidth: 0.3,
        borderColor: 'black',
        borderColor: 'grey',
    },
    settingText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        fontFamily: 'Inter_600SemiBold',
    },
    settingSubtext: {
        color: '#8E8E93',
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
    },
    rowContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
});
