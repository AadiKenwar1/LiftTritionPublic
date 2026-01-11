import React, {createContext, useCallback, useContext, useEffect, useMemo, useState, useRef} from "react";
import Purchases from "react-native-purchases";
import NetInfo from '@react-native-community/netinfo';
import { useAuthContext } from "../Auth/AuthContext";

const BillingContext = createContext(undefined);

export function BillingProvider({ children }) {
  const { user, loading: authLoading } = useAuthContext();
  
  const [offerings, setOfferings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const loading = authLoading || billingLoading;
  const isMountedRef = useRef(true);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let listener;
    let netInfoListener;

    async function initializeBilling() {
      if (authLoading || !isMountedRef.current) return;

      const userId = user?.appleUserId;

      // 1. Check if user is logged in
      if (!userId) {
        await Purchases.logOut().catch(() => {});
        if (isMountedRef.current) {
          setOfferings(null);
          setCustomerInfo(null);
          setBillingLoading(false);
          setLoaded(true);
        }
        return;
      }

      // 2. Check RevenueCat cache first (works offline)
      try {
        const cachedInfo = await Purchases.getCustomerInfo();
        if (cachedInfo && isMountedRef.current) {
          setCustomerInfo(cachedInfo);
          setLoaded(true);
        }
      } catch (cacheErr) {
        console.warn("[Billing] Failed to get cached data", cacheErr);
      }

      // 3. If online, refresh from API (with simple inline retry)
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        let freshOfferings, freshInfo;
        let success = false;

        for (let i = 0; i < 3; i++) {
          try {
            [freshOfferings, freshInfo] = await Promise.all([
              Purchases.getOfferings(),
              Purchases.getCustomerInfo(),
            ]);
            success = true;
            break;
          } catch (err) {
            if (i === 2) {
              // Last attempt failed
              console.warn("[Billing] Failed to refresh from API after 3 attempts", err);
              if (isMountedRef.current) {
                setError(err);
              }
            } else {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
          }
        }

        if (success && isMountedRef.current && userId === user?.appleUserId) {
          setOfferings(freshOfferings);
          setCustomerInfo(freshInfo);
          setLoaded(true);
        }
      }

      if (isMountedRef.current) {
        setBillingLoading(false);
      }
    }

    if (!authLoading) {
      initializeBilling();
    } else {
      setBillingLoading(true);
    }

    // Network reconnect - simple refresh with retry
    netInfoListener = NetInfo.addEventListener(state => {
      if (state.isConnected && user?.appleUserId && !authLoading) {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(async () => {
          const netState = await NetInfo.fetch();
          if (netState.isConnected && user?.appleUserId && !authLoading && isMountedRef.current) {
            let freshInfo;
            let success = false;

            for (let i = 0; i < 3; i++) {
              try {
                freshInfo = await Purchases.getCustomerInfo();
                success = true;
                break;
              } catch (err) {
                if (i === 2) {
                  console.warn("[Billing] Failed to refresh after reconnect", err);
                } else {
                  await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
              }
            }

            if (success && isMountedRef.current && user?.appleUserId) {
              setCustomerInfo(freshInfo);
            }
          }
        }, 1500);
      }
    });

    // RevenueCat subscription update listener
    listener = Purchases.addCustomerInfoUpdateListener((info) => {
      if (isMountedRef.current && user?.appleUserId) {
        setCustomerInfo(info);
      }
    });

    return () => {
      listener?.remove?.();
      netInfoListener?.();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [authLoading, user?.appleUserId]);

  const purchasePackage = useCallback(async (pkg) => {
    try {
      if (!isMountedRef.current) return;
      setError(null);
      const result = await Purchases.purchasePackage(pkg);
      
      if (isMountedRef.current && user?.appleUserId) {
        setCustomerInfo(result.customerInfo);
      }
      
      try {
        const freshInfo = await Purchases.getCustomerInfo();
        if (isMountedRef.current && user?.appleUserId) {
          setCustomerInfo(freshInfo);
        }
      } catch (refreshErr) {
        console.warn("[Billing] Failed to refresh after purchase", refreshErr);
      }
      
      return result.customerInfo;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
      }
      throw err;
    }
  }, [user?.appleUserId]);

  const restorePurchases = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      setError(null);
      const info = await Purchases.restorePurchases();
      
      if (isMountedRef.current && user?.appleUserId) {
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

  const refreshSubscription = useCallback(async () => {
    if (!user?.appleUserId) {
      throw new Error("No user logged in");
    }
    
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error("No internet connection. Please connect to the internet to refresh your subscription.");
    }
    
    try {
      if (!isMountedRef.current) return;
      setError(null);
      setBillingLoading(true);
      
      let info;
      let success = false;

      for (let i = 0; i < 3; i++) {
        try {
          info = await Purchases.getCustomerInfo();
          success = true;
          break;
        } catch (err) {
          if (i === 2) {
            throw err;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
      
      if (success && isMountedRef.current && user?.appleUserId) {
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

  const hasPremium = useMemo(() => {
    const entitlementId = "LiftTrition Pro";
    const activeEntitlements = customerInfo?.entitlements?.active ?? {};
    
    
    return Boolean(activeEntitlements[entitlementId]);
  }, [customerInfo]);

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