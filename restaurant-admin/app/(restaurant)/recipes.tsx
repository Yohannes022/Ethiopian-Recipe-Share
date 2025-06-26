import { useRouter } from 'expo-router';
import { Plus, Search, Filter, Clock, Users, Flame, Sliders } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type Recipe = {
  _id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  image?: string;
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
  }[];
  instructions: string[];
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
};

type RecipeFilter = 'all' | 'published' | 'drafts' | 'featured';

export default function RecipeManagement() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [activeFilter, setActiveFilter] = useState<RecipeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [searchQuery, activeFilter, recipes]);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/recipes');
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      Alert.alert('Error', 'Failed to load recipes. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecipes();
  };

  const filterRecipes = () => {
    let filtered = [...recipes];
    
    // Apply status filter
    switch (activeFilter) {
      case 'published':
        filtered = filtered.filter(recipe => recipe.isPublished);
        break;
      case 'drafts':
        filtered = filtered.filter(recipe => !recipe.isPublished);
        break;
      case 'featured':
        filtered = filtered.filter(recipe => recipe.isFeatured);
        break;
      default:
        // 'all' - no filter
        break;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        recipe =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query)) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredRecipes(filtered);
  };

  const toggleRecipeStatus = async (recipeId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/recipes/${recipeId}/status`, { isPublished: !currentStatus });
      fetchRecipes();
    } catch (error) {
      console.error('Error updating recipe status:', error);
      Alert.alert('Error', 'Failed to update recipe status. Please try again.');
    }
  };

  const toggleFeaturedStatus = async (recipeId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/recipes/${recipeId}/featured`, { isFeatured: !currentStatus });
      fetchRecipes();
    } catch (error) {
      console.error('Error updating featured status:', error);
      Alert.alert('Error', 'Failed to update featured status. Please try again.');
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    try {
      await api.delete(`/recipes/${recipeId}`);
      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      Alert.alert('Error', 'Failed to delete recipe. Please try again.');
    }
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => router.push(`/(restaurant)/recipes/${item._id}`)}
    >
      <View style={styles.recipeImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.recipeImage} />
        ) : (
          <View style={styles.recipeImagePlaceholder} />
        )}
        
        {/* Featured Badge */}
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
        )}
        
        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          item.isPublished ? styles.publishedBadge : styles.draftBadge,
        ]}>
          <Text style={styles.statusBadgeText}>
            {item.isPublished ? 'Published' : 'Draft'}
          </Text>
        </View>
      </View>
      
      <View style={styles.recipeContent}>
        <Text style={styles.recipeName} numberOfLines={1}>
          {item.name}
        </Text>
        
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.recipeMeta}>
          <View style={styles.metaItem}>
            <Clock size={14} color="#999" />
            <Text style={styles.metaText}>
              {item.prepTime + item.cookTime} min
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Users size={14} color="#999" />
            <Text style={styles.metaText}>
              {item.servings} {item.servings === 1 ? 'serving' : 'servings'}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Flame size={14} color="#999" />
            <Text style={styles.metaText}>
              {item.calories} cal
            </Text>
          </View>
        </View>
        
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <View style={styles.moreTags}>
                <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.recipeActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.isFeatured ? styles.featuredActiveButton : styles.featuredButton,
          ]}
          onPress={() => toggleFeaturedStatus(item._id, item.isFeatured)}
        >
          <Text
            style={[
              styles.actionButtonText,
              item.isFeatured ? styles.featuredActiveText : {},
            ]}
          >
            {item.isFeatured ? 'Featured' : 'Feature'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              'Recipe Actions',
              undefined,
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: item.isPublished ? 'Unpublish' : 'Publish',
                  onPress: () => toggleRecipeStatus(item._id, item.isPublished),
                },
                {
                  text: 'Edit',
                  onPress: () => router.push(`/(restaurant)/recipes/edit/${item._id}`),
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      'Delete Recipe',
                      'Are you sure you want to delete this recipe? This action cannot be undone.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteRecipe(item._id) },
                      ]
                    );
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.moreButtonText}>•••</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No recipes found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'No recipes match your search. Try a different term.'
          : activeFilter !== 'all'
          ? `No ${activeFilter} recipes.`
          : 'Get started by adding your first recipe.'}
      </Text>
      {!searchQuery && activeFilter === 'all' && (
        <TouchableOpacity
          style={styles.addFirstButton}
          onPress={() => router.push('/(restaurant)/recipes/new')}
        >
          <Text style={styles.addFirstButtonText}>Add Recipe</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Recipe Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setIsFilterVisible(!isFilterVisible)}
          >
            <Sliders size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      {isFilterVisible && (
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'all' && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'published' && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter('published')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'published' && styles.filterButtonTextActive,
              ]}
            >
              Published
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'drafts' && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter('drafts')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'drafts' && styles.filterButtonTextActive,
              ]}
            >
              Drafts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'featured' && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter('featured')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'featured' && styles.filterButtonTextActive,
              ]}
            >
              Featured
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item._id}
          renderItem={renderRecipeItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          stickyHeaderIndices={[0]}
        />
      )}

      {/* FAB for adding new recipe */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(restaurant)/recipes/new')}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 20,
    marginTop: -2,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  recipeCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  recipeImageContainer: {
    height: 160,
    backgroundColor: '#333',
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeImagePlaceholder: {
    flex: 1,
    backgroundColor: '#333',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publishedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  draftBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recipeContent: {
    padding: 16,
  },
  recipeName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  recipeDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
  moreTags: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreTagsText: {
    color: '#999',
    fontSize: 12,
  },
  recipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  featuredButton: {
    backgroundColor: 'transparent',
  },
  featuredActiveButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredActiveText: {
    color: '#fff',
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 16,
    marginTop: -2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
