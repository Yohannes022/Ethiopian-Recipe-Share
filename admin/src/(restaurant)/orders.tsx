import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors, spacing } from '../styles/theme';

interface Order {
  id: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  customerName: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  createdAt: string;
  deliveryAddress: string;
  phoneNumber: string;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function OrdersScreen() {
  const { userRole } = useAuthStore();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [stats, setStats] = React.useState<OrderStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockOrders = async () => {
        return {
          orders: [
            {
              id: '1',
              status: 'pending',
              customerName: 'John Doe',
              total: 45.99,
              items: [
                { name: 'Injera', quantity: 2, price: 5.99 },
                { name: 'Doro Wat', quantity: 1, price: 25.00 },
                { name: 'Tibs', quantity: 1, price: 15.00 },
              ],
              createdAt: '2025-06-24T12:00:00',
              deliveryAddress: '123 Main St',
              phoneNumber: '555-1234',
            },
            // Add more mock orders as needed
          ],
          stats: {
            totalOrders: 156,
            pendingOrders: 8,
            totalRevenue: 12345,
          },
        };
      };

      const { orders: fetchedOrders, stats: fetchedStats } = await mockOrders();
      setOrders(fetchedOrders);
      setStats(fetchedStats);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      // TODO: Replace with actual API call
      const mockUpdateStatus = async () => {
        return { success: true, message: 'Status updated' };
      };

      await mockUpdateStatus();
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!orders || !stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Failed to load orders</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Orders</Text>
            <Text style={styles.statValue}>{stats.pendingOrders}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <Text style={styles.statValue}>${stats.totalRevenue}</Text>
          </View>
        </View>
      </View>

      {orders.map((order) => (
        <TouchableOpacity
          key={order.id}
          style={styles.orderCard}
          onPress={() => {
            // TODO: Navigate to order details
          }}
        >
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderTitle}>Order #{order.id}</Text>
              <Text style={styles.orderSubtitle}>
                {order.customerName} • ${order.total}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.statusText,
                  styles[`status${order.status}`],
                ]}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.orderItems}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  ${item.price} x {item.quantity}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.orderFooter}>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
            {userRole === 'owner' && (
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.status === 'pending' && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(order.id, 'pending')}
                >
                  <Text style={styles.statusButtonText}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.status === 'preparing' && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(order.id, 'preparing')}
                >
                  <Text style={styles.statusButtonText}>Preparing</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.status === 'ready' && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(order.id, 'ready')}
                >
                  <Text style={styles.statusButtonText}>Ready</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    order.status === 'delivered' && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(order.id, 'delivered')}
                >
                  <Text style={styles.statusButtonText}>Delivered</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    styles.statusButtonDanger,
                    order.status === 'cancelled' && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(order.id, 'cancelled')}
                >
                  <Text style={styles.statusButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.light,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  statValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderSubtitle: {
    color: colors.gray,
    fontSize: 14,
  },
  statusContainer: {
    padding: spacing.sm,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    padding: spacing.sm,
    borderRadius: 4,
  },
  statuspending: {
    backgroundColor: '#ffd700',
    color: '#000',
  },
  statuspreparing: {
    backgroundColor: '#2ecc71',
    color: '#fff',
  },
  statusready: {
    backgroundColor: '#3498db',
    color: '#fff',
  },
  statusdelivered: {
    backgroundColor: '#27ae60',
    color: '#fff',
  },
  statuscancelled: {
    backgroundColor: '#e74c3c',
    color: '#fff',
  },
  orderItems: {
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemName: {
    color: colors.text,
    fontSize: 16,
  },
  itemPrice: {
    color: colors.gray,
    fontSize: 14,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    color: colors.gray,
    fontSize: 14,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    padding: spacing.sm,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
  },
  statusButtonDanger: {
    borderColor: colors.danger,
  },
  statusButtonText: {
    color: colors.text,
  },
  error: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
});
