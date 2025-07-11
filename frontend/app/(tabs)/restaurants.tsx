import CategoryPill from "@/components/CategoryPill";
import RestaurantCard from "@/components/RestaurantCard";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
// Remove the import since we're defining them in this file
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { ChevronDown, Filter, MapPin, Search, X, Check } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { Modal, Switch } from "react-native";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define the Restaurant interface with all required properties
// Import the base Restaurant type and extend it
import type { Restaurant as BaseRestaurant } from '@/types/restaurant';

// Define the extended Restaurant interface with proper typing
interface Restaurant extends BaseRestaurant {
  id: string;
  name: string;
  image: string;
  imageUrl: string;
  rating: number;
  deliveryTime: string;
  minOrder: string;
  categories: string[];
  cuisine: string;
  priceLevel: string; // Changed to only accept string
  isOpen: boolean;
  distance: string;
  address: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
  dietaryOptions?: string[];
  // Override the openingHours to be more specific about the type
  openingHours?: Record<string, { open: string; close: string }>;
}

type PriceRange = [number, number];

const priceRanges = [
  { label: 'Under 100 ETB', value: [0, 100] as [number, number] },
  { label: '100-300 ETB', value: [100, 300] as [number, number] },
  { label: '300-500 ETB', value: [300, 500] as [number, number] },
  { label: '500+ ETB', value: [500, Infinity] as [number, number] },
];

// Mock data for restaurants
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Habesha Restaurant',
    image: 'https://example.com/habesha.jpg',
    imageUrl: 'https://example.com/habesha.jpg',
    rating: 4.5,
    deliveryTime: '30-45 min',
    minOrder: '100 ETB',
    categories: ['Ethiopian', 'Traditional'],
    cuisine: 'Ethiopian',
    priceLevel: '$$',
    isOpen: true,
    distance: '1.2 km',
    address: '123 Bole Road, Addis Ababa',
    ownerId: 'owner123',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    estimatedDeliveryTime: '45',
    dietaryOptions: ['Vegetarian', 'Vegan', 'gluten-free', 'halal'],
    openingHours: {
      'Monday': { open: '09:00', close: '22:00' },
      'Tuesday': { open: '09:00', close: '22:00' },
      'Wednesday': { open: '09:00', close: '22:00' },
      'Thursday': { open: '09:00', close: '22:00' },
      'Friday': { open: '09:00', close: '23:00' },
      'Saturday': { open: '10:00', close: '23:00' },
      'Sunday': { open: '10:00', close: '22:00' }
    }
  },
  {
    id: '2',
    name: 'Tibs Village',
    image: 'https://example.com/tibs.jpg',
    imageUrl: 'https://example.com/tibs.jpg',
    rating: 4.2,
    deliveryTime: '20-30 min',
    minOrder: '50 ETB',
    categories: ['Ethiopian', 'Grill'],
    cuisine: 'Ethiopian',
    priceLevel: '$$',
    isOpen: true,
    distance: '0.8 km',
    address: '456 Bole Road, Addis Ababa',
    ownerId: 'owner456',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z',
    estimatedDeliveryTime: '30',
    dietaryOptions: ['Meat Lovers', 'Spicy', 'halal'],
    openingHours: {
      'Monday': { open: '10:00', close: '23:00' },
      'Tuesday': { open: '10:00', close: '23:00' },
      'Wednesday': { open: '10:00', close: '23:00' },
      'Thursday': { open: '10:00', close: '23:00' },
      'Friday': { open: '10:00', close: '00:00' },
      'Saturday': { open: '11:00', close: '00:00' },
      'Sunday': { open: '11:00', close: '22:00' }
    }
  },
  {
    id: '3',
    name: 'Injera Time',
    image: 'https://example.com/injera.jpg',
    imageUrl: 'https://example.com/injera.jpg',
    rating: 4.0,
    deliveryTime: '25-40 min',
    minOrder: '75 ETB',
    categories: ['Ethiopian', 'Vegetarian'],
    cuisine: 'Ethiopian',
    priceLevel: '$$',
    isOpen: true,
    distance: '1.5 km',
    address: '789 Bole Road, Addis Ababa',
    ownerId: 'owner789',
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-01T00:00:00Z',
    estimatedDeliveryTime: '40',
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    openingHours: {
      'Monday': { open: '08:00', close: '21:00' },
      'Tuesday': { open: '08:00', close: '21:00' },
      'Wednesday': { open: '08:00', close: '21:00' },
      'Thursday': { open: '08:00', close: '21:00' },
      'Friday': { open: '08:00', close: '22:00' },
      'Saturday': { open: '09:00', close: '22:00' },
      'Sunday': { open: '10:00', close: '18:00' } // Changed from 'Closed' to a valid time range
    }
  }
];

