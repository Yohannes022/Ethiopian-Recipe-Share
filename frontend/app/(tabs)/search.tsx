import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  SafeAreaView,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Types
type Recipe = {
  id: string;
  title: string;
  image: string;
  rating: number;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  region: string;
  tags: string[];
};

type FilterType = 'cuisine' | 'diet' | 'cookingTime' | 'ingredients' | 'difficulty' | 'region';

type Filter = {
  id: string;
  label: string;
  type: FilterType;
  selected: boolean;
};

// Mock data
const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Injera with Doro Wat',
    image: 'https://example.com/injera-doro-wat.jpg',
    rating: 4.8,
    cookTime: 120,
    difficulty: 'Medium',
    region: 'Ethiopia',
    tags: ['dinner', 'spicy', 'chicken'],
  },
  {
    id: '2',
    title: 'Shiro Wat',
    image: 'https://example.com/shiro-wat.jpg',
    rating: 4.5,
    cookTime: 45,
    difficulty: 'Easy',
    region: 'Ethiopia',
    tags: ['lunch', 'vegetarian', 'stew'],
  },
  {
    id: '3',
    title: 'Kitfo',
    image: 'https://example.com/kitfo.jpg',
    rating: 4.7,
    cookTime: 30,
    difficulty: 'Medium',
    region: 'Ethiopia',
    tags: ['dinner', 'meat', 'spicy'],
  },
];

const filters: Filter[] = [
  { id: 'breakfast', label: 'Breakfast', type: 'cuisine', selected: false },
  { id: 'lunch', label: 'Lunch', type: 'cuisine', selected: false },
  { id: 'dinner', label: 'Dinner', type: 'cuisine', selected: false },
  { id: 'vegetarian', label: 'Vegetarian', type: 'diet', selected: false },
  { id: 'vegan', label: 'Vegan', type: 'diet', selected: false },
  { id: 'under-30', label: 'Under 30 min', type: 'cookingTime', selected: false },
  { id: 'easy', label: 'Easy', type: 'difficulty', selected: false },
  { id: 'medium', label: 'Medium', type: 'difficulty', selected: false },
  { id: 'hard', label: 'Hard', type: 'difficulty', selected: false },
  { id: 'northern', label: 'Northern', type: 'region', selected: false },
  { id: 'southern', label: 'Southern', type: 'region', selected: false },
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = ['25%', '50%'];

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Filter recipes based on search query
    if (query.trim() === '') {
      setRecipes(mockRecipes);
    } else {
      const filtered = mockRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(query.toLowerCase())
      );
      setRecipes(filtered);
    }
  };

  // Toggle filter selection
  const toggleFilter = (filterId: string) => {
    const updatedFilters = filters.map(filter => 
      filter.id === filterId 
        ? { ...filter, selected: !filter.selected }
        : filter
    );
    
    setActiveFilters(updatedFilters.filter(f => f.selected));
    // Apply filters to recipes
    applyFilters(updatedFilters);
  };

  // Apply all active filters
  const applyFilters = (filtersToApply: Filter[]) => {
    // This is a simplified filter logic
    // You can enhance it based on your specific requirements
    let filteredRecipes = [...mockRecipes];
    
    // Apply search query filter
    if (searchQuery.trim() !== '') {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply other active filters
    const activeFilterTypes = new Set(filtersToApply
      .filter(f => f.selected)
      .map(f => f.type));
    
    if (activeFilterTypes.size > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => {
        // This is a simplified check - adjust according to your filter logic
        return true; // Replace with actual filter logic
      });
    }
    
    setRecipes(filteredRecipes);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = filters.map(filter => ({
      ...filter,
      selected: false,
    }));
    setActiveFilters([]);
    setRecipes(mockRecipes);
  };

  // Render filter chip
  const renderFilterChip = (filter: Filter) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterChip,
        filter.selected && styles.filterChipActive,
      ]}
      onPress={() => toggleFilter(filter.id)}
    >
      <Text style={[
        styles.filterChipText,
        filter.selected && styles.filterChipTextActive,
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  // Render recipe item
  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => router.push(`/recipe/${item.id}`)}
    >
      <Text style={styles.recipeTitle}>{item.title}</Text>
      <View style={styles.recipeMeta}>
        <Text style={styles.recipeMetaText}>{item.cookTime} min</Text>
        <Text style={styles.recipeMetaText}>•</Text>
        <Text style={styles.recipeMetaText}>{item.difficulty}</Text>
        <Text style={styles.recipeMetaText}>•</Text>
        <Text style={styles.recipeMetaText}>{item.region}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color={colors.warning} />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.gray}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersScroll}
            >
              {activeFilters.map(filter => (
                <View key={filter.id} style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>{filter.label}</Text>
                  <TouchableOpacity onPress={() => toggleFilter(filter.id)}>
                    <Ionicons name="close" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersText}>Clear all</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Filter Button */}
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => bottomSheetModalRef.current?.present()}
        >
          <Ionicons name="filter" size={20} color={colors.primary} />
          <Text style={styles.filterButtonText}>Filters</Text>
          {activeFilters.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilters.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Recipe List */}
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.recipeList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={colors.gray} />
              <Text style={styles.emptyStateTitle}>No recipes found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />

        {/* Filter Bottom Sheet */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.bottomSheetHandle}
        >
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Filters</Text>
              <TouchableOpacity onPress={() => bottomSheetModalRef.current?.dismiss()}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filtersContainer}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.filtersRow}>
                {filters.filter(f => f.type === 'cuisine').map(renderFilterChip)}
              </View>

              <Text style={styles.sectionTitle}>Dietary</Text>
              <View style={styles.filtersRow}>
                {filters.filter(f => f.type === 'diet').map(renderFilterChip)}
              </View>

              <Text style={styles.sectionTitle}>Cooking Time</Text>
              <View style={styles.filtersRow}>
                {filters.filter(f => f.type === 'cookingTime').map(renderFilterChip)}
              </View>

              <Text style={styles.sectionTitle}>Difficulty</Text>
              <View style={styles.filtersRow}>
                {filters.filter(f => f.type === 'difficulty').map(renderFilterChip)}
              </View>

              <Text style={styles.sectionTitle}>Region</Text>
              <View style={styles.filtersRow}>
                {filters.filter(f => f.type === 'region').map(renderFilterChip)}
              </View>
            </ScrollView>

            <View style={styles.bottomSheetActions}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => bottomSheetModalRef.current?.dismiss()}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

