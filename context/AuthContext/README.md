# Authentication System Documentation

## Overview
The authentication system is built using AWS Amplify v6 with Cognito user pools. It provides email/password authentication with a clean, centralized architecture and simplified user flows.

## File Structure

```
context/AuthContext/
├── README.md                 # This documentation
├── AuthContext.js            # Main authentication context provider
├── index.js                  # Exports for easy importing
├── standardAuth.js           # Email/password authentication functions
├── userManagement.js         # User management operations (logout, password reset, etc.)
└── testAuth.js              # Development/testing authentication helpers
```

## Core Components

### 1. AuthContext.js
**Purpose**: Main authentication context provider that manages global auth state.

**Key Features**:
- Manages `user`, `loading`, `isAuthenticated` states
- Provides authentication methods (`signin`, `signup`, `logout`)
- Handles automatic session restoration
- Integrates with dataService for user data management

**State Management**:
```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [isAuthenticated, setIsAuthenticated] = useState(false);
```

**Key Methods**:
- `checkAuthState()`: Checks for existing user session
- `signin(email, password)`: Authenticates user with email/password
- `signup(email, password)`: Creates new user account
- `logout()`: Signs out user and clears data

### 2. standardAuth.js
**Purpose**: Handles email/password authentication operations.

**Key Functions**:
- `signin(email, password)`: Authenticates user
- `signup(email, password)`: Creates new account
- `confirmSignup(email, code)`: Confirms email verification
- `resendConfirmationCode(email)`: Resends verification code

**Error Handling**: Comprehensive error handling for all Cognito error types with user-friendly messages.

### 3. userManagement.js
**Purpose**: User account management operations.

**Key Functions**:
- `logoutCognito()`: Signs out from AWS Cognito
- `resetPassword(email)`: Initiates password reset
- `confirmPasswordReset(email, code, newPassword)`: Confirms password reset
- `updatePassword(oldPassword, newPassword)`: Updates user password

### 4. testAuth.js
**Purpose**: Development and testing authentication helpers.

**Key Functions**:
- `devSignIn()`: Quick development sign-in
- `clearAuthData()`: Clears all authentication data for testing
- `clearUserData()`: Clears user-specific data
- `resetOnboarding()`: Resets onboarding status for testing

## Authentication Flow

### New User Registration
1. **Welcome Screen**: User sees app introduction with "Get Started" and "Already have account" options
2. **Onboarding**: User goes through 4 onboarding screens to learn about the app
3. **Signup**: On the final onboarding screen, user creates account with email/password
4. **Email Confirmation**: User receives verification code via email
5. **Confirm Signup**: User enters code to confirm email
6. **Auto-login**: User automatically signed in after confirmation
7. **Main App**: User directed to main application

### Existing User Login
1. **Welcome Screen**: User clicks "Already have account? Login"
2. **Login**: User enters email/password → `signin()` called
3. **Session Check**: `checkAuthState()` verifies existing session
4. **Main App**: User directed to main application

### Session Management
- **Automatic Restoration**: App checks for existing session on startup
- **Data Integration**: User data automatically set in dataService
- **State Synchronization**: Auth state synchronized across all components

## Navigation Flow

### Three Main User Flows

#### 1. New User Flow
```
Welcome → Onboarding → Signup → Confirm → Main App
```

#### 2. Existing User Flow
```
Welcome → Login → Main App
```

#### 3. Authenticated User (App Reload)
```
Authenticated → Main App
```

### Complete Flow Tree
```
App Startup
    │
    ▼
LoadingScreen
    │
    ▼
Auth Check
    │
    ├── NOT AUTHENTICATED
    │   │
    │   ├── Welcome Screen
    │   │   ├── "Get Started" → Onboarding → Signup → Confirm → Main App
    │   │   └── "Already have account" → Login → Main App
    │   │
    │   └── Onboarding Flow
    │       ├── Onboarding1
    │       ├── Onboarding2
    │       ├── Onboarding3
    │       └── Onboarding4 (Signup Form)
    │
    └── AUTHENTICATED
        │
        └── Main App (direct)
```

### User Scenarios

