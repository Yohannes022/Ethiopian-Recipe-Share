import { useAuthStore } from "@/store/authStore";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  const { isAuthenticated, userRole } = useAuthStore();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(restaurant)" options={{ headerShown: false }} />
      <Stack.Screen name="recipe/[id]" options={{ headerShown: false, title: "Recipe Details" }} />
      <Stack.Screen name="restaurant/[id]" options={{ headerShown: false, title: "Restaurant" }} />
      <Stack.Screen name="menu-item/[restaurantId]/[itemId]" options={{ headerShown: false, title: "Menu Item" }} />
      <Stack.Screen name="checkout" options={{ headerShown: false, title: "Checkout" }} />
      <Stack.Screen name="order/[id]" options={{ headerShown: false, title: "Order Details" }} />
      <Stack.Screen name="delivery-tracking/[id]" options={{ headerShown: false, title: "Delivery Tracking" }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false, title: "Edit Profile" }} />
      <Stack.Screen name="profile/addresses/index" options={{ headerShown: false, title: "My Addresses" }} />
      <Stack.Screen name="profile/payment/index" options={{ headerShown: false, title: "Payment Methods" }} />
      <Stack.Screen name="profile/orders" options={{ headerShown: false, title: "My Orders" }} />
      <Stack.Screen name="settings" options={{ headerShown: false, title: "Settings" }} />
      <Stack.Screen name="create-recipe" options={{ headerShown: false, title: "Create Recipe" }} />
      <Stack.Screen name="edit-recipe/[id]" options={{ headerShown: false, title: "Edit Recipe" }} />
    </Stack>
  );
}
