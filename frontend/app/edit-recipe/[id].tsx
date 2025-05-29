import Button from "@/components/Button";
import Input from "@/components/Input";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { popularTags, regions } from "@/mocks/recipes";
import { useAuthStore } from "@/store/authStore";
import { useRecipeStore } from "@/store/recipeStore";
import { Ingredient, Step } from "@/types/recipe";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, Camera, Plus, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { recipes, updateRecipe } = useRecipeStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipe = recipes.find((r) => r.id === id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [region, setRegion] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [creditTo, setCreditTo] = useState("");

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    imageUrl?: string;
    ingredients?: string;
    steps?: string;
    permission?: string;
  }>({});

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      Alert.alert("Login Required", "Please login to edit recipes", [
        { text: "OK", onPress: () => router.replace("/(auth)") }
      ]);
      return;
    }
    
    // Check if recipe exists
    if (!recipe) {
      Alert.alert("Error", "Recipe not found", [
        { text: "OK", onPress: () => router.back() }
      ]);
      return;
    }
    
    // Check if user is the owner of the recipe
    if (recipe.authorId !== user.id) {
      Alert.alert("Permission Denied", "You can only edit your own recipes", [
        { text: "OK", onPress: () => router.back() }
      ]);
      setErrors({ permission: "You don't have permission to edit this recipe" });
      return;
    }
    
    // Load recipe data
    setTitle(recipe.title);
    setDescription(recipe.description);
    setImageUrl(recipe.imageUrl);
    setPrepTime(recipe.prepTime.toString());
    setCookTime(recipe.cookTime.toString());
    setServings(recipe.servings.toString());
    setDifficulty(recipe.difficulty as "easy" | "medium" | "hard");
    setRegion(recipe.region || "");
    setSelectedTags(recipe.tags);
    setIngredients(recipe.ingredients);
    setSteps(recipe.steps);
    setCreditTo(recipe.creditTo || "");
  }, [recipe, user, router]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: "", amount: "", unit: "" },
    ]);
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((ing) => ing.id !== id));
    }
  };

  const addStep = () => {
    setSteps([
      ...steps,
      { id: Date.now().toString(), description: "" },
    ]);
  };

  const updateStep = (id: string, description: string) => {
    setSteps(
      steps.map((step) =>
        step.id === id ? { ...step, description } : step
      )
    );
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((step) => step.id !== id));
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!imageUrl) {
      newErrors.imageUrl = "Please add a recipe image";
    }

    const hasEmptyIngredient = ingredients.some(
      (ing) => !ing.name.trim() || !ing.amount.trim()
    );
    if (hasEmptyIngredient) {
      newErrors.ingredients = "Please complete all ingredient fields";
    }

    const hasEmptyStep = steps.some((step) => !step.description.trim());
    if (hasEmptyStep) {
      newErrors.steps = "Please complete all instruction steps";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to edit recipes");
      return;
    }
    
    if (recipe && recipe.authorId !== user.id) {
      Alert.alert("Permission Denied", "You can only edit your own recipes");
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      updateRecipe(id, {
        title,
        description,
        imageUrl,
        prepTime: parseInt(prepTime) || 0,
        cookTime: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 1,
        difficulty,
        ingredients,
        steps,
        region: region || undefined,
        tags: selectedTags.length > 0 ? selectedTags : ["traditional"],
        creditTo: creditTo.trim() || undefined,
      });

      Alert.alert(
        "Success",
        "Your recipe has been updated successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error updating recipe:", error);
      Alert.alert("Error", "Failed to update recipe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (errors.permission) {
    return (
      <View style={styles.permissionErrorContainer}>
        <AlertCircle size={60} color={colors.error} />
        <Text style={styles.permissionErrorTitle}>Permission Denied</Text>
        <Text style={styles.permissionErrorText}>{errors.permission}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (!recipe || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Edit Recipe</Text>

          <Input
            label="Recipe Title"
            placeholder="Enter recipe name"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
          />

          <Input
            label="Description"
            placeholder="Describe your recipe"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            error={errors.description}
          />

          <Input
            label="Credit To (Optional)"
            placeholder="Give credit to someone who inspired this recipe"
            value={creditTo}
            onChangeText={setCreditTo}
          />

          <Text style={styles.label}>Recipe Image</Text>
          {imageUrl ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.imagePreview}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickImage}
            >
              <Camera size={32} color={colors.lightText} />
              <Text style={styles.imagePickerText}>Add Recipe Photo</Text>
            </TouchableOpacity>
          )}
          {errors.imageUrl && (
            <Text style={styles.errorText}>{errors.imageUrl}</Text>
          )}

          <View style={styles.row}>
            <Input
              label="Prep Time (min)"
              placeholder="30"
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="number-pad"
              style={styles.halfInput}
            />
            <Input
              label="Cook Time (min)"
              placeholder="45"
              value={cookTime}
              onChangeText={setCookTime}
              keyboardType="number-pad"
              style={styles.halfInput}
            />
          </View>

          <View style={styles.row}>
            <Input
              label="Servings"
              placeholder="4"
              value={servings}
              onChangeText={setServings}
              keyboardType="number-pad"
              style={styles.halfInput}
            />
            <View style={[styles.halfInput, styles.difficultyContainer]}>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.difficultyButtons}>
                {["easy", "medium", "hard"].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      difficulty === level && styles.selectedDifficulty,
                    ]}
                    onPress={() => setDifficulty(level as any)}
                  >
                    <Text
                      style={[
                        styles.difficultyButtonText,
                        difficulty === level && styles.selectedDifficultyText,
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.label}>Region (Optional)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.regionsContainer}
          >
            {regions.filter(r => r !== "All regions").map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.regionButton,
                  region === r && styles.selectedRegion,
                ]}
                onPress={() => setRegion(region === r ? "" : r)}
              >
                <Text
                  style={[
                    styles.regionButtonText,
                    region === r && styles.selectedRegionText,
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagsContainer}>
            {popularTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  selectedTags.includes(tag) && styles.selectedTag,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagButtonText,
                    selectedTags.includes(tag) && styles.selectedTagText,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Ingredients</Text>
          {errors.ingredients && (
            <Text style={styles.errorText}>{errors.ingredients}</Text>
          )}

          {ingredients.map((ingredient, index) => (
            <View key={ingredient.id} style={styles.ingredientRow}>
              <View style={styles.ingredientInputs}>
                <Input
                  placeholder="Amount"
                  value={ingredient.amount}
                  onChangeText={(text) =>
                    updateIngredient(ingredient.id, "amount", text)
                  }
                  style={styles.amountInput}
                />
                <Input
                  placeholder="Unit (optional)"
                  value={ingredient.unit}
                  onChangeText={(text) =>
                    updateIngredient(ingredient.id, "unit", text)
                  }
                  style={styles.unitInput}
                />
                <Input
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChangeText={(text) =>
                    updateIngredient(ingredient.id, "name", text)
                  }
                  style={styles.nameInput}
                />
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeIngredient(ingredient.id)}
                disabled={ingredients.length === 1}
              >
                <X
                  size={20}
                  color={
                    ingredients.length === 1
                      ? colors.divider
                      : colors.lightText
                  }
                />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={addIngredient}
          >
            <Plus size={20} color={colors.primary} />
            <Text style={styles.addButtonText}>Add Ingredient</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Instructions</Text>
          {errors.steps && (
            <Text style={styles.errorText}>{errors.steps}</Text>
          )}

          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeStep(step.id)}
                  disabled={steps.length === 1}
                >
                  <X
                    size={20}
                    color={
                      steps.length === 1 ? colors.divider : colors.lightText
                    }
                  />
                </TouchableOpacity>
              </View>
              <Input
                placeholder="Describe this step..."
                value={step.description}
                onChangeText={(text) => updateStep(step.id, text)}
                multiline
                numberOfLines={3}
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={addStep}
          >
            <Plus size={20} color={colors.primary} />
            <Text style={styles.addButtonText}>Add Step</Text>
          </TouchableOpacity>

          <View style={styles.submitContainer}>
            <Button
              title="Update Recipe"
              onPress={handleSubmit}
              loading={isSubmitting}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    ...typography.heading2,
    marginBottom: 20,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: "500",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  imagePicker: {
    height: 200,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    borderStyle: "dashed",
  },
  imagePickerText: {
    ...typography.body,
    color: colors.lightText,
    marginTop: 12,
  },
  imagePreviewContainer: {
    marginBottom: 16,
    position: "relative",
  },
  imagePreview: {
    height: 200,
    width: "100%",
    borderRadius: 12,
  },
  changeImageButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  changeImageText: {
    ...typography.caption,
    color: colors.white,
  },
  difficultyContainer: {
    marginBottom: 16,
  },
  difficultyButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  difficultyButtonText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  selectedDifficulty: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedDifficultyText: {
    color: colors.white,
    fontWeight: "600",
  },
  regionsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  regionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
    marginBottom: 8,
  },
  regionButtonText: {
    ...typography.caption,
    color: colors.text,
  },
  selectedRegion: {
    backgroundColor: colors.primary,
  },
  selectedRegionText: {
    color: colors.white,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
    marginBottom: 8,
  },
  tagButtonText: {
    ...typography.caption,
    color: colors.text,
  },
  selectedTag: {
    backgroundColor: colors.primary,
  },
  selectedTagText: {
    color: colors.white,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 24,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ingredientInputs: {
    flex: 1,
    flexDirection: "row",
  },
  amountInput: {
    width: "25%",
    marginRight: 8,
    marginBottom: 0,
  },
  unitInput: {
    width: "25%",
    marginRight: 8,
    marginBottom: 0,
  },
  nameInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    borderStyle: "dashed",
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: "500",
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: colors.white,
    fontWeight: "600",
  },
  submitContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: 8,
  },
  permissionErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  permissionErrorTitle: {
    ...typography.heading2,
    color: colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  permissionErrorText: {
    ...typography.body,
    color: colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.text,
  },
});
