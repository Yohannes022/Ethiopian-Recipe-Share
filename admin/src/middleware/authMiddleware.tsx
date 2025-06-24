import React from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function AuthMiddleware() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuthStore();

  React.useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        router.replace('/(restaurant)'); // Redirect to login
      }
    };

    checkAuth();
  }, [isAuthenticated, router]);

  return null;
}
