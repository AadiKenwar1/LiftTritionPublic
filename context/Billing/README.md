# BillingContext

The BillingContext manages all subscription and billing functionality using RevenueCat. It handles user authentication with RevenueCat, loading subscription data, purchasing subscriptions, and checking premium status.

## Usage
```javascript
import { useBilling } from './context/Billing/BillingContext';

function MyComponent() {
  const { hasPremium, purchasePackage, offerings } = useBilling();
}
```

## Exported Properties and Functions

### State Properties

- **`offerings`** (Object | null) - Available subscription packages from RevenueCat. Contains pricing and package information. Format: `offerings.current.availablePackages[]`. Used to display subscription options to users.

- **`customerInfo`** (Object | null) - Current customer information from RevenueCat including active entitlements, subscriptions, and purchase history. Used internally to calculate `hasPremium` status.

- **`loading`** (Boolean) - Combined loading state. Returns `true` if either authentication is loading OR billing data is being fetched. Used to show loading indicators in UI.

- **`loaded`** (Boolean) - Indicates whether billing data has finished loading for the first time. Used to prevent rendering components before billing data is available.

- **`error`** (Error | null) - Error object if any billing operation fails. Used to display error messages to users.

### Functions

- **`purchasePackage(pkg)`** - Purchases a subscription package. 
  - **Parameters:** `pkg` - Package object from `offerings.current.availablePackages[]`
  - **Returns:** Promise that resolves to customerInfo object
  - **Usage:** Called when user taps "Subscribe" button. Automatically updates customerInfo after purchase and forces a refresh to ensure data is up-to-date.

- **`restorePurchases()`** - Restores previous purchases on the user's account.
  - **Returns:** Promise that resolves to customerInfo object
  - **Usage:** Called when user taps "Restore Purchases" button. Useful when user reinstalls app or switches devices.

- **`refreshSubscription()`** - Manually refreshes subscription status from RevenueCat servers.
  - **Returns:** Promise that resolves to customerInfo object
  - **Throws:** Error if no user is logged in or no internet connection
  - **Usage:** Called when user manually requests subscription refresh. Ensures user is logged in to RevenueCat before fetching latest data.

- **`hasPremium`** (Boolean) - Computed value indicating if user has active "LiftTrition Pro" subscription.
  - **Returns:** `true` if user has active premium subscription, `false` otherwise
  - **Usage:** Most commonly used export. Controls access to premium features (AI photo analysis, barcode lookup, etc.)

## Internal Logic and Architecture

### State Management

The context uses React state for reactive values and `useRef` for values that need to persist across renders without causing re-renders.

**State Variables:**
- `offerings` - Subscription packages from RevenueCat
- `customerInfo` - Customer subscription data
- `billingLoading` - Tracks if billing operations are in progress
- `loaded` - Tracks if initial load is complete
- `error` - Stores any errors from billing operations

**Ref Variables (Why `useRef`?):**
Refs are used for values that need to be checked in async callbacks without triggering re-renders:

- **`isMountedRef`** - Tracks if component is still mounted. Prevents memory leaks by stopping state updates after component unmounts.
- **`currentUserIdRef`** - Stores current user ID. Prevents stale updates by ensuring async operations only update state if user hasn't changed.
- **`isInitializingRef`** - Prevents duplicate initialization calls from running concurrently.
- **`reconnectTimeoutRef`** - Stores timeout ID for network reconnect debouncing.
- **`initializationTimeoutRef`** - Stores timeout ID to prevent stuck initialization (30 second timeout).

### Initialization Flow

When the component mounts or user changes, billing initialization happens automatically:

1. **Auth Check** - Waits for authentication to finish loading
2. **Single Entry Point** - `requestInitialization()` ensures only one initialization runs at a time
3. **User Login** - Logs user into RevenueCat with their Apple User ID
4. **Data Fetch** - Fetches offerings and customer info in parallel
5. **State Update** - Updates state only if component still mounted and user hasn't changed

