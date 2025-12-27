# Auth Context

This folder contains all authentication-related functionality for the LiftTrition app, including Apple Sign-In, session management, user data caching, and database operations.

## 📁 File Structure

```
context/Auth/
├── AuthContext.js          # Main authentication context and provider
├── appleAuth.js            # Apple Sign-In implementation
├── sessionStorage.js       # Session and user data caching utilities
├── databaseQueries.js      # GraphQL database operations
└── amplifyConfig.js        # AWS Amplify configuration
```

## 🔑 Key Components

### `AuthContext.js`
Main authentication context that manages:
- User authentication state
- Sign-in/Sign-out flow
- Account deletion
- Onboarding completion
- Data backup and restore operations

**Exported Functions:**
- `useAuth()` / `useAuthContext()` - Hook to access auth context
- `AuthProvider` - Context provider component

**Context Value:**
- `user` - Current authenticated user object
- `loading` - Loading state
- `isAuthenticated` - Authentication status
- `signInWithApple()` - Sign in with Apple ID
- `signOut()` - Sign out and backup data
- `deleteAccount()` - Delete account and all data
- `markOnboardingCompleted()` - Mark onboarding as complete

### `appleAuth.js`
Handles Apple Sign-In authentication flow.

**Functions:**
- `signInWithApple()` - Initiates Apple Sign-In
- `extractUserData(credential)` - Extracts user data from Apple credential

### `sessionStorage.js`
Manages session persistence and user data caching for offline access.

**Functions:**
- `storeAppleUserSession(userData)` - Store user session
- `getAppleUserSession()` - Retrieve user session
- `clearAppleUserSession()` - Clear user session
- `cacheUserData(userData)` - Cache full user object for offline access
- `getCachedUserData()` - Get cached user data
- `clearCachedUserData()` - Clear cached user data

### `databaseQueries.js`
All GraphQL database operations for user data.

**User Management:**
- `checkAppleUserExists(appleUserId)` - Check if user exists
- `createDefaultSettings(appleUserId, email, name)` - Create new user settings
- `loadAppleUserData(appleUserId)` - Load user settings
- `deleteAppleUserData(appleUserId)` - Delete all user data

**Data Backup/Restore:**
- `saveNutritionToDatabase(userId, nutritionData)` - Backup nutrition data
- `saveWorkoutDataToDatabase(userId, workouts, exercises, logs, userExercises)` - Backup workout data
- `saveWeightProgressToDatabase(userId, weightProgress)` - Backup weight progress
- `loadNutritionFromDatabase(userId)` - Restore nutrition data
- `loadWorkoutDataFromDatabase(userId)` - Restore workout data
- `loadWeightProgressFromDatabase(userId)` - Restore weight progress

### `amplifyConfig.js`
Configures AWS Amplify for GraphQL API access.

## 🔄 Authentication Flow

### Sign In Flow
1. User clicks "Sign in with Apple"
2. `signInWithApple()` initiates Apple authentication
3. Extract user data from Apple credential
4. Check network connectivity (required)
5. Check if user exists in database
6. **If user exists:**
   - Load user settings from database
   - Restore nutrition/workout/weight data from database → AsyncStorage
   - Cache user data for offline access
7. **If new user:**
   - Create default settings
   - Cache user data for offline access
8. Store session and set authenticated user

### App Startup Flow
1. `checkAuthState()` runs on app startup
2. Check for existing session
3. **If session exists:**
   - Load user from cache (works offline)
   - All contexts load data from AsyncStorage
4. **If no session:**
   - Reset auth state (user not signed in)

### Sign Out Flow
1. Check network connectivity (required)
2. Get all data from AsyncStorage (nutrition, workouts, weightProgress)
3. Backup all data to database
4. Clear cached user data
5. Clear all AsyncStorage
6. Clear session and reset auth state

### Account Deletion Flow
1. Check network connectivity (required)
2. Delete all user data from database:
   - ExerciseLogs
   - Exercises
   - Workouts
   - Nutrition entries
   - UserExercises
   - Settings
3. Clear cached user data
4. Clear all AsyncStorage
5. Clear session and reset auth state

## 💾 Data Management

### Offline Support
- **User Data Caching**: Full user object is cached in AsyncStorage for offline access
- **Data Persistence**: All user data (nutrition, workouts, weightProgress) is stored in AsyncStorage
- **Offline Usage**: App works offline after initial sign-in (data loads from AsyncStorage)
- **Online Requirements**: 
  - Sign-in requires internet
  - Sign-out requires internet (to backup data)
  - Account deletion requires internet
  - Onboarding requires internet

### Data Backup Strategy
- **On Sign-Out**: All AsyncStorage data is backed up to database
- **On Sign-In**: Data is restored from database to AsyncStorage
- **Onboarding**: Data is saved to database when onboarding completes

## 🔐 Security & Network

### Network Requirements
- **Sign-In**: Requires internet (to check/create user, restore data)
- **Sign-Out**: Requires internet (to backup data)
- **Account Deletion**: Requires internet (to delete from database)
- **Onboarding**: Requires internet (to save settings)
- **App Usage**: Works offline (loads from AsyncStorage)

### Session Management
- Session persists across app restarts
- Session is stored in AsyncStorage
- User data is cached for offline access
- Both are cleared on sign-out or account deletion

## 📝 Usage Examples

### Using Auth Context
```javascript
import { useAuth } from '../context/Auth/AuthContext';

function MyComponent() {
  const { user, loading, isAuthenticated, signInWithApple, signOut } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <SignInScreen />;
  
  return <AppContent user={user} />;
}
```

### Sign In
```javascript
const result = await signInWithApple();
if (result.success) {
  // User signed in successfully
} else {
  // Handle error
  console.error(result.error);
}
```

### Sign Out
```javascript
const result = await signOut();
if (result.success) {
  // User signed out, data backed up
} else {
  // Handle error (e.g., no internet)
  console.error(result.error);
}
```

## 🐛 Error Handling

All functions return objects with `success` and `error` properties:
```javascript
{
  success: true/false,
  error: 'Error message' (if success is false),
  code: 'ERROR_CODE' (optional)
}
```

Common error codes:
- `NO_INTERNET` - Network connectivity required
- `INVALID_USER_DATA` - Missing required user data
- `UNKNOWN_ERROR` - Unexpected error

## 🔄 Data Flow Diagram

```
Sign In:
Apple Auth → Extract Data → Check User Exists → Load/Create Settings
  → Restore Data from DB → AsyncStorage → Cache User Data → Set User

App Startup:
Check Session → Load from Cache → Load Data from AsyncStorage → Set User

Sign Out:
Get Data from AsyncStorage → Backup to DB → Clear Cache → Clear AsyncStorage → Clear Session

Account Deletion:
Delete from DB → Clear Cache → Clear AsyncStorage → Clear Session
```

## 📌 Important Notes

1. **Offline First**: After initial sign-in, app works offline using AsyncStorage
2. **Database as Backup**: Database is used for backup/restore, not primary storage
3. **Cache Strategy**: User data is cached for offline access on app startup
4. **Network Checks**: Critical operations (sign-in, sign-out, deletion) require internet
5. **Data Consistency**: AsyncStorage is source of truth during app usage; database is backup

