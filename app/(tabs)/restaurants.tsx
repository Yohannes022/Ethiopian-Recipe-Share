import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { Search, MapPin, Filter, ChevronDown } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import RestaurantCard from "@/components/RestaurantCard";
import CategoryPill from "@/components/CategoryPill";
import { mockRestaurants, restaurantCategories } from "@/mocks/restaurants";

export default function RestaurantsScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState(mockRestaurants);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState("Loading location...");
  const [isLoading, setIsLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

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
    // Filter restaurants based on search query and category
    let filtered = [...restaurants];
    
    if (searchQuery) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (restaurant) => restaurant.cuisine === selectedCategory
      );
    }
    
    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCategory, restaurants]);

  const handleRestaurantPress = (id: string) => {
    router.push(`/restaurant/${id}`);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
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
        <TouchableOpacity style={styles.filterButton}>
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
            isSelected={selectedCategory === category}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
