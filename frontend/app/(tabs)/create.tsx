import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CreateScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleCreateRecipe = () => {
    router.push("/create-recipe");
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Sign in to create recipes</Text>
          <Text style={styles.authText}>
            Join our community to share your favorite Ethiopian recipes
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push("/(auth)")}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Recipe</Text>
      <Text style={styles.subtitle}>
        Share your favorite Ethiopian dishes with the community
      </Text>

      <TouchableOpacity
        style={styles.createCard}
        onPress={handleCreateRecipe}
        activeOpacity={1}
      >
        <View style={styles.createCardContent}>
          <View>
            <Text style={styles.createCardTitle}>New Recipe</Text>
            <Text style={styles.createCardText}>
              Create a complete recipe with ingredients, steps, and photos
            </Text>
          </View>
          <ChevronRight size={24} color={colors.primary} />
        </View>
      </TouchableOpacity>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for great recipes</Text>
        
        <View style={styles.tipItem}>
          <View style={styles.tipNumber}>
            <Text style={styles.tipNumberText}>1</Text>
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipItemTitle}>Be specific with ingredients</Text>
            <Text style={styles.tipItemText}>
              Include exact measurements and any substitutions
            </Text>
          </View>
        </View>
        
        <View style={styles.tipItem}>
          <View style={styles.tipNumber}>
            <Text style={styles.tipNumberText}>2</Text>
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipItemTitle}>Add clear instructions</Text>
            <Text style={styles.tipItemText}>
              Break down the cooking process into simple steps
            </Text>
          </View>
        </View>
        
        <View style={styles.tipItem}>
          <View style={styles.tipNumber}>
            <Text style={styles.tipNumberText}>3</Text>
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipItemTitle}>Include a good photo</Text>
            <Text style={styles.tipItemText}>
              A quality photo makes your recipe more appealing
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    ...typography.heading2,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.lightText,
    marginBottom: 24,
  },
  createCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  createCardTitle: {
    ...typography.heading3,
    marginBottom: 4,
  },
  createCardText: {
    ...typography.bodySmall,
    color: colors.lightText,
    maxWidth: "90%",
  },
  createCardImage: {
    height: 150,
    width: "100%",
  },
  tipsContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tipNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tipNumberText: {
    color: colors.white,
    fontWeight: "600",
  },
  tipContent: {
    flex: 1,
  },
  tipItemTitle: {
    ...typography.heading4,
    marginBottom: 4,
  },
  tipItemText: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  authPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  authTitle: {
    ...typography.heading2,
    marginBottom: 12,
    textAlign: "center",
  },
  authText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  authButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
