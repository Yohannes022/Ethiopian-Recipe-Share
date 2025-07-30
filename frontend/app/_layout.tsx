import { Stack } from "expo-router";
import React from "react";

// This layout is the root layout of the app
// It handles the initial routing based on authentication state

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Welcome screen */}
      <Stack.Screen 
        name="welcome" 
        options={{ 
          headerShown: false,
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
      {/* <Stack.Screen 
        name="(restaurant)" 
        options={{ 
          headerShown: false,
          animation: 'fade',
          animationDuration: 200,
        }} 
      /> */}

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
          animation: 'slide_from_bottom',
        }} 
      />

      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: 'modal',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
