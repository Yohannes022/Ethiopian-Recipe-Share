import colors from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

const HeaderBackground = () => (
  <View style={styles.headerContainer}>
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      style={styles.headerBackground}
      resizeMode="cover"
    />
    <View style={styles.overlay} />
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

// This is the root layout for the authentication flow
// It defines all the screens in the auth stack

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerBackground: () => <HeaderBackground />,
        headerTintColor: colors.white,
        headerTitleStyle: {
          color: colors.white,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        // Ensure consistent animation for all screens
        animation: 'slide_from_right',
      }}
    >
      {/* Index screen - Handles initial redirection */}
      <Stack.Screen
        name="index"
        key="auth-index"
        options={{
          title: "",
          headerShown: false,
          animation: 'fade',
        }}
      />

      {/* Phone Authentication Screen */}
      <Stack.Screen
        name="phone-auth"
        key="phone-auth-screen"
        options={{
          title: "Sign In / Sign Up",
          headerShown: true,
          animation: 'slide_from_right',
        }}
      />

      {/* OTP Verification Screen */}
      <Stack.Screen
        name="verify"
        key="verify-screen"
        options={{
          title: "Verify Phone Number",
          headerShown: true,
          animation: 'slide_from_right',
        }}
      />

      {/* Restaurant Owner Signup */}
      <Stack.Screen
        name="restaurant-owner-signup"
        key="restaurant-signup-screen"
        options={{
          title: "Restaurant Owner Sign Up",
          headerShown: true,
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
