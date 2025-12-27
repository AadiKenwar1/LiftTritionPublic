import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import CustomHeader from "../../../components/CustomHeader";

export default function PrivacyScreen() {
  return (
    <>
      <CustomHeader title={"Privacy Policy"} showBack />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Privacy Policy</Text>
        <Text style={styles.subheading}>Effective Date: January 2025</Text>
        <Text style={styles.subheading}>Last Updated: January 2025</Text>

        <Text style={styles.introText}>
          At LiftTrition, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our fitness and nutrition tracking application.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        
        <Text style={styles.subsectionTitle}>1.1 Account Information</Text>
        <Text style={styles.text}>
          When you sign in using Apple Sign In, we collect:
        </Text>
        <Text style={styles.bullet}>• Your Apple User ID (a unique identifier)</Text>
        <Text style={styles.bullet}>• Your email address (which may be a proxy email provided by Apple)</Text>
        <Text style={styles.bullet}>• Your name (if provided by Apple)</Text>

        <Text style={styles.subsectionTitle}>1.2 Profile and Health Information</Text>
        <Text style={styles.text}>
          During onboarding and app usage, we collect:
        </Text>
        <Text style={styles.bullet}>• Birth date and age (minimum age requirement: 12 years)</Text>
        <Text style={styles.bullet}>• Biological sex (used for nutrition calculations)</Text>
        <Text style={styles.bullet}>• Height and body weight</Text>
        <Text style={styles.bullet}>• Weight progress history</Text>
        <Text style={styles.bullet}>• Activity level and training frequency</Text>
        <Text style={styles.bullet}>• Fitness goals (weight goals, goal pace)</Text>
        <Text style={styles.bullet}>• Calculated nutrition goals (calories, protein, carbs, fats)</Text>

        <Text style={styles.subsectionTitle}>1.3 Workout Data</Text>
        <Text style={styles.text}>
          When using Lift Mode, we collect:
        </Text>
        <Text style={styles.bullet}>• Workout names, order, and notes</Text>
        <Text style={styles.bullet}>• Exercise names, muscle groups, and fatigue factors</Text>
        <Text style={styles.bullet}>• Exercise logs (date, weight, reps, RPE)</Text>
        <Text style={styles.bullet}>• Custom exercises you create</Text>

        <Text style={styles.subsectionTitle}>1.4 Nutrition Data</Text>
        <Text style={styles.text}>
          When using Nutrition Mode, we collect:
        </Text>
        <Text style={styles.bullet}>• Food names and nutrition entries</Text>
        <Text style={styles.bullet}>• Macronutrient data (protein, carbs, fats, calories)</Text>
        <Text style={styles.bullet}>• Meal timestamps</Text>
        <Text style={styles.bullet}>• Saved/bookmarked foods</Text>
        <Text style={styles.bullet}>• Ingredients lists (for photo-analyzed foods)</Text>

        <Text style={styles.subsectionTitle}>1.5 Camera and Photo Data</Text>
        <Text style={styles.text}>
          If you use our premium camera features:
        </Text>
        <Text style={styles.bullet}>• Photos are captured, cropped, and compressed</Text>
        <Text style={styles.bullet}>• Photos are converted to base64 format and sent to OpenAI for analysis</Text>
        <Text style={styles.bullet}>• Photos are NOT stored permanently on our servers</Text>
        <Text style={styles.bullet}>• Only the extracted nutrition data is saved</Text>
        <Text style={styles.bullet}>• Barcode data may be captured for product identification</Text>

        <Text style={styles.subsectionTitle}>1.6 Device and Technical Information</Text>
        <Text style={styles.text}>
          We automatically collect:
        </Text>
        <Text style={styles.bullet}>• Device model and operating system version</Text>
        <Text style={styles.bullet}>• App version</Text>
        <Text style={styles.bullet}>• Network connection status</Text>
        <Text style={styles.bullet}>• Session information (stored locally)</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use your information to:
        </Text>
        <Text style={styles.bullet}>• Provide core app functionality (workout and nutrition tracking)</Text>
        <Text style={styles.bullet}>• Calculate personalized nutrition goals based on your profile</Text>
        <Text style={styles.bullet}>• Generate progress charts and insights</Text>
        <Text style={styles.bullet}>• Process food photos using AI to extract nutrition information (premium feature)</Text>
        <Text style={styles.bullet}>• Search food databases to provide nutrition information</Text>
        <Text style={styles.bullet}>• Manage your subscription and premium features</Text>
        <Text style={styles.bullet}>• Synchronize your data across devices</Text>
        <Text style={styles.bullet}>• Maintain and improve app functionality</Text>
        <Text style={styles.bullet}>• Provide customer support</Text>

        <Text style={styles.sectionTitle}>3. Third-Party Services and Data Sharing</Text>
        
        <Text style={styles.subsectionTitle}>3.1 Service Providers</Text>
        <Text style={styles.text}>
          We use the following third-party services:
        </Text>
        
        <Text style={styles.bullet}>
          <Text style={styles.bold}>OpenAI:</Text> We use OpenAI's GPT-4o Vision API to analyze food photos and extract nutrition information. When you take a photo, it is sent to OpenAI for processing. Images are not stored by OpenAI after processing. Please review OpenAI's privacy policy for more information.
        </Text>
        
        <Text style={styles.bullet}>
          <Text style={styles.bold}>FatSecret API:</Text> We use FatSecret's food database to provide nutrition information when you search for foods. Your search queries are sent to FatSecret, and results are cached locally for one week to improve performance.
        </Text>
        
        <Text style={styles.bullet}>
          <Text style={styles.bold}>RevenueCat:</Text> We use RevenueCat to manage subscriptions and in-app purchases. RevenueCat processes your purchase information and subscription status. Please review RevenueCat's privacy policy for more information.
        </Text>
        
        <Text style={styles.bullet}>
          <Text style={styles.bold}>Amazon Web Services (AWS):</Text> All your data is stored securely on AWS AppSync (GraphQL database) in the us-east-1 region. AWS provides the infrastructure for data storage and synchronization.
        </Text>

        <Text style={styles.bullet}>
          <Text style={styles.bold}>Apple:</Text> We use Apple Sign In for authentication. Apple provides your user ID, email, and name (if available) according to Apple's privacy practices.
        </Text>

        <Text style={styles.subsectionTitle}>3.2 Data Sharing Policy</Text>
        <Text style={styles.text}>
          We do NOT sell your personal information to third parties. We only share data with service providers necessary to operate the app, and only the minimum data required for their services.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
        
        <Text style={styles.subsectionTitle}>4.1 Cloud Storage</Text>
        <Text style={styles.text}>
          Your data is stored securely on AWS AppSync (GraphQL database) in the us-east-1 region. All data is encrypted in transit and at rest. Your data is isolated by your user ID, ensuring only you can access your information.
        </Text>

        <Text style={styles.subsectionTitle}>4.2 Local Storage</Text>
        <Text style={styles.text}>
          Some information is stored locally on your device:
        </Text>
        <Text style={styles.bullet}>• Session information (stored in device storage)</Text>
        <Text style={styles.bullet}>• Apple authentication tokens (stored securely in device keychain)</Text>
        <Text style={styles.bullet}>• Cached food search results (temporary, 1 week)</Text>

        <Text style={styles.subsectionTitle}>4.3 Photo Storage</Text>
        <Text style={styles.text}>
          Photos taken for food analysis are:
        </Text>
        <Text style={styles.bullet}>• Processed immediately after capture</Text>
        <Text style={styles.bullet}>• Sent to OpenAI for analysis</Text>
        <Text style={styles.bullet}>• Deleted from your device after processing</Text>
        <Text style={styles.bullet}>• NOT stored permanently on our servers or your device</Text>
        <Text style={styles.bullet}>• Only the extracted nutrition data is saved</Text>

        <Text style={styles.subsectionTitle}>4.4 Security Measures</Text>
        <Text style={styles.text}>
          We implement security measures including:
        </Text>
        <Text style={styles.bullet}>• HTTPS encryption for all data transmission</Text>
        <Text style={styles.bullet}>• Secure token storage in device keychain</Text>
        <Text style={styles.bullet}>• API key authentication for database access</Text>
        <Text style={styles.bullet}>• User data isolation by user ID</Text>
        <Text style={styles.bullet}>• Optimistic updates with error rollback</Text>

        <Text style={styles.sectionTitle}>5. Permissions</Text>
        <Text style={styles.text}>
          Our app may request the following permissions:
        </Text>
        <Text style={styles.bullet}>
          <Text style={styles.bold}>Camera:</Text> Required for premium food photo analysis feature. Photos are processed and deleted immediately after analysis.
        </Text>
        <Text style={styles.bullet}>
          <Text style={styles.bold}>Network Access:</Text> Required for data synchronization, API calls, and subscription management.
        </Text>
        <Text style={styles.text}>
          Note: We do not currently use microphone, photo library, or Face ID permissions, though they may be listed for future features.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
        
        <Text style={styles.subsectionTitle}>6.1 Access and Modification</Text>
        <Text style={styles.text}>
          You can:
        </Text>
        <Text style={styles.bullet}>• View all your data within the app</Text>
        <Text style={styles.bullet}>• Edit nutrition entries, workouts, and exercises</Text>
        <Text style={styles.bullet}>• Update your profile information and goals</Text>
        <Text style={styles.bullet}>• Modify your settings and preferences</Text>

        <Text style={styles.subsectionTitle}>6.2 Data Deletion</Text>
        <Text style={styles.text}>
          You can delete your data in the following ways:
        </Text>
        <Text style={styles.bullet}>• Delete individual nutrition entries, workouts, or exercises</Text>
        <Text style={styles.bullet}>• Delete your entire account through Profile settings</Text>
        <Text style={styles.text}>
          When you delete your account, we permanently delete:
        </Text>
        <Text style={styles.bullet}>• All settings and profile information</Text>
        <Text style={styles.bullet}>• All workout data (workouts, exercises, logs)</Text>
        <Text style={styles.bullet}>• All nutrition entries</Text>
        <Text style={styles.bullet}>• All custom exercises</Text>
        <Text style={styles.bullet}>• Local session data</Text>
        <Text style={styles.text}>
          Account deletion is permanent and cannot be undone. A two-step confirmation is required for account deletion.
        </Text>

        <Text style={styles.subsectionTitle}>6.3 Data Export</Text>
        <Text style={styles.text}>
          Currently, we do not provide a data export feature. If you need to export your data, please contact us at lifttrition@gmail.com.
        </Text>

        <Text style={styles.sectionTitle}>7. Age Requirements</Text>
        <Text style={styles.text}>
          Our app is intended for users who are at least 12 years old. We collect birth date information during onboarding and enforce this age requirement. If you are under 12, please do not use this app.
        </Text>
        <Text style={styles.text}>
          If you are a parent or guardian and believe your child under 12 has provided us with personal information, please contact us immediately.
        </Text>

        <Text style={styles.sectionTitle}>8. Data Retention</Text>
        <Text style={styles.text}>
          We retain your data for as long as your account is active or as needed to provide our services. When you delete your account, all data is permanently deleted from our servers within a reasonable timeframe.
        </Text>
        <Text style={styles.text}>
          Cached data (such as food search results) is automatically deleted after 1 week.
        </Text>

        <Text style={styles.sectionTitle}>9. Network Requirements</Text>
        <Text style={styles.text}>
          Our app requires an active internet connection to function. The app needs internet connectivity for:
        </Text>
        <Text style={styles.bullet}>• Signing in with Apple</Text>
        <Text style={styles.bullet}>• Loading and synchronizing data with our servers</Text>
        <Text style={styles.bullet}>• Using AI food analysis features (premium)</Text>
        <Text style={styles.bullet}>• Searching food databases</Text>
        <Text style={styles.bullet}>• Managing subscriptions</Text>
        <Text style={styles.bullet}>• Viewing your workout and nutrition data</Text>
        <Text style={styles.text}>
          The app cannot function offline. An active internet connection is required for all app features.
        </Text>

        <Text style={styles.sectionTitle}>10. Premium Features</Text>
        <Text style={styles.text}>
          Some features require a "LiftTrition Pro" subscription:
        </Text>
        <Text style={styles.bullet}>• AI-powered food photo analysis</Text>
        <Text style={styles.bullet}>• AI-generated macro estimates from text descriptions</Text>
        <Text style={styles.text}>
          Subscription management is handled by RevenueCat. Free features include manual nutrition entry, food database search, workout tracking, and progress charts.
        </Text>

        <Text style={styles.sectionTitle}>11. International Users</Text>
        <Text style={styles.text}>
          If you are located outside the United States, please note that your data is stored in the United States (AWS us-east-1 region). By using our app, you consent to the transfer of your data to the United States.
        </Text>

        <Text style={styles.sectionTitle}>12. Changes to This Privacy Policy</Text>
        <Text style={styles.text}>
          We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by updating the "Last Updated" date at the top of this policy. We encourage you to review this policy periodically.
        </Text>

        <Text style={styles.sectionTitle}>13. Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us at:
        </Text>
        <Text style={styles.contactText}>Email: lifttrition@gmail.com</Text>

        <Text style={styles.sectionTitle}>14. Pricing Policy</Text>
        <Text style={styles.text}>
          We reserve the right to change prices for our app, services, subscriptions, or features at any time, with or without prior notice. Any price changes will be communicated through the app or other appropriate means and will not affect existing subscriptions until the end of the current billing cycle.
        </Text>

        <Text style={styles.footerText}>
          By using LiftTrition, you acknowledge that you have read and understood this Privacy Policy.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#242424",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  subheading: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  introText: {
    fontSize: 15,
    color: "white",
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginTop: 24,
    marginBottom: 12,
    fontFamily: 'Inter_700Bold',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  text: {
    fontSize: 14,
    color: "white",
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  bullet: {
    fontSize: 14,
    color: "white",
    marginLeft: 10,
    marginBottom: 6,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  bold: {
    fontWeight: "600",
    fontFamily: 'Inter_600SemiBold',
  },
  contactText: {
    fontSize: 14,
    color: "#4CD964",
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  footerText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 24,
    marginBottom: 8,
    fontStyle: "italic",
    textAlign: "center",
    fontFamily: 'Inter_400Regular',
  },
});
