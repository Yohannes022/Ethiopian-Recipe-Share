import { useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { clearAuthState, needsAuthentication } from '@/utils/authUtils';

export default function AuthIndex() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Clear any existing auth state to ensure fresh start
        await clearAuthState();
        
        // Check if authentication is needed
        const needsAuth = await needsAuthentication();
        
        if (!needsAuth) {
          // If no auth needed, redirect to home
          router.replace('/(tabs)');
        } else {
          // If auth needed, go to phone auth
          router.replace('/phone-auth');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, default to phone auth
        router.replace('/phone-auth');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading indicator while checking auth state
  if (isLoading || isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Default to phone auth if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/phone-auth" />;
  }

  // Default to home if authenticated
  return <Redirect href="/(tabs)" />;
}
