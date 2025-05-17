import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { CreditCard, Plus, Edit2, Trash2 } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import PaymentMethodCard from "@/components/PaymentMethodCard";
import { useProfileStore } from "@/store/profileStore";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { paymentMethods, removePaymentMethod, setDefaultPaymentMethod } = useProfileStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleAddPaymentMethod = () => {
    // In a real app, this would navigate to a payment method form
    router.push("/profile/payment/add");
  };

  const handleEditPaymentMethod = (id: string) => {
    // In a real app, this would navigate to a payment method form with the payment method data
    router.push(`/profile/payment/edit/${id}`);
  };

  const handleRemovePaymentMethod = (id: string) => {
    removePaymentMethod(id);
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    setDefaultPaymentMethod(id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Payment Methods</Text>
          <Text style={styles.subtitle}>
            Manage your payment options
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading payment methods...</Text>
          </View>
        ) : paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard size={48} color={colors.lightText} />
            <Text style={styles.emptyTitle}>No payment methods yet</Text>
            <Text style={styles.emptyText}>
              Add your first payment method to get started
            </Text>
          </View>
        ) : (
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map((paymentMethod) => (
              <PaymentMethodCard
                key={paymentMethod.id}
                paymentMethod={paymentMethod}
                onEdit={() => handleEditPaymentMethod(paymentMethod.id)}
                onDelete={() => handleRemovePaymentMethod(paymentMethod.id)}
                onSetDefault={() => handleSetDefaultPaymentMethod(paymentMethod.id)}
              />
            ))}
          </View>
        )}

        <Button
          title="Add Payment Method"
          icon={<Plus size={20} color={colors.white} />}
          onPress={handleAddPaymentMethod}
          fullWidth
          style={styles.addButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.lightText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
  },
  paymentMethodsList: {
    marginBottom: 24,
  },
  addButton: {
    marginBottom: 24,
  },
});
