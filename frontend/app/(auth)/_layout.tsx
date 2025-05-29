import colors from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
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
          title: "Welcome",
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
