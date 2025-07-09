import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Filter, SlidersHorizontal, ChevronDown } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import SearchBar from "@/components/SearchBar";
import RecipeCard from "@/components/RecipeCard";
import CategoryPill from "@/components/CategoryPill";
import { useRecipeStore } from "@/store/recipeStore";
import { popularTags, regions, difficulties } from "@/mocks/recipes";

type SortOption = {
  label: string;
  value: string;
};

const sortOptions: SortOption[] = [
  { label: "Most Popular", value: "popular" },
  { label: "Highest Rated", value: "rating" },
  { label: "Newest", value: "newest" },
  { label: "Cooking Time", value: "time" },
];

export default function SearchScreen() {
  const router = useRouter();
  const {
    recipes,
    filteredRecipes,
    selectedTag,
    selectedRegion,
    searchQuery,
    setSelectedTag,
    setSelectedRegion,
    setSearchQuery,
    sortRecipes,
    filterByDifficulty,
    filterByTime,
  } = useRecipeStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>("popular");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const { width } = Dimensions.get("window");
  const isTablet = width > 768;

  useEffect(() => {
    // Apply sorting when selected option changes
    sortRecipes(selectedSort);
  }, [selectedSort, sortRecipes]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(selectedRegion === region ? null : region);
  };

  const handleDifficultySelect = (difficulty: string) => {
    const newDifficulty = selectedDifficulty === difficulty ? null : difficulty;
    setSelectedDifficulty(newDifficulty);
    filterByDifficulty(newDifficulty);
  };

  const handleTimeSelect = (time: number | null) => {
    setMaxTime(time);
    filterByTime(time);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
    if (showFilters) setShowFilters(false);
  };

  const handleSortSelect = (sortValue: string) => {
    setSelectedSort(sortValue);
    setShowSortOptions(false);
  };

  const clearAllFilters = () => {
    setSelectedTag(null);
    setSelectedRegion(null);
    setSelectedDifficulty(null);
    setMaxTime(null);
    setSearchQuery("");
    filterByDifficulty(null);
    filterByTime(null);
  };

  const getSelectedSortLabel = () => {
    return sortOptions.find((option) => option.value === selectedSort)?.label;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
            placeholder="Search recipes..."        
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            (selectedTag || selectedRegion || selectedDifficulty || maxTime) ? styles.activeFilterButton : {},
          ]}
          onPress={toggleFilters}
        >
          <Filter
            size={20}
            color={
              selectedTag || selectedRegion || selectedDifficulty || maxTime
                ? colors.white
                : colors.text
            }
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Categories</Text>
              {selectedTag && (
                <TouchableOpacity onPress={() => setSelectedTag(null)}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsContainer}
            >
              {popularTags.map((tag) => (
                <CategoryPill
                  key={tag}
                  title={tag}
                  selected={selectedTag === tag}
                  onPress={() => handleTagSelect(tag)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Regions</Text>
              {selectedRegion && (
                <TouchableOpacity onPress={() => setSelectedRegion(null)}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsContainer}
            >
              {regions.map((region) => (
                <CategoryPill
                  key={region}
                  title={region}
                  selected={selectedRegion === region}
                  onPress={() => handleRegionSelect(region)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Difficulty</Text>
              {selectedDifficulty && (
                <TouchableOpacity
                  onPress={() => handleDifficultySelect(selectedDifficulty)}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.difficultyContainer}>
              {difficulties.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.difficultyButton,
                    selectedDifficulty === difficulty &&
                      styles.selectedDifficultyButton,
                  ]}
                  onPress={() => handleDifficultySelect(difficulty)}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      selectedDifficulty === difficulty &&
                        styles.selectedDifficultyButtonText,
                    ]}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Cooking Time</Text>
              {maxTime && (
                <TouchableOpacity onPress={() => handleTimeSelect(null)}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.timeContainer}>
              {[30, 60, 90, 120].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    maxTime === time && styles.selectedTimeButton,
                  ]}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text
                    style={[
                      styles.timeButtonText,
                      maxTime === time && styles.selectedTimeButtonText,
                    ]}
                  >
                    {time === 120 ? "2+ hours" : `${time} min`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort By</Text>
            <View style={styles.sortOptionsContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    selectedSort === option.value && styles.selectedSortOption,
                  ]}
                  onPress={() => {
                    setSelectedSort(option.value);
                    sortRecipes(option.value);
                  }}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      selectedSort === option.value && styles.selectedSortOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={clearAllFilters}
          >
            <Text style={styles.clearAllText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredRecipes.length > 0 ? (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          contentContainerStyle={styles.recipesList}
          showsVerticalScrollIndicator={false}
          numColumns={isTablet ? 2 : 1}
          key={isTablet ? "two-column" : "one-column"}
          columnWrapperStyle={
            isTablet ? { justifyContent: "space-between" } : undefined
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No recipes found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search or filters to find what you're looking for
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  searchHeader: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    paddingHorizontal: 18,
    width: "100%",
  },
  filterSortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.inputBackground,
    marginLeft: 8,
  },
  sortButtonText: {
    ...typography.bodySmall,
    marginHorizontal: 8,
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  sortOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSortOption: {
    backgroundColor: colors.primary,
  },
  sortOptionText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  selectedSortOptionText: {
    color: colors.white,
    fontWeight: "600",
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterTitle: {
    ...typography.heading4,
  },
  clearText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  difficultyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    alignItems: "center",
  },
  selectedDifficultyButton: {
    backgroundColor: colors.primary,
  },
  difficultyButtonText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  selectedDifficultyButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    alignItems: "center",
  },
  selectedTimeButton: {
    backgroundColor: colors.primary,
  },
  timeButtonText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  selectedTimeButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  clearAllButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  clearAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  recipesList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    ...typography.heading3,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
  },
});
