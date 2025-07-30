import CategoryPill from "@/components/CategoryPill";
import RecipeCard from "@/components/RecipeCard";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { popularTags } from "@/mocks/recipes";
import { useRecipeStore } from "@/store/recipeStore";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { ChevronRight, MapPin, Star } from "lucide-react-native";
import React, { useState } from "react";
// statusBar
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const isTablet = width > 768;
  
  const { recipes, setSelectedTag, isLoading: recipesLoading } = useRecipeStore();
  const { restaurants, isLoading: restaurantsLoading } = useRestaurantStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  
  const featuredRecipe = recipes[0];
  const popularRecipes = recipes.slice(1, 5);
  const featuredRestaurants = restaurants.slice(0, 3);
  
  const filteredRecipes = selectedCategory
    ? recipes.filter((recipe) => recipe.tags.includes(selectedCategory))
    : popularRecipes;

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const handleSeeAllPopular = () => {
    setSelectedTag(null);
    router.push("/search");
  };

  const handleSeeAllCategory = (category: string) => {
    setSelectedTag(category);
    router.push("/search");
  };

  const handleSeeAllRestaurants = () => {
    router.push("/restaurants");
  };

  const handleLocationPress = async () => {
    if (!Location) return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        
        // Get address from coordinates
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (addressResponse.length > 0) {
          const { street, name, city, region } = addressResponse[0];
          const displayAddress = [street || name, city, region].filter(Boolean).join(', ');
          setAddress(displayAddress);
        }
        
        Linking.openURL(`geo:${location.coords.latitude},${location.coords.longitude}?q=My+Location`);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      // Optionally show an error message to the user
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would fetch fresh data from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const isLoading = recipesLoading || restaurantsLoading;

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <>
    <StatusBar style="light" />
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.locationWrapper}>
          <TouchableOpacity 
            onPress={handleLocationPress} 
            style={styles.locationContainer}
          >
            <MapPin size={20} color={colors.primary} />
            <Text 
              style={styles.locationText} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {address || 'My location'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push("/profile")} style={styles.profileButton}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200" }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Featured Recipe */}
      <View style={styles.featuredContainer}>
        <RecipeCard recipe={featuredRecipe} variant="featured" />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {popularTags.map((tag) => (
            <CategoryPill
              key={tag}
              title={tag}
              selected={selectedCategory === tag}
              onPress={() => handleCategoryPress(tag)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Featured Restaurants */}
      <View style={styles.restaurantsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={handleSeeAllRestaurants}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.restaurantsScrollContent}
        >
          {featuredRestaurants.map((restaurant) => (
            <TouchableOpacity 
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
            >
              <Image
                source={{ uri: restaurant.imageUrl }}
                style={styles.restaurantImage}
              />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {restaurant.name}
                </Text>
                <View style={styles.restaurantMeta}>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color={colors.secondary} fill={colors.secondary} />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <MapPin size={14} color={colors.lightText} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {restaurant.address}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Popular Recipes */}
      <View style={styles.popularContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `${selectedCategory} Recipes` : "Popular Recipes"}
          </Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() =>
              selectedCategory
                ? handleSeeAllCategory(selectedCategory)
                : handleSeeAllPopular()
            }
          >
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} variant="horizontal" />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // paddingHorizontal: 7,w
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationWrapper: {
    flex: 1,
    marginRight: 12,
    maxWidth: '80%',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  locationText: {
    ...typography.body,
    color: colors.text,
    marginLeft: 8,
    flexShrink: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  featuredContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoriesScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  restaurantsContainer: {
    marginBottom: 24,
  },
  restaurantsScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  restaurantCard: {
    width: 220,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginRight: 16,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantImage: {
    width: "100%",
    height: 120,
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    ...typography.heading4,
    marginBottom: 8,
  },
  restaurantMeta: {
    gap: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginLeft: 4,
    },
  popularContainer: {
    marginBottom: 24,
    paddingHorizontal: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
});
