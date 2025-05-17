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
import { MapPin, Plus, Edit2, Trash2 } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import AddressCard from "@/components/AddressCard";
import { useProfileStore } from "@/store/profileStore";

export default function AddressesScreen() {
  const router = useRouter();
  const { addresses, removeAddress, setDefaultAddress } = useProfileStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleAddAddress = () => {
    // In a real app, this would navigate to an address form
    router.push("/profile/addresses/add");
  };

  const handleEditAddress = (id: string) => {
    // In a real app, this would navigate to an address form with the address data
    router.push(`/profile/addresses/edit/${id}`);
  };

  const handleRemoveAddress = (id: string) => {
    removeAddress(id);
  };

  const handleSetDefaultAddress = (id: string) => {
    setDefaultAddress(id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Addresses</Text>
          <Text style={styles.subtitle}>
            Manage your delivery addresses
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading addresses...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MapPin size={48} color={colors.lightText} />
            <Text style={styles.emptyTitle}>No addresses yet</Text>
            <Text style={styles.emptyText}>
              Add your first address to get started
            </Text>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => handleEditAddress(address.id)}
                onDelete={() => handleRemoveAddress(address.id)}
                onSetDefault={() => handleSetDefaultAddress(address.id)}
              />
            ))}
          </View>
        )}

        <Button
          title="Add New Address"
          icon={<Plus size={20} color={colors.white} />}
          onPress={handleAddAddress}
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
  addressList: {
    marginBottom: 24,
  },
  addButton: {
    marginBottom: 24,
  },
});
