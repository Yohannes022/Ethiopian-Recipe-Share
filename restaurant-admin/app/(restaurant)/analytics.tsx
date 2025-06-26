import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "@react-navigation/native";
import { useAuthStore } from "@/store/authStore";
import Colors from "@/constants/colors";
import typography from "@/constants/typography";
import { AnalyticsData, Period } from "@/types/analytics";
import { UserRole } from "@/types/user";

// Mock analytics API - replace with actual API calls
const analyticsAPI = {
  getAnalytics: async (period: string) => {
    // Mock data - replace with actual API call
    return {
      totalOrders: 156,
      completedOrders: 142,
      cancelledOrders: 14,
      totalRevenue: 12580,
      orderTrends: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        count: Math.floor(Math.random() * 50) + 10,
      })),
      popularItems: [
        { name: "Doro Wat", orders: 45 },
        { name: "Injera", orders: 78 },
        { name: "Tibs", orders: 32 },
        { name: "Kitfo", orders: 28 },
        { name: "Shiro", orders: 25 },
      ],
      customerBreakdown: [
        { label: "New Customers", value: 35 },
        { label: "Returning Customers", value: 121 },
      ],
    };
  },
};

const { width } = Dimensions.get("window");

export default function AnalyticsScreen() {
  const { colors: themeColors } = useTheme();
  const { user } = useAuthStore();
  const colors = Colors; // Alias Colors to colors for backward compatibility
  const [period, setPeriod] = useState<Period>(Period.MONTH);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get available periods based on user role
  const isRestaurantOwner = user?.role === UserRole.RESTAURANT_OWNER;
  const periodOptions: { value: Period; label: string }[] = isRestaurantOwner
    ? [
        { value: Period.MONTH, label: "Monthly" },
        { value: Period.YEAR, label: "Yearly" },
      ]
    : [
        { value: Period.DAY, label: "Daily" },
        { value: Period.WEEK, label: "Weekly" },
        { value: Period.MONTH, label: "Monthly" },
      ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await analyticsAPI.getAnalytics(period);
        setAnalyticsData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, user?.restaurantId]);

  const getChartConfig = (colors: any) => ({
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary,
    },
    propsForBackgroundLines: {
      strokeWidth: "1",
      stroke: colors.border,
    },
    yAxisLabel: "Orders",
    yAxisSuffix: "",
    propsForGridLines: {
      horizontal: true,
      vertical: false,
    },
    verticalLabelRotation: 30,
  });

  const renderChart = (data: any, title: string, colors: any) => {
    if (!data) return null;

    const chartData = {
      labels: data.labels,
      datasets: [
        {
          data: data.values,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <LineChart
          data={chartData}
          width={width - 64}
          height={200}
          chartConfig={getChartConfig(colors)}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: Colors.cardBackground }]}>
          <Text style={[styles.title, { color: Colors.text }]}>Analytics</Text>
          <View style={styles.periodSelector}>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.periodButton,
                  period === option.value && [styles.activePeriodButton, { backgroundColor: Colors.primary }],
                ]}
                onPress={() => setPeriod(option.value)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    period === option.value && styles.activePeriodButtonText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors.cardBackground }]}>
            <Text style={[styles.statTitle, { color: Colors.placeholderText }]}>Total Orders</Text>
            <Text style={[styles.statValue, { color: Colors.text }]}>{analyticsData?.totalOrders}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.cardBackground }]}>
            <Text style={[styles.statTitle, { color: Colors.placeholderText }]}>Completed</Text>
            <Text style={[styles.statValue, { color: Colors.text }]}>{analyticsData?.completedOrders}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.cardBackground }]}>
            <Text style={[styles.statTitle, { color: Colors.placeholderText }]}>Cancelled</Text>
            <Text style={[styles.statValue, { color: Colors.text }]}>{analyticsData?.cancelledOrders}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.cardBackground }]}>
            <Text style={[styles.statTitle, { color: Colors.placeholderText }]}>Revenue</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              ${analyticsData?.totalRevenue?.toLocaleString()}
            </Text>
          </View>
        </View>

        {renderChart(analyticsData?.orderTrends, "Order Trends", Colors)}

        <View style={[styles.popularItemsContainer, { backgroundColor: Colors.cardBackground }]}>
          <Text style={[styles.popularItemsTitle, { color: Colors.text }]}>Popular Items</Text>
          <FlatList
            data={analyticsData?.popularItems}
            renderItem={({ item }) => (
              <View style={[styles.popularItem, { borderBottomColor: Colors.border }]}>
                <Text style={[styles.popularItemName, { color: Colors.text }]}>{item.name}</Text>
                <Text style={[styles.popularItemCount, { color: Colors.primary }]}>{item.orders} orders</Text>
              </View>
            )}
            keyExtractor={(item) => item.name}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  periodSelector: {
    flexDirection: "row",
    gap: 8,
  },
  periodButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 14,
  },
  activePeriodButton: {},
  activePeriodButtonText: {
    color: Colors.white,
  },

  statCard: {
    width: '47%',
    borderRadius: 12,
    padding: 16,
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
  },
  chartContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  chart: {
    marginTop: 16,
    height: 200,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  popularItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  popularItem: {
    width: '47%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  popularItemName: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  popularItemCount: {
    fontSize: 16,
    color: Colors.primary,
  },
  popularItemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.text,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 24,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-between',
    width: '100%',
  }
});
