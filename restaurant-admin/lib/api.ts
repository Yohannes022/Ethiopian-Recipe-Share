import * as SecureStore from 'expo-secure-store';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://your-api-url/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync('authToken');
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Handle 401 Unauthorized
    if (response.status === 401) {
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          // Try to refresh the token
          const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const { accessToken } = await refreshResponse.json();
            await SecureStore.setItemAsync('authToken', accessToken);
            
            // Retry the original request with the new token
            const originalRequest = response.url;
            const originalOptions = response.type === 'basic' ? {} : await response.clone().json();
            
            return fetchWithAuth(originalRequest, originalOptions)
              .then(res => res.json());
          }
        }
        
        // If refresh fails, clear tokens
        await Promise.all([
          SecureStore.deleteItemAsync('authToken'),
          SecureStore.deleteItemAsync('refreshToken'),
        ]);
        // You might want to redirect to login here
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorData.message || 'An error occurred',
      data: errorData,
    };
  }
  
  return response.json();
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: RequestMethod = 'GET',
  data?: any,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const fetchOptions: RequestInit = {
    ...options,
    method,
  };
  
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetchWithAuth(url, fetchOptions);
    return handleResponse<T>(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Helper methods for common HTTP methods
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, 'GET', undefined, options),
    
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, 'POST', data, options),
    
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, 'PUT', data, options),
    
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, 'DELETE', undefined, options),
    
  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, 'PATCH', data, options),
};