#### New User
```
Welcome → Onboarding → Signup → Confirm → [Auto-Login] → Main App
```

#### Existing User Login
```
Welcome → Login → Main App
```

#### Returning User (App Reload)
```
App Reload → Main App
```

### Key Points
- **Welcome Screen** → First screen for all users
- **Get Started** → Takes users through onboarding then signup
- **Already have account** → Takes users directly to login
- **Onboarding** → Only appears for new users who click "Get Started"
- **Signup** → Integrated into the final onboarding screen
- **Auto-login** → Happens after email confirmation

## Integration with Data Service

The authentication system integrates with `utils/dataService.js` for:
- **User Data Isolation**: Each user's data is stored with user-specific prefixes
- **Session Persistence**: Maintains user state across app sessions

## Error Handling

### Cognito Error Types Handled
- `UserNotFoundException`: No account found
- `NotAuthorizedException`: Incorrect credentials
- `UserNotConfirmedException`: Email not confirmed
- `UsernameExistsException`: Account already exists
- `InvalidPasswordException`: Password doesn't meet requirements
- `TooManyRequestsException`: Rate limiting
- `LimitExceededException`: Request limits exceeded

### User-Friendly Error Messages
All errors are converted to user-friendly messages and returned in a consistent format:
```javascript
{
  success: false,
  error: "User-friendly error message"
}
```

## Usage Examples

### Basic Authentication
```javascript
import { useAuth } from '../context/AuthContext';

function LoginComponent() {
  const { signin, loading } = useAuth();
  
  const handleLogin = async () => {
    const result = await signin(email, password);
    if (result.success) {
      // User signed in successfully
    } else {
      // Handle error
      console.error(result.error);
    }
  };
}
```

### Check Authentication Status
```javascript
import { useAuth } from '../context/AuthContext';

function AppComponent() {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? <MainApp /> : <AuthScreens />;
}
```

### User Management
```javascript
import { useAuth } from '../context/AuthContext';

function SettingsComponent() {
  const { logout, resetPassword } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    // User will be redirected to welcome screen
  };
}
```

## Configuration

### AWS Amplify Configuration
The authentication system requires proper AWS Amplify configuration in `database/amplify.js`:

```javascript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'your-user-pool-id',
      userPoolClientId: 'your-client-id',
      signUpVerificationMethod: 'code',
    }
  }
});
```

### Environment Variables
Required environment variables:
- `COGNITO_USER_POOL_ID`: AWS Cognito User Pool ID
- `COGNITO_USER_POOL_CLIENT_ID`: AWS Cognito User Pool Client ID

## Security Considerations

1. **Password Requirements**: Enforced by AWS Cognito
2. **Rate Limiting**: Handled by AWS Cognito
3. **Session Management**: Secure token-based sessions
4. **Data Isolation**: User-specific data prefixes prevent data leakage
5. **Error Handling**: No sensitive information exposed in error messages

## Testing

### Development Testing
Use the test authentication helpers in `testAuth.js` for development:
```javascript
import { devSignIn, clearAuthData } from '../context/AuthContext';

// Quick development sign-in
await devSignIn();

// Clear all data for testing
await clearAuthData();
```

### Error Testing
Test various error scenarios:
- Invalid credentials
- Unconfirmed accounts
- Network errors
- Rate limiting

## Troubleshooting

### Common Issues

1. **"Couldn't find a navigation object"**
   - Ensure `useNavigation()` is only used inside navigation components
   - Use `initialRouteName` for initial navigation instead

2. **Authentication state not persisting**
   - Check AWS Amplify configuration
   - Verify Cognito user pool settings

3. **Welcome screen not showing**
   - Ensure `WelcomeScreen` is imported and included in navigation stack
   - Check that `initialRouteName` is set correctly

### Debug Logging
The system includes comprehensive debug logging. Enable by checking console logs for:
- `🔐 AuthContext:` - Authentication operations
- `✅` - Successful operations
- `❌` - Error conditions

## Future Enhancements

1. **Multi-Factor Authentication (MFA)**
2. **Social Authentication** (Google, Apple, etc.)
3. **Biometric Authentication**
4. **Advanced Session Management**
5. **Offline Authentication Support** 