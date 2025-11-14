import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBilling } from "../../../context/Billing/BillingContext";

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const { offerings, loading, error, purchasePackage, restorePurchases, hasPremium } = useBilling();
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#666666" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Manage Subscription</Text>
        <Text style={styles.subtitle}>
          Upgrade to access AI-powered nutrition insights, barcode lookups, and more.
        </Text>

        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Lift Mode AI</Text>
          <Text style={styles.planPrice}>{priceString} / month</Text>
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

        {hasPremium ? (
          <View style={styles.statusPill}>
            <Ionicons name="checkmark-circle" size={18} color="#00B8A9" />
            <Text style={styles.statusText}>Your subscription is active.</Text>
          </View>
        ) : null}

        {loading && !offerings ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#00B8A9" />
            <Text style={styles.loadingText}>Loading subscription details…</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.loadingRow}>
            <Ionicons name="warning-outline" size={18} color="#E53E3E" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>We couldn’t load plans right now.</Text>
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

        <TouchableOpacity style={styles.linkButton} onPress={handleOpenStore}>
          <Text style={styles.linkButtonText}>
            Open {Platform.OS === "ios" ? "App Store" : "Play Store"} subscription settings
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 6,
    color: "#666666",
    fontSize: 15,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 32,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#00B8A9",
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  listIcon: {
    marginRight: 10,
  },
  listText: {
    fontSize: 15,
    color: "#333333",
  },
  primaryButton: {
    backgroundColor: "#00B8A9",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#00B8A9",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#00B8A9",
    fontSize: 15,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 16,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#007AFF",
    fontSize: 14,
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: "#666666",
    fontSize: 14,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 14,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5F5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statusText: {
    color: "#00B8A9",
    fontWeight: "600",
    fontSize: 14,
  },
});

