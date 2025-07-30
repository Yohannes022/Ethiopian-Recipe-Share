import RecipeCard from "@/components/RecipeCard";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useCartStore } from "@/store/cartStore";
import { useProfileStore } from "@/store/profileStore";
import { useRecipeStore } from "@/store/recipeStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Bookmark,
  ChevronRight,
  CreditCard,
  Edit2,
  Grid,
  LogOut,
  MapPin,
  Settings,
  ShoppingBag,
} from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { recipes } = useRecipeStore();
  const { addresses, paymentMethods } = useProfileStore();
  const { orders } = useCartStore();
  const [activeTab, setActiveTab] = useState<"recipes" | "saved">("recipes");
  const [isLoading, setIsLoading] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);

  // Mock user data
  const user = {
    id: '1',
    name: 'Guest User',
    email: 'guest@example.com',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200',
    location: 'Addis Ababa, Ethiopia',
    bio: 'A passionate cook sharing the love for Ethiopian cuisine.',
    followers: 1200,
    following: 150,
  };

  const [profileUser, setProfileUser] = useState(user);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  
  // Form state for profile setup
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bio: user?.bio || "",
  });
  
  // Check if we're in setup mode
  useEffect(() => {
    if (params?.setup === 'true') {
      setIsSetupMode(true);
    }
  }, [params]);

  const handleProfileUpdate = async () => {
    if (!formData.name?.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const successMessage = isSetupMode 
        ? "Your profile has been set up successfully!"
        : "Your profile has been updated!";
      
      Alert.alert("Success", successMessage, [
        {
          text: "OK",
          onPress: () => {
            if (isSetupMode) {
              setIsSetupMode(false);
            }
          }
        }
      ]);
      
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage = "Failed to update profile. Please try again.";
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show profile setup form if in setup mode
  if (isSetupMode) {
    return (
      <ScrollView style={styles.setupContainer}>
        <Text style={styles.setupTitle}>Complete Your Profile</Text>
        <Text style={styles.setupSubtitle}>Tell us a bit about yourself</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            autoCapitalize="words"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio (Optional)</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChangeText={(text) => setFormData({...formData, bio: text})}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleProfileUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const userRecipes = recipes.filter((recipe) => recipe.authorId === user.id);
  const savedRecipes = recipes.filter((recipe) => recipe.isSaved);
  
  const defaultAddress = addresses.find(a => a.isDefault);
  const defaultPaymentMethod = paymentMethods.find(p => p.isDefault);
  const recentOrders = orders.slice(0, 3);

  const handleLogout = () => {
    Alert.alert("Logout", "This action is disabled.");
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleFollowToggle = async () => {
    Alert.alert("Follow", "This action is disabled.");
  };

  const handleViewFollowers = () => {
    router.push("/profile/followers");
  };

  const handleViewFollowing = () => {
    router.push("/profile/following");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
          <LogOut size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user.avatar }}
            style={styles.profileImage}
            contentFit="cover"
          />
          <Text style={styles.profileName}>{user.name}</Text>
          {user.location && (
            <Text style={styles.profileLocation}>{user.location}</Text>
          )}
          {user.bio && <Text style={styles.profileBio}>{user.bio}</Text>}

          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => router.push({
                pathname: "/recipes",
                params: { userId: user?.id }
              } as any)}
            >
              <Text style={styles.statNumber}>{userRecipes.length}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={handleViewFollowers}
            >
              <Text style={styles.statNumber}>{user.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={handleViewFollowing}
            >
              <Text style={styles.statNumber}>{user.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
              <Edit2 size={16} color={colors.text} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
            
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/orders")}
          >
            <View style={styles.menuItemLeft}>
              <ShoppingBag size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>My Orders</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/addresses")}
          >
            <View style={styles.menuItemLeft}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>My Addresses</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/payment")}
          >
            <View style={styles.menuItemLeft}>
              <CreditCard size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>Payment Methods</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>
        </View>
        
        {recentOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => router.push("/profile/orders")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderItem}
                onPress={() => router.push(`/order/${order.id}`)}
              >
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>Order #{order.id.slice(-4)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.orderStatus}>
                  <Text
                    style={[
                      styles.orderStatusText,
                      order.status === "delivered" && styles.deliveredStatus,
                      order.status === "cancelled" && styles.cancelledStatus,
                    ]}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/-/g, " ")}
                  </Text>
                  <ChevronRight size={16} color={colors.lightText} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "recipes" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("recipes")}
          >
            <Grid
              size={20}
              color={
                activeTab === "recipes" ? colors.primary : colors.lightText
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "recipes" && styles.activeTabText,
              ]}
            >
              My Recipes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "saved" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("saved")}
          >
            <Bookmark
              size={20}
              color={activeTab === "saved" ? colors.primary : colors.lightText}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "saved" && styles.activeTabText,
              ]}
            >
              Saved
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recipesContainer}>
          {activeTab === "recipes" &&
            (userRecipes.length > 0 ? (
              userRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No recipes yet</Text>
                <Text style={styles.emptyStateText}>
                  Create your first recipe to share with the community
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push("/create-recipe")}
                >
                  <Text style={styles.createButtonText}>Create Recipe</Text>
                </TouchableOpacity>
              </View>
            ))}

          {activeTab === "saved" &&
            (savedRecipes.length > 0 ? (
              savedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No saved recipes</Text>
                <Text style={styles.emptyStateText}>
                  Save recipes to access them later
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push("/search")}
                >
                  <Text style={styles.createButtonText}>Explore Recipes</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Setup mode styles
  setupContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
    textAlign: 'center',
  },
  setupSubtitle: {
    fontSize: 16,
    color: colors.lightText,
    marginBottom: 32,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  iconButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    ...typography.heading2,
    marginBottom: 4,
  },
  profileLocation: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginBottom: 12,
  },
  profileBio: {
    ...typography.body,
    textAlign: "center",
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    ...typography.heading3,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.lightText,
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: colors.divider,
  },
  profileActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  editProfileText: {
    ...typography.bodySmall,
    marginLeft: 8,
  },
  section: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    ...typography.body,
    marginLeft: 12,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  orderDate: {
    ...typography.caption,
    color: colors.lightText,
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderStatusText: {
    ...typography.caption,
    color: colors.info,
    marginRight: 4,
  },
  deliveredStatus: {
    color: colors.success,
  },
  cancelledStatus: {
    color: colors.error,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.cardBackground,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.lightText,
    marginLeft: 8,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  recipesContainer: {
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    ...typography.heading3,
    marginBottom: 8,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
