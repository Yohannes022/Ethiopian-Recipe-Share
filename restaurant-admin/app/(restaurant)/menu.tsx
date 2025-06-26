import { useRouter } from 'expo-router';
import { Plus, Search, Filter, Sliders, MoreVertical, Utensils } from 'lucide-react-native';
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
  Platform,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type MenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  ingredients: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

type Category = {
  _id: string;
  name: string;
  description?: string;
};

export default function MenuManagement() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    fetchMenuData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, menuItems]);

  const fetchMenuData = async () => {
    try {
      setIsLoading(true);
      const [menuRes, categoriesRes] = await Promise.all([
        api.get('/menu/items'),
        api.get('/menu/categories'),
      ]);
      
      setMenuItems(menuRes.data.items);
      setCategories(categoriesRes.data.categories);
      setFilteredItems(menuRes.data.items);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      Alert.alert('Error', 'Failed to load menu data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMenuData();
  };

  const filterItems = () => {
    let filtered = [...menuItems];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.ingredients.some(ing => ing.toLowerCase().includes(query))
      );
    }
    
    setFilteredItems(filtered);
  };

  const toggleItemAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/menu/items/${itemId}`, { isAvailable: !currentStatus });
      fetchMenuData();
    } catch (error) {
      console.error('Error updating item status:', error);
      Alert.alert('Error', 'Failed to update item status. Please try again.');
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      await api.delete(`/menu/items/${itemId}`);
      fetchMenuData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      Alert.alert('Error', 'Failed to delete menu item. Please try again.');
    }
  };

  const renderRightActions = (item: MenuItem) => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={() => router.push(`/(restaurant)/menu/edit/${item._id}`)}
      >
        <Text style={styles.actionButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => {
          Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this menu item?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteMenuItem(item._id) },
            ]
          );
        }}
      >
        <Text style={styles.actionButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push(`/(restaurant)/menu/${item._id}`)}
      >
        <View style={styles.menuItemImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.menuItemImage} />
          ) : (
            <View style={styles.menuItemImagePlaceholder}>
              <Utensils size={24} color="#666" />
            </View>
          )}
        </View>
        <View style={styles.menuItemDetails}>
          <View style={styles.menuItemHeader}>
            <Text style={styles.menuItemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
          </View>
          <Text style={styles.menuItemDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.menuItemFooter}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {categories.find(cat => cat._id === item.category)?.name || 'Uncategorized'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.availabilityBadge,
                item.isAvailable ? styles.availableBadge : styles.unavailableBadge,
              ]}
              onPress={() => toggleItemAvailability(item._id, item.isAvailable)}
            >
              <Text
                style={[
                  styles.availabilityText,
                  item.isAvailable ? styles.availableText : styles.unavailableText,
                ]}
              >
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item._id && styles.categoryItemActive,
      ]}
      onPress={() => setSelectedCategory(item._id)}
    >
      <Text
        style={[
          styles.categoryItemText,
          selectedCategory === item._id && styles.categoryItemTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No menu items found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'No items match your search. Try a different term.'
          : selectedCategory !== 'all'
          ? `No items in this category.`
          : 'Get started by adding your first menu item.'}
      </Text>
      {!searchQuery && selectedCategory === 'all' && (
        <TouchableOpacity
          style={styles.addFirstItemButton}
          onPress={() => router.push('/(restaurant)/menu/new')}
        >
          <Text style={styles.addFirstItemButtonText}>Add Menu Item</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Menu Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setIsMenuVisible(!isMenuVisible)}
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
          placeholder="Search menu items..."
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

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            selectedCategory === 'all' && styles.categoryItemActive,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.categoryItemText,
              selectedCategory === 'all' && styles.categoryItemTextActive,
            ]}
          >
            All Items
          </Text>
        </TouchableOpacity>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderCategoryItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
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
          data={filteredItems}
          keyExtractor={(item) => item._id}
          renderItem={renderMenuItem}
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

      {/* FAB for adding new menu item */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(restaurant)/menu/new')}
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
  categoriesContainer: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingBottom: 10,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#2a2a2a',
  },
  categoryItemActive: {
    backgroundColor: '#007AFF',
  },
  categoryItemText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryItemTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  menuItemImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemImage: {
    width: '100%',
    height: '100%',
  },
  menuItemImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemDetails: {
    flex: 1,
    padding: 12,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  menuItemName: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  menuItemPrice: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuItemDescription: {
    color: '#999',
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  availableBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  unavailableBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  availableText: {
    color: '#4CAF50',
  },
  unavailableText: {
    color: '#F44336',
  },
  rightActions: {
    flexDirection: 'row',
    marginRight: 20,
    marginBottom: 12,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  editButton: {
    backgroundColor: '#FFA000',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  addFirstItemButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstItemButtonText: {
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