interface Styles {
  container: ViewStyle;
  searchContainer: ViewStyle;
  searchIcon: TextStyle;
  searchInput: TextStyle;
  activeFiltersContainer: ViewStyle;
  activeFiltersScroll: ViewStyle;
  activeFilter: ViewStyle;
  activeFilterText: TextStyle;
  clearFiltersButton: ViewStyle;
  clearFiltersText: TextStyle;
  filterButton: ViewStyle;
  filterButtonText: TextStyle;
  filterBadge: ViewStyle;
  filterBadgeText: TextStyle;
  filterChip: ViewStyle;
  filterChipActive: ViewStyle;
  filterChipText: TextStyle;
  filterChipTextActive: TextStyle;
  recipeList: ViewStyle;
  recipeCard: ViewStyle;
  recipeTitle: TextStyle;
  recipeMeta: ViewStyle;
  recipeMetaText: TextStyle;
  ratingContainer: ViewStyle;
  ratingText: TextStyle;
  emptyState: ViewStyle;
  emptyStateTitle: TextStyle;
  emptyStateText: TextStyle;
  bottomSheetBackground: ViewStyle;
  bottomSheetHandle: ViewStyle;
  bottomSheetContent: ViewStyle;
  bottomSheetHeader: ViewStyle;
  bottomSheetTitle: TextStyle;
  filtersContainer: ViewStyle;
  sectionTitle: TextStyle;
  filtersRow: ViewStyle;
  bottomSheetActions: ViewStyle;
  clearButton: ViewStyle;
  clearButtonText: TextStyle;
  applyButton: ViewStyle;
  applyButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.text,
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  activeFiltersScroll: {
    paddingBottom: 8,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilterText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
    color: colors.white,
    fontWeight: '500',
    marginRight: 6,
  },
  clearFiltersButton: {
    padding: 6,
    marginLeft: 4,
  },
  clearFiltersText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
    color: colors.primary,
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  filterButtonText: {
    marginLeft: 6,
    color: colors.primary,
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
    fontWeight: '500',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
    color: colors.text,
  },
  filterChipTextActive: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
    color: colors.primary,
    fontWeight: '500',
  },
  recipeList: {
    padding: 16,
    paddingTop: 0,
  },
  recipeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recipeTitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipeMetaText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
    color: colors.gray,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
    color: colors.text,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontFamily: typography.bodyLarge.fontFamily,
    fontSize: typography.bodyLarge.fontSize,
    lineHeight: typography.bodyLarge.lineHeight,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
    color: colors.gray,
    textAlign: 'center',
  },
  bottomSheetBackground: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetHandle: {
    backgroundColor: colors.border,
    width: 40,
    height: 4,
    marginTop: 12,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 24,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomSheetTitle: {
    fontFamily: typography.heading3.fontFamily,
    fontSize: typography.heading3.fontSize,
    lineHeight: typography.heading3.lineHeight,
    color: colors.text,
  },
  filtersContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  bottomSheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    marginRight: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: '500',
    color: colors.text,
  },
  applyButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: typography.button.fontSize,
    lineHeight: typography.button.lineHeight,
    color: colors.white,
  },
});

// export default SearchScreen;