import { useRouter } from 'expo-router';
import { BarChart3, ChevronRight, RefreshCw, Settings, ShoppingBag, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

interface Order {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}

interface ChartData {
  labels: string[];
  data: number[];
  legend?: string[];
}

// Web-compatible chart component
const LineChart = Platform.OS === 'web' 
  ? ({ data, width, height, chartConfig, bezier, style }: any) => (
      <View style={[{ width, height }, style, styles.webChartPlaceholder]}>
        <Text style={styles.webChartText}>
          Chart visualization available on mobile devices
        </Text>
      </View>
    )
  : require('react-native-chart-kit').LineChart;

export default function RestaurantDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  const screenWidth = Dimensions.get('window').width - 40;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (refresh = false) => {
    try {
      if (!refresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // Get restaurant ID from user data or context
      const restaurantId = user?.restaurantId;
      
      if (!restaurantId) {
        throw new Error('No restaurant associated with this account');
      }

      // Fetch dashboard data from API
      const [statsRes, ordersRes, analyticsRes] = await Promise.all([
        api.get(`/restaurants/${restaurantId}/stats`),
        api.get(`/orders/restaurant/${restaurantId}?limit=5&sort=-createdAt`),
        api.get(`/analytics/restaurant/${restaurantId}/sales?period=7days`),
      ]);

      setStats({
        totalOrders: statsRes.data.totalOrders || 0,
        pendingOrders: statsRes.data.pendingOrders || 0,
        totalRevenue: statsRes.data.totalRevenue || 0,
        totalCustomers: statsRes.data.totalCustomers || 0,
      });
      
      setRecentOrders(ordersRes.data.orders || []);
      setChartData({
        labels: analyticsRes.data.labels || [],
        data: analyticsRes.data.data || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode, onPress?: () => void) => (
    <TouchableOpacity 
      style={styles.statCard} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statIconContainer}>
        {icon}
      </View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  // Format date for order display
  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.loadingContainer, { padding: 20 }]}>
        <Text style={styles.errorText}>Please log in to view the dashboard</Text>
      </View>
    );
  }

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { padding: 20 }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchDashboardData()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name || 'Restaurant Owner'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/(restaurant)/settings')}
          >
            <Settings size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard('Total Orders', stats.totalOrders, <ShoppingBag size={20} color="#4CAF50" />, () => 
            router.push('/(restaurant)/orders')
          )}
          {renderStatCard('Pending Orders', stats.pendingOrders, <ShoppingBag size={20} color="#FFC107" />, () => 
            router.push('/(restaurant)/orders?status=pending')
          )}
          {renderStatCard('Total Revenue', formatCurrency(stats.totalRevenue), <BarChart3 size={20} color="#2196F3" />)}
          {renderStatCard('Total Customers', stats.totalCustomers, <Users size={20} color="#9C27B0" />, () => 
            router.push('/(restaurant)/customers')
          )}
        </View>

        {/* Sales Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sales Overview</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View Report</Text>
            </TouchableOpacity>
          </View>
          {chartData && (
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    data: chartData.data,
                  },
                ],
              }}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundColor: '#1a1a1a',
                backgroundGradientFrom: '#1a1a1a',
                backgroundGradientTo: '#1a1a1a',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#007AFF',
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          )}
        </View>


        {/* Recent Orders */}
        <View style={styles.recentOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(restaurant)/orders')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentOrders.length > 0 ? (
            <View style={styles.ordersList}>
              {recentOrders.map((order) => (
                <TouchableOpacity 
                  key={order._id} 
                  style={styles.orderItem}
                  onPress={() => router.push(`/(restaurant)/orders/${order._id}`)}
                >
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.orderStatus}>
                    <Text style={[
                      styles.statusText,
                      order.status === 'completed' && styles.statusCompleted,
                      order.status === 'pending' && styles.statusPending,
                      order.status === 'cancelled' && styles.statusCancelled,
                    ]}>
                      {order.status}
                    </Text>
                    <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                  </View>
                  <ChevronRight size={16} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noOrders}>
              <Text style={styles.noOrdersText}>No recent orders found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1a1a1a',
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },
    greeting: {
      fontSize: 16,
      color: '#999',
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginTop: 4,
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#2a2a2a',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 10,
      marginBottom: 20,
    },
    statCard: {
      width: '47%',
      backgroundColor: '#2a2a2a',
      borderRadius: 12,
      padding: 16,
      margin: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    statTextContainer: {
      flex: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: '#999',
    },
    chartContainer: {
      backgroundColor: '#2a2a2a',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
    },
    seeAllText: {
      color: '#007AFF',
      fontSize: 14,
    },
    webChartPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
      borderRadius: 8,
      padding: 20,
    },
    webChartText: {
      color: '#999',
      fontSize: 14,
      textAlign: 'center',
    },
    recentOrdersContainer: {
      backgroundColor: '#2a2a2a',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 20,
    },
    ordersList: {
      borderRadius: 8,
      overflow: 'hidden',
    },
    orderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      backgroundColor: '#333',
      marginBottom: 8,
      borderRadius: 8,
    },
    orderInfo: {
      flex: 1,
    },
    orderNumber: {
      color: '#fff',
      fontWeight: '500',
      marginBottom: 4,
    },
    orderDate: {
      color: '#999',
      fontSize: 12,
    },
    orderStatus: {
      marginRight: 12,
      alignItems: 'flex-end',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'capitalize',
    },
    statusCompleted: {
      color: '#4CAF50',
    },
    statusPending: {
      color: '#FFC107',
    },
    statusCancelled: {
      color: '#F44336',
    },
    orderTotal: {
      color: '#fff',
      fontWeight: '600',
    },
    noOrders: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noOrdersText: {
      color: '#999',
      fontSize: 14,
    },
    errorText: {
      color: '#F44336',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: '#007AFF',
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8,
      alignSelf: 'center',
    },
    retryButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    refreshButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 1,
    },
  });
