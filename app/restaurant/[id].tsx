import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Star,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Globe,
  ChevronLeft,
  ShoppingBag,
  Navigation,
  MessageSquare,
  Send,
} from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import MenuItemCard from "@/components/MenuItemCard";
import CategoryPill from "@/components/CategoryPill";
import Button from "@/components/Button";
import { useRestaurantStore } from "@/store/restaurantStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { menuCategories } from "@/mocks/restaurants";
import { API_CONFIG } from "@/constants/api";

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

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const { fetchRestaurant, addReview } = useRestaurantStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Calculate cart items count directly
  const cartItemCount = items.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchRestaurant(id || "").then((data: any) => {
      if (isMounted) {
        setRestaurant(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);
  
  useEffect(() => {
    // Request location permission on native platforms
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
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading restaurant details...</Text>
      </View>
    );
  }
  
  const filteredMenu = restaurant && restaurant.menu && (selectedCategory === "All"
    ? restaurant.menu
    : restaurant.menu.filter(item => item.category === selectedCategory));
  
  if (!restaurant) {
    return (
      <View style={styles.notFound}>
        <Text style={typography.heading2}>Restaurant not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderPriceLevel = () => {
    const level = restaurant.priceLevel ? restaurant.priceLevel.length : 0;
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <DollarSign
          key={index}
          size={14}
          color={index < level ? colors.secondary : colors.lightText}
          fill={index < level ? colors.secondary : "none"}
        />
      ));
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleAddToCart = (menuItemId: string) => {
    // This function is implemented in the MenuItemCard component
  };

  const handleMenuItemPress = (menuItemId: string) => {
    router.push(`/menu-item/${restaurant.id}/${menuItemId}`);
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === "web" || !Location) return;
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");
      
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        Alert.alert(
          "Location Permission",
          "We need your location to show directions. Please enable location services in your settings.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.warn("Error requesting location permission:", error);
    }
  };

  const getDirections = () => {
    if (!userLocation && Platform.OS !== "web" && Location) {
      requestLocationPermission();
      return;
    }
    
    // On a real app, this would open maps with directions
    // For now, we'll just toggle the map view
    setShowMap(true);
  };

  const handleOpenReviewModal = () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "You need to be logged in to leave a review.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/login") }
        ]
      );
      return;
    }
    
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    if (!user) return;
    
    setIsSubmittingReview(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        addReview(restaurant.id, { rating: reviewRating, comments: reviewComment });
        
        setIsSubmittingReview(false);
        setShowReviewModal(false);
        setReviewRating(5);
        setReviewComment("");
        
        Alert.alert("Success", "Your review has been submitted. Thank you for your feedback!");
      } catch (error) {
        setIsSubmittingReview(false);
        Alert.alert("Error", "Failed to submit review. Please try again.");
      }
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.animatedHeader,
        { opacity: headerOpacity }
      ]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/cart")}
          >
            <ShoppingBag size={24} color={colors.text} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: restaurant.coverImageUrl || restaurant.imageUrl }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "transparent"]}
            style={styles.gradient}
          />
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartIconButton}
            onPress={() => router.push("/cart")}
          >
            <ShoppingBag size={24} color={colors.white} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{restaurant.name}</Text>
            
            <View style={styles.ratingContainer}>
              <Star size={18} color={colors.secondary} fill={colors.secondary} />
              <Text style={styles.rating}>{restaurant.rating}</Text>
              <Text style={styles.reviewCount}>({restaurant.reviewCount || 0} reviews)</Text>
              <TouchableOpacity 
                style={styles.writeReviewButton}
                onPress={handleOpenReviewModal}
              >
                <MessageSquare size={14} color={colors.primary} />
                <Text style={styles.writeReviewText}>Write a Review</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.categories}>
              {restaurant.categories && restaurant.categories.map((category, index) => (
                <React.Fragment key={category}>
                  <Text style={styles.category}>{category}</Text>
                  {index < (restaurant.categories?.length || 0) - 1 && (
                    <Text style={styles.categoryDot}>•</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Clock size={16} color={colors.lightText} />
                <Text style={styles.metaText}>{restaurant.estimatedDeliveryTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <View style={styles.priceLevelContainer}>
                  {renderPriceLevel()}
                </View>
              </View>
              {!restaurant.isOpen && (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedText}>Closed</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{restaurant.description}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Location</Text>
              <TouchableOpacity 
                style={styles.directionsButton}
                onPress={getDirections}
              >
                <Navigation size={16} color={colors.primary} />
                <Text style={styles.directionsText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={toggleMap}>
              {showMap && Platform.OS !== "web" && MapView && restaurant.location ? (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                      latitude: restaurant.location.latitude,
                      longitude: restaurant.location.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={restaurant.location}
                      title={restaurant.name}
                    >
                      <View style={styles.markerContainer}>
                        <MapPin size={24} color={colors.primary} />
                      </View>
                    </Marker>
                    
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
                  
                  {!locationPermission && (
                    <TouchableOpacity 
                      style={styles.locationPermissionButton}
                      onPress={requestLocationPermission}
                    >
                      <Text style={styles.locationPermissionText}>Enable location</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.addressContainer}>
                  <MapPin size={20} color={colors.primary} />
                  <Text style={styles.addressText}>{restaurant.address}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.infoItem}>
              <Phone size={18} color={colors.primary} />
              <Text style={styles.infoText}>{restaurant.phone || "Not available"}</Text>
            </View>
            
            {restaurant.website && (
              <View style={styles.infoItem}>
                <Globe size={18} color={colors.primary} />
                <Text style={styles.infoText}>{restaurant.website}</Text>
              </View>
            )}
            
            <View style={styles.hoursContainer}>
              <Text style={styles.hoursTitle}>Opening Hours</Text>
              {restaurant.openingHours && Object.entries(restaurant.openingHours).map(([day, hours]) => (
                <View key={day} style={styles.hourRow}>
                  <Text style={styles.dayText}>{day}</Text>
                  <Text style={styles.hoursText}>{hours}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Menu</Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScrollContent}
            >
              {menuCategories.map((category) => (
                <CategoryPill
                  key={category}
                  title={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
            </ScrollView>
            
            <View style={styles.menuItems}>
              {filteredMenu && filteredMenu.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onPress={() => handleMenuItemPress(item.id)}
                  onAddToCart={() => handleAddToCart(item.id)}
                />
              ))}
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <Text style={styles.modalSubtitle}>{restaurant.name}</Text>
            
            <View style={styles.ratingSelector}>
              <Text style={styles.ratingLabel}>Your Rating:</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setReviewRating(star)}
                  >
                    <Star
                      size={32}
                      color={colors.secondary}
                      fill={star <= reviewRating ? colors.secondary : "none"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <Text style={styles.commentLabel}>Your Review:</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience with this restaurant..."
              placeholderTextColor={colors.lightText}
              multiline
              numberOfLines={5}
              value={reviewComment}
              onChangeText={setReviewComment}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowReviewModal(false)}
                disabled={isSubmittingReview}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!reviewComment.trim() || isSubmittingReview) && styles.disabledButton
                ]}
                onPress={handleSubmitReview}
                disabled={!reviewComment.trim() || isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get("window");

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
    marginTop: 16,
    color: colors.lightText,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    zIndex: 10,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.heading4,
    flex: 1,
    textAlign: "center",
  },
  imageContainer: {
    height: 250,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backIconButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cartIconButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.heading1,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  rating: {
    ...typography.body,
    fontWeight: "600",
    marginLeft: 4,
  },
  reviewCount: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginLeft: 4,
  },
  writeReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.primary + "15",
    borderRadius: 4,
  },
  writeReviewText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  category: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  categoryDot: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginHorizontal: 4,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    ...typography.bodySmall,
    marginLeft: 4,
  },
  priceLevelContainer: {
    flexDirection: "row",
  },
  closedBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  description: {
    ...typography.body,
    lineHeight: 24,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + "40",
    justifyContent: "center",
    alignItems: "center",
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  locationPermissionButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationPermissionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addressText: {
    ...typography.body,
    marginLeft: 12,
    flex: 1,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  directionsText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    ...typography.body,
    marginLeft: 12,
  },
  hoursContainer: {
    marginTop: 16,
  },
  hoursTitle: {
    ...typography.heading4,
    marginBottom: 12,
  },
  hourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayText: {
    ...typography.body,
    fontWeight: "500",
    width: 100,
  },
  hoursText: {
    ...typography.body,
  },
  menuSection: {
    marginBottom: 24,
  },
  categoriesScrollContent: {
    paddingBottom: 16,
  },
  menuItems: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    ...typography.heading2,
    marginBottom: 4,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.lightText,
    marginBottom: 20,
  },
  ratingSelector: {
    marginBottom: 20,
  },
  ratingLabel: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  commentLabel: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: "top",
    ...typography.body,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: colors.lightText,
  },
  submitButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
});
