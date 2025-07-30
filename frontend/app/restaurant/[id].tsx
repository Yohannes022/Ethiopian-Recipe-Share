import CategoryPill from "@/components/CategoryPill";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { mockRestaurants as restaurants } from "@/mocks/restaurants";
import { useCartStore } from "@/store/cartStore";
import { MenuItem, Restaurant } from "@/types/restaurant";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Clock, Globe, Minus, Phone, Plus, ShoppingCart, Star } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RestaurantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, addToCart, removeFromCart } = useCartStore();

  const restaurant = restaurants.find((r) => r.id === id);
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.errorText}>Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  const menuCategories = [
    "All",
    ...new Set((restaurant.menu || []).map((item) => item.category)),
  ];

  const filteredMenu = (restaurant.menu || []).filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );

  const getCartItemCount = (menuItemId: string) => {
    return items.find((item) => item.id === menuItemId)?.quantity || 0;
  };

  const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (item: MenuItem) => {
    if (!id) return;
    addToCart(id, item.id, 1);
    const title = "Added to Cart";
    const message = `${item.name} added to your cart.`;
    Alert.alert(title, message, [
      {
        text: "OK",
        onPress: () => {},
      },
    ]);
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeFromCart(itemId);
    const title = "Removed from Cart";
    const message = `Item removed from your cart.`;
    Alert.alert(title, message, [
      {
        text: "OK",
        onPress: () => {},
      },
    ]);
  };

  const handleCheckout = () => {
    const title = "Login Required";
    const message = "Please log in to place an order.";
    Alert.alert(title, message, []);
  };

  const renderMenuItem = (item: MenuItem) => {
    const count = getCartItemCount(item.id);
    return (
      <View key={item.id} style={styles.menuItem}>
        <Image source={{ uri: item.imageUrl }} style={styles.menuItemImage} />
        <View style={styles.menuItemDetails}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemDescription}>{item.description}</Text>
          <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.quantityControl}>
          {count > 0 ? (
            <>
              <TouchableOpacity
                onPress={() => handleRemoveFromCart(item.id)}
                style={styles.quantityButton}
              >
                <Minus size={16} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{count}</Text>
              <TouchableOpacity
                onPress={() => handleAddToCart(item)}
                style={styles.quantityButton}
              >
                <Plus size={16} color={colors.primary} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => handleAddToCart(item)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image source={{ uri: restaurant.imageUrl }} style={styles.image} />
        <View style={styles.detailsContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <Text style={[styles.status, restaurant.isOpen ? styles.open : styles.closed]}>
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
          <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
          <Text style={styles.address}>{restaurant.address}</Text>
          <View style={styles.metaRow}>
            <Star size={16} color={colors.primary} fill={colors.primary} />
            <Text style={styles.metaText}>{restaurant.rating} ({restaurant.reviewCount} reviews)</Text>
            <Text style={styles.metaText}>{restaurant.priceLevel}</Text>
          </View>
          <Text style={styles.description}>{restaurant.description}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.categoriesContainer}>
            {(restaurant.categories ?? []).map(cat => <Text key={cat} style={styles.categoryTag}>{cat}</Text>)} 
          </View>
        </View>

        <View style={styles.deliveryInfoContainer}>
          <View style={styles.deliveryInfoItem}>
            <Text style={styles.deliveryInfoLabel}>Delivery Fee</Text>
            <Text style={styles.deliveryInfoValue}>${(restaurant.deliveryFee ?? 0).toFixed(2)}</Text>
          </View>
          <View style={styles.deliveryInfoItem}>
            <Text style={styles.deliveryInfoLabel}>Estimated Time</Text>
            <Text style={styles.deliveryInfoValue}>{restaurant.estimatedDeliveryTime}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <TouchableOpacity onPress={() => restaurant.phone && Linking.openURL(`tel:${restaurant.phone}`)} style={styles.contactRow}>
            <Phone size={18} color={colors.primary} />
            <Text style={styles.contactText}>{restaurant.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => restaurant.website && Linking.openURL(restaurant.website)} style={styles.contactRow}>
            <Globe size={18} color={colors.primary} />
            <Text style={styles.contactText}>{restaurant.website}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.contactRow}>
            <Clock size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Opening Hours</Text>
          </View>
          <View style={styles.hoursContainer}>
            {Object.entries(restaurant.openingHours ?? {}).map(([day, hours]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.dayText}>{day}</Text>
                <Text style={styles.hoursText}>{hours.open === 'Closed' ? 'Closed' : `${hours.open} - ${hours.close}`}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Menu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {menuCategories.map((category) => (
              <CategoryPill
                key={category}
                title={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
              />
            ))}
          </ScrollView>
          {filteredMenu.map(renderMenuItem)}
        </View>
      </ScrollView>

      {totalCartItems > 0 && (
        <TouchableOpacity style={styles.cartFab} onPress={handleCheckout}>
          <ShoppingCart size={24} color={colors.white} />
          <Text style={styles.cartFabText}>View Cart ({totalCartItems})</Text>
        </TouchableOpacity>
      )}

      <SafeAreaView style={styles.header} edges={["top"]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.white} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    ...typography.heading2,
  },
  image: {
    width: "100%",
    height: 250,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    margin: 16,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: colors.white,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.heading2,
    flex: 1,
  },
  status: {
    ...typography.body,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  open: {
    backgroundColor: colors.lightGray,
    color: colors.success,
  },
  closed: {
    backgroundColor: colors.lightGray,
    color: colors.error,
  },
  cuisine: {
    ...typography.body,
    color: colors.lightText,
    marginVertical: 4,
  },
  address: {
    ...typography.body,
    color: colors.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  metaText: {
    ...typography.body,
    marginLeft: 4,
  },
  description: {
    ...typography.body,
    marginTop: 12,
  },
  infoSection: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.gray,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    ...typography.body,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deliveryInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray,
  },
  deliveryInfoItem: {
    alignItems: "center",
  },
  deliveryInfoLabel: {
    ...typography.body,
    color: colors.lightText,
  },
  deliveryInfoValue: {
    ...typography.bodyLarge,
    fontWeight: "bold",
    marginTop: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactText: {
    ...typography.bodyLarge,
    marginLeft: 12,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.heading3,
    marginLeft: 12,
  },
  hoursContainer: {
    marginTop: 8,
    paddingLeft: 30, // Indent hours under the title
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dayText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  hoursText: {
    ...typography.body,
    color: colors.lightText,
  },
  menuContainer: {
    padding: 20,
    backgroundColor: colors.white,
    marginTop: 10,
  },
  menuTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  menuItemDetails: {
    flex: 1,
  },
  menuItemName: {
    ...typography.bodyLarge,
    fontWeight: "bold",
  },
  menuItemDescription: {
    ...typography.body,
    color: colors.lightText,
    marginVertical: 4,
  },
  menuItemPrice: {
    ...typography.bodyLarge,
    color: colors.primary,
    fontWeight: "bold",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 16,
  },
  quantityText: {
    ...typography.bodyLarge,
    marginHorizontal: 12,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  cartFab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cartFabText: {
    color: colors.white,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
