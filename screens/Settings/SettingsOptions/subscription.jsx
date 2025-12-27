import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBilling } from "../../../context/Billing/BillingContext";
import CustomHeader from "../../../components/CustomHeader";

const { width: screenWidth } = Dimensions.get('window');

export default function SubscriptionScreen() {
  const { offerings, loading, error, purchasePackage, restorePurchases, refreshSubscription, hasPremium } = useBilling();
  const [processing, setProcessing] = useState(false);

  const packageToSell = useMemo(
    () => offerings?.current?.availablePackages?.[0] ?? null,
    [offerings]
  );

  const handleSubscribe = async () => {
    if (!packageToSell) {
      Alert.alert("Not available", "Subscription details are still loading.");
      return;
    }

    try {
      setProcessing(true);
      await purchasePackage(packageToSell);
      Alert.alert("Success", "Your subscription is now active.");
    } catch (err) {
      if (err?.userCancelled) return;
      Alert.alert("Purchase failed", err?.message ?? "Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setProcessing(true);
      const info = await restorePurchases();
      const active = info?.entitlements?.active ?? {};
      if (Object.keys(active).length === 0) {
        Alert.alert("Nothing to restore", "No active subscriptions were found on this account.");
      } else {
        Alert.alert("Restored", "Your subscription has been restored.");
      }
    } catch (err) {
      Alert.alert("Restore failed", err?.message ?? "Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setProcessing(true);
      await refreshSubscription();
      Alert.alert("Refreshed", "Your subscription status has been updated.");
    } catch (err) {
      Alert.alert("Refresh failed", err?.message ?? "Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenStore = async () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions";
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert("Unavailable", "Unable to open the store subscription page on this device.");
    }
  };

  const priceString = packageToSell?.product?.priceString ?? "$4.99";

  return (
    <>
      <CustomHeader title="Manage Subscription" showBack />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Upgrade to access AI-powered nutrition insights, barcode lookups, and more.
          </Text>

          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Lift Mode AI</Text>
            <Text style={styles.planPrice}>{priceString} / month</Text>
            <View style={styles.featuresList}>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={18} color="#00B8A9" style={styles.listIcon} />
                <Text style={styles.listText}>AI photo and label analysis</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={18} color="#00B8A9" style={styles.listIcon} />
                <Text style={styles.listText}>Barcode nutrition lookup</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={18} color="#00B8A9" style={styles.listIcon} />
                <Text style={styles.listText}>Priority macro recommendations</Text>
              </View>
            </View>
          </View>

          {hasPremium ? (
            <View style={styles.statusPill}>
              <Ionicons name="checkmark-circle" size={18} color="#4CD964" />
              <Text style={styles.statusText}>Your subscription is active.</Text>
            </View>
          ) : null}

          {loading && !offerings ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#D94CC4" />
              <Text style={styles.loadingText}>Loading subscription details…</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="warning-outline" size={18} color="#FF3B30" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>We couldn't load plans right now.</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, (processing || loading) && styles.disabledButton]}
            onPress={handleSubscribe}
            disabled={processing || loading}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {hasPremium ? "Manage Plan" : "Unlock Lift Mode"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRestore}
            disabled={processing}
          >
            <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, (processing || loading) && styles.disabledButton]}
            onPress={handleRefresh}
            disabled={processing || loading}
          >
            <Text style={styles.secondaryButtonText}>
              {loading ? "Fetching subscriptions..." : "Refresh Subscription"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={handleOpenStore}>
            <Text style={styles.linkButtonText}>
              Open {Platform.OS === "ios" ? "App Store" : "Play Store"} subscription settings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flex: 1,
    backgroundColor: '#242424',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: 'Inter_400Regular',
  },
  planCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignSelf: 'center',
    width: screenWidth - 32,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#00B8A9",
    marginBottom: 20,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  featuresList: {
    marginTop: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  listIcon: {
    marginRight: 12,
  },
  listText: {
    fontSize: 15,
    color: "white",
    fontFamily: 'Inter_500Medium',
  },
  primaryButton: {
    backgroundColor: "#00B8A9",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryButton: {
    borderWidth: 0.3,
    borderColor: "grey",
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: 'Inter_600SemiBold',
  },
  linkButton: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 12,
  },
  linkButtonText: {
    color: "#4FC3F7",
    fontSize: 14,
    textAlign: "center",
    fontFamily: 'Inter_500Medium',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  loadingText: {
    marginLeft: 8,
    color: "white",
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  statusText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});

