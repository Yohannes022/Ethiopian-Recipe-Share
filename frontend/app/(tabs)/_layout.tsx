import colors from "@/constants/colors";
import { Tabs } from "expo-router";
import {
  Home,
  MessageSquare,
  Plus,
  Search,
  ShoppingBag,
  User,
  Utensils,
} from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet } from "react-native";

export default function TabsLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.lightText,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.99)',
          // borderTopWidth: 0,
          // height: Platform.OS === "ios" ? 70 : 60,
          // paddingBottom: Platform.OS === "ios" ? 20 : 10,
          // paddingVertical: 8,
          // position: 'absolute',
          // left: 20,
          // right: 20,
          // bottom: 20,
          // borderRadius: 30,
          // marginHorizontal: 6,
          // maxWidth: 400,
          // shadowColor: '#000',
          // shadowOffset: { width: 0, height: 2 },
          // shadowOpacity: 0.1,
          // shadowRadius: 8,
          // elevation: 5,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        headerShadowVisible: false,
        headerRight: undefined,
        headerRightContainerStyle: {
          paddingRight: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="restaurants"
        options={{
          title: "Restaurants",
          tabBarIcon: ({ color }) => <Utensils size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => <Plus size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => <ShoppingBag size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Tab bar styles
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    height: Platform.OS === "ios" ? 90 : 70,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  header: {
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontWeight: "600",
    fontSize: 18,
  },
});
