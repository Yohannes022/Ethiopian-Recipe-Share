import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { mockOrders } from "@/mocks/orders";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight, Clock, MapPin, ShoppingBag } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState(mockOrders);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleViewOrder = (id: string) => {
    router.push(`/order/${id}`);
  };

  const handleTrackDelivery = (id: string) => {
    router.push(`/delivery-tracking/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return colors.success;
      case "in-progress":
        return colors.primary;
      case "cancelled":
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>
            View and track your order history
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={48} color={colors.lightText} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              Your order history will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => handleViewOrder(order.id)}
              >
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderNumber}>Order #{order.id}</Text>
                    <Text style={styles.orderDate}>
                      {formatDate(order.date?.toString() || "")}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusColor(order.status) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.restaurantInfo}>
                  <Image
                    source={{ uri: order.restaurantId.imageUrl }}
                    style={styles.restaurantImage}
                    contentFit="cover"
                  />
                  <View style={styles.restaurantDetails}>
                    <Text style={styles.restaurantName}>
                      {order.restaurantId.name}
                    </Text>
                    <Text style={styles.itemCount}>
                      {order.items.length} items • ${order.totalAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Clock
                      size={16}
                      color={colors.lightText}
                      style={styles.detailIcon}
                    />
                    <Text style={styles.detailText}>
                      {order.deliveryTime}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin
                      size={16}
                      color={colors.lightText}
                      style={styles.detailIcon}
                    />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {order.deliveryAddress?.addressLine1}
                    </Text>
                  </View>
                </View>

                {order.status === "out-for-delivery" && (
                  <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => handleTrackDelivery(order.id)}
                  >
                    <Text style={styles.trackButtonText}>
                      Track Delivery
                    </Text>
                    <ChevronRight size={16} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  ordersList: {
    marginBottom: 24,
  },
  orderCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderNumber: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: "600",
  },
  orderDate: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  restaurantImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemCount: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  orderDetails: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  trackButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "500",
    marginRight: 4,
  },
});
