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

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerBackground: () => <HeaderBackground />,
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
        }}
      />
      <Stack.Screen
        name="verify"
        options={{
          title: "Verify Phone",
        }}
      />
      <Stack.Screen
        name="restaurant-owner-signup"
        options={{
          title: "Restaurant Owner Signup",
        }}
      />
    </Stack>
  );
}
