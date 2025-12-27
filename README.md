# LiftTrition

 LiftTrition is a a full-stack  fitness app that with its niche being a dual-mode interface for both weight training and nutrtion, allowing users to track and visual their progress for both in one app. We feature AI-powered food analysis, and personalized macro calculations, and many more to allow users to reach their fitness goals.

## App Flow

### Onboarding

When users first open the app, they go through a 9-screen onboarding process that collects essential information:

1. **Welcome Screen**: Introduction to the app
2. **Personal Information**: Birth date and age
3. **Gender Selection**: Male, female, or other
4. **Body Metrics**: Height and weight (Imperial or Metric units)
5. **Training Frequency**: How many times per week they train (0, 1-2, 3-4, or 5+ times)
6. **Goal Selection**: Choose to lose, maintain, or gain weight
7. **Goal Pace**: Rate of desired weight change per week
8. **Review**: Summary of all entered information
9. **Macro Calculation**: Automatic calculation of personalized calorie and macro goals

This information is used to calculate personalized nutrition goals using the Mifflin-St Jeor BMR formula, taking into account activity level and weight goals.

### Main App

After onboarding, users enter the main app interface with three tabs: **Log**, **Progress**, and **Settings**. There is also a permanent mode switch at the top of the screen that allows users to toggle between **Lift Mode** (weight training) and **Nutrition Mode** (calories + macronutrient tracking). When switching modes, the content dynamically updates to show relevant features and data.

#### Log Screen

**Lift Mode:**

The main feature is workout tracking. Users can:
- **Create workouts** and organize them by name
- **Add exercises** to each workout from a pre-built library or create custom exercises
- **Log training sessions** by recording weight, reps, and RPE (Rate of Perceived Exertion) for each set
- **Manage workouts**: Archive, add notes, rename, delete, and reorder workouts
- **Manage exercises**: Archive, add notes, rename, delete, and reorder exercises within workouts
- **Manage logs**: Edit or delete exercise logs

The exercise library is organized by muscle groups (chest, back, shoulders, triceps, biceps, legs) and includes exercises with predefined fatigue factors. Users can also create custom exercises with personalized settings.

**Nutrition Mode:**

Users can track their daily nutrition in several ways:
- **Manual Entry**: Manually enter nutrition values (protein, carbs, fats, calories) or use AI text processing to generate values from food descriptions
- **Camera Mode (Premium)**: Take photos of food, scan barcodes, or photograph nutrition labels to automatically extract nutrition information using AI
- **Food Database (Premium)**: Search a comprehensive database of branded and unbranded foods using the FatSecret API
- **Saved Foods**: Bookmark frequently used foods for quick access

Additional features include:
- Update body weight
- View and edit nutrition entries from any past date
- Edit or delete existing entries
- View ingredient lists for photo-analyzed foods

#### Progress Screen

**Lift Mode:**

Users can visualize their training progress:
- **Fatigue Progress Wheels**: Display fatigue percentages for today and the last 3, 6, and 9 days. Fatigue is calculated based on exercise type, volume, intensity, and training frequency.
- **Volume Chart**: Graph showing total training volume (sets × reps × weight) in the last 10, 20, or 30 liting sessions
- **Sets Chart**: Graph showing total sets completed last 10, 20, or 30 liting sessions
- **Strength Progression**: Chart showing lift progression for the last 10, 20, or 30 lifting sessions

**Nutrition Mode:**

Users can track their nutrition progress:
- **Calorie + Macro Progress Wheels**: Display progress toward daily goals for calories, protein, carbohydrates, and fats
- **Weight Progress Chart**: Graph showing body weight changes over time with continuous line visualization
- **Calories + Macro Progress Charts**: Graphs showing macro consumption trends over time

#### Settings

Users can manage their account and preferences:
- **Personal Details**: Update profile information (age, gender, height, weight)
- **Manage Subscription**: Upgrade, restore, or cancel premium subscription
- **Nutrition Goals**: Adjust macro targets (can recalculate or manually override)
- **Training Frequency**: Update activity level which adjusts macro calculations
- **My Exercises**: Manage custom exercises
- **Privacy & Security**: Manage data and privacy settings
- **Support**: Contact support or suggest improvements

## Technical & Algorithmic Features

### AI-Powered Nutrition Analysis

LiftTrition utilizes OpenAI GPT-4o Vision and NLP API for intelligent food analysis:

- **Picture Mode**: Takes a photo of food and extracts nutrition information including calories, protein, carbs, fats, and ingredient lists. The AI analyzes portion sizes and provides accurate estimates.
- **Label Mode**: Photographs nutrition labels for precise data extraction. The AI reads and interprets standard nutrition facts panels.
- **Barcode Mode**: Scans product barcodes to identify foods and retrieve nutrition information.
- **Manual Nutrition Entry**: User enters text input and recieves AI generated nutritional values

All modes use structured JSON responses with low temperature settings (0.1-0.2) for consistent, accurate results.

### Food Database Integration

The app integrates with the FatSecret API to provide access to a comprehensive food database:

