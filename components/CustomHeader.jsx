import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSettings } from '../context/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomHeader(props) {

  const {mode, setMode, toggleMode} = useSettings()

  const navigation = useNavigation();

  const handleSettingsPress = () => {
    navigation.navigate("Settings");
  };

  return (
    <View style={styles.header}>
      {/* Back button (left) */}
      {props.showBack && navigation.canGoBack() ? (
        <TouchableOpacity
          style={styles.sideButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" marginTop={40} />
        </TouchableOpacity>
        
      ) : (
        <></>
      )}

      {/* Button Row */}
      {console.log(props.title)}
      {/* Title */}
      {props.title? (
        <Text style={styles.title} numberOfLines={1}>
          {props.title}
        </Text>
      ):(
      <View style={styles.modeSelectorContainer}>
        {/**Mode Selector */}
        {mode === true ? (
          <Pressable
            style={styles.modeButton}
            onPress={() => setMode(true)}
          >
            <LinearGradient
              colors={['#1A7FE0', '#2D9CFF', '#3DAFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={[styles.modeButtonText, styles.activeModeText]}>LIFT</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <TouchableOpacity
            style={[styles.modeButton, styles.inactiveModeButton]}
            onPress={() => setMode(true)}
          >
            <Text style={styles.modeButtonText}>LIFT</Text>
          </TouchableOpacity>
        )}

        {mode === false ? (
          <Pressable
            style={styles.modeButton}
            onPress={() => setMode(false)}
          >
            <LinearGradient
              colors={['#3CB855', '#4CD964', '#5CE073']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={[styles.modeButtonText, styles.activeModeText]}>NUTRITION</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <TouchableOpacity
            style={[styles.modeButton, styles.inactiveModeButton]}
            onPress={() => setMode(false)}
          >
            <Text style={styles.modeButtonText}>NUTRITION</Text>
          </TouchableOpacity>
        )}
      </View>
      )
      
      }

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    flexDirection:"row",
    paddingHorizontal: 16,
    zIndex: 100,
  },
  sideButton: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "white",
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginTop: 40,
    marginRight:40
  },
  buttonRow: {
    flexDirection: "row",
    marginTop:30,
    gap: 10,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
  },
  tabText: {
    color: "#000",
    fontFamily: 'Inter_700Bold',
  },
  modeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 35,
    backgroundColor: 'transparent', // light gray
    padding: 4,
    borderRadius: 10,
    elevation: 4,
    gap: 2,
  },

  modeButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  inactiveModeButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  gradientButton: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  modeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: 'white', // gray-700
  },

  activeModeText: {
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
  },
});
