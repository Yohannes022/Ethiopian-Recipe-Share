import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function RestaurantLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Dashboard',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="orders" 
          options={{ 
            title: 'Orders',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="menu" 
          options={{ 
            title: 'Menu Management',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="recipes" 
          options={{ 
            title: 'Recipes',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="analytics" 
          options={{ 
            title: 'Analytics',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="customers" 
          options={{ 
            title: 'Customers',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: 'Settings',
            presentation: 'modal',
            headerBackTitle: 'Back',
          }} 
        />
      </Stack>
    </>
  );
}
