import { Order, OrderItem, PaymentMethod } from "@/types/restaurant";

export const mockOrders: Order[] = [
  {
    id: "order1",
    userId: "user1",
    restaurantId: "rest1",
    items: [
      {
        id: "orderitem1",
        menuItemId: "item1",
        name: "Doro Wat",
        price: 14.99,
        quantity: 2,
        specialInstructions: "Extra spicy please"
      },
      {
        id: "orderitem2",
        menuItemId: "item3",
        name: "Injera",
        price: 3.99,
        quantity: 4
      }
    ],
    status: "delivered",
    subtotal: 45.94,
    deliveryFee: 2.99,
    tax: 6.89,
    tip: 5.00,
    total: 60.82,
    paymentMethod: {
      id: "payment1",
      type: "card",
      name: "Visa ending in 4242",
      last4: "4242"
    },
    serviceType: "delivery",
    deliveryAddress: {
      addressLine1: "123 Main St",
      addressLine2: "Apt 4B",
      city: "Addis Ababa",
      instructions: "Gate code: 1234",
      location: {
        latitude: 9.0222,
        longitude: 38.7468
      }
    },
    driverInfo: {
      name: "Dawit Haile",
      phone: "+251922345678",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
      currentLocation: {
        latitude: 9.0222,
        longitude: 38.7468
      }
    },
    createdAt: "2023-06-15T14:30:00Z",
    estimatedDeliveryTime: 30
  },
  {
    id: "order2",
    userId: "user1",
    restaurantId: "rest2",
    items: [
      {
        id: "orderitem3",
        menuItemId: "item5",
        name: "Kitfo",
        price: 15.99,
        quantity: 1,
        specialInstructions: "Medium rare"
      },
      {
        id: "orderitem4",
        menuItemId: "item3",
        name: "Injera",
        price: 3.99,
        quantity: 2
      },
      {
        id: "orderitem5",
        menuItemId: "item4",
        name: "Ethiopian Coffee",
        price: 4.99,
        quantity: 2
      }
    ],
    status: "in-progress",
    subtotal: 33.95,
    deliveryFee: 0,
    tax: 5.09,
    tip: 0,
    total: 39.04,
    paymentMethod: {
      id: "payment2",
      type: "cash",
      name: "Cash on delivery"
    },
    serviceType: "pickup",
    pickupTime: "2023-06-20T18:30:00Z",
    createdAt: "2023-06-20T17:45:00Z",
    estimatedDeliveryTime: 0,
    deliveryAddress: "Pickup"
  },
  {
    id: "order3",
    userId: "user1",
    restaurantId: "rest3",
    items: [
      {
        id: "orderitem6",
        menuItemId: "item2",
        name: "Tibs",
        price: 16.99,
        quantity: 2
      },
      {
        id: "orderitem7",
        menuItemId: "item3",
        name: "Injera",
        price: 3.99,
        quantity: 3
      },
      {
        id: "orderitem8",
        menuItemId: "item4",
        name: "Ethiopian Coffee",
        price: 4.99,
        quantity: 1
      }
    ],
    status: "cancelled",
    subtotal: 46.94,
    deliveryFee: 0,
    tax: 7.04,
    tip: 8.00,
    total: 61.98,
    paymentMethod: {
      id: "payment3",
      type: "mobileMoney",
      name: "Mobile Money"
    },
    serviceType: "dine-in",
    tableNumber: "12",
    createdAt: "2023-06-25T19:15:00Z",
    estimatedDeliveryTime: 0,
    deliveryAddress: "Dine-in"
  },
  {
    id: "order4",
    userId: "user1",
    restaurantId: "rest1",
    items: [
      {
        id: "orderitem9",
        menuItemId: "item1",
        name: "Doro Wat",
        price: 14.99,
        quantity: 1
      },
      {
        id: "orderitem10",
        menuItemId: "item2",
        name: "Tibs",
        price: 16.99,
        quantity: 1
      }
    ],
    status: "pending",
    subtotal: 31.98,
    deliveryFee: 2.99,
    tax: 4.80,
    tip: 6.00,
    total: 45.77,
    paymentMethod: {
      id: "payment4",
      type: "card",
      name: "Mastercard ending in 5678",
      last4: "5678"
    },
    serviceType: "delivery",
    deliveryAddress: {
      addressLine1: "456 Oak Ave",
      addressLine2: "",
      city: "Addis Ababa",
      instructions: "Leave at door",
      location: {
        latitude: 9.0300,
        longitude: 38.7500
      }
    },
    driverInfo: {
      name: "Selam Tadesse",
      phone: "+251911234567",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
      currentLocation: {
        latitude: 9.0280,
        longitude: 38.7490
      }
    },
    createdAt: "2023-07-01T12:00:00Z",
    estimatedDeliveryTime: 35
  },
  {
    id: "order5",
    userId: "user1",
    restaurantId: "rest2",
    items: [
      {
        id: "orderitem11",
        menuItemId: "item5",
        name: "Kitfo",
        price: 15.99,
        quantity: 2
      },
      {
        id: "orderitem12",
        menuItemId: "item3",
        name: "Injera",
        price: 3.99,
        quantity: 4
      }
    ],
    status: "delivered",
    subtotal: 47.94,
    deliveryFee: 0,
    tax: 7.19,
    tip: 0,
    total: 55.13,
    paymentMethod: {
      id: "payment5",
      type: "cash",
      name: "Cash payment"
    },
    serviceType: "dine-in",
    tableNumber: "8",
    createdAt: "2023-07-05T20:30:00Z",
    estimatedDeliveryTime: 0,
    deliveryAddress: "Dine-in"
  }
];

export default mockOrders;
