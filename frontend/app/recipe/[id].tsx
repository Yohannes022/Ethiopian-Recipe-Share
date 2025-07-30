import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ChevronLeft,
  Clock,
  Heart,
  Share2,
  Users,
  Edit,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mockRecipe = {
  id: "1",
  title: "Mock Recipe",
  imageUrl: "https://example.com/image.jpg",
  author: {
    name: "John Doe",
    avatar: "https://example.com/avatar.jpg",
  },
  description: "This is a mock recipe.",
  prepTime: 30,
  servings: 4,
  difficulty: "medium",
  ingredients: [
    { id: "1", amount: 2, unit: "cups", name: "Flour" },
    { id: "2", amount: 1, unit: "cup", name: "Sugar" },
  ],
  steps: [
    { id: "1", description: "Step 1: Mix flour and sugar." },
    { id: "2", description: "Step 2: Add eggs and mix well." },
  ],
  creditTo: "Jane Doe",
};

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const recipe = mockRecipe;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.title}!`,
        url: `exp://127.0.0.1:8081/--/recipe/${id}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share recipe.");
    }
  };

  const handleSave = () => {
    Alert.alert("Login Required", "Please log in to save recipes.");
  };

  const getDifficultyStyle = (difficulty: string) => {
    if (difficulty === "easy") return styles.easy;
    if (difficulty === "medium") return styles.medium;
    if (difficulty === "hard") return styles.hard;
    return {};
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={48} color={colors.error} />
        <Text style={styles.errorText}>Recipe not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: recipe.author.avatar }}
              style={styles.authorAvatar}
            />
            <Text style={styles.authorName}>{recipe.author.name}</Text>
          </View>

          <Text style={styles.description}>{recipe.description}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Clock size={18} color={colors.lightText} />
              <Text style={styles.metaText}>{recipe.prepTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={18} color={colors.lightText} />
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.difficulty, getDifficultyStyle(recipe.difficulty)]}>
                {recipe.difficulty}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ing) => (
              <Text key={ing.id} style={styles.ingredientText}>
                {`\u2022 ${ing.amount} ${ing.unit} ${ing.name}`}
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.steps.map((step, index) => (
              <View key={step.id} style={styles.stepContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step.description}</Text>
              </View>
            ))}
          </View>

          {recipe.creditTo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Credit To</Text>
              <Text style={styles.creditText}>{recipe.creditTo}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView style={styles.header} edges={["top"]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ChevronLeft size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
            <Heart size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Share2 size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/edit-recipe/${id}`)}
            style={styles.iconButton}
          >
            <Edit size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    width: "100%",
    height: 350,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    ...typography.heading2,
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  authorName: {
    ...typography.body,
    fontWeight: "500",
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 20,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  metaItem: {
    alignItems: "center",
  },
  metaText: {
    ...typography.bodySmall,
    marginTop: 4,
  },
  difficulty: {
    ...typography.bodySmall,
    fontWeight: "bold",
    textTransform: "capitalize",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  easy: {
    backgroundColor: colors.lightGray,
    color: colors.success,
  },
  medium: {
    backgroundColor: colors.lightGray,
    color: colors.warning,
  },
  hard: {
    backgroundColor: colors.lightGray,
    color: colors.error,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 12,
  },
  ingredientText: {
    ...typography.body,
    marginBottom: 8,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stepNumber: {
    ...typography.heading3,
    color: colors.primary,
    marginRight: 12,
  },
  stepText: {
    ...typography.body,
    flex: 1,
    lineHeight: 22,
  },
  creditText: {
    ...typography.body,
    fontStyle: "italic",
    color: colors.lightText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    ...typography.heading2,
    marginVertical: 16,
  },
});
