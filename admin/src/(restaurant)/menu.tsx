import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, typography, shadows, borders } from '../styles/theme';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export default function MenuScreen() {
  const { userRole, token, restaurantId } = useAuthStore();
  const [menu, setMenu] = React.useState<MenuCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);

  const [newItem, setNewItem] = React.useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    isAvailable: true,
  });

  React.useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const mockMenu = async () => {
        return [
          {
            id: '1',
            name: 'Main Dishes',
            items: [
              {
                id: '1',
                name: 'Doro Wat',
                description: 'Traditional spicy chicken stew',
                price: 25.00,
                category: 'Main Dishes',
                isAvailable: true,
              },
              {
                id: '2',
                name: 'Tibs',
                description: 'Sautéed meat with vegetables',
                price: 18.00,
                category: 'Main Dishes',
                isAvailable: true,
              },
            ],
          },
          {
            id: '2',
            name: 'Vegetarian',
            items: [
              {
                id: '3',
                name: 'Gomen',
                description: 'Collard greens with spices',
                price: 12.00,
                category: 'Vegetarian',
                isAvailable: true,
              },
            ],
          },
        ];
      };

      const menuData = await mockMenu();
      setMenu(menuData);
    } catch (error) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.description) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // TODO: Implement API call
      const response = await fetch(`http://localhost:3000/api/v1/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error('Failed to add menu item');
      }

      const data = await response.json();
      const categoryIndex = menu.findIndex(cat => cat.name === data.category);
      if (categoryIndex === -1) {
        // Create new category
        setMenu([...menu, {
          id: data.id,
          name: data.category,
          items: [{
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            isAvailable: data.isAvailable,
            imageUrl: data.imageUrl,
          }]
        }]);
      } else {
        // Add to existing category
        const updatedMenu = [...menu];
        updatedMenu[categoryIndex] = {
          ...updatedMenu[categoryIndex],
          items: [...updatedMenu[categoryIndex].items, {
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            isAvailable: data.isAvailable,
            imageUrl: data.imageUrl,
          }]
        };
        setMenu(updatedMenu);
      }
      setNewItem({ name: '', description: '', price: 0, category: '', isAvailable: true });
      setShowAddModal(false);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleEditItem = async (item: MenuItem) => {
    try {
      // TODO: Implement API call
      const response = await fetch(`http://localhost:3000/api/v1/restaurants/${restaurantId}/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error('Failed to update menu item');
      }

      const data = await response.json();
      
      // Update the menu state with the new item data
      setMenu(menu.map(category => {
        if (category.name !== item.category) return category; // Skip categories that don't match
        return {
          ...category,
          items: category.items.map(menuItem => 
            menuItem.id === item.id ? {
              ...menuItem,
              ...data
            } : menuItem
          )
        };
      }));

      setSelectedItem(null);
      setShowEditModal(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      // TODO: Implement API call
      const response = await fetch(`http://localhost:3000/api/v1/restaurants/${restaurantId}/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete menu item');
      }

      // Update the menu state by removing the item
      setMenu(menu.map(category => {
        const updatedItems = category.items.filter(item => item.id !== itemId);
        return {
          ...category,
          items: updatedItems
        };
      }));

      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete menu item');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!menu.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No menu items found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.scrollView}>
        {menu.map((category) => (
          <View key={category.id} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            {category.items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => {
                      setSelectedItem(item);
                      setShowEditModal(true);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <TextInput
              placeholder="Name"
              value={newItem.name}
              onChangeText={(text) => setNewItem({ ...newItem, name: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={newItem.description}
              onChangeText={(text) => setNewItem({ ...newItem, description: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Price"
              value={newItem.price?.toString()}
              onChangeText={(text) => setNewItem({ ...newItem, price: parseFloat(text) || 0 })}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Category"
              value={newItem.category}
              onChangeText={(text) => setNewItem({ ...newItem, category: text })}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setNewItem({ name: '', description: '', price: 0, category: '', isAvailable: true });
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddItem}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            <TextInput
              placeholder="Name"
              value={selectedItem?.name}
              onChangeText={(text) => setSelectedItem({ ...selectedItem!, name: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={selectedItem?.description}
              onChangeText={(text) => setSelectedItem({ ...selectedItem!, description: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Price"
              value={selectedItem?.price.toString()}
              onChangeText={(text) => setSelectedItem({ ...selectedItem!, price: parseFloat(text) || 0 })}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Category"
              value={selectedItem?.category}
              onChangeText={(text) => setSelectedItem({ ...selectedItem!, category: text })}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (selectedItem) {
                    handleEditItem(selectedItem);
                  }
                }}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: borders.radius.medium,
  },
  addButtonText: {
    color: colors.light,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  category: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold' as const,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.light,
    borderRadius: borders.radius.medium,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.body.fontSize,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  itemDescription: {
    ...typography.caption,
    color: colors.gray,
  },
  itemPrice: {
    fontSize: typography.body.fontSize,
    fontWeight: 'bold' as const,
    color: colors.primary,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: borders.radius.small,
    backgroundColor: colors.secondary,
  },
  editButton: {
    backgroundColor: colors.owner.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.light,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.light,
    padding: spacing.xl,
    borderRadius: borders.radius.medium,
    width: '90%',
  },
  modalTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold' as const,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borders.radius.medium,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: typography.body.fontSize,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    padding: spacing.sm,
    borderRadius: borders.radius.small,
    backgroundColor: colors.secondary,
  },
  saveButton: {
    padding: spacing.sm,
    borderRadius: borders.radius.small,
    backgroundColor: colors.owner.primary,
  },
  buttonText: {
    color: colors.light,
    fontWeight: 'bold',
  },
  error: {
    color: colors.danger,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});