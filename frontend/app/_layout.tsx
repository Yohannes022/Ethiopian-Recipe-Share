import { useAuthStore } from "@/store/authStore";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

// This layout is the root layout of the app
// It handles the initial routing based on authentication state

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Effect to handle protected routes
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (isLoading) {
      // Don't do anything while loading
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the auth flow if not authenticated
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the app if authenticated and in auth flow
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth group - Handles all authentication screens */}
      <Stack.Screen 
        name="(auth)" 
        options={{ 
          headerShown: false,
          animation: 'fade',
          animationDuration: 200,
        }} 
      />

      {/* Main app tabs - Only accessible when authenticated */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          animation: 'fade',
          animationDuration: 200,
        }} 
      />

      {/* Restaurant section - Only accessible when authenticated */}
      <Stack.Screen 
        name="(restaurant)" 
        options={{ 
          headerShown: false,
          animation: 'fade',
          animationDuration: 200,
        }} 
      />

      {/* Individual screens with specific options */}
      <Stack.Screen 
        name="recipe/[id]" 
        options={{ 
          headerShown: false,
          title: "Recipe Details",
          animation: 'slide_from_right',
        }} 
      />
      
      {/* Add other individual screens with proper animations */}
      <Stack.Screen 
        name="restaurant/[id]" 
        options={{ 
          headerShown: false,
          title: "Restaurant",
          animation: 'slide_from_right',
        }} 
      />
      
      <Stack.Screen 
        name="menu-item/[restaurantId]/[itemId]" 
        options={{ 
          headerShown: false,
          title: "Menu Item",
          animation: 'slide_from_right',
        }} 
      />

      <Stack.Screen 
        name="checkout" 
        options={{ 
          headerShown: false,
          title: "Checkout",
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }} 
      />

      <Stack.Screen 
        name="order/[id]" 
        options={{ 
          headerShown: false,
          title: "Order Details",
          animation: 'slide_from_right',
        }} 
      />

      <Stack.Screen 
        name="delivery-tracking/[id]" 
        options={{ 
          headerShown: false,
          title: "Delivery Tracking",
          animation: 'slide_from_right',
        }} 
      />

      <Stack.Screen 
        name="profile/edit" 
        options={{ 
          headerShown: false,
          title: "Edit Profile",
          animation: 'slide_from_right',
        }} 
      />

      <Stack.Screen 
        name="profile/addresses/index" 
        options={{ 
          headerShown: false,
          title: "My Addresses",
          animation: 'slide_from_right',
        }} 
      />

      <Stack.Screen 
        name="profile/payment/index" 
        options={{ 
          headerShown: false,
          title: "Payment Methods",
          animation: 'slide_from_right',
        }} 
      />

      <Stack.Screen 
        name="profile/orders" 
        options={{ 
          headerShown: false,
          title: "My Orders",
          animation: 'slide_from_right',
        }} 
      />

      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: false,
          title: "Settings",
          animation: 'slide_from_right',
        }} 
      />

      <Stack.Screen 
        name="create-recipe" 
        options={{ 
          headerShown: false,
          title: "Create Recipe",
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }} 
      />

      <Stack.Screen 
        name="edit-recipe/[id]" 
        options={{ 
          headerShown: false,
          title: "Edit Recipe",
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
}
