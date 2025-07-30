import OrderStatusTracker from "@/components/OrderStatusTracker";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { restaurants } from "@/mocks/restaurants";
import { useCartStore } from "@/store/cartStore";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MapPin, MessageCircle, Navigation, Phone } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Conditionally import MapView to avoid web issues
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

// Only import on native platforms
if (Platform.OS !== "web") {
  try {
    const ReactNativeMaps = require("react-native-maps");
    MapView = ReactNativeMaps.default;
    Marker = ReactNativeMaps.Marker;
    PROVIDER_GOOGLE = ReactNativeMaps.PROVIDER_GOOGLE;
  } catch (error) {
    console.warn("react-native-maps could not be loaded", error);
  }
}

// Conditionally import Location to avoid web issues
let Location: any = null;
if (Platform.OS !== "web") {
  try {
    Location = require("expo-location");
  } catch (error) {
    console.warn("expo-location could not be loaded", error);
  }
}

export default function DeliveryTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getOrderById } = useCartStore();
  const mapRef = useRef<any>(null);
  
  const order = getOrderById(id);
  const restaurant = restaurants.find(r => r.id === order?.restaurantId);
  
  const [driverLocation, setDriverLocation] = useState(
    order?.driverInfo?.currentLocation || restaurant?.location
  );
  
  const [estimatedTime, setEstimatedTime] = useState<number>(
    order?.estimatedDeliveryTime ? parseInt(order.estimatedDeliveryTime.toString().split("-")[1]) : 30
  );

  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (Platform.OS !== "web" && Location) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status === "granted");
          
          if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        } catch (error) {
          console.warn("Error getting location:", error);
        }
      })();
    }
  }, []);
  
  useEffect(() => {
    // Simulate driver movement
    const interval = setInterval(() => {
      if (order?.status === "out-for-delivery" && driverLocation && order.deliveryAddress?.location) {
        // Move driver closer to delivery location
        const deliveryLoc = order.deliveryAddress.location;
        const newLat = driverLocation.latitude + (deliveryLoc.latitude - driverLocation.latitude) * 0.1;
        const newLng = driverLocation.longitude + (deliveryLoc.longitude - driverLocation.longitude) * 0.1;
        
        setDriverLocation({
          latitude: newLat,
          longitude: newLng,
        });
        
        // Update estimated time
        setEstimatedTime((prev) => Math.max(1, prev - 1));
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [driverLocation, order]);

  useEffect(() => {
    // Fit map to show all markers
    if (Platform.OS !== "web" && mapRef.current && restaurant?.location && order?.deliveryAddress?.location && driverLocation) {
      const points = [
        restaurant.location,
        order.deliveryAddress.location,
        driverLocation
      ];
      
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [restaurant, order, driverLocation]);
  
  const handleCallDriver = () => {
    if (order?.driverInfo?.phone) {
      Linking.openURL(`tel:${order.driverInfo.phone}`);
    }
  };
  
  const handleMessageDriver = () => {
    if (order?.driverInfo?.phone) {
      Linking.openURL(`sms:${order.driverInfo.phone}`);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === "web" || !Location) return;
    
    Alert.alert(
      "Location Permission",
      "We need your location to show you on the map and provide better delivery tracking.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              setLocationPermission(status === "granted");
              
              if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });
              }
            } catch (error) {
              console.warn("Error requesting location permission:", error);
            }
          }
        }
      ]
    );
  };
  
  if (!order || !restaurant) {
    return (
      <View style={styles.notFound}>
        <Text style={typography.heading2}>Order not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/profile")}
        >
          <Text style={styles.backButtonText}>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Tracking</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapContainer}>
          {Platform.OS === "web" || !MapView ? (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>Map View</Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: restaurant.location?.latitude,
                longitude: restaurant.location?.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {/* Restaurant marker */}
              <Marker
                coordinate={restaurant.location}
                title={restaurant.name}
                description="Restaurant location"
              >
                <View style={styles.restaurantMarker}>
                  <MapPin size={24} color={colors.white} />
                </View>
              </Marker>
              
              {/* Delivery address marker */}
              {order.deliveryAddress?.location && (
                <Marker
                  coordinate={order.deliveryAddress.location}
                  title="Delivery Address"
                  description={order.deliveryAddress.addressLine1}
                >
                  <View style={styles.destinationMarker}>
                    <MapPin size={24} color={colors.white} />
                  </View>
                </Marker>
              )}
              
              {/* Driver marker */}
              {driverLocation && (
                <Marker
                  coordinate={driverLocation}
                  title={order.driverInfo?.name || "Driver"}
                  description="Your delivery driver"
                >
                  <View style={styles.driverMarker}>
                    <Navigation size={24} color={colors.white} />
                  </View>
                </Marker>
              )}

              {/* User location marker */}
              {userLocation && (
                <Marker
                  coordinate={userLocation}
                  title="Your Location"
                >
                  <View style={styles.userMarker}>
                    <View style={styles.userMarkerInner} />
                  </View>
                </Marker>
              )}
            </MapView>
          )}
        </View>
        
        {order.driverInfo && (
          <View style={styles.driverInfoCard}>
            <View style={styles.driverInfoHeader}>
              <Image
                source={{ uri: order.driverInfo.photoUrl }}
                style={styles.driverImage}
                contentFit="cover"
              />
              <View style={styles.driverInfoText}>
                <Text style={styles.driverName}>{order.driverInfo.name}</Text>
                <Text style={styles.deliveryStatus}>{order.status}</Text>
              </View>
            </View>
            <View style={styles.driverActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCallDriver}
              >
                <Phone size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Call Driver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleMessageDriver}
              >
                <MessageCircle size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.content}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MapPin size={24} color={colors.white} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Delivery Address</Text>
                <Text style={styles.detailValue}>{order.deliveryAddress?.addressLine1}</Text>
                {order.deliveryAddress?.addressLine2 && (
                  <Text style={styles.detailValue}>{order.deliveryAddress.addressLine2}</Text>
                )}
                <Text style={styles.detailNote}>{order.deliveryAddress?.instructions}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Navigation size={24} color={colors.white} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Estimated Arrival</Text>
                <Text style={styles.detailValue}>{estimatedTime} minutes</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {order.items.map((item) => (
              <View key={item.menuItemId} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>{item.price.toFixed(2)} Birr</Text>
              </View>
            ))}
            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{order.totalAmount.toFixed(2)} Birr</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Footer with action buttons */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerTextContainer}>
            <Text style={styles.footerLabel}>Estimated Delivery</Text>
            <Text style={styles.footerTime}>{estimatedTime} min</Text>
          </View>
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => {
              // Center map on driver's location
              if (mapRef.current && driverLocation) {
                mapRef.current.animateToRegion({
                  ...driverLocation,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }, 1000);
              }
            }}
          >
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Location Permission Banner */}
      {!locationPermission && Platform.OS !== 'web' && (
        <View style={styles.locationPermissionBanner}>
          <MapPin size={20} color={colors.primary} />
          <Text style={styles.locationPermissionText}>
            Enable location to track your order in real-time
          </Text>
          <TouchableOpacity 
            style={styles.enableButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.enableButtonText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 90,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  mapContainer: {
    height: 300,
    backgroundColor: colors.lightGray,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  mapPlaceholderText: {
    ...typography.body,
    color: colors.text,
  },
  driverInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  driverInfoText: {
    flex: 1,
  },
  driverName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  deliveryStatus: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginTop: 2,
  },
  driverActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.white,
    marginLeft: 6,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
  },
  detailNote: {
    ...typography.caption,
    color: colors.lightText,
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    ...typography.body,
    color: colors.text,
    marginBottom: 2,
  },
  orderItemQuantity: {
    ...typography.caption,
    color: colors.lightText,
  },
  orderItemPrice: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  totalLabel: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  totalAmount: {
    ...typography.heading4,
    color: colors.primary,
  },
  
  // Marker Styles
  restaurantMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    transform: [{ rotate: '45deg' }],
  },
  userMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userMarkerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTextContainer: {
    flex: 1,
  },
  footerLabel: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 2,
  },
  footerTime: {
    ...typography.heading4,
    color: colors.primary,
  },
  trackButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  trackButtonText: {
    ...typography.button,
    color: colors.white,
  },
  
  // Location Permission Banner
  locationPermissionBanner: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationPermissionText: {
    ...typography.bodySmall,
    color: colors.primary,
    flex: 1,
    marginLeft: 8,
    marginRight: 12,
  },
  enableButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  enableButtonText: {
    ...typography.buttonSmall,
    color: colors.white,
  },
});
