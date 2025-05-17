import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { analyticsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, ShoppingBag, TrendingUp, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Web-compatible chart components
const LineChart = Platform.OS === 'web' 
  ? ({ data, width, height, chartConfig, bezier, style }: any) => (
      <View style={[{ width, height }, style, styles.webChartPlaceholder]}>
        <Text style={styles.webChartText}>
          Chart visualization available on mobile devices
        </Text>
      </View>
    )
  : require('react-native-chart-kit').LineChart;

const BarChart = Platform.OS === 'web'
  ? ({ data, width, height, chartConfig, style }: any) => (
      <View style={[{ width, height }, style, styles.webChartPlaceholder]}>
        <Text style={styles.webChartText}>
          Chart visualization available on mobile devices
        </Text>
      </View>
    )
  : require('react-native-chart-kit').BarChart;

const PieChart = Platform.OS === 'web'
  ? ({ data, width, height, chartConfig, accessor, backgroundColor, paddingLeft, absolute }: any) => (
      <View style={[{ width, height }, styles.webChartPlaceholder]}>
        <Text style={styles.webChartText}>
          Chart visualization available on mobile devices
        </Text>
      </View>
    )
  : require('react-native-chart-kit').PieChart;

export default function AnalyticsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("week");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  const screenWidth = Dimensions.get("window").width - 40;

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would get the restaurant ID from the user's profile
      const restaurantId = user?.restaurantId || "restaurant-123";
      
      // Fetch analytics data
      const data = await analyticsAPI.getRestaurantAnalytics(restaurantId, period);
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "day":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      default:
        return "This Week";
    }
  };

  // Prepare chart data
  const getSalesChartData = () => {
    if (!analyticsData) return null;
    
    const labels = Object.keys(analyticsData.salesByDay).map(date => {
      const d = new Date(date);
      if (period === "day") {
        return d.toLocaleTimeString('en-US', { hour: '2-digit' });
      } else if (period === "week") {
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (period === "month") {
        return d.getDate().toString();
      } else {
        return d.toLocaleDateString('en-US', { month: 'short' });
      }
    });
    
    const data = Object.values(analyticsData.salesByDay);
    
    return {
      labels,
      datasets: [
        {
          data: data as number[],
          color: () => colors.primary,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getOrdersChartData = () => {
    if (!analyticsData) return null;
    
    const labels = Object.keys(analyticsData.ordersByDay).map(date => {
      const d = new Date(date);
      if (period === "day") {
        return d.toLocaleTimeString('en-US', { hour: '2-digit' });
      } else if (period === "week") {
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (period === "month") {
        return d.getDate().toString();
      } else {
        return d.toLocaleDateString('en-US', { month: 'short' });
      }
    });
    
    const data = Object.values(analyticsData.ordersByDay);
    
    return {
      labels,
      datasets: [
        {
          data: data as number[],
          color: () => colors.secondary,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getPopularItemsChartData = () => {
    if (!analyticsData || !analyticsData.popularItems) return null;
    
    const labels = analyticsData.popularItems.map((item: any) => item.name);
    const data = analyticsData.popularItems.map((item: any) => item.count);
    
    return {
      labels,
      datasets: [
        {
          data,
        },
      ],
    };
  };

  const getCustomerBreakdownData = () => {
    if (!analyticsData || !analyticsData.customerBreakdown) return null;
    
    const colorOptions = [colors.primary, colors.secondary, colors.accent, colors.info, colors.success];
    
    return [
      {
        name: "New",
        population: analyticsData.customerBreakdown.new,
        color: colorOptions[0],
        legendFontColor: colors.text,
        legendFontSize: 12,
      },
      {
        name: "Returning",
        population: analyticsData.customerBreakdown.returning,
        color: colorOptions[1],
        legendFontColor: colors.text,
        legendFontSize: 12,
      },
    ];
  };

  const chartConfig = {
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.lightText,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary,
    },
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading analytics data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.periodSelector}>
          <Text style={styles.periodLabel}>{getPeriodLabel()}</Text>
          <View style={styles.periodButtons}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                period === "day" && styles.activePeriodButton,
              ]}
              onPress={() => setPeriod("day")}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === "day" && styles.activePeriodButtonText,
                ]}
              >
                Day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                period === "week" && styles.activePeriodButton,
              ]}
              onPress={() => setPeriod("week")}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === "week" && styles.activePeriodButtonText,
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                period === "month" && styles.activePeriodButton,
              ]}
              onPress={() => setPeriod("month")}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === "month" && styles.activePeriodButtonText,
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                period === "year" && styles.activePeriodButton,
              ]}
              onPress={() => setPeriod("year")}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === "year" && styles.activePeriodButtonText,
                ]}
              >
                Year
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={20} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>
                {formatCurrency(analyticsData?.totalSales || 0)}
              </Text>
              <Text style={styles.statLabel}>Total Sales</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <ShoppingBag size={20} color={colors.secondary} />
              </View>
              <Text style={styles.statValue}>
                {analyticsData?.totalOrders || 0}
              </Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Users size={20} color={colors.info} />
              </View>
              <Text style={styles.statValue}>
                {analyticsData?.newCustomers || 0}
              </Text>
              <Text style={styles.statLabel}>New Customers</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Calendar size={20} color={colors.success} />
              </View>
              <Text style={styles.statValue}>
                {formatCurrency(analyticsData?.avgOrderValue || 0)}
              </Text>
              <Text style={styles.statLabel}>Avg. Order</Text>
            </View>
          </View>
        </View>

        {Platform.OS !== 'web' && (
          <>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Sales Trend</Text>
              <View style={styles.chart}>
                {getSalesChartData() && (
                  <LineChart
                    data={getSalesChartData()}
                    width={screenWidth}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chartStyle}
                  />
                )}
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Orders Trend</Text>
              <View style={styles.chart}>
                {getOrdersChartData() && (
                  <LineChart
                    data={getOrdersChartData()}
                    width={screenWidth}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => colors.secondary,
                    }}
                    bezier
                    style={styles.chartStyle}
                  />
                )}
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Popular Items</Text>
              <View style={styles.chart}>
                {getPopularItemsChartData() && (
                  <BarChart
                    data={getPopularItemsChartData()}
                    width={screenWidth}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => colors.info,
                    }}
                    style={styles.chartStyle}
                  />
                )}
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Customer Breakdown</Text>
              <View style={styles.chart}>
                {getCustomerBreakdownData() && (
                  <PieChart
                    data={getCustomerBreakdownData()}
                    width={screenWidth}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                )}
              </View>
            </View>
          </>
        )}

        {Platform.OS === 'web' && (
          <View style={styles.webChartsContainer}>
            <Text style={styles.chartTitle}>Charts</Text>
            <View style={styles.webChartPlaceholder}>
              <Text style={styles.webChartText}>
                Chart visualizations are available on mobile devices.
                Please view this page on the mobile app for full analytics.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.popularItemsContainer}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          {analyticsData?.popularItems?.map((item: any, index: number) => (
            <View key={index} style={styles.popularItemRow}>
              <Text style={styles.popularItemRank}>{index + 1}</Text>
              <Text style={styles.popularItemName}>{item.name}</Text>
              <Text style={styles.popularItemCount}>{item.count} orders</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
  },
  periodSelector: {
    marginBottom: 24,
  },
  periodLabel: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: "row",
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activePeriodButton: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    ...typography.bodySmall,
    color: colors.lightText,
    fontWeight: "500",
  },
  activePeriodButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 16,
  },
  chart: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  chartStyle: {
    borderRadius: 12,
    paddingRight: 16,
  },
  webChartsContainer: {
    marginBottom: 24,
  },
  webChartPlaceholder: {
    height: 220,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 24,
    padding: 20,
  },
  webChartText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
  },
  popularItemsContainer: {
    marginBottom: 24,
  },
  popularItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  popularItemRank: {
    ...typography.heading3,
    color: colors.primary,
    width: 30,
    textAlign: "center",
  },
  popularItemName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginLeft: 8,
  },
  popularItemCount: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
});
