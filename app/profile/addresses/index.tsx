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
  const { 
    addresses = [], 
    removeAddress, 
    setDefaultAddress,
    getAddresses,
    isLoading 
  } = useProfileStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [localAddresses, setLocalAddresses] = useState<typeof addresses>([]);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const loadedAddresses = await getAddresses();
        setLocalAddresses(loadedAddresses);
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadAddresses();
  }, [getAddresses]);

  const handleAddAddress = () => {
    // Navigate to the add address screen using a relative path
    router.push('../addresses/add');
  };

  const handleEditAddress = (id: string) => {
    // Navigate to the edit address screen with the address ID using a relative path
    router.push(`../addresses/edit/${id}`);
  };

  const handleRemoveAddress = async (id: string) => {
    try {
      await removeAddress(id);
      // Update local state after removal
      setLocalAddresses(prev => prev ? prev.filter(addr => addr.id !== id) : []);
    } catch (error) {
      console.error('Error removing address:', error);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await setDefaultAddress(id);
      // Update local state to reflect the default address change
      setLocalAddresses(prev => 
        prev ? prev.map(addr => ({
          ...addr,
          isDefault: addr.id === id,
        })) : []
      );
    } catch (error) {
      console.error('Error setting default address:', error);
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
          <Text style={styles.title}>My Addresses</Text>
          <Text style={styles.subtitle}>
            Manage your delivery addresses
          </Text>
        </View>

        {isLoading || isInitialLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading addresses...</Text>
          </View>
        ) : (!addresses || addresses.length === 0) ? (
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

        <View style={styles.addButton}>
          <Button
            title="Add New Address"
            onPress={handleAddAddress}
            fullWidth
            leftIcon={<Plus size={20} color={colors.white} />}
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
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
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
    textAlign: 'center',
    marginBottom: 16,
  },
  addressList: {
    marginBottom: 24,
  },
  addButton: {
    marginBottom: 24,
    marginTop: 8,
  },
});
