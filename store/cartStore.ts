import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MenuItem, Order, OrderItem, OrderServiceType } from "@/types/restaurant";
import { mockRestaurants } from "@/mocks/restaurants";
import { currentUser } from "@/mocks/users";
import { addresses } from "@/mocks/addresses";

interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  menuItem: MenuItem;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  serviceType: OrderServiceType;
  
  // Cart actions
  addToCart: (restaurantId: string, menuItemId: string, quantity: number, specialInstructions?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateInstructions: (itemId: string, instructions: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  setServiceType: (type: OrderServiceType) => void;
  
  // Cart calculations
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getDeliveryFee: () => number;
  getTax: () => number;
  getCartItems: () => Array<CartItem & { menuItem: MenuItem }>;
  getCartItemsCount: () => number;
  
  // Orders
  orders: Order[];
  createOrder: (
    paymentMethod: 'card' | 'cash' | 'mobile-money',
    addressId: string | null,
    tip: number,
    tableNumber?: string,
    pickupTime?: string
  ) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      serviceType: 'delivery' as OrderServiceType,
      orders: [],
      
      addToCart: (restaurantId, menuItemId, quantity, specialInstructions) => {
        const { items, restaurantId: currentRestaurantId, getCartItems } = get();
        
        // If adding from a different restaurant, clear the cart first
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
          if (items.length > 0) {
            // In a real app, you would show a confirmation dialog here
            set({ items: [], restaurantId: null });
          }
        }
        
        // Find the menu item to get its details
        const restaurant = mockRestaurants.find(r => r.id === restaurantId);
        const menuItem = restaurant?.menu?.find(mi => mi.id === menuItemId);
        
        const existingItemIndex = items.findIndex(item => item.menuItemId === menuItemId);
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
            specialInstructions: specialInstructions || updatedItems[existingItemIndex].specialInstructions
          };
          set({ items: updatedItems, restaurantId });
        } else {
          // Create a minimal menu item if not found
          const now = new Date().toISOString();
          const minimalMenuItem: MenuItem = menuItem || {
            id: menuItemId,
            name: "Unknown Item",
            description: "",
            price: 0,
            image: "",
            category: "",
            restaurantId: restaurantId,
            createdAt: now,
            updatedAt: now,
          };
          
          // Add new item
          const newItem: CartItem = {
            id: menuItemId,
            menuItemId: menuItemId,
            quantity,
            specialInstructions,
            menuItem: minimalMenuItem
          };
          
          set({
            items: [...items, newItem],
            restaurantId,
          });
        }
      },
      
      updateQuantity: (itemId, quantity) => {
        const { items } = get();
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          set({
            items: items.filter(item => (item.id !== itemId && item.menuItemId !== itemId)),
          });
          
          // If this was the last item, clear the restaurantId
          if (items.length === 1) {
            set({ restaurantId: null });
          }
        } else {
          // Update quantity
          set({
            items: items.map(item =>
              (item.id === itemId || item.menuItemId === itemId)
                ? { ...item, quantity }
                : item
            ),
          });
        }
      },
      
      updateInstructions: (itemId, instructions) => {
        const { items } = get();
        
        set({
          items: items.map(item =>
            (item.id === itemId || item.menuItemId === itemId)
              ? { ...item, specialInstructions: instructions }
              : item
          ),
        });
      },
      
      removeFromCart: (itemId) => {
        const { items } = get();
        
        const updatedItems = items.filter(item => (item.id !== itemId && item.menuItemId !== itemId));
        
        set({ items: updatedItems });
        
        // If this was the last item, clear the restaurantId
        if (updatedItems.length === 0) {
          set({ restaurantId: null });
        }
      },
      
      clearCart: () => {
        set({ items: [], restaurantId: null });
      },
      
      setServiceType: (type) => {
        set({ serviceType: type });
      },
      
      getDeliveryFee: () => {
        const { restaurantId, getCartSubtotal } = get();
        
        if (!restaurantId) return 0;
        
        const restaurant = mockRestaurants.find(r => r.id === restaurantId);
        
        if (!restaurant) return 0;
        
        // Free delivery for orders over $30
        if (getCartSubtotal() > 30) {
          return 0;
        }
        
        // Default delivery fee or use restaurant's delivery fee if available
        return restaurant.deliveryFee || 3.99;
      },
      
      getCartItems: () => {
        const { items, restaurantId } = get();
        
        if (!restaurantId) return [];
        
        const restaurant = mockRestaurants.find(r => r.id === restaurantId);
        
        if (!restaurant) return [];
        
        return items.map(item => {
          // Find the full menu item details from the restaurant
          const menuItem = restaurant.menu?.find(m => m.id === item.menuItemId);
          
          // If menu item is not found, return a minimal valid object
          if (!menuItem) {
            return {
              ...item,
              menuItem: {
                id: item.menuItemId,
                name: 'Unknown Item',
                price: 0,
                description: 'Item not found in menu',
                category: 'Unknown',
                restaurantId: restaurantId,
                isAvailable: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            };
          }
          
          return {
            ...item,
            menuItem: {
              ...menuItem,
              // Ensure required fields have default values
              id: menuItem.id || item.menuItemId,
              name: menuItem.name || 'Unknown Item',
              price: menuItem.price || 0,
              category: menuItem.category || 'Uncategorized',
              restaurantId: menuItem.restaurantId || restaurantId,
              isAvailable: menuItem.isAvailable !== undefined ? menuItem.isAvailable : true,
              createdAt: menuItem.createdAt || new Date().toISOString(),
              updatedAt: menuItem.updatedAt || new Date().toISOString(),
            }
          };
        });
      },
      
      getCartItemsCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getCartSubtotal: () => {
        const cartItems = get().getCartItems();
        
        if (!cartItems.length) return 0;
        
        return cartItems.reduce((total, item) => {
          const price = typeof item.menuItem.price === 'string' 
            ? parseFloat(item.menuItem.price) 
            : item.menuItem.price || 0;
          return total + (price * item.quantity);
        }, 0);
      },
      
      getDeliveryFee: () => {
        const { restaurantId, serviceType } = get();
        
        // No delivery fee for dine-in or pickup
        if (serviceType === 'dine-in' || serviceType === 'pickup') {
          return 0;
        }
        
        if (!restaurantId) return 0;
        
        const restaurant = mockRestaurants.find(r => r.id === restaurantId);
        return restaurant?.deliveryFee || 0;
      },
      
      getTax: () => {
        // Assuming 15% VAT in Ethiopia
        const subtotal = get().getCartSubtotal();
        return subtotal * 0.15;
      },
      
      getCartTotal: () => {
        const subtotal = get().getCartSubtotal();
        const deliveryFee = get().getDeliveryFee();
        const tax = get().getTax();
        
        return subtotal + deliveryFee + tax;
      },
      
      createOrder: (paymentMethod, addressId, tip, tableNumber, pickupTime) => {
        const { 
          getCartItems, 
          getCartSubtotal, 
          getDeliveryFee, 
          getTax, 
          getCartTotal,
          clearCart,
          serviceType,
          restaurantId
        } = get();
        
        if (!restaurantId) {
          throw new Error("No restaurant selected");
        }
        
        const cartItems = getCartItems();
        
        if (cartItems.length === 0) {
          throw new Error("Cannot create an empty order");
        }
        
        const subtotal = getCartSubtotal();
        const deliveryFee = getDeliveryFee();
        const tax = getTax();
        const total = getCartTotal() + tip;
        
        // Define the delivery address based on service type
        let deliveryAddress: string | {
          addressLine1: string;
          addressLine2?: string;
          city: string;
          instructions?: string;
          location: {
            latitude: number;
            longitude: number;
          };
        } = serviceType === 'dine-in' ? 'Dine-in' : 'Pickup';
        
        if (serviceType === 'delivery') {
          if (!addressId) {
            throw new Error("Delivery address is required for delivery orders");
          }
          
          const selectedAddress = addresses.find(a => a.id === addressId);
          
          if (!selectedAddress) {
            throw new Error("Delivery address not found");
          }
          
          // Use the address fields that exist on the Address type
          deliveryAddress = {
            addressLine1: selectedAddress.addressLine1 || '',
            addressLine2: selectedAddress.addressLine2 || '',
            city: selectedAddress.city || 'Addis Ababa', // Default city if not provided
            instructions: selectedAddress.instructions || '',
            location: {
              latitude: selectedAddress.location?.latitude || 9.0054, // Default to Addis Ababa coordinates
              longitude: selectedAddress.location?.longitude || 38.7636
            }
          };
        }
        
        const restaurant = mockRestaurants.find(r => r.id === get().restaurantId);
        
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const newOrder: Order = {
          id: Date.now().toString(),
          userId: currentUser?.id,
          restaurantId: restaurant.id,
          items: cartItems.map(item => ({
            id: Date.now() + "-" + item.menuItem.id,
            menuItemId: item.menuItem.id,
            name: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          })),
          status: 'pending',
          subtotal,
          deliveryFee,
          tax,
          tip,
          total,
          paymentMethod: {
            id: Date.now().toString(),
            type: paymentMethod === 'mobile-money' ? 'mobileMoney' : paymentMethod,
            name: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'cash' ? 'Cash' : 'Mobile Money',
          },
          serviceType,
          deliveryAddress,
          tableNumber,
          pickupTime,
          createdAt: new Date().toISOString(),
          estimatedDeliveryTime: serviceType === 'delivery' ? restaurant.estimatedDeliveryTime : 0,
        };
        
        // Add driver info only for delivery orders
        if (serviceType === 'delivery') {
          newOrder.driverInfo = {
            name: "Dawit Haile",
            phone: "+251922345678",
            photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
            currentLocation: {
              latitude: 9.0222,
              longitude: 38.7468,
            },
          };
        }
        
        set(state => ({
          orders: [newOrder, ...state.orders],
        }));
        
        // Clear the cart after creating an order
        clearCart();
        
        return newOrder;
      },
      
      getOrderById: (orderId) => {
        return get().orders.find(order => order.id === orderId);
      },
      
      updateOrderStatus: (orderId, status) => {
        set(state => ({
          orders: state.orders.map(order =>
            order.id === orderId
              ? { ...order, status }
              : order
          ),
        }));
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);