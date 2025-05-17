import React, { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const { isAuthenticated, userRole } = useAuthStore();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(restaurant)" options={{ headerShown: false }} />
      <Stack.Screen name="recipe/[id]" options={{ headerShown: true, title: "Recipe Details" }} />
      <Stack.Screen name="restaurant/[id]" options={{ headerShown: true, title: "Restaurant" }} />
      <Stack.Screen name="menu-item/[restaurantId]/[itemId]" options={{ headerShown: true, title: "Menu Item" }} />
      <Stack.Screen name="checkout" options={{ headerShown: true, title: "Checkout" }} />
      <Stack.Screen name="order/[id]" options={{ headerShown: true, title: "Order Details" }} />
      <Stack.Screen name="delivery-tracking/[id]" options={{ headerShown: true, title: "Delivery Tracking" }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: true, title: "Edit Profile" }} />
      <Stack.Screen name="profile/addresses/index" options={{ headerShown: true, title: "My Addresses" }} />
      <Stack.Screen name="profile/payment/index" options={{ headerShown: true, title: "Payment Methods" }} />
      <Stack.Screen name="profile/orders" options={{ headerShown: true, title: "My Orders" }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: "Settings" }} />
      <Stack.Screen name="create-recipe" options={{ headerShown: true, title: "Create Recipe" }} />
      <Stack.Screen name="edit-recipe/[id]" options={{ headerShown: true, title: "Edit Recipe" }} />
    </Stack>
  );
}
