import Button from "@/components/Button";
import PaymentMethodCard from "@/components/PaymentMethodCard";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { PaymentMethod, useProfileStore } from "@/store/profileStore";
import { useRouter } from "expo-router";
import { CreditCard, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { 
    removePaymentMethod, 
    setDefaultPaymentMethod,
    getPaymentMethods,
  } = useProfileStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethodsList, setPaymentMethodsList] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoading(true);
        const methods = await getPaymentMethods();
        setPaymentMethodsList(methods);
      } catch (error) {
        console.error('Error loading payment methods:', error);
        Alert.alert('Error', 'Failed to load payment methods');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPaymentMethods();
  }, [getPaymentMethods]);

  const handleAddPaymentMethod = () => {
    // Use relative path for navigation
    router.push('../payment/add');
  };

  const handleEditPaymentMethod = (id: string) => {
    // Use relative path for navigation
    router.push(`../payment/edit/${id}`);
  };

  const handleRemovePaymentMethod = async (id: string) => {
    try {
      await removePaymentMethod(id);
      // Refresh the payment methods list
      const methods = await getPaymentMethods();
      setPaymentMethodsList(methods);
    } catch (error) {
      console.error('Error removing payment method:', error);
      Alert.alert('Error', 'Failed to remove payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      // Update the local state to reflect the change
      setPaymentMethodsList(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === id
        }))
      );
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method');
    }
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
        ) : paymentMethodsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard size={48} color={colors.lightText} />
            <Text style={styles.emptyTitle}>No payment methods yet</Text>
            <Text style={styles.emptyText}>
              Add your first payment method to get started
            </Text>
          </View>
        ) : (
          <View style={styles.paymentMethodsList}>
            {paymentMethodsList.map((method) => (
              <PaymentMethodCard
                key={method.id}
                id={method.id}
                type={method.type}
                last4={method.last4}
                cardBrand={method.cardBrand}
                expiryMonth={method.expiryMonth}
                expiryYear={method.expiryYear}
                provider={method.provider}
                phoneNumber={method.phoneNumber}
                isDefault={method.isDefault}
                onEdit={() => handleEditPaymentMethod(method.id)}
                onDelete={() => handleRemovePaymentMethod(method.id)}
                onSetDefault={() => handleSetDefaultPaymentMethod(method.id)}
              />
            ))}
          </View>
        )}

        <View style={styles.addButton}>
          <Button
            title="Add Payment Method"
            leftIcon={<Plus size={20} color={colors.white} />}
            onPress={handleAddPaymentMethod}
            fullWidth
          />
        </View>
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
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.lightText,
    marginBlockStart: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
    marginBlockStart: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBlockStart: 16,
    marginBlockEnd: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: 'center',
  },
  paymentMethodsList: {
    gap: 16,
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
