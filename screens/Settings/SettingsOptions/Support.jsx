import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import CustomHeader from "../../../components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";

const SUPPORT_FORM_URL = "https://forms.gle/r8P3CY6QRmx8Jyc78";

export default function SupportScreen() {
  const handleOpenForm = async () => {
    try {
      const canOpen = await Linking.canOpenURL(SUPPORT_FORM_URL);
      if (canOpen) {
        await Linking.openURL(SUPPORT_FORM_URL);
      } else {
        Alert.alert("Error", "Unable to open the support form. Please try again later.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open the support form. Please try again later.");
    }
  };

  return (
    <>
      <CustomHeader title={"Suggestions & Support"} showBack />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="help-circle" size={64} color="#00B8A9" />
        </View>

        <Text style={styles.heading}>We're Here to Help</Text>
        
        <Text style={styles.introText}>
          If you have any suggestions or need support, please fill out the form below. 
          Your feedback helps us improve the app and provide you with the best experience possible.
        </Text>

        <Text style={styles.text}>
          Don't be shy to speak up about what we could be doing better. All suggestions 
          and support requests will be reviewed and responded to as soon as possible.
        </Text>

        <TouchableOpacity 
          style={styles.formButton}
          onPress={handleOpenForm}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.formButtonText}>Open Suggestion & Support Form</Text>
          <Ionicons name="open-outline" size={20} color="white" style={styles.buttonIcon} />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Can You Do?</Text>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark-circle" size={18} color="#00B8A9" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Report bugs or issues</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark-circle" size={18} color="#00B8A9" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Suggest new features</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark-circle" size={18} color="#00B8A9" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Share your feedback</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark-circle" size={18} color="#00B8A9" style={styles.bulletIcon} />
            <Text style={styles.bulletText}>Ask questions about the app</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  introText: {
    fontSize: 15,
    color: "white",
    marginBottom: 16,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  text: {
    fontSize: 14,
    color: "#E5E5E5",
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  formButton: {
    backgroundColor: "#00B8A9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  formButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Inter_600SemiBold',
    marginHorizontal: 5,
  },
  buttonIcon: {
    marginHorizontal: 4,
  },
 
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#E5E5E5",
    marginLeft: 12,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bulletIcon: {
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: "white",
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
});
