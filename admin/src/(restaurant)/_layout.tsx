import { useAuthStore } from '../store/authStore';
import { Stack } from 'expo-router';
import React from 'react';

export default function RestaurantLayout() {
  const { userRole } = useAuthStore();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: '#000',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: userRole === 'owner' ? 'Owner Dashboard' : 'Manager Dashboard',
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          title: userRole === 'owner' ? 'Owner Analytics' : 'Manager Analytics',
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: 'Orders',
        }}
      />
      <Stack.Screen
        name="menu"
        options={{
          title: 'Menu Management',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Stack>
  );
}
