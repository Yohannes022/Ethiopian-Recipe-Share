// import { useState, useEffect } from 'react';
// import { View, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import Colors from '@/constants/colors';
// import typography from '@/constants/typography';

// interface Restaurant {
//   id: string;
//   name: string;
//   cuisine: string;
//   rating: number;
//   deliveryTime: string;
//   image: string;
//   isOpen: boolean;
// }

// export default function ExploreScreen() {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Mock data - in a real app, this would come from an API
//   const [restaurants, setRestaurants] = useState<Restaurant[]>([
//     {
//       id: '1',
//       name: 'Addis Ababa Restaurant',
//       cuisine: 'Ethiopian',
//       rating: 4.7,
//       deliveryTime: '30-45 min',
//       image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
//       isOpen: true,
//     },
//     {
//       id: '2',
//       name: 'Habesha Kitchen',
//       cuisine: 'Ethiopian',
//       rating: 4.5,
//       deliveryTime: '25-40 min',
//       image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
//       isOpen: true,
//     },
//     {
//       id: '3',
//       name: 'Blue Nile Ethiopian Cuisine',
//       cuisine: 'Ethiopian',
//       rating: 4.8,
//       deliveryTime: '35-50 min',
//       image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
//       isOpen: false,
//     },
//   ]);

//   const cuisines = ['All', 'Ethiopian', 'Italian', 'Chinese', 'Indian', 'Mexican'];

//   useEffect(() => {
//     // Simulate API call
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, []);

//   const filteredRestaurants = restaurants.filter(restaurant => {
//     const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesCuisine = !selectedCuisine || selectedCuisine === 'All' || 
//                           restaurant.cuisine === selectedCuisine;
    
//     return matchesSearch && matchesCuisine;
//   });

//   const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
//     <TouchableOpacity 
//       style={styles.restaurantCard}
//       onPress={() => router.push(`/restaurant/${item.id}`)}
//     >
//       <Image 
//         source={{ uri: item.image }} 
//         style={styles.restaurantImage}
//         resizeMode="cover"
//       />
//       <View style={styles.restaurantInfo}>
//         <View style={styles.restaurantHeader}>
//           <Text style={styles.restaurantName} numberOfLines={1} ellipsizeMode="tail">
//             {item.name}
//           </Text>
//           <View style={styles.ratingContainer}>
//             <Ionicons name="star" size={16} color={Colors.warning} />
//             <Text style={styles.ratingText}>{item.rating}</Text>
//           </View>
//         </View>
//         <Text style={styles.cuisineText}>{item.cuisine}</Text>
//         <View style={styles.footer}>
//           <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
//           {item.isOpen ? (
//             <Text style={styles.openText}>Open Now</Text>
//           ) : (
//             <Text style={styles.closedText}>Closed</Text>
//           )}
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={Colors.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <Ionicons name="search" size={20} color={Colors.lightText} style={styles.searchIcon} />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search for restaurants or cuisines"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//           placeholderTextColor={Colors.lightText}
//         />
//       </View>
      
//       {/* Cuisine Filter */}
//       <View style={styles.cuisineContainer}>
//         <FlatList
//           horizontal
//           data={cuisines}
//           keyExtractor={(item) => item}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               style={[
//                 styles.cuisineButton,
//                 selectedCuisine === item && styles.selectedCuisineButton,
//               ]}
//               onPress={() => setSelectedCuisine(item === selectedCuisine ? null : item)}
//             >
//               <Text
//                 style={[
//                   styles.cuisineText,
//                   selectedCuisine === item && styles.selectedCuisineText,
//                 ]}
//               >
//                 {item}
//               </Text>
//             </TouchableOpacity>
//           )}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.cuisineList}
//         />
//       </View>
      
//       {/* Restaurants List */}
//       <FlatList
//         data={filteredRestaurants}
//         renderItem={renderRestaurantItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.restaurantList}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="restaurant-outline" size={50} color={Colors.lightGray} />
//             <Text style={styles.emptyText}>No restaurants found</Text>
//             <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
//           </View>
//         }
//       />
//       <Collapsible title="Android, iOS, and web support">
//         <ThemedText>
//           You can open this project on Android, iOS, and the web. To open the web version, press{' '}
//           <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
//         </ThemedText>
//       </Collapsible>
//       <Collapsible title="Images">
//         <ThemedText>
//           For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
//           <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
//           different screen densities
//         </ThemedText>
//         <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
//         <ExternalLink href="https://reactnative.dev/docs/images">
//           <ThemedText type="link">Learn more</ThemedText>
//         </ExternalLink>
//       </Collapsible>
//       <Collapsible title="Custom fonts">
//         <ThemedText>
//           Open <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText> to see how to load{' '}
//           <ThemedText style={{ fontFamily: 'SpaceMono' }}>
//             custom fonts such as this one.
//           </ThemedText>
//         </ThemedText>
//         <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
//           <ThemedText type="link">Learn more</ThemedText>
//         </ExternalLink>
//       </Collapsible>
//       <Collapsible title="Light and dark mode components">
//         <ThemedText>
//           This template has light and dark mode support. The{' '}
//           <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
//           what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
//         </ThemedText>
//         <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
//           <ThemedText type="link">Learn more</ThemedText>
//         </ExternalLink>
//       </Collapsible>
//       <Collapsible title="Animations">
//         <ThemedText>
//           This template includes an example of an animated component. The{' '}
//           <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
//           the powerful <ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText>{' '}
//           library to create a waving hand animation.
//         </ThemedText>
//         {Platform.select({
//           ios: (
//             <ThemedText>
//               The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
//               component provides a parallax effect for the header image.
//             </ThemedText>
//           ),
//         })}
//       </Collapsible>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   headerImage: {
//     color: '#808080',
//     bottom: -90,
//     left: -35,
//     position: 'absolute',
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     gap: 8,
//   },
// });
