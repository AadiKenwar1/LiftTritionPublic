import { View, Text, StyleSheet, ScrollView } from "react-native";
import CustomHeader from "../../../components/CustomHeader";

export default function PrivacyScreen() {
  return (
    <>
      <CustomHeader title={"Privacy Policy"} showBack />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>Privacy Policy</Text>
        <Text style={styles.subheading}>Effective Date: June 7, 2025</Text>
        <Text style={styles.subheading}>Last Updated: June 7, 2025</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We may collect the following types of information:
        </Text>
        <Text style={styles.bullet}>
          • Personal Information: such as your name, email address, or profile
          details when you create an account.
        </Text>
        <Text style={styles.bullet}>
          • Usage Data: including your interactions with the app, session
          length, and feature usage.
        </Text>
        <Text style={styles.bullet}>
          • Device Information: such as your device model, operating system, and
          app version.
        </Text>
        <Text style={styles.bullet}>
          • Location Data: only if you grant us permission.
        </Text>
        <Text style={styles.bullet}>
          • Health/Fitness Data: workout logs that you the user have provided.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.bullet}>• Provide and improve our services</Text>
        <Text style={styles.bullet}>• Personalize your experience</Text>
        <Text style={styles.bullet}>
          • Communicate with you (such as support or app updates)
        </Text>
        <Text style={styles.bullet}>
          • Analyze usage trends to enhance app performance
        </Text>
        <Text style={styles.bullet}>
          • Ensure the security and integrity of the app
        </Text>

        <Text style={styles.sectionTitle}>3. Sharing Your Information</Text>
        <Text style={styles.text}>
          We do not sell your personal information. We may share anonymized or
          aggregated data with trusted third-party service providers to help us
          operate and improve our app (e.g., analytics providers, crash
          reporting tools).
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.text}>
          We take reasonable measures to protect your data from unauthorized
          access, disclosure, or destruction. These include encryption, access
          control, and secure storage practices.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Choices and Rights</Text>
        <Text style={styles.bullet}>
          • You can access, update, or delete your data at any time by
          contacting us.
        </Text>
        <Text style={styles.bullet}>
          • You may opt out of marketing communications by following the
          unsubscribe link in our emails (if applicable).
        </Text>
        <Text style={styles.bullet}>
          • You can delete your account and associated data through app settings
          or by contacting us.
        </Text>

        <Text style={styles.sectionTitle}>6. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this Privacy Policy from time to time. If we make
          significant changes, we will notify you within the app or by other
          means.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions or requests regarding this Privacy Policy,
          please contact us at:
        </Text>
        <Text style={styles.text}>Email: LiftLyzer@gmail.com</Text>

        <Text style={styles.sectionTitle}>8. Pricing Policy</Text>
        <Text style={styles.text}>
          We reserve the right to change prices for our app, services,
          subscriptions, or features at any time, with or without prior notice.
          Any price changes will be communicated through the app or other
          appropriate means and will not affect potential existing subscriptions
          until the end of the current billing cycle.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  bullet: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    marginBottom: 6,
    lineHeight: 20,
  },
});
