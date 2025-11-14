import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Purchases from "react-native-purchases";
import { useAuthContext } from "../Auth/AuthContext";

const BillingContext = createContext(undefined);

export function BillingProvider({ children }) {
  const { user, loading: authLoading } = useAuthContext();
  const [offerings, setOfferings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let listener;

    async function loadBillingData() {
      if (authLoading) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [fetchedOfferings, fetchedCustomerInfo] = await Promise.all([
          Purchases.getOfferings(),
          Purchases.getCustomerInfo(),
        ]);

        setOfferings(fetchedOfferings);
        setCustomerInfo(fetchedCustomerInfo);
      } catch (err) {
        console.warn("[Billing] Failed to load offerings or customer info", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadBillingData();

    listener = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
    });

    return () => listener?.remove?.();
  }, [authLoading, user?.appleUserId]);

  const purchasePackage = useCallback(async (pkg) => {
    try {
      setError(null);
      const result = await Purchases.purchasePackage(pkg);
      setCustomerInfo(result.customerInfo);
      return result.customerInfo;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      setError(null);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return info;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const hasPremium = useMemo(() => {
    const entitlementId = "LiftTrition Pro";
    const activeEntitlements = customerInfo?.entitlements?.active ?? {};
    console.log("[Billing] Active entitlements:", activeEntitlements);
    console.log("[Billing] Has premium:", Boolean(activeEntitlements[entitlementId]));
    return Boolean(activeEntitlements[entitlementId]);
  }, [customerInfo]);

  const value = useMemo(
    () => ({
      offerings,
      customerInfo,
      loading,
      error,
      purchasePackage,
      restorePurchases,
      hasPremium,
    }),
    [offerings, customerInfo, loading, error, purchasePackage, restorePurchases, hasPremium]
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

