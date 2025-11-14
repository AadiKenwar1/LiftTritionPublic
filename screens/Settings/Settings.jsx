import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Pressable,
    Alert,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSettings } from '../../context/SettingsContext';
import { useAuthContext } from '../../context/Auth/AuthContext';
import { SafeAreaView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const screenWidth = Dimensions.get('window').width;
const horizontalPadding = 32; // total horizontal padding/margin
const gutter = 16; // space between cards
const cardSize = (screenWidth - horizontalPadding - gutter) / 2;

export default function Settings() {
    const { mode } = useSettings();
    const { user } = useAuthContext();
    const navigation = useNavigation();



    return (
      <>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
          <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.header}>Account Settings</Text>



            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("Profile")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Personal Details</Text>
                  <Text style={styles.settingSubtext}>Update your profile information</Text>
                </View>
                <MaterialCommunityIcons name="account-circle" size={28} color="black" />
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
                <Ionicons name="card-outline" size={28} color="black" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("UserExercisesScreen")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>My Exercises</Text>
                  <Text style={styles.settingSubtext}>Manage your custom exercises</Text>
                </View>
                <MaterialCommunityIcons name="dumbbell" size={28} color="black" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("AdjustMacros")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Nutrition Goals</Text>
                  <Text style={styles.settingSubtext}>Adjust your macro targets</Text>
                </View>
                <Ionicons name="nutrition" size={28} color="black" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("TrainingFrequency")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Training Frequency</Text>
                  <Text style={styles.settingSubtext}>Set your workout schedule</Text>
                </View>
                <MaterialCommunityIcons name="calendar-clock" size={28} color="black" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("Privacy")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Privacy & Security</Text>
                  <Text style={styles.settingSubtext}>Manage your data and privacy</Text>
                </View>
                <FontAwesome6 name="shield-halved" size={28} color="black" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("About")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>About LiftLyzer</Text>
                  <Text style={styles.settingSubtext}>App information and version</Text>
                </View>
                <FontAwesome5 name="info-circle" size={28} color="black" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate("Support")}>
              <View style={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Help & Support</Text>
                  <Text style={styles.settingSubtext}>Get help and contact support</Text>
                </View>
                <Entypo name="help-with-circle" size={28} color="black" />
              </View>
            </TouchableOpacity>




          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#F8F9FA',
        paddingTop: 20,
    },
    header: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 32,
        color: '#1A1A1A',
        letterSpacing: -0.5,
        fontFamily: 'Inter_700Bold',
    },
    userInfoSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
        fontFamily: 'Inter_700Bold',
    },
    userEmail: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 8,
        fontFamily: 'Inter_400Regular',
    },
    authProvider: {
        fontSize: 12,
        color: '#007AFF',
        fontFamily: 'Inter_400Regular',
    },
    settingRow: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth:1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'black',
        borderBottomWidth: 4,
        borderBottomColor: 'black',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
    },
    settingText: {
        color: '#1A1A1A',
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

    card: {
        width: cardSize,
        height: cardSize, // square
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 0,
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,

        // Shadow
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6, // Android
    },
    weightText: {
        fontSize: 20,
        fontWeight: 'bold',
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
    debugSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    debugSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
        fontFamily: 'Inter_700Bold',
    },
});
