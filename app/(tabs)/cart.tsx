import Button from "@/components/Button";
import CartItem from "@/components/CartItem";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { mockRestaurants } from "@/mocks/restaurants";
import { useCartStore } from "@/store/cartStore";
import { ServiceType } from "@/types/restaurant";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MapPin, MapPinOff, ShoppingBag, UtensilsCrossed } from "lucide-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const {
    getCartItems,
    getCartSubtotal,
    getDeliveryFee,
    getTax,
    getCartTotal,
    updateQuantity,
    removeFromCart,
    restaurantId,
    clearCart,
    serviceType,
    setServiceType,
  } = useCartStore();

  const cartItems = getCartItems();
  const subtotal = getCartSubtotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTax();
  const total = getCartTotal();

  const restaurant = mockRestaurants.find(r => r.id === restaurantId);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Your cart is empty", "Add some items to your cart first.");
      return;
    }
    
    router.push("/checkout");
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to clear your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          onPress: () => clearCart(),
          style: "destructive",
        },
      ]
    );
  };

  const handleServiceTypeChange = (type: ServiceType) => {
    setServiceType(type);
  };

  const getServiceTypeIcon = (type: ServiceType, size: number = 20) => {
    switch (type) {
      case 'delivery':
        return <MapPin size={size} color={colors.primary} />;
      case 'dine-in':
        return <UtensilsCrossed size={size} color={colors.primary} />;
      case 'pickup':
        return <MapPinOff size={size} color={colors.primary} />;
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShoppingBag size={80} color={colors.lightText} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>
          Add items from restaurants to start an order
        </Text>
        <Button
          title="Browse Restaurants"
          onPress={() => router.push("/restaurants")}
          variant="primary"
          style={styles.browseButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {restaurant && (
          <View style={styles.restaurantContainer}>
            <Image
              source={{ uri: restaurant.imageUrl }}
              style={styles.restaurantImage}
              contentFit="cover"
            />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <TouchableOpacity
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              >
                <Text style={styles.addMoreText}>Add more items</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.serviceTypeSection}>
          <Text style={styles.serviceTypeTitle}>Service Type</Text>
          <View style={styles.serviceTypeContainer}>
            <TouchableOpacity
              style={[
                styles.serviceTypeButton,
                serviceType === 'delivery' && styles.serviceTypeButtonActive,
              ]}
              onPress={() => handleServiceTypeChange('delivery')}
            >
              <MapPin 
                size={20} 
                color={serviceType === 'delivery' ? colors.white : colors.text} 
              />
              <Text 
                style={[
                  styles.serviceTypeText,
                  serviceType === 'delivery' && styles.serviceTypeTextActive,
                ]}
              >
                Delivery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.serviceTypeButton,
                serviceType === 'dine-in' && styles.serviceTypeButtonActive,
              ]}
              onPress={() => handleServiceTypeChange('dine-in')}
            >
              <UtensilsCrossed 
                size={20} 
                color={serviceType === 'dine-in' ? colors.white : colors.text} 
              />
              <Text 
                style={[
                  styles.serviceTypeText,
                  serviceType === 'dine-in' && styles.serviceTypeTextActive,
                ]}
              >
                Dine-in
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.serviceTypeButton,
                serviceType === 'pickup' && styles.serviceTypeButtonActive,
              ]}
              onPress={() => handleServiceTypeChange('pickup')}
            >
              <MapPinOff 
                size={20} 
                color={serviceType === 'pickup' ? colors.white : colors.text} 
              />
              <Text 
                style={[
                  styles.serviceTypeText,
                  serviceType === 'pickup' && styles.serviceTypeTextActive,
                ]}
              >
                Pickup
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Order</Text>
            {cartItems.length > 0 && (
              <TouchableOpacity onPress={handleClearCart}>
                <Text style={styles.clearText}>Clear Cart</Text>
              </TouchableOpacity>
            )}
          </View>

          {cartItems.map((item) => (
            <CartItem
              key={item.id || item.menuItemId}
              menuItem={item.menuItem}
              quantity={item.quantity}
              specialInstructions={item.specialInstructions}
              onUpdateQuantity={(quantity) => updateQuantity(item.id || item.menuItemId, quantity)}
              onRemove={() => removeFromCart(item.id || item.menuItemId)}
            />
          ))}
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)} Birr</Text>
          </View>
          
          {serviceType === 'delivery' && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{deliveryFee.toFixed(2)} Birr</Text>
            </View>
          )}
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (15%)</Text>
            <Text style={styles.summaryValue}>{tax.toFixed(2)} Birr</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)} Birr</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <View style={styles.serviceTypeBadge}>
          {getServiceTypeIcon(serviceType)}
          <Text style={styles.serviceTypeBadgeText}>
            {serviceType === 'delivery' ? 'Delivery' : serviceType === 'dine-in' ? 'Dine-in' : 'Pickup'}
          </Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={handleCheckout}
          variant="primary"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    ...typography.heading2,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    marginTop: 16,
  },
  restaurantContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    margin: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    width: 80,
    height: 80,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  restaurantName: {
    ...typography.heading4,
    marginBottom: 4,
  },
  addMoreText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  serviceTypeSection: {
    padding: 20,
    paddingTop: 0,
  },
  serviceTypeTitle: {
    ...typography.heading4,
    marginBottom: 12,
  },
  serviceTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceTypeButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  serviceTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  serviceTypeText: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: 8,
    fontWeight: "500",
  },
  serviceTypeTextActive: {
    color: colors.white,
  },
  itemsContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.heading3,
  },
  clearText: {
    ...typography.bodySmall,
    color: colors.error,
  },
  summaryContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 0,
  },
  summaryTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.lightText,
  },
  summaryValue: {
    ...typography.body,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    ...typography.heading4,
  },
  totalValue: {
    ...typography.heading4,
    color: colors.primary,
  },
  checkoutContainer: {
    backgroundColor: colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  serviceTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  serviceTypeBadgeText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 8,
  },
});
