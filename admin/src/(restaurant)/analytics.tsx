import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuthStore } from '../store/authStore';
import { colors, spacing } from '../styles/theme';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  newCustomers: number;
  returningCustomers: number;
  salesByDay: { [key: string]: number };
}

export default function AnalyticsScreen() {
  const { userRole } = useAuthStore();
  const [period, setPeriod] = React.useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = React.useState(true);
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);

  React.useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockData = async () => {
        return {
          totalOrders: 156,
          totalRevenue: 12345,
          newCustomers: 25,
          returningCustomers: 75,
          salesByDay: {
            '2025-06-17': 15,
            '2025-06-18': 18,
            '2025-06-19': 22,
            '2025-06-20': 20,
            '2025-06-21': 16,
            '2025-06-22': 19,
            '2025-06-23': 25,
          },
        };
      };

      const data = await mockData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Failed to load analytics</Text>
      </View>
    );
  }

  const labels = Object.keys(analyticsData.salesByDay).map(date => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });
  const data = Object.values(analyticsData.salesByDay);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {userRole === 'owner' ? 'Owner Analytics' : 'Manager Analytics'}
        </Text>
        <View style={styles.periodContainer}>
          <TouchableOpacity
            style={[styles.periodButton, period === 'day' && styles.periodButtonActive]}
            onPress={() => setPeriod('day')}
          >
            <Text style={[styles.periodText, period === 'day' && styles.periodTextActive]}>Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>Month</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statValue}>{analyticsData.totalOrders}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Revenue</Text>
          <Text style={styles.statValue}>${analyticsData.totalRevenue}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>New Customers</Text>
          <Text style={styles.statValue}>{analyticsData.newCustomers}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Returning Customers</Text>
          <Text style={styles.statValue}>{analyticsData.returningCustomers}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sales Trend</Text>
        <LineChart
          data={{
            labels,
            datasets: [{
              data,
              color: () => colors.primary,
            }],
          }}
          width={350}
          height={220}
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.primary,
            labelColor: () => colors.text,
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.primary,
            },
            propsForBackgroundLines: {
              strokeWidth: '1',
              stroke: colors.border,
            },
            yAxisLabel: 'Orders',
            yAxisSuffix: '',
            propsForGridLines: {
              horizontal: true,
              vertical: false,
            },
            verticalLabelRotation: 30,
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
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
  periodContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodButton: {
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    color: colors.text,
  },
  periodTextActive: {
    color: colors.light,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  chartContainer: {
    backgroundColor: colors.light,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  chartTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  loading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
});
