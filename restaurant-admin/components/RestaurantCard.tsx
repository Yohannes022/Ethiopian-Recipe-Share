import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Restaurant } from "@/types/restaurant";
import { Image } from "expo-image";
import { Clock, Star } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

export default function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  const {
    name,
    image,
    cuisine,
    rating,
    deliveryFee,
    estimatedDeliveryTime,
    priceLevel,
    isOpen,
  } = restaurant;

  // Format delivery fee
  const formattedDeliveryFee = deliveryFee === 0 ? "Free" : `$${deliveryFee}`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: image }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      
      {!isOpen && (
        <View style={styles.closedBadge}>
          <Text style={styles.closedText}>Closed</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={colors.yellow} fill={colors.yellow} />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          </View>
        </View>
        
        <Text style={styles.cuisine}>{cuisine}</Text>
        
        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Clock size={14} color={colors.lightText} />
            <Text style={styles.infoText}>{estimatedDeliveryTime}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoText}>{formattedDeliveryFee} delivery</Text>
          </View>
          
          {priceLevel && (
            <View style={styles.infoItem}>
              <Text style={styles.infoText}>{priceLevel}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 160,
  },
  closedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  closedText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    ...typography.subtitle,
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ratingBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rating: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "600",
    marginLeft: 2,
  },
  cuisine: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  infoText: {
    ...typography.caption,
    color: colors.lightText,
    marginLeft: 4,
  },
});
