import 'dotenv/config';

export default {
  expo: {
    name: "LiftLyzerV3",
    slug: "LiftLyzerV3",
    version: "1.0.0",
    orientation: "portrait",
    // icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    // newArchEnabled: true, // Removed for SDK 52 compatibility
    // Temporarily disabled splash screen to avoid permission issues during iOS build
    // splash: {
    //   image: "./assets/splash-icon.png",
    //   resizeMode: "contain",
    //   backgroundColor: "#ffffff",
    // },
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
    // Temporarily disabled web platform to avoid permission issues during iOS build
    // web: {
    //   favicon: "./assets/favicon.png",
    // },
    extra: {
      // AWS Cognito
      COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
      COGNITO_USER_POOL_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID,
      
      //Open AI API
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      
      // Nutritionix API
      NUTRITIONX_APP_ID: process.env.NUTRITIONX_APP_ID,
      NUTRITIONX_API_KEY: process.env.NUTRITIONX_API_KEY,
      
      // AppSync API
      APPSYNC_ENDPOINT: process.env.APPSYNC_ENDPOINT,
      APPSYNC_API_KEY: process.env.APPSYNC_API_KEY,
      
      // GraphQL API
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
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            deploymentTarget: "16.0",
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
          },
        },
      ],
    ],
  },
};
