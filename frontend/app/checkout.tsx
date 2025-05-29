import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { restaurants } from "@/mocks/restaurants";
import { useCartStore } from "@/store/cartStore";
import { useProfileStore } from "@/store/profileStore";
import { OrderServiceType } from "@/types/restaurant";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Clock, CreditCard, MapPin, MapPinOff, Plus, UtensilsCrossed } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CheckoutScreen() {
  const router = useRouter();
  const { 
    getCartItems, 
    getCartSubtotal, 
    getDeliveryFee, 
    getTax, 
    getCartTotal, 
    restaurantId, 
    createOrder,
    serviceType,
    setServiceType
  } = useCartStore();
  const { addresses, paymentMethods } = useProfileStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [tip, setTip] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const cartItems = getCartItems();
  const subtotal = getCartSubtotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTax();
  const total = getCartTotal() + tip;
  
  const restaurant = restaurants.find(r => r.id === restaurantId);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();

    // Set default address and payment method if available
    if (addresses.length > 0 && serviceType === 'delivery') {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      setSelectedAddress(defaultAddress ? defaultAddress.id : addresses[0].id);
    }

    if (paymentMethods.length > 0) {
      const defaultPayment = paymentMethods.find((pm) => pm.isDefault);
      setSelectedPayment(defaultPayment ? defaultPayment.id : paymentMethods[0].id);
    }
  }, [addresses, paymentMethods, serviceType]);

  const handleAddAddress = () => {
    router.push("/profile/addresses/add");
  };

  const handleAddPayment = () => {
    router.push("/profile/payment/add");
  };

  const handlePlaceOrder = () => {
    if (serviceType === 'delivery' && !selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    if (!selectedPayment) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    if (serviceType === 'dine-in' && !tableNumber) {
      Alert.alert("Error", "Please enter your table number");
      return;
    }

    if (serviceType === 'pickup' && !pickupTime) {
      Alert.alert("Error", "Please select a pickup time");
      return;
    }

    setIsProcessing(true);

    try {
      // Get the payment method type
      const paymentMethod = paymentMethods.find(pm => pm.id === selectedPayment);
      if (!paymentMethod) {
        throw new Error("Selected payment method not found");
      }

      // Create the order
      const order = createOrder(
        paymentMethod.type as 'card' | 'cash' | 'mobile-money',
        selectedAddress,
        tip,
        serviceType === 'dine-in' ? tableNumber : undefined,
        serviceType === 'pickup' ? pickupTime : undefined
      );
      
      // Navigate to order confirmation
      router.replace(`/order/${order.id}`);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to place order");
      setIsProcessing(false);
    }
  };

  const handleTipChange = (amount: number) => {
    setTip(amount);
  };

  const handleServiceTypeChange = (type: OrderServiceType) => {
    setServiceType(type);
    
    // Reset related fields when changing service type
    if (type === 'dine-in') {
      setSelectedAddress(null);
    } else if (type === 'pickup') {
      setSelectedAddress(null);
      setTableNumber("");
    } else {
      setTableNumber("");
      setPickupTime("");
    }
  };

  const getServiceTypeLabel = (type: OrderServiceType) => {
    switch (type) {
      case 'delivery':
        return 'Delivery';
      case 'dine-in':
        return 'Dine-in';
      case 'pickup':
        return 'Pickup';
      default:
        return 'Delivery';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {restaurant && (
          <View style={styles.restaurantInfo}>
            <Image
              source={{ uri: restaurant.imageUrl }}
              style={styles.restaurantImage}
              contentFit="cover"
            />
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <View style={styles.deliveryTimeContainer}>
                <Clock size={14} color={colors.lightText} style={styles.deliveryTimeIcon} />
                <Text style={styles.deliveryTimeText}>
                  Estimated {serviceType === 'delivery' ? 'delivery' : serviceType === 'pickup' ? 'pickup' : 'preparation'}: {restaurant.estimatedDeliveryTime}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Type</Text>
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

        {serviceType === 'delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            
            {addresses.length === 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddAddress}
              >
                <Plus size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Address</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addressesContainer}>
                {addresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={[
                      styles.addressCard,
                      selectedAddress === address.id && styles.selectedCard,
                    ]}
                    onPress={() => setSelectedAddress(address.id)}
                  >
                    <View style={styles.addressCardContent}>
                      <MapPin
                        size={20}
                        color={selectedAddress === address.id ? colors.primary : colors.text}
                        style={styles.addressIcon}
                      />
                      <View style={styles.addressDetails}>
                        <Text style={styles.addressType}>{address.type || address.label || "Address"}</Text>
                        <Text style={styles.addressText}>{address.addressLine1}</Text>
                        {address.addressLine2 && (
                          <Text style={styles.addressText}>{address.addressLine2}</Text>
                        )}
                      </View>
                    </View>
                    <View
                      style={[
                        styles.radioButton,
                        selectedAddress === address.id && styles.radioButtonSelected,
                      ]}
                    >
                      {selectedAddress === address.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  style={styles.addNewButton}
                  onPress={handleAddAddress}
                >
                  <Plus size={16} color={colors.primary} />
                  <Text style={styles.addNewButtonText}>Add New Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {serviceType === 'dine-in' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Table Number</Text>
            <View style={styles.tableNumberContainer}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.tableNumberButton,
                    tableNumber === num && styles.tableNumberButtonActive,
                  ]}
                  onPress={() => setTableNumber(num)}
                >
                  <Text
                    style={[
                      styles.tableNumberText,
                      tableNumber === num && styles.tableNumberTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {serviceType === 'pickup' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Time</Text>
            <View style={styles.pickupTimeContainer}>
              {['15 min', '30 min', '45 min', '1 hour', '1.5 hours', '2 hours'].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.pickupTimeButton,
                    pickupTime === time && styles.pickupTimeButtonActive,
                  ]}
                  onPress={() => setPickupTime(time)}
                >
                  <Text
                    style={[
                      styles.pickupTimeText,
                      pickupTime === time && styles.pickupTimeTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {paymentMethods.length === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPayment}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.paymentMethodsContainer}>
              {paymentMethods.map((payment) => (
                <TouchableOpacity
                  key={payment.id}
                  style={[
                    styles.paymentCard,
                    selectedPayment === payment.id && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedPayment(payment.id)}
                >
                  <View style={styles.paymentCardContent}>
                    <CreditCard
                      size={20}
                      color={selectedPayment === payment.id ? colors.primary : colors.text}
                      style={styles.paymentIcon}
                    />
                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentType}>{payment.type}</Text>
                      <Text style={styles.paymentText}>
                        {payment.type === 'card' 
                          ? `**** **** **** ${payment.last4 || payment.lastFourDigits || "****"}`
                          : payment.phoneNumber || payment.number || ""}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radioButton,
                      selectedPayment === payment.id && styles.radioButtonSelected,
                    ]}
                  >
                    {selectedPayment === payment.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.addNewButton}
                onPress={handleAddPayment}
              >
                <Plus size={16} color={colors.primary} />
                <Text style={styles.addNewButtonText}>Add New Payment Method</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          
          <View style={styles.cartItemsContainer}>
            {cartItems.map((item) => (
              <View key={item.menuItemId} style={styles.checkoutItem}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.menuItem.name}</Text>
                <Text style={styles.itemPrice}>
                  {(item.menuItem.price * item.quantity).toFixed(2)} Birr
                </Text>
              </View>
            ))}
          </View>
        </View>

        {serviceType !== 'dine-in' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tip for {serviceType === 'delivery' ? 'Delivery' : 'Service'}</Text>
            
            <View style={styles.tipContainer}>
              {[0, 10, 20, 30, 50].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.tipButton,
                    tip === amount && styles.tipButtonSelected,
                  ]}
                  onPress={() => handleTipChange(amount)}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                      tip === amount && styles.tipButtonTextSelected,
                    ]}
                  >
                    {amount === 0 ? "No Tip" : `${amount} Birr`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.receiptContainer}>
          <Text style={styles.receiptTitle}>Order Summary</Text>
          
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Subtotal</Text>
            <Text style={styles.receiptValue}>{subtotal.toFixed(2)} Birr</Text>
          </View>
          
          {serviceType === 'delivery' && (
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Delivery Fee</Text>
              <Text style={styles.receiptValue}>{deliveryFee.toFixed(2)} Birr</Text>
            </View>
          )}
          
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Tax (15%)</Text>
            <Text style={styles.receiptValue}>{tax.toFixed(2)} Birr</Text>
          </View>
          
          {serviceType !== 'dine-in' && (
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Tip</Text>
              <Text style={styles.receiptValue}>{tip.toFixed(2)} Birr</Text>
            </View>
          )}
          
          <View style={styles.receiptDivider} />
          
          <View style={styles.receiptRow}>
            <Text style={styles.receiptTotalLabel}>Total</Text>
            <Text style={styles.receiptTotalValue}>{total.toFixed(2)} Birr</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{total.toFixed(2)} Birr</Text>
        </View>
        <Button
          title={`Place ${getServiceTypeLabel(serviceType)} Order`}
          onPress={handlePlaceOrder}
          loading={isProcessing}
          disabled={
            isLoading || 
            !selectedPayment || 
            isProcessing || 
            (serviceType === 'delivery' && !selectedAddress) ||
            (serviceType === 'dine-in' && !tableNumber) ||
            (serviceType === 'pickup' && !pickupTime)
          }
          style={styles.placeOrderButton}
        />
      </View>
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
    paddingBottom: 100,
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
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 4,
  },
  deliveryTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryTimeIcon: {
    marginRight: 4,
  },
  deliveryTimeText: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 16,
  },
  serviceTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  serviceTypeButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  serviceTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  tableNumberContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tableNumberButton: {
    width: "30%",
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
  },
  tableNumberButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10", // 10% opacity
  },
  tableNumberText: {
    ...typography.body,
    color: colors.text,
  },
  tableNumberTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  pickupTimeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  pickupTimeButton: {
    width: "48%",
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
  },
  pickupTimeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10", // 10% opacity
  },
  pickupTimeText: {
    ...typography.body,
    color: colors.text,
  },
  pickupTimeTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    borderStyle: "dashed",
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 8,
  },
  addressesContainer: {
    marginBottom: 8,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  selectedCard: {
    borderColor: colors.primary,
  },
  addressCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addressIcon: {
    marginRight: 12,
  },
  addressDetails: {
    flex: 1,
  },
  addressType: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  addressText: {
    ...typography.body,
    color: colors.text,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  addNewButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 8,
  },
  paymentMethodsContainer: {
    marginBottom: 8,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  paymentCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentType: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentText: {
    ...typography.body,
    color: colors.text,
  },
  cartItemsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  checkoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemQuantity: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
    marginRight: 8,
    width: 30,
  },
  itemName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  itemPrice: {
    ...typography.body,
    color: colors.text,
    fontWeight: "500",
  },
  tipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tipButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    width: "48%",
    alignItems: "center",
  },
  tipButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10", // 10% opacity
  },
  tipButtonText: {
    ...typography.body,
    color: colors.text,
  },
  tipButtonTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  receiptContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  receiptTitle: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 16,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  receiptLabel: {
    ...typography.body,
    color: colors.lightText,
  },
  receiptValue: {
    ...typography.body,
    color: colors.text,
  },
  receiptTotalLabel: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: "600",
  },
  receiptTotalValue: {
    ...typography.heading3,
    color: colors.primary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: "600",
  },
  totalAmount: {
    ...typography.heading3,
    color: colors.primary,
  },
  placeOrderButton: {
    marginBottom: 0,
  },
});
