import { addresses } from "@/mocks/addresses";
import { mockRestaurants } from "@/mocks/restaurants";
import { currentUser } from "@/mocks/users";
import { CartItem, MenuItem, Order, OrderServiceType } from "@/types/restaurant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
      serviceType: 'delivery',
      orders: [],
      
      addToCart: (restaurantId, menuItemId, quantity, specialInstructions) => {
        const { items, restaurantId: currentRestaurantId } = get();
        
        // If adding from a different restaurant, clear the cart first
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
          if (items.length > 0) {
            // In a real app, you would show a confirmation dialog here
            set({ items: [], restaurantId: null });
          }
        }
        
        const existingItemIndex = items.findIndex(item => item.id === menuItemId || item.menuItemId === menuItemId);
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          if (specialInstructions) {
            updatedItems[existingItemIndex].specialInstructions = specialInstructions;
          }
          set({ items: updatedItems, restaurantId });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                id: menuItemId,
                menuItemId: menuItemId,
                restaurantId,
                quantity,
                specialInstructions,
                name: "", // Will be populated in getCartItems
                price: 0, // Will be populated in getCartItems
              },
            ],
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
      
      // getCartItems: () => {
      //   const { items, restaurantId } = get();
        
      //   if (!restaurantId) return [];
        
      //   const restaurant = mockRestaurants.find(r => r.id === restaurantId);
      //   if (!restaurant || !restaurant.menu) return [];
        
      //   return items.map(item => {
      //     const menuItem = restaurant.menu?.find(mi => mi.id === (item.id || item.menuItemId));
      //     if (!menuItem) {
      //       // If menu item not found, return a placeholder
      //       return {
      //         ...item,
      //         menuItem: {
      //           id: item.id || item.menuItemId || "",
      //           name: item.name || "Unknown Item",
      //           description: "",
      //           price: item.price || 0,
      //           image: "",
      //           category: "",
      //         }
      //       };
      //     }
      //     return {
      //       ...item,
      //       menuItem,
      //     };
      //   });
      // },
      
      getCartItems: () => {
        const { items, restaurantId } = get();
        
        if (!restaurantId) return [];
        
        const restaurant = mockRestaurants.find(r => r.id === restaurantId);
        if (!restaurant?.menu?.length) return [];
        
        return items.reduce<Array<CartItem & { menuItem: MenuItem }>>((result, item) => {
          const menuItem = restaurant.menu?.find(mi => 
            mi.id === (item.id || item.menuItemId)
          );
          
          if (!menuItem) {
            console.warn(`Menu item not found for cart item: ${item.id || item.menuItemId}`);
            return result; // Skip items with missing menu data
          }
          
          result.push({
            ...item,
            menuItem
          });
          
          return result;
        }, []);
      },

      getCartItemsCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getCartSubtotal: () => {
        const cartItems = get().getCartItems();
        
        return cartItems.reduce(
          (total, item) => total + item.menuItem.price * item.quantity,
          0
        );
      },
      
      // getDeliveryFee: () => {
      //   const { restaurantId, serviceType } = get();
        
      //   // No delivery fee for dine-in or pickup
      //   if (serviceType === 'dine-in' || serviceType === 'pickup') {
      //     return 0;
      //   }
        
      //   if (!restaurantId) return 0;
        
      //   const restaurant = mockRestaurants.find(r => r.id === restaurantId);
      //   return restaurant ? restaurant.deliveryFee : 0;
      // },
      
      getDeliveryFee: () => {
        const { restaurantId, serviceType } = get();
        
        // No delivery fee for dine-in or pickup
        if (serviceType !== 'delivery') {
          return 0;
        }
        
        if (!restaurantId) return 0;
        
        const restaurant = mockRestaurants.find(r => r.id === restaurantId);
        if (!restaurant) return 0;
        
        // // Check for free delivery threshold
        // const subtotal = get().getCartSubtotal();
        // if (restaurant.freeDeliveryThreshold && subtotal >= restaurant.freeDeliveryThreshold) {
        //   return 0;
        // }

        // //Distance-Based Pricing
        // if (userLocation && restaurant.location) {
        //   const distance = calculateDistance(userLocation, restaurant.location);
        //   return calculateDynamicFee(distancem restaurant.baseDeliveryFee, restaurant.deliveryFeePerKm)
        // }
        
        // Return the delivery fee or default to 0
        return restaurant.deliveryFee ?? 0;
      },

      getTax: () => {
        // Assuming 15% VAT in Ethiopia
        return get().getCartSubtotal() * 0.15;
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
          serviceType 
        } = get();
        
        const cartItems = getCartItems();
        const subtotal = getCartSubtotal();
        const deliveryFee = getDeliveryFee();
        const tax = getTax();
        const total = getCartTotal() + tip;
        
        let deliveryAddress: any = "Pickup";
        
        if (serviceType === 'delivery') {
          if (!addressId) {
            throw new Error("Delivery address is required for delivery orders");
          }
          
          const address = addresses.find(a => a.id === addressId);
          
          if (!address) {
            throw new Error("Delivery address not found");
          }
          
          deliveryAddress = {
            addressLine1: address.street,
            addressLine2: address.apt,
            city: address.city,
            instructions: address.instructions,
            location: {
              latitude: 9.0222, // Default location
              longitude: 38.7468, // Default location
            },
          };
        } else if (serviceType === 'dine-in') {
          deliveryAddress = "Dine-in";
        }
        
        const restaurant = mockRestaurants.find(r => r.id === get().restaurantId);
        
        if (!restaurant) {
          throw new Error("Restaurant not found");
        }
        
        const newOrder: Order = {
          id: Date.now().toString(),
          userId: currentUser?.id || `guest-${Date.now()}`,
          isGuest: !currentUser?.id,
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
          paymentMethod: paymentMethod === 'mobile-money' ? 'mobileMoney' : paymentMethod,
          serviceType,
          deliveryAddress,
          tableNumber,
          pickupTime,
          createdAt: new Date().toISOString(),
          estimatedDeliveryTime: serviceType === 'delivery' ? restaurant.estimatedDeliveryTime : 0,
          totalAmount: total,
          paymentStatus: "pending",
          updatedAt: ""
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
