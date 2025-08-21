import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {useSettings} from '../context/SettingsContext'

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
          <Ionicons name="arrow-back" size={24} color="black" marginTop={40} />
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
        <TouchableOpacity
          style={[styles.modeButton, mode === true && styles.activeModeButtonLift]}
          onPress={() => setMode(true)}
        >
          <Text style={[styles.modeButtonText, mode === true && styles.activeModeText]}>Lift</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === false && styles.activeModeButtonMacros]}
          onPress={() => setMode(false)}
        >
          <Text style={[styles.modeButtonText, mode === false && styles.activeModeText]}>Macros</Text>
        </TouchableOpacity>
      </View>
      )
      
      }

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: "#F2F2F2",
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
    color: "black",
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
    backgroundColor: '#F2F2F2', // light gray
    padding: 4,
    borderRadius: 10,

    elevation: 4,
    gap: 2,
  },

  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 4,
    borderBottomColor: 'black',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  activeModeButtonLift: {
    backgroundColor: '#2D9CFF', // indigo
  },
  activeModeButtonMacros: {
    backgroundColor: '#4CD964', // indigo
  },
  modeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: 'black', // gray-700
  },

  activeModeText: {
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
  },
});
