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
import { useRouter } from "expo-router";
import { AlertCircle, Award, Camera, Plus, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Food-related keywords for validation
const foodKeywords = [
  "food", "recipe", "cook", "bake", "fry", "boil", "grill", "roast", "stew",
  "meal", "dish", "cuisine", "ingredient", "spice", "herb", "vegetable", "fruit",
  "meat", "fish", "chicken", "beef", "lamb", "pork", "injera", "wat", "tibs",
  "kitfo", "doro", "berbere", "mitmita", "niter kibbeh", "kocho", "shiro",
  "teff", "ayib", "dabo", "kita", "genfo", "chechebsa", "fitfit", "gomen",
  "alicha", "dulet", "kategna", "breakfast", "lunch", "dinner", "appetizer",
  "dessert", "snack", "drink", "beverage", "ethiopian", "traditional"
];

export default function CreateRecipeScreen() {
  const router = useRouter();
  const { addRecipe } = useRecipeStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [region, setRegion] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", name: "", amount: "", unit: "" },
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", description: "" },
  ]);
  const [creditTo, setCreditTo] = useState("");

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    imageUrl?: string;
    ingredients?: string;
    steps?: string;
    content?: string;
    auth?: string;
  }>({});

  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    score: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      setErrors({
        auth: "You need to be logged in to create recipes"
      });
    }
  }, [user]);

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

    if (!user) {
      newErrors.auth = "You need to be logged in to create recipes";
      return false;
    }

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

  const validateFoodContent = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Combine all text content for validation
      const contentToValidate = `
        Title: ${title}
        Description: ${description}
        Ingredients: ${ingredients.map(ing => `${ing.amount} ${ing.unit} ${ing.name}`).join(', ')}
        Steps: ${steps.map(step => step.description).join(' ')}
        Tags: ${selectedTags.join(', ')}
        Region: ${region}
      `;

      // Check if content contains food-related keywords
      const lowerContent = contentToValidate.toLowerCase();
      const matchedKeywords = foodKeywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      );
      
      const score = matchedKeywords.length / foodKeywords.length * 100;
      const isValid = score > 15; // At least 15% of keywords should match
      
      setValidationResult({
        isValid,
        score: Math.min(100, score),
        message: isValid 
          ? "This appears to be a valid food recipe." 
          : "This doesn't appear to be a food recipe. Please ensure you're adding food-related content."
      });

      if (!isValid) {
        setErrors({
          ...errors,
          content: "This doesn't appear to be a food recipe. Please add more food-related content."
        });
        return false;
      }

      return isValid;
    } catch (error) {
      console.error("Error validating content:", error);
      return true; // Allow submission if validation fails
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to create recipes", [
        { text: "OK", onPress: () => router.replace("/(auth)") }
      ]);
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Validate that this is a food recipe
    const isValidFood = await validateFoodContent();
    if (!isValidFood) {
      return;
    }

    setIsSubmitting(true);

    try {
      // For demo purposes, we'll use a placeholder image if the user didn't select one
      const finalImageUrl = imageUrl || "https://images.unsplash.com/photo-1567364816519-cbc9c4ffe1eb?q=80&w=1000";

      addRecipe({
        title,
        description,
        imageUrl: finalImageUrl,
        prepTime: parseInt(prepTime) || 0,
        cookTime: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 1,
        difficulty,
        ingredients,
        steps,
        region: region || undefined,
        tags: selectedTags.length > 0 ? selectedTags : ["traditional"],
        creditTo: creditTo.trim() || undefined,
        restaurantId: "",
        updatedAt: ""
      });

      Alert.alert(
        "Success",
        "Your recipe has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error creating recipe:", error);
      Alert.alert("Error", "Failed to create recipe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (errors.auth) {
    return (
      <View style={styles.authErrorContainer}>
        <AlertCircle size={60} color={colors.error} />
        <Text style={styles.authErrorTitle}>Login Required</Text>
        <Text style={styles.authErrorText}>{errors.auth}</Text>
        <Button 
          title="Login" 
          onPress={() => router.replace("/(auth)")}
          style={styles.loginButton}
        />
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
          <Text style={styles.sectionTitle}>Recipe Details</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Recipe Title</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.textInput,
                  !title && styles.emptyInput
                ]}
                placeholder="Recipe Title"
                placeholderTextColor={colors.placeholderText}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputWrapper, { minHeight: 100 }]}>
              <TextInput
                style={[
                  styles.textInput,
                  { textAlignVertical: 'top', minHeight: 100 },
                  !description && styles.emptyInput
                ]}
                placeholder="Enter a brief description of your recipe..."
                placeholderTextColor={colors.placeholderText}
                multiline
                value={description}
                onChangeText={setDescription}
                numberOfLines={4}
              />
            </View>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <View style={styles.creditContainer}>
            <Award size={20} color={colors.primary} style={styles.creditIcon} />
            <TextInput
              style={styles.creditInput}
              placeholder="Give credit to someone who inspired this recipe (optional)"
              value={creditTo}
              onChangeText={setCreditTo}
            />
          </View>

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
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Prep Time (min)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.textInput,
                    !prepTime && styles.emptyInput
                  ]}
                  placeholder="0"
                  placeholderTextColor={colors.placeholderText}
                  keyboardType="numeric"
                  value={prepTime}
                  onChangeText={setPrepTime}
                />
              </View>
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Cook Time (min)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.textInput,
                    !cookTime && styles.emptyInput
                  ]}
                  placeholder="45"
                  placeholderTextColor={colors.placeholderText}
                  keyboardType="numeric"
                  value={cookTime}
                  onChangeText={setCookTime}
                />
              </View>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 20 }]}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Servings</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.textInput,
                    !servings && styles.emptyInput
                  ]}
                  placeholder="1"
                  placeholderTextColor={colors.placeholderText}
                  keyboardType="numeric"
                  value={servings}
                  onChangeText={setServings}
                />
              </View>
            </View>
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

          {ingredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.ingredientRow}>
              <View style={styles.ingredientInputs}>
                <View style={[styles.ingredientInput, styles.amountInput]}>
                  <TextInput
                    style={[
                      styles.textInput,
                      !ingredient.amount && styles.emptyInput
                    ]}
                    placeholder="Amount"
                    placeholderTextColor={colors.placeholderText}
                    keyboardType="numeric"
                    value={ingredient.amount}
                    onChangeText={(text) =>
                      updateIngredient(ingredient.id, "amount", text)
                    }
                  />
                </View>
                <View style={[styles.ingredientInput, styles.unitInput]}>
                  <TextInput
                    style={[
                      styles.textInput,
                      !ingredient.unit && styles.emptyInput
                    ]}
                    placeholder="Unit"
                    placeholderTextColor={colors.placeholderText}
                    keyboardType="numeric"
                    value={ingredient.unit}
                    onChangeText={(text) =>
                      updateIngredient(ingredient.id, "unit", text)
                    }
                  />
                </View>
                <View style={[styles.ingredientInput, styles.nameInput]}>
                  <TextInput
                    style={[
                      styles.textInput,
                      !ingredient.name && styles.emptyInput
                    ]}
                    placeholder="Ingredient name"
                    placeholderTextColor={colors.placeholderText}
                    value={ingredient.name}
                    onChangeText={(text) =>
                      updateIngredient(ingredient.id, "name", text)
                    }
                  />
                </View>
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

          {errors.content && (
            <View style={styles.contentErrorContainer}>
              <AlertCircle size={20} color={colors.error} />
              <Text style={styles.contentErrorText}>{errors.content}</Text>
            </View>
          )}

          {validationResult && (
            <View style={[
              styles.validationResultContainer,
              validationResult.isValid ? styles.validContainer : styles.invalidContainer
            ]}>
              <Text style={styles.validationResultTitle}>
                {validationResult.isValid ? "Valid Recipe" : "Invalid Recipe"}
              </Text>
              <Text style={styles.validationResultMessage}>
                {validationResult.message}
              </Text>
              <View style={styles.validationScoreContainer}>
                <View style={styles.validationScoreBar}>
                  <View 
                    style={[
                      styles.validationScoreFill,
                      { width: `${validationResult.score}%` },
                      validationResult.isValid ? styles.validScoreFill : styles.invalidScoreFill
                    ]} 
                  />
                </View>
                <Text style={styles.validationScoreText}>
                  {Math.round(validationResult.score)}% food-related
                </Text>
              </View>
            </View>
          )}

          <View style={styles.submitContainer}>
            {isValidating ? (
              <View style={styles.validatingContainer}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.validatingText}>Validating recipe content...</Text>
              </View>
            ) : (
              <Button
                title="Create Recipe"
                onPress={handleSubmit}
                loading={isSubmitting}
                fullWidth
              />
            )}
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
    alignItems: "center",
    gap: 12,
  },
  halfInput: {
    width: "48%",
  },
  creditContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  creditIcon: {
    marginRight: 8,
  },
  creditInput: {
    flex: 1,
    paddingVertical: 12,
    ...typography.body,
    color: colors.text,
  },
  imagePicker: {
    height: 200,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    borderStyle: "dashed",
  },
  inputContainer: {
    // marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.divider,
    justifyContent: 'center',
  },
  textInput: {
    ...typography.body,
    color: colors.text,
    fontSize: 15,
    padding: 14,
    width: '100%',
  },
  // Style for input when it's empty (showing placeholder)
  emptyInput: {
    color: colors.placeholderText,
  },
  inputPlaceholder: {
    color: colors.lightText + '99', // Slightly transparent light text for placeholders
  },
  imagePickerText: {
    ...typography.body,
    color: colors.lightText,
    marginTop: 12,
  },
  imagePreviewContainer: {
    marginBottom: 12,
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
    width: '48%',
    // marginTop: 12,
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
    marginBottom: 12,
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
    marginBottom: 12,
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
    marginVertical: 12,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  ingredientInputs: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...typography.body,
    color: colors.text,
  },
  ingredientInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    justifyContent: 'center',
  },
  ingredientTextInput: {
    ...typography.body,
    color: colors.text,
    fontSize: 15,
    padding: 10,
    width: '100%',
  },
  amountInput: {
    width: "35%",
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
    marginBottom: 12,
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
  contentErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error + "15",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  contentErrorText: {
    ...typography.body,
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  validationResultContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  validContainer: {
    backgroundColor: colors.success + "15",
  },
  invalidContainer: {
    backgroundColor: colors.error + "15",
  },
  validationResultTitle: {
    ...typography.heading4,
    marginBottom: 4,
  },
  validationResultMessage: {
    ...typography.body,
    marginBottom: 12,
  },
  validationScoreContainer: {
    marginTop: 8,
  },
  validationScoreBar: {
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  validationScoreFill: {
    height: "100%",
  },
  validScoreFill: {
    backgroundColor: colors.success,
  },
  invalidScoreFill: {
    backgroundColor: colors.error,
  },
  validationScoreText: {
    ...typography.caption,
    textAlign: "right",
  },
  validatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  validatingText: {
    ...typography.body,
    marginLeft: 8,
    color: colors.primary,
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
  authErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  authErrorTitle: {
    ...typography.heading2,
    marginTop: 16,
    marginBottom: 8,
  },
  authErrorText: {
    ...typography.body,
    color: colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    width: 200,
  },
});