- **Smart Search**: Uses intelligent word matching to score and rank search results by relevance, prioritizing items that match multiple search terms
- **Debounced Searching**: Implements a 400ms delay before triggering API calls. This prevents excessive API requests while users type, only searching when they pause or finish typing
- **Caching Strategy**: Uses both temporal and spatial locality principles:
  - **Temporal Locality**: Recently accessed food items are cached for 1 week
  - **Spatial Locality**: Search results and selected items are cached together
  - This reduces API calls and improves response times for frequently accessed items

The FatSecret integration uses OAuth 2.0 authentication with automatic token management and refresh.

### Offline-First Architecture

LiftTrition implements a sophisticated offline-first data synchronization system:

- **Local Storage**: All data is stored locally in AsyncStorage, providing instant access/UX and full functionality offline
- **Background Sync**: When online, a centralized sync manager automatically synchronizes data to AWS AppSync (DynamoDB) in the background
- **Sync Flags**: Each data item (workouts, exercises, logs, nutrition entries) has a `synced` flag that tracks synchronization status:
  - New items are created with `synced: false`
  - Items are synced to the database and marked `synced: true` after successful sync
  - Edited items are marked `synced: false` and re-synced
  - Deleted items use soft delete (`deleted: true`) and are removed from the database after successful sync
- **Network Awareness**: The sync manager monitors network status and automatically syncs pending changes when connection is restored
- **Data Safety**: Users cannot sign out or delete their account while offline. This ensures all data is properly backed up to the cloud before account operations, preventing data loss

The sync system handles concurrent operations, prevents duplicate syncs, and includes error handling with retry logic.

### Advanced Calculations

**Fatigue Calculation:**
```
Fatigue = reps × (weight / currentMax) × rpe × fatigueFactor × frequencyMultiplier
Daily Budget = 600 fatigue units
```
- Exercise types have different fatigue factors (Machine Isolation: 0.5, Barbell Compound: 1.1, etc.)
- Training frequency adjusts the multiplier (more frequent training = lower multiplier)
- Current max is estimated using one-rep max calculations (Epley formula)

**Macro Calculation:**
- Uses Mifflin-St Jeor BMR formula with activity factor adjustments
- Calorie adjustments based on weight goals (lose/maintain/gain)
- Progressive protein recommendations that increase with training frequency
- Optimal macro split: 27.5% calories from fats, remainder from carbs after protein allocation

## Running the App

### Prerequisites

- **Node.js** 18+ and npm
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **iOS Development**: Xcode 14+ (macOS only)
- **Android Development**: Android Studio with Android SDK
- **Accounts Required**:
  - Apple Developer Account (for Apple Sign In)
  - AWS Account with Amplify configured
  - OpenAI API account with API key
  - FatSecret API account with client ID and secret
  - RevenueCat account with API keys

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LiftTrition
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   FATSECRET_CLIENT_ID=your_fatsecret_client_id
   FATSECRET_CLIENT_SECRET=your_fatsecret_client_secret
   APPSYNC_ENDPOINT=your_appsync_endpoint
   APPSYNC_API_KEY=your_appsync_api_key
   GRAPHQL_ENDPOINT=your_graphql_endpoint
   GRAPHQL_API_KEY=your_graphql_api_key
   REVENUECAT_API_KEY_IOS=your_revenuecat_ios_key
   REVENUECAT_API_KEY_ANDROID=your_revenuecat_android_key
   ```

4. **Set up AWS Amplify backend**
   - Ensure your Amplify backend is configured with the correct GraphQL schema
   - Run `amplify pull` to sync backend configuration to your local project
   - Verify your AppSync endpoint and API key are correct

5. **Configure Apple Sign In**
   - Set up Sign in with Apple in your Apple Developer account
   - Add the `.p8` authentication key file to `config/ios/`
   - Update the bundle identifier in `app.config.js` to match your Apple Developer account

6. **Configure Expo**
   - Update `app.config.js` with your app details (name, slug, bundle identifier)
   - Verify all environment variables are accessible via `Constants.expoConfig.extra`

### Running in Development *CURRENTLY THIS APP ONLY WORKS ON IOS*

```bash
# Start the Expo development server
npx expo start --tunnel -c

```

Then choose your platform:
- Press `i` to open in iOS simulator (requires Xcode on macOS)
- Press `a` to open in Android emulator (requires Android Studio)
- Scan the QR code with the Expo Go app on a physical device

### Platform-Specific Commands

```bash
# Run on iOS
npm run ios
# or
expo run:ios

# Run on Android
npm run android
# or
expo run:android

# Prebuild native projects (generates ios/ and android/ folders)
npm run prebuild
```

### EAS Building

For production builds, use EAS Build (Expo Application Services):

```bash
#dev build
eas build --platform ios --profile development

# Preview Build
eas build --platform ios --profile preview

# Production Build
eas build --platform ios --profile production
```

For iOS development builds:
```bash
npm run build:ios
```

## Tech Stack

- **React Native** 0.79.6 with **Expo SDK** 53
- **React Navigation** for navigation (Stack & Bottom Tabs)
- **AWS Amplify** with AppSync GraphQL API
- **AsyncStorage** for local storage
- **RevenueCat** for subscription management
- **React Context API** for state management
- **react-native-gifted-charts** for data visualization
- **fatsecret** for food database API
- **Open AI** for AI nutritional value generation

## License


