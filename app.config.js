import 'dotenv/config';

export default {
  expo: {
    name: "LiftTrition",
    slug: "LiftLyzerV3",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/LiftTrition_App_Icon.png",
    userInterfaceStyle: "light",
    //newArchEnabled: true,
    splash: {
       image: "./assets/LiftTrition_Icon_Transparent.png",
       resizeMode: "contain",
       backgroundColor: "#242424",
    },
    platforms: process.env.EXPO_NO_WEB === "1" ? ["ios", "android"] : ["ios", "android", "web"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.LiftLyzerCo.liftlyzer.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSFaceIDUsageDescription:
          "We use Face ID to let you sign into your account easily and securely.",
        NSUserTrackingUsageDescription:
          "We use your data to provide personalized ads and improve user experience.",
        NSCameraUsageDescription:
          "We may request camera access for future features.",
        NSMicrophoneUsageDescription:
          "We may request microphone access for future features.",
        NSPhotoLibraryUsageDescription:
          "We may request access to your photo library for future features.",
        NSPhotoLibraryAddUsageDescription:
          "We may request access to save images or files in your photo library.",
      },
      entitlements: {
        "com.apple.developer.applesignin": ["Default"],
        "keychain-access-groups": ["$(AppIdentifierPrefix)com.LiftLyzerCo.liftlyzer.app"],
      },
      config: {
        usesAppleSignIn: true,
      },
      // Additional Apple Sign In configuration
      associatedDomains: [],
    },
    android: {
      package: "com.LiftLyzerCo.liftlyzer.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },

    extra: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,      
      FATSECRET_CLIENT_ID: process.env.FATSECRET_CLIENT_ID,
      FATSECRET_CLIENT_SECRET: process.env.FATSECRET_CLIENT_SECRET,
      APPSYNC_ENDPOINT: process.env.APPSYNC_ENDPOINT,
      APPSYNC_API_KEY: process.env.APPSYNC_API_KEY,
      GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
      GRAPHQL_API_KEY: process.env.GRAPHQL_API_KEY,
      REVENUECAT_API_KEY_IOS: process.env.REVENUECAT_API_KEY_IOS,
      REVENUECAT_API_KEY_ANDROID: process.env.REVENUECAT_API_KEY_ANDROID,
      
      eas: {
        projectId: "30f35f1b-1628-4ec9-83c4-83cca617f111",
      },
    },
    plugins: [
      "expo-font",
      "expo-apple-authentication",
    ],
  },
};
