import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import CountryCodePicker from "@/components/CountryCodePicker";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import countryCodes, { formatPhoneNumber } from "@/constants/countryCodes";
import { CountryCode, UserRole } from "@/types/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [userType, setUserType] = useState<UserRole>("user");
  const [showUserTypePicker, setShowUserTypePicker] = useState(false);

  const validatePhoneNumber = () => {
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
    
    setPhoneError("");
    return true;
  };

  const handleLogin = async () => {
    if (!validatePhoneNumber()) {
      return;
    }
    
    try {
      await login(countryCode + phoneNumber, userType);
      router.push("/(auth)/verify");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleCountryCodeSelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setCountryCode(country.code);
    setShowCountryPicker(false);
    // Clear any existing errors when changing country code
    setPhoneError("");
  };

  const handleUserTypeSelect = (type: UserRole) => {
    setUserType(type);
    setShowUserTypePicker(false);
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case "owner":
        return "Restaurant Owner";
      case "manager":
        return "Restaurant Manager";
      default:
        return "Customer";
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    // Format the phone number based on the selected country
    const formattedNumber = formatPhoneNumber(text, countryCode);
    setPhoneNumber(formattedNumber);
  };

  const getPhoneInputPlaceholder = () => {
    switch (countryCode) {
      case "+1":
        return "(555) 123-4567";
      case "+44":
        return "7911 123456";
      case "+91":
        return "9876543210";
      case "+251":
        return "911234567";
      default:
        return "Phone number";
    }
  };

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
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue to your account
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>I am a</Text>
          <TouchableOpacity
            style={styles.userTypePicker}
            onPress={() => setShowUserTypePicker(!showUserTypePicker)}
          >
            <Text style={styles.userTypeText}>{getUserTypeLabel()}</Text>
            <ChevronDown size={20} color={colors.text} />
          </TouchableOpacity>

          {showUserTypePicker && (
            <View style={styles.userTypeDropdown}>
              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  userType === "user" && styles.selectedUserType,
                ]}
                onPress={() => handleUserTypeSelect("user")}
              >
                <Text
                  style={[
                    styles.userTypeOptionText,
                    userType === "user" && styles.selectedUserTypeText,
                  ]}
                >
                  Customer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  userType === "owner" && styles.selectedUserType,
                ]}
                onPress={() => handleUserTypeSelect("owner")}
              >
                <Text
                  style={[
                    styles.userTypeOptionText,
                    userType === "owner" && styles.selectedUserTypeText,
                  ]}
                >
                  Restaurant Owner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  userType === "manager" && styles.selectedUserType,
                ]}
                onPress={() => handleUserTypeSelect("manager")}
              >
                <Text
                  style={[
                    styles.userTypeOptionText,
                    userType === "manager" && styles.selectedUserTypeText,
                  ]}
                >
                  Restaurant Manager
                </Text>
              </TouchableOpacity>
            </View>
          )}

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

          {showCountryPicker && (
            <CountryCodePicker
              visible={showCountryPicker}
              onClose={() => setShowCountryPicker(false)}
              onSelect={handleCountryCodeSelect}
              selectedCountry={selectedCountry}
              currentCode={countryCode}
            />
          )}

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
            onPress={() => {
              if (userType === "owner" || userType === "manager") {
                router.push("/(auth)/restaurant-owner-signup");
              } else {
                router.push("/(auth)/register");
              }
            }}
          >
            <Text style={styles.registerButtonText}>
              {userType === "user"
                ? "Create a new account"
                : "Register your restaurant"}
            </Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
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
    width: "100%",
  },
  label: {
    ...typography.bodySmall,
    fontWeight: "500",
    marginBottom: 8,
  },
  userTypePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  userTypeText: {
    ...typography.body,
  },
  userTypeDropdown: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 16,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userTypeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  selectedUserType: {
    backgroundColor: colors.primary + "20",
  },
  userTypeOptionText: {
    ...typography.body,
  },
  selectedUserTypeText: {
    color: colors.primary,
    fontWeight: "600",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
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
    marginBottom: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginHorizontal: 16,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    ...typography.body,
    color: colors.primary,
    marginRight: 4,
  },
});
