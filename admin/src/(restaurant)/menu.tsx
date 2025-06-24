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
import { colors, spacing } from '../styles/theme';

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
  const { userRole, token } = useAuthStore();
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
    try {
      if (!newItem.name || !newItem.price || !newItem.category) {
        setError('Please fill in all required fields');
        return;
      }

      // TODO: Replace with actual API call
      const mockAddItem = async () => {
        return { success: true, message: 'Item added successfully' };
      };

      await mockAddItem();
      await fetchMenu();
      setShowAddModal(false);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: '',
        isAvailable: true,
      });
    } catch (error) {
      setError('Failed to add item');
    }
  };

  const handleEditItem = async (item: MenuItem) => {
    try {
      // TODO: Replace with actual API call
      const mockEditItem = async () => {
        return { success: true, message: 'Item updated successfully' };
      };

      await mockEditItem();
      await fetchMenu();
      setShowEditModal(false);
    } catch (error) {
      setError('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      // TODO: Replace with actual API call
      const mockDeleteItem = async () => {
        return { success: true, message: 'Item deleted successfully' };
      };

      await mockDeleteItem();
      await fetchMenu();
    } catch (error) {
      setError('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!menu) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Failed to load menu</Text>
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

      <ScrollView style={styles.menuContainer}>
        {menu.map((category) => (
          <View key={category.id} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            {category.items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemPrice}>${item.price}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
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
              multiline
              numberOfLines={3}
            />
            <TextInput
              placeholder="Price"
              value={newItem.price.toString()}
              onChangeText={(text) => setNewItem({ ...newItem, price: parseFloat(text) || 0 })}
              style={styles.input}
              keyboardType="numeric"
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
                onPress={() => setShowAddModal(false)}
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
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            {/* Similar form fields as Add Item modal */}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.light,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
  },
  category: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  itemDescription: {
    color: colors.gray,
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: 4,
    backgroundColor: colors.secondary,
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
    borderRadius: 8,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    padding: spacing.sm,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  saveButton: {
    padding: spacing.sm,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.light,
    fontWeight: 'bold',
  },
  error: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
});
