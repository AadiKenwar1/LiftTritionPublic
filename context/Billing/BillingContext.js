import React, {createContext, useCallback, useContext, useEffect, useMemo, useState, useRef} from "react";
import Purchases from "react-native-purchases";
import NetInfo from '@react-native-community/netinfo';
import { useAuthContext } from "../Auth/AuthContext";

const BillingContext = createContext(undefined);

export function BillingProvider({ children }) {
  //Auth context to get user and auth loading state
  const { user, loading: authLoading } = useAuthContext();
  //State variables for offerings, customer info, loading, loaded, and error
  const [offerings, setOfferings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Combined loading state - true if either auth or billing is loading
  const loading = authLoading || billingLoading;

  // Refs to track state without causing re-renders (prevents infinite loops, memory leaks, race conditions, and other issues)
  const isInitializingRef = useRef(false); //Prevents duplicate initialization calls
  const isMountedRef = useRef(true); //Prevents memory leaks (Doesnt try to update state if BillingContext is not mounted)
  const currentUserIdRef = useRef(null); //Prevents stale updates by stopping async operations if user changes
  const reconnectTimeoutRef = useRef(null); //Prevents rapid reconnects (debounced to prevent flooding)
  const initializationTimeoutRef = useRef(null); //Prevents stuck initialization

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    // Cleanup function (I didnt even know this was a thing)to set mounted state to false and clear timeouts
    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, []);

  // Load billing data when user changes or when component mounts
  useEffect(() => {
    let listener;
    let netInfoListener;

    // Load billing data from RevenueCat
    async function loadBillingData(userId) {
      if (authLoading) return;
      if (currentUserIdRef.current !== userId) {
        return;
      }

      try {
        if (!isMountedRef.current) return;
        setBillingLoading(true);
        setError(null);

        const [fetchedOfferings, fetchedCustomerInfo] = await Promise.all([
          Purchases.getOfferings(),
          Purchases.getCustomerInfo(), // RevenueCat handles offline caching internally
        ]);

        // Double-check we're still mounted and user hasn't changed (prevents stale updates)
        if (!isMountedRef.current || currentUserIdRef.current !== userId) {
          return;
        }
        setOfferings(fetchedOfferings);
        setCustomerInfo(fetchedCustomerInfo);
        setLoaded(true);
      } catch (err) {
        console.warn("[Billing] Failed to load billing data", err);
        if (isMountedRef.current && currentUserIdRef.current === userId) {
          setError(err);
          setLoaded(true); // Still mark as loaded even on error
        }
      } finally {
        if (isMountedRef.current && currentUserIdRef.current === userId) {
          setBillingLoading(false);
        }
      }
    }

    // Initialize billing by logging in/out RevenueCat user and loading billing data
    async function initializeBilling(userId) {
      // Step 1: Login/Logout RevenueCat user FIRST
      if (userId) {
        if (!isMountedRef.current || currentUserIdRef.current !== userId) {
          return;
        }
        setLoaded(false);

        await Purchases.logIn(userId).catch((error) => {
          console.warn("[RevenueCat] Failed to log in user", error);
        });

        // Check again after async operation
        if (!isMountedRef.current || currentUserIdRef.current !== userId) {
          return;
        }

        // Step 2: Then load billing data
        await loadBillingData(userId);
      } else {
        await Purchases.logOut().catch((error) => {
          console.warn("[RevenueCat] Failed to log out user", error);
        });

        if (isMountedRef.current && currentUserIdRef.current === userId) {
          setOfferings(null);
          setCustomerInfo(null);
          setBillingLoading(false);
          setLoaded(false);
        }
      }
    }

    // SINGLE ENTRY POINT: All initialization requests go through here (prevents duplicate or infinite initialization calls)
    async function requestInitialization() {
      const userId = user?.appleUserId;
      
      // If user changed, cancel previous initialization
      if (isInitializingRef.current && currentUserIdRef.current !== userId) {
        console.log("[Billing] User changed, canceling previous initialization");
        isInitializingRef.current = false;
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
        }
      }

      // Guard against concurrent calls for the same user
      if (isInitializingRef.current) {
        console.log("[Billing] Initialization already in progress, skipping duplicate call");
        return;
      }

      // Track current user to prevent stale updates
      currentUserIdRef.current = userId;

      // Set timeout to prevent stuck initialization (30 seconds)
      initializationTimeoutRef.current = setTimeout(() => {
        if (isInitializingRef.current) {
          console.warn("[Billing] Initialization timeout, resetting");
          isInitializingRef.current = false;
        }
      }, 30000);

      try {
        isInitializingRef.current = true;
        await initializeBilling(userId);
      } catch (err) {
        console.error("[Billing] Initialization error", err);
        if (isMountedRef.current && currentUserIdRef.current === userId) {
          setError(err);
        }
      } finally {
        isInitializingRef.current = false;
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
          initializationTimeoutRef.current = null;
        }
      }
    }

    // Only initialize if auth is not loading
    if (!authLoading) {
      requestInitialization();
    } else {
      // Keep loading state while auth is loading (prevents race conditions)
      setBillingLoading(true);
    }

    // Network reconnect - debounced to prevent flooding (prevents rapid reconnects)
    netInfoListener = NetInfo.addEventListener(state => {
      if (state.isConnected && user?.appleUserId && !authLoading) {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Debounce rapid reconnects - wait 1.5 seconds for network to stabilize
        reconnectTimeoutRef.current = setTimeout(() => {
          // Double-check network is still connected and user is still the same
          NetInfo.fetch().then(netState => {
            if (netState.isConnected && currentUserIdRef.current === user?.appleUserId && !authLoading) {
              requestInitialization();
            }
          });
        }, 1500);
      }
    });

    // RevenueCat's subscription update listener - safe state update
    listener = Purchases.addCustomerInfoUpdateListener((info) => {
      if (isMountedRef.current && currentUserIdRef.current === user?.appleUserId) {
        setCustomerInfo(info);
      }
    });

    // Cleanup function to remove listeners and clear timeouts
    return () => {
      listener?.remove?.();
      netInfoListener?.();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    }
  }, [authLoading, user?.appleUserId]);

  // Purchase a package
  const purchasePackage = useCallback(async (pkg) => {
    try {
      if (!isMountedRef.current) return;
      setError(null);
      const result = await Purchases.purchasePackage(pkg);
      
      // Immediately update customer info to reflect purchase
      if (isMountedRef.current && currentUserIdRef.current === user?.appleUserId) {
        setCustomerInfo(result.customerInfo);
      }
      
      // Force a refresh to ensure we have the latest data
      // This helps with the "sometimes works, sometimes doesn't" issue
      try {
        const freshInfo = await Purchases.getCustomerInfo();
        if (isMountedRef.current && currentUserIdRef.current === user?.appleUserId) {
          setCustomerInfo(freshInfo);
        }
      } catch (refreshErr) {
        console.warn("[Billing] Failed to refresh after purchase", refreshErr);
        // Don't throw - we already have the purchase result
      }
      
      return result.customerInfo;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
      }
      throw err;
    }
  }, [user?.appleUserId]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      setError(null);
      const info = await Purchases.restorePurchases();
      
      if (isMountedRef.current && currentUserIdRef.current === user?.appleUserId) {
        setCustomerInfo(info);
      }
      
      return info;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
      }
      throw err;
    }
  }, [user?.appleUserId]);

  // Refresh subscription
  const refreshSubscription = useCallback(async () => {
    if (!user?.appleUserId) {
      throw new Error("No user logged in");
    }
    
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error("No internet connection. Please connect to the internet to refresh your subscription.");
    }
    
    try {
      if (!isMountedRef.current) return;
      setError(null);
      setBillingLoading(true);
      
      // Step 1: Ensure user is logged in to RevenueCat
      await Purchases.logIn(user.appleUserId);
      
      // Step 2: Get fresh customer info
      const info = await Purchases.getCustomerInfo();
      
      if (isMountedRef.current && currentUserIdRef.current === user.appleUserId) {
        setCustomerInfo(info);
        setLoaded(true);
      }
      
      return info;
    } catch (err) {
      console.warn("[Billing] Failed to refresh subscription", err);
      if (isMountedRef.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setBillingLoading(false);
      }
    }
  }, [user?.appleUserId]);

  // Check if user has premium
  const hasPremium = useMemo(() => {
    const entitlementId = "LiftTrition Pro";
    const activeEntitlements = customerInfo?.entitlements?.active ?? {};
    
    // Only log in development to reduce noise
    if (__DEV__) {
      console.log("[Billing] Active entitlements:", activeEntitlements);
      console.log("[Billing] Has premium:", Boolean(activeEntitlements[entitlementId]));
    }
    
    return Boolean(activeEntitlements[entitlementId]);
  }, [customerInfo]);

  //Exports
  const value = useMemo(
    () => ({
      offerings,
      customerInfo,
      loading,
      loaded,
      error,
      purchasePackage,
      restorePurchases,
      refreshSubscription,
      hasPremium,
    }),
    [offerings, customerInfo, loading, loaded, error, purchasePackage, restorePurchases, refreshSubscription, hasPremium]
  );

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error("useBilling must be used within a BillingProvider");
  }
  return context;
}

