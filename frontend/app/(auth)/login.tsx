import Button from "@/components/Button";
import CountryCodePicker from "@/components/CountryCodePicker";
import colors from "@/constants/colors";
import countryCodes, { formatPhoneNumber } from "@/constants/countryCodes";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { CountryCode } from "@/types/auth";
import { Image, ImageStyle } from "expo-image";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { UserRole } from "@/types/user";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginScreen(): React.ReactElement {
  /**
   * Login Screen Component
   * 
   * Handles user authentication through phone number or email/password.
   * Users can switch between login methods and navigate to registration.
   * 
   * @component
   * @example
   * // Example API calls:
   * 
   * // Phone Login
   * fetch('/api/auth/login', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     phone: '+1234567890',
   *     userType: 'user'
   *   })
   * });
   * 
   * // Email Login
   * fetch('/api/auth/login', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     email: 'user@example.com',
   *     password: 'yourpassword',
   *     userType: 'user'
   *   })
   * });
   * 
   * // Registration
   * fetch('/api/auth/register', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     email: 'user@example.com',
   *     password: 'yourpassword',
   *     userType: 'user',
   *     name: 'John Doe',
   *     // ... other user data
   *   })
   * });
   */
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [isPhoneLogin, setIsPhoneLogin] = useState(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>({
    name: "Ethiopia",
    code: "+251",
    flag: "",
    minLength: 9,
    maxLength: 9
  });
  const [countryCode, setCountryCode] = useState("+251");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  /**
   * Validates the login form based on the selected login method
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    // Clear previous errors
    setPhoneError("");
    setFormError("");

    if (isPhoneLogin) {
      if (!phoneNumber.trim()) {
        setPhoneError("Phone number is required");
        return false;
      }
      
      const cleanedNumber = phoneNumber.replace(/\D/g, "");
      
      if (selectedCountry.minLength && cleanedNumber.length < selectedCountry.minLength) {
        setPhoneError(`Phone number must be at least ${selectedCountry.minLength} digits`);
        return false;
      }
      
      if (selectedCountry.maxLength && cleanedNumber.length > selectedCountry.maxLength) {
        setPhoneError(`Phone number cannot exceed ${selectedCountry.maxLength} digits`);
        return false;
      }
      
      return true;
    } else {
      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email.trim()) {
        setFormError("Email is required");
        return false;
      } else if (!emailRegex.test(email.trim())) {
        setFormError("Please enter a valid email address");
        return false;
      }
      
      if (!password.trim()) {
        setFormError("Password is required");
        return false;
      }
      
      return true;
    }
  };

  /**
   * Handles the login form submission
   */
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isPhoneLogin) {
        await login(countryCode + phoneNumber, UserRole.USER);
        router.push("/(auth)/verify");
      } else {
        // For email login, the login function will use the default role
        await login(email, password);
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setFormError(error?.message || "An error occurred during login");
    }
  };

  const handleCountryCodeSelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setCountryCode(country.code);
    setShowCountryPicker(false);
    // Clear any existing errors when changing country code
    setPhoneError("");
  };

  const toggleLoginMethod = () => {
    setIsPhoneLogin(!isPhoneLogin);
  };

  const handlePhoneNumberChange = (text: string) => {
    // Format the phone number based on the selected country
    const formattedNumber = formatPhoneNumber(text, countryCode);
    setPhoneNumber(formattedNumber);
  };

  const getPhoneInputPlaceholder = () => {
    switch (countryCode) {
      case "+251":
        return "911234567";
      case "+1":
        return "(555) 123-4567";
      case "+44":
        return "7911 123456";
      case "+91":
        return "9876543210";
      default:
        return "Phone number";
    }
  };

  // Move styles to the bottom to avoid reference errors
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
            transition={1000}
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue to your account
          </Text>
        </View>

        <View style={styles.form}>

          {isPhoneLogin ? (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity
                  style={styles.countryCodeButton}
                  onPress={() => setShowCountryPicker(!showCountryPicker)}
                >
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                  <ChevronDown size={16} color={colors.text} />
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneInput}
                  placeholder={getPhoneInputPlaceholder()}
                  placeholderTextColor={colors.placeholderText}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  maxLength={15}
                />
              </View>
              
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : (
                <Text style={styles.helperText}>
                  We'll send a verification code to this number
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.emailInput}
                placeholder="Enter your email"
                placeholderTextColor={colors.placeholderText}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor={colors.placeholderText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </>
          )}

          {showCountryPicker && isPhoneLogin && (
            <CountryCodePicker
              visible={showCountryPicker}
              onClose={() => setShowCountryPicker(false)}
              onSelect={handleCountryCodeSelect}
              selectedCountry={selectedCountry}
              currentCode={countryCode}
            />
          )}

          <TouchableOpacity
            style={styles.toggleMethodButton}
            onPress={toggleLoginMethod}
          >
            <Text style={styles.toggleMethodText}>
              {isPhoneLogin ? "Login with email" : "Login with phone"}
            </Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Continue"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            style={styles.continueButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.registerButtonText}>
              Create a new account
            </Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Define interface for styles to ensure type safety
interface Styles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  logo: ImageStyle;
  title: TextStyle;
  subtitle: TextStyle;
  form: ViewStyle;
  label: TextStyle;
  toggleMethodButton: ViewStyle;
  toggleMethodText: TextStyle;
  emailInput: TextStyle;
  passwordInput: TextStyle;
  phoneInputContainer: ViewStyle;
  countryCodeButton: ViewStyle;
  countryCodeText: TextStyle;
  phoneInput: TextStyle;
  helperText: TextStyle;
  errorText: TextStyle;
  continueButton: ViewStyle;
  divider: ViewStyle;
  dividerLine: ViewStyle;
  dividerText: TextStyle;
  registerButton: ViewStyle;
  registerButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 16, // added padding
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: {
    ...typography.heading1,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
  },
  form: {
    width: '100%',
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
    marginBottom: 8,
  },
  toggleMethodButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  toggleMethodText: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
  },
  emailInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 8,
  },
  countryCodeText: {
    ...typography.body,
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helperText: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 24,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: 24,
  },
  continueButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginHorizontal: 16,
    marginVertical: 0,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
  },
  registerButtonText: {
    ...typography.body,
    color: colors.primary,
    marginRight: 4,
  },
});
