import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { restaurants } from "@/mocks/restaurants";
import { useCartStore } from "@/store/cartStore";
import { OrderServiceType } from "@/types/restaurant";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Flame,
  Leaf,
  MapPin,
  MapPinOff,
  Minus,
  Plus,
  UtensilsCrossed,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MenuItemDetailScreen() {
  const { restaurantId, itemId } = useLocalSearchParams<{ restaurantId: string; itemId: string }>();
  const router = useRouter();
  const { addToCart, serviceType, setServiceType } = useCartStore();
  
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState<OrderServiceType>(serviceType);
  
  const restaurant = restaurants.find(r => r.id === restaurantId);
  const menuItem = restaurant?.menu?.find(item => item.id === itemId);
  
  if (!restaurant || !menuItem) {
    return (
      <View style={styles.notFound}>
        <Text style={typography.heading2}>Item not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleServiceTypeChange = (type: OrderServiceType) => {
    setSelectedServiceType(type);
  };

  const handleAddToCart = () => {
    // Update the global service type
    setServiceType(selectedServiceType);
    
    // Add the item to cart
    addToCart(restaurant.id, menuItem.id, quantity, specialInstructions);
    
    Alert.alert(
      "Added to Cart",
      `${quantity} ${menuItem.name} added to your cart for ${selectedServiceType}.`,
      [
        {
          text: "Continue Shopping",
          onPress: () => router.back(),
          style: "cancel",
        },
        {
          text: "View Cart",
          onPress: () => router.push("/cart"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: menuItem.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "transparent"]}
            style={styles.gradient}
          />
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.badgesContainer}>
            {menuItem.isSpicy && (
              <View style={styles.badge}>
                <Flame size={16} color={colors.white} />
                <Text style={styles.badgeText}>Spicy</Text>
              </View>
            )}
            {menuItem.isVegetarian && (
              <View style={[styles.badge, styles.vegBadge]}>
                <Leaf size={16} color={colors.white} />
                <Text style={styles.badgeText}>Vegetarian</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{menuItem.name}</Text>
            <Text style={styles.price}>{menuItem.price} Birr</Text>
          </View>
          
          <Text style={styles.description}>{menuItem.description}</Text>
          
          {menuItem.ingredients && menuItem.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.ingredientsContainer}>
                {menuItem.ingredients.map((ingredient, index) => (
                  <View key={ingredient} style={styles.ingredient}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How would you like your food?</Text>
            <View style={styles.serviceTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.serviceTypeButton,
                  selectedServiceType === 'delivery' && styles.serviceTypeButtonActive,
                ]}
                onPress={() => handleServiceTypeChange('delivery')}
              >
                <MapPin 
                  size={20} 
                  color={selectedServiceType === 'delivery' ? colors.white : colors.text} 
                />
                <Text 
                  style={[
                    styles.serviceTypeText,
                    selectedServiceType === 'delivery' && styles.serviceTypeTextActive,
                  ]}
                >
                  Delivery
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.serviceTypeButton,
                  selectedServiceType === 'dine-in' && styles.serviceTypeButtonActive,
                ]}
                onPress={() => handleServiceTypeChange('dine-in')}
              >
                <UtensilsCrossed 
                  size={20} 
                  color={selectedServiceType === 'dine-in' ? colors.white : colors.text} 
                />
                <Text 
                  style={[
                    styles.serviceTypeText,
                    selectedServiceType === 'dine-in' && styles.serviceTypeTextActive,
                  ]}
                >
                  Dine-in
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.serviceTypeButton,
                  selectedServiceType === 'pickup' && styles.serviceTypeButtonActive,
                ]}
                onPress={() => handleServiceTypeChange('pickup')}
              >
                <MapPinOff 
                  size={20} 
                  color={selectedServiceType === 'pickup' ? colors.white : colors.text} 
                />
                <Text 
                  style={[
                    styles.serviceTypeText,
                    selectedServiceType === 'pickup' && styles.serviceTypeTextActive,
                  ]}
                >
                  Pickup
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <TextInput
              style={styles.instructionsInput}
              placeholder="Add notes (e.g. allergies, spice level, etc.)"
              placeholderTextColor={colors.lightText}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityTitle}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecrement}
                disabled={quantity <= 1}
              >
                <Minus size={20} color={quantity <= 1 ? colors.lightText : colors.text} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncrement}
              >
                <Plus size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>{menuItem.price * quantity} Birr</Text>
        </View>
        
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          variant="primary"
          style={styles.addButton}
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
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  imageContainer: {
    height: 300,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backIconButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgesContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  vegBadge: {
    backgroundColor: colors.accent,
  },
  badgeText: {
    color: colors.white,
    fontWeight: "600",
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    ...typography.heading1,
    flex: 1,
    marginRight: 16,
  },
  price: {
    ...typography.heading2,
    color: colors.primary,
  },
  description: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 12,
  },
  ingredientsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  ingredient: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  ingredientText: {
    ...typography.bodySmall,
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
    backgroundColor: colors.inputBackground,
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
  instructionsInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    ...typography.body,
    textAlignVertical: "top",
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  quantityTitle: {
    ...typography.heading3,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    ...typography.heading3,
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
  },
  footer: {
    backgroundColor: colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    flexDirection: "row",
    alignItems: "center",
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  totalPrice: {
    ...typography.heading3,
  },
  addButton: {
    flex: 1,
    marginLeft: 16,
  },
});