### Memory Leak Prevention

The context uses multiple strategies to prevent memory leaks:

**1. Mounted Check (`isMountedRef`)**
```javascript
if (!isMountedRef.current) return; // Don't update state if unmounted
setCustomerInfo(info);
```

**2. Cleanup Functions**
All `useEffect` hooks return cleanup functions that:
- Remove event listeners
- Clear timeouts
- Reset ref values

**3. User Change Checks (`currentUserIdRef`)**
After async operations, checks if user is still the same:
```javascript
if (currentUserIdRef.current !== userId) return; // User changed, don't update
setCustomerInfo(info);
```

### Stale Update Prevention

To prevent showing data for the wrong user, the context:
1. Stores current user ID in `currentUserIdRef` before starting async operations
2. Checks user ID matches after async operations complete
3. Only updates state if user ID still matches

Example:
```javascript
// Before async operation
currentUserIdRef.current = userId;

// After async operation
if (currentUserIdRef.current !== userId) {
  return; // User changed, ignore this result
}
setCustomerInfo(info); // Safe to update
```

### Race Condition Prevention

**Concurrent Initialization Guard:**
- `isInitializingRef` prevents multiple initialization calls from running simultaneously
- If initialization already in progress, subsequent calls are skipped

**Timeout Protection:**
- 30 second timeout prevents initialization from getting stuck forever
- If timeout fires, `isInitializingRef` is reset to allow retry

### Network Reconnection Handling

When network reconnects:
1. Listener detects network state change
2. Waits 1.5 seconds (debounce) for network to stabilize
3. Verifies network is still connected and user hasn't changed
4. Triggers re-initialization to refresh subscription data

### Automatic Updates

The context automatically updates when:
- **User logs in/out** - Triggers initialization to load/clear billing data
- **Network reconnects** - Refreshes subscription data
- **RevenueCat events** - Listener updates customerInfo when subscriptions change

## Error Handling

All billing operations have try-catch blocks that:
1. Log errors to console
2. Update error state (if component still mounted)
3. Re-throw errors so calling code can handle them

## Dependencies

- **RevenueCat SDK** (`react-native-purchases`) - Handles all subscription purchases and management
- **NetInfo** - Monitors network connectivity for reconnect handling
- **AuthContext** - Provides user information and authentication state

## Usage Examples

### Check Premium Status
```javascript
const { hasPremium } = useBilling();

if (hasPremium) {
  // Show premium features
} else {
  // Show upgrade prompt
}
```

### Purchase Subscription
```javascript
const { purchasePackage, offerings } = useBilling();

const handleSubscribe = async () => {
  const package = offerings?.current?.availablePackages?.[0];
  if (!package) return;
  
  try {
    await purchasePackage(package);
    // Purchase successful
  } catch (err) {
    if (err.userCancelled) {
      // User cancelled, do nothing
    } else {
      // Show error message
    }
  }
};
```

### Restore Purchases
```javascript
const { restorePurchases } = useBilling();

const handleRestore = async () => {
  try {
    const info = await restorePurchases();
    // Check if restoration found active subscriptions
    const hasActiveSubs = Object.keys(info.entitlements.active).length > 0;
  } catch (err) {
    // Handle error
  }
};
```

### Show Loading State
```javascript
const { loading, loaded } = useBilling();

if (!loaded) {
  return <LoadingScreen />;
}

if (loading) {
  return <ActivityIndicator />;
}
```

## Important Notes

- Always check `isMountedRef.current` before updating state in async callbacks
- Always check `currentUserIdRef.current === userId` before updating state after async operations
- The context automatically handles user login/logout with RevenueCat
- Premium status is computed from `customerInfo`, so changes to customerInfo automatically update `hasPremium`
- Network reconnection triggers automatic refresh (debounced by 1.5 seconds)
- All timeouts and listeners are properly cleaned up on unmount