const restaurantCategories = ['All', 'Ethiopian', 'Traditional', 'Fast Food'];

export default function RestaurantsScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleRestaurantPress = (restaurantId: string) => {
    router.push(`/restaurant/${restaurantId}`);
  };

  const toggleCuisine = (cuisineId: string) => {
    setFilters(prev => ({
      ...prev,
      cuisines: prev.cuisines.map(cuisine => 
        cuisine.id === cuisineId 
          ? { ...cuisine, selected: !cuisine.selected } 
          : cuisine
      )
    }));
  };
  
  const parseDeliveryTime = (timeStr: string | number | undefined): number => {
    if (!timeStr) return 0;
    const str = String(timeStr);
    const matches = str.match(/(\d+)/g);
    if (!matches || matches.length === 0) return 0;
    const nums = matches.map(Number);
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  };

  // Define restaurant categories with proper typing
  const restaurantCategories = [
    'All',
    'Ethiopian',
    'Italian',
    'Chinese',
    'Indian',
    'Pizza',
    'Burgers',
    'Sushi',
    'Desserts'
  ] as const;

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState("Loading location...");
  const [isLoading, setIsLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  type CuisineType = {
    id: string;
    name: string;
    selected: boolean;
  };

  const initialCuisines: CuisineType[] = [
    { id: 'ethiopian', name: 'Ethiopian', selected: false },
    { id: 'italian', name: 'Italian', selected: false },
    { id: 'chinese', name: 'Chinese', selected: false },
    { id: 'indian', name: 'Indian', selected: false },
    { id: 'mexican', name: 'Mexican', selected: false },
  ];

  const [filters, setFilters] = useState({
    priceRange: [0, 1000] as [number, number],
    openNow: false,
    minRating: 0,
    cuisines: initialCuisines,
    dietaryOptions: [] as string[],
    maxDeliveryTime: 60,
  });

  useEffect(() => {
    // Get location permission and current location
    const getLocation = async () => {
      try {
        if (Platform.OS === 'web') {
          // Handle web differently since expo-location has limited support
          setAddress("New York, NY");
          setLocationPermission(true);
          setIsLoading(false);
          return;
        }
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === "granted");
        
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          setLocation(location);
          
          // Get address from coordinates
          const geocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          if (geocode.length > 0) {
            const { city, region } = geocode[0];
            setAddress(`${city || ""}, ${region || ""}`);
          }
        } else {
          setAddress("Location permission denied");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error getting location:", error);
        setAddress("Error getting location");
        setIsLoading(false);
      }
    };
    
    getLocation();
  }, []);

  useEffect(() => {
    // Filter restaurants based on search query, category, and filters with type safety
    let filtered = [...restaurants];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query) ||
        (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(query)) ||
        (restaurant.categories && restaurant.categories.some((cat: string) => 
          cat.toLowerCase().includes(query)
        ))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(restaurant => 
        (restaurant.categories && restaurant.categories.includes(selectedCategory)) ||
        (restaurant.cuisine && restaurant.cuisine === selectedCategory)
      );
    }
    
    // Apply price range filter
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000) {
      const [minPrice, maxPrice] = filters.priceRange;
      filtered = filtered.filter(restaurant => {
        if (!restaurant.priceLevel) return false;
        const price = parseInt(restaurant.priceLevel.replace(/[^0-9]/g, ''));
        return price >= minPrice && price <= maxPrice;
      });
    }
    
    // Apply cuisine filter
    const selectedCuisines = filters.cuisines
      .filter(cuisine => cuisine.selected)
      .map(cuisine => cuisine.id.toLowerCase());
      
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(restaurant => 
        restaurant.cuisine && 
        selectedCuisines.includes(restaurant.cuisine.toLowerCase())
      );
    }
    
    // Apply open now filter
    if (filters.openNow) {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = now.getHours() * 100 + now.getMinutes();

      filtered = filtered.filter((restaurant) => {
        const hours = restaurant.openingHours?.[currentDay];
        if (!hours || typeof hours === 'string') return false;
        
        // If hours is an object with open/close times, use them directly
        if (typeof hours === 'object' && 'open' in hours && 'close' in hours) {
          const parseTime = (timeStr: string) => {
            const [hours, minutes] = timeStr
              .replace(/[^0-9:]/g, '')
              .split(':')
              .map(Number);
            return { hours, minutes: minutes || 0 };
          };

          const openTime = parseTime(hours.open);
          const closeTime = parseTime(hours.close);

          const openTimeInMinutes = openTime.hours * 100 + openTime.minutes;
          let closeTimeInMinutes = closeTime.hours * 100 + closeTime.minutes;

          // Handle overnight hours
          if (closeTimeInMinutes < openTimeInMinutes) {
            closeTimeInMinutes += 2400; // Add 24 hours
          }

          return currentTime >= openTimeInMinutes && currentTime <= closeTimeInMinutes;
        }
        return false; // If hours format is invalid, exclude from results
      });
    }
    
    // Apply rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(
        (restaurant) => restaurant.rating >= filters.minRating
      );
    }
    
    // Apply dietary options filter
    if (filters.dietaryOptions.length > 0) {
      filtered = filtered.filter(restaurant => 
        restaurant.dietaryOptions && 
        filters.dietaryOptions.every(option => 
          restaurant.dietaryOptions?.includes(option)
        )
      );
    }
    
    // Apply max delivery time filter
    if (filters.maxDeliveryTime < 60) {
      filtered = filtered.filter(restaurant => {
        const deliveryTime = parseDeliveryTime(restaurant.deliveryTime);
        return deliveryTime > 0 && deliveryTime <= filters.maxDeliveryTime;
      });
    }
    
    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCategory, filters, restaurants]);
  
  const toggleDietaryOption = (option: string) => {
    setFilters(prev => ({
      ...prev,
      dietaryOptions: prev.dietaryOptions.includes(option)
        ? prev.dietaryOptions.filter(o => o !== option)
        : [...prev.dietaryOptions, option]
    }));
  };

  const togglePriceRange = (price: [number, number]) => {
    setFilters(prev => {
      // If the same price range is clicked again, reset to default
      if (prev.priceRange[0] === price[0] && prev.priceRange[1] === price[1]) {
        return { ...prev, priceRange: [0, 1000] as [number, number] };
      }
      // Otherwise set the new price range
      return { ...prev, priceRange: price };
    });
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      openNow: false,
      minRating: 0,
      cuisines: initialCuisines,
      dietaryOptions: [],
      maxDeliveryTime: 60,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin size={20} color={colors.primary} style={styles.locationIcon} />
          <Text style={styles.locationText} numberOfLines={1}>
            {address}
          </Text>
          <ChevronDown size={16} color={colors.text} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            placeholderTextColor={colors.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {restaurantCategories.map((category) => (
          <CategoryPill
            key={category}
            title={category}
            selected={selectedCategory === category}
            onPress={() => handleCategoryPress(category)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      ) : filteredRestaurants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No restaurants found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.restaurantsList}
          contentContainerStyle={styles.restaurantsListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => handleRestaurantPress(restaurant.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Restaurants</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptions}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range (ETB)</Text>
                <View style={styles.priceRangeContainer}>
                  {priceRanges.map((price) => (
                    <TouchableOpacity
                      key={price.label}
                      style={[
                        styles.priceButton,
                        filters.priceRange[0] === price.value[0] && filters.priceRange[1] === price.value[1] && styles.priceButtonSelected,
                      ]}
                      onPress={() => togglePriceRange(price.value)}
                    >
                      <Text
                        style={[
                          styles.priceButtonText,
                          filters.priceRange[0] === price.value[0] && filters.priceRange[1] === price.value[1] && styles.priceButtonTextSelected,
                        ]}
                      >
                        {price.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Cuisine Type</Text>
                <View style={styles.tagsContainer}>
                  {filters.cuisines.map((cuisine) => (
                    <TouchableOpacity
                      key={cuisine.id}
                      style={[
                        styles.tagButton,
                        cuisine.selected && styles.tagButtonSelected,
                      ]}
                      onPress={() => toggleCuisine(cuisine.id)}
                    >
                      <Text
                        style={[
                          styles.tagButtonText,
                          cuisine.selected && styles.tagButtonTextSelected,
                        ]}
                      >
                        {cuisine.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Dietary Options</Text>
                <View style={styles.tagsContainer}>
                  {filters.dietaryOptions.length > 0 && (
                    <Text style={styles.filterBadge}>
                      {filters.dietaryOptions.length}
                    </Text>
                  )}
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.tagButton,
                        filters.dietaryOptions.includes(option) && styles.tagButtonSelected,
                      ]}
                      onPress={() => toggleDietaryOption(option)}
                    >
                      <Text
                        style={[
                          styles.tagButtonText,
                          filters.dietaryOptions.includes(option) && styles.tagButtonTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <View style={styles.filterRow}>
                  <Text style={styles.filterSectionTitle}>
                    Max Delivery Time: {filters.maxDeliveryTime} min
                  </Text>
                </View>
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderTrack}>
                    <View 
                      style={[
                        styles.sliderFill,
                        { width: `${(filters.maxDeliveryTime / 120) * 100}%` }
                      ]} 
                    />
                  </View>
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>15 min</Text>
                    <Text style={styles.sliderLabel}>60 min</Text>
                    <Text style={styles.sliderLabel}>120 min</Text>
                  </View>
                  <View style={styles.sliderThumbContainer}>
                    <View 
                      style={styles.sliderThumb}
                      onStartShouldSetResponder={() => true}
                      onMoveShouldSetResponder={() => true}
                      onResponderMove={(e) => {
                        const { locationX } = e.nativeEvent;
                        const containerWidth = e.currentTarget.measure(() => {});
                        const percentage = Math.min(Math.max(locationX / 300, 0), 1);
                        const newValue = Math.round(15 + (percentage * 105)); // 15 to 120 minutes
                        setFilters(prev => ({ ...prev, maxDeliveryTime: newValue }));
                      }}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.filterSection}>
                <View style={styles.filterRow}>
                  <Text style={styles.filterSectionTitle}>Open Now</Text>
                  <Switch
                    value={filters.openNow}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, openNow: value }))
                    }
                    trackColor={{ false: colors.lightGray, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() =>
                        setFilters((prev) => ({
                          ...prev,
                          minRating: prev.minRating === star ? 0 : star,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.ratingStar,
                          star <= filters.minRating && styles.ratingStarSelected,
                        ]}
                      >
                        {star <= filters.minRating ? '★' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.ratingText}>
                    {filters.minRating > 0 ? `${filters.minRating}+` : 'Any'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.filterButton, styles.resetButton]}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
    marginRight: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text,
    ...typography.body,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...typography.h4,
    fontWeight: '700',
  },
  filterOptions: {
    maxHeight: '80%',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterBadge: {
    position: 'absolute',
    right: 8,
    top: -8,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterSectionTitle: {
    ...typography.subtitle,
    marginBottom: 12,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  tagButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagButtonText: {
    ...typography.small,
    color: colors.text,
  },
  tagButtonTextSelected: {
    color: colors.white,
  },
  sliderContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    position: 'relative',
    marginBottom: 8,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sliderLabel: {
    ...typography.small,
    color: colors.lightText,
  },
  sliderThumbContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 24,
    justifyContent: 'center',
    marginTop: -10,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    position: 'absolute',
    left: '50%',
    marginLeft: -12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  priceButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  priceButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priceButtonText: {
    ...typography.body,
    color: colors.text,
  },
  priceButtonTextSelected: {
    color: colors.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingStar: {
    fontSize: 24,
    color: colors.lightGray,
  },
  ratingStarSelected: {
    color: colors.warning,
  },
  ratingText: {
    ...typography.body,
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  applyButton: {
    flex: 2,
    backgroundColor: colors.primary,
  },
  resetButtonText: {
    ...typography.button,
    color: colors.text,
  },
  applyButtonText: {
    ...typography.button,
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
  },
  restaurantsList: {
    flex: 1,
  },
  restaurantsListContent: {
    padding: 16,
    paddingTop: 0,
  },
});
