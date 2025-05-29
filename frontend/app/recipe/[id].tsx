import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { useRecipeStore } from "@/store/recipeStore";
import { Comment } from "@/types/recipe";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Award,
  ChefHat,
  Clock,
  Edit,
  Heart,
  MessageCircle,
  Send,
  Share,
  Star,
  Trash,
  Users
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { recipes, toggleFavorite, deleteRecipe, rateRecipe, addComment, getComments } = useRecipeStore();
  const { user } = useAuthStore();
  const [recipe, setRecipe] = useState(recipes.find((r) => r.id === id));
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditName, setCreditName] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Update recipe when recipes change (e.g., after toggling favorite)
    const updatedRecipe = recipes.find((r) => r.id === id);
    setRecipe(updatedRecipe);
    
    if (updatedRecipe) {
      setComments(updatedRecipe.comments || []);
    }
  }, [recipes, id]);

  const handleToggleFavorite = () => {
    if (recipe) {
      toggleFavorite(recipe.id);
    }
  };

  const handleShare = () => {
    // In a real app, this would open the share dialog
    Alert.alert("Share Recipe", "Share this recipe with friends and family");
  };

  const handleEdit = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to edit recipes");
      return;
    }
    
    if (recipe && recipe.authorId !== user.id) {
      Alert.alert("Permission Denied", "Only the recipe creator can edit this recipe");
      return;
    }
    
    router.push(`/edit-recipe/${id}`);
  };

  const handleDelete = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to delete recipes");
      return;
    }
    
    if (recipe && recipe.authorId !== user.id) {
      Alert.alert("Permission Denied", "Only the recipe creator can delete this recipe");
      return;
    }
    
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            if (recipe) {
              deleteRecipe(recipe.id);
              router.back();
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleRateRecipe = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to rate recipes");
      return;
    }
    
    setShowRatingModal(true);
  };

  const submitRating = (rating: number) => {
    if (recipe) {
      rateRecipe(recipe.id, rating);
      setUserRating(rating);
      setShowRatingModal(false);
      Alert.alert("Thank You!", "Your rating has been submitted");
    }
  };

  const handleSubmitComment = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to comment on recipes");
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    if (recipe) {
      addComment(recipe.id, newComment);
      setNewComment("");
      
      // Scroll to comments section after adding a comment
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 300);
    }
  };

  const handleGiveCredit = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to give credit");
      return;
    }
    
    if (recipe && recipe.authorId !== user.id) {
      Alert.alert("Permission Denied", "Only the recipe creator can give credit");
      return;
    }
    
    setShowCreditModal(true);
  };

  const submitCredit = () => {
    if (!creditName.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    
    if (recipe) {
      // In a real app, you would update the recipe with credit information
      Alert.alert("Credit Given", `Credit has been given to ${creditName}`);
      setCreditName("");
      setShowCreditModal(false);
    }
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Recipe not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = user && recipe.authorId === user.id;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.recipeImage}
            contentFit="cover"
          />

          <View style={styles.recipeHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <View style={styles.tagsContainer}>
                {recipe.tags && recipe.tags.map((tag, index) => (
                  <View key={`tag-${index}`} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  recipe.isSaved && styles.favoriteButton,
                ]}
                onPress={handleToggleFavorite}
              >
                <Heart
                  size={20}
                  color={recipe.isSaved ? colors.white : colors.text}
                  fill={recipe.isSaved ? colors.error : "none"}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Share size={20} color={colors.text} />
              </TouchableOpacity>
              {isOwner && (
                <>
                  <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                    <Edit size={20} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                  >
                    <Trash size={20} color={colors.error} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <View style={styles.authorSection}>
            <Image
              source={{ uri: recipe.authorAvatar }}
              style={styles.authorAvatar}
              contentFit="cover"
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{recipe.authorName}</Text>
              <Text style={styles.recipeDate}>
                {new Date(recipe.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {isOwner && (
              <TouchableOpacity 
                style={styles.creditButton}
                onPress={handleGiveCredit}
              >
                <Award size={16} color={colors.primary} />
                <Text style={styles.creditButtonText}>Give Credit</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.recipeDescription}>{recipe.description}</Text>

          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={`star-${star}`}
                    size={24}
                    color={colors.warning}
                    fill={star <= Math.round(recipe.rating) ? colors.warning : "none"}
                  />
                ))}
              </View>
              <Text style={styles.ratingValue}>
                {recipe.rating.toFixed(1)} ({recipe.ratingCount} {recipe.ratingCount === 1 ? "rating" : "ratings"})
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={handleRateRecipe}
            >
              <Text style={styles.rateButtonText}>Rate Recipe</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recipeMetadata}>
            <View style={styles.metadataItem}>
              <Clock size={20} color={colors.primary} style={styles.metadataIcon} />
              <View>
                <Text style={styles.metadataLabel}>Prep Time</Text>
                <Text style={styles.metadataValue}>{recipe.prepTime} min</Text>
              </View>
            </View>
            <View style={styles.metadataItem}>
              <Clock size={20} color={colors.primary} style={styles.metadataIcon} />
              <View>
                <Text style={styles.metadataLabel}>Cook Time</Text>
                <Text style={styles.metadataValue}>{recipe.cookTime} min</Text>
              </View>
            </View>
            <View style={styles.metadataItem}>
              <Users size={20} color={colors.primary} style={styles.metadataIcon} />
              <View>
                <Text style={styles.metadataLabel}>Servings</Text>
                <Text style={styles.metadataValue}>{recipe.servings}</Text>
              </View>
            </View>
            <View style={styles.metadataItem}>
              <ChefHat size={20} color={colors.primary} style={styles.metadataIcon} />
              <View>
                <Text style={styles.metadataLabel}>Difficulty</Text>
                <Text style={styles.metadataValue}>
                  {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {recipe.region && (
            <View style={styles.regionContainer}>
              <Text style={styles.regionLabel}>Region:</Text>
              <Text style={styles.regionValue}>{recipe.region}</Text>
            </View>
          )}

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                <View key={`ingredient-${index}`} style={styles.ingredientItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.ingredientText}>
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsList}>
              {recipe.steps && recipe.steps.map((step, index) => (
                <View key={`step-${index}`} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{step.description}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.commentsHeader}>
              <Text style={styles.sectionTitle}>Comments</Text>
              <View style={styles.commentCountContainer}>
                <MessageCircle size={16} color={colors.lightText} />
                <Text style={styles.commentCount}>{comments.length}</Text>
              </View>
            </View>
            
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity 
                style={[
                  styles.commentSendButton,
                  !newComment.trim() && styles.disabledButton
                ]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                <Send size={20} color={!newComment.trim() ? colors.lightText : colors.white} />
              </TouchableOpacity>
            </View>
            
            {comments.length > 0 ? (
              <View style={styles.commentsList}>
                {comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Image
                      source={{ uri: comment.userAvatar }}
                      style={styles.commentAvatar}
                      contentFit="cover"
                    />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentUserName}>{comment.userName}</Text>
                        <Text style={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noCommentsContainer}>
                <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Rating Modal */}
        {showRatingModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Rate this Recipe</Text>
              <View style={styles.ratingStarsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={`rating-star-${star}`}
                    onPress={() => setUserRating(star)}
                  >
                    <Star
                      size={40}
                      color={colors.warning}
                      fill={star <= userRating ? colors.warning : "none"}
                      style={styles.ratingStar}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingText}>
                {userRating === 0 ? "Tap to rate" : `${userRating} star${userRating !== 1 ? "s" : ""}`}
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowRatingModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton, 
                    styles.submitButton,
                    userRating === 0 && styles.disabledButton
                  ]}
                  onPress={() => submitRating(userRating)}
                  disabled={userRating === 0}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Credit Modal */}
        {showCreditModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Give Credit</Text>
              <Text style={styles.modalSubtitle}>
                Acknowledge someone who inspired or contributed to this recipe
              </Text>
              <TextInput
                style={styles.creditInput}
                placeholder="Enter name"
                value={creditName}
                onChangeText={setCreditName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowCreditModal(false);
                    setCreditName("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton, 
                    styles.submitButton,
                    !creditName.trim() && styles.disabledButton
                  ]}
                  onPress={submitCredit}
                  disabled={!creditName.trim()}
                >
                  <Text style={styles.submitButtonText}>Give Credit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  recipeImage: {
    width: "100%",
    height: 300,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  recipeTitle: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tag: {
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  favoriteButton: {
    backgroundColor: colors.error,
  },
  deleteButton: {
    backgroundColor: colors.error + "20",
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    ...typography.bodyLarge,
    fontWeight: "600",
    color: colors.text,
  },
  recipeDate: {
    ...typography.caption,
    color: colors.lightText,
  },
  creditButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primary + "10",
    borderRadius: 16,
  },
  creditButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
  },
  recipeDescription: {
    ...typography.body,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
  },
  ratingContainer: {
    flex: 1,
  },
  ratingLabel: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  ratingValue: {
    ...typography.bodySmall,
    color: colors.text,
  },
  rateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  rateButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "600",
  },
  recipeMetadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 16,
  },
  metadataIcon: {
    marginRight: 8,
  },
  metadataLabel: {
    ...typography.caption,
    color: colors.lightText,
  },
  metadataValue: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: "600",
  },
  regionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  regionLabel: {
    ...typography.body,
    color: colors.lightText,
    marginRight: 8,
  },
  regionValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 16,
  },
  ingredientsList: {
    marginBottom: 8,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  ingredientText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  instructionsList: {
    marginBottom: 8,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "bold",
  },
  instructionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  commentCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentCount: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginLeft: 4,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...typography.body,
    color: colors.text,
    marginRight: 8,
    minHeight: 40,
  },
  commentSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
  },
  commentsList: {
    marginTop: 8,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  commentUserName: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.text,
  },
  commentDate: {
    ...typography.caption,
    color: colors.lightText,
  },
  commentText: {
    ...typography.body,
    color: colors.text,
  },
  noCommentsContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
  },
  noCommentsText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    width: "80%",
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.lightText,
    marginBottom: 16,
    textAlign: "center",
  },
  ratingStarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  ratingStar: {
    marginHorizontal: 8,
  },
  ratingText: {
    ...typography.body,
    color: colors.text,
    marginBottom: 24,
  },
  creditInput: {
    width: "100%",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...typography.body,
    color: colors.text,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  notFoundText: {
    ...typography.heading3,
    color: colors.text,
  },
});
