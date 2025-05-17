import Button from "@/components/Button";
import Input from "@/components/Input";
import colors from "@/constants/colors";
import countryCodes, { formatPhoneNumber } from "@/constants/countryCodes";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { CountryCode } from "@/types/auth";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function RestaurantOwnerSignup() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"owner" | "manager">("owner");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [restaurantNameError, setRestaurantNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const validateForm = () => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    // Validate phone
    if (!phone.trim()) {
      setPhoneError("Phone number is required");
      isValid = false;
    } else {
      const digitsOnly = phone.replace(/\D/g, "");
      if (digitsOnly.length < (selectedCountry.minLength || 10)) {
        setPhoneError(`Phone number must be at least ${selectedCountry.minLength || 10} digits`);
        isValid = false;
      } else if (digitsOnly.length > (selectedCountry.maxLength || 10)) {
        setPhoneError(`Phone number cannot exceed ${selectedCountry.maxLength || 10} digits`);
        isValid = false;
      } else {
        setPhoneError("");
      }
    }
    
    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    
    // Validate restaurant name
    if (!restaurantName.trim()) {
      setRestaurantNameError("Restaurant name is required");
      isValid = false;
    } else {
      setRestaurantNameError("");
    }
    
    // Validate address
    if (!address.trim()) {
      setAddressError("Address is required");
      isValid = false;
    } else {
      setAddressError("");
    }
    
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    try {
      const digitsOnly = phone.replace(/\D/g, "");
      const fullPhoneNumber = `${selectedCountry.code} ${digitsOnly}`;
      
      const otp = await register({
        name,
        email,
        phone: fullPhoneNumber,
        role,
        restaurantName,
        address
      });
      
      if (otp) {
        Alert.alert(
          "Registration Successful",
          "Please verify your phone number to continue.",
          [
            {
              text: "OK",
              onPress: () => router.push("/verify")
            }
          ]
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert(
        "Registration Failed",
        "There was an error creating your account. Please try again."
      );
    }
  };

  const handlePhoneChange = (text: string) => {
    const formattedNumber = formatPhoneNumber(text, selectedCountry.code);
    setPhone(formattedNumber);
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    // Reset phone number when country changes
    setPhone("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500",
                }}
                style={styles.logo}
                contentFit="cover"
              />
              <Text style={styles.title}>Join as Restaurant Partner</Text>
              <Text style={styles.subtitle}>
                Create your restaurant account to start serving customers
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.roleSelector}>
                <Text style={styles.label}>Select Your Role</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === "owner" && styles.roleButtonActive,
                    ]}
                    onPress={() => setRole("owner")}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      role === "owner" && styles.roleButtonTextActive,
                    ]}>
                      Owner
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === "manager" && styles.roleButtonActive,
                    ]}
                    onPress={() => setRole("manager")}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      role === "manager" && styles.roleButtonTextActive,
                    ]}>
                      Manager
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <Text style={styles.label}>Full Name</Text>
              <Input
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                error={nameError}
              />
              
              <Text style={styles.label}>Email</Text>
              <Input
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />
              
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity 
                  style={styles.countryCodeButton}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
                </TouchableOpacity>
                <View style={styles.phoneInputWrapper}>
                  <Input
                    placeholder={selectedCountry.format || "Enter phone number"}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    error=""
                    style={styles.phoneInput}
                  />
                </View>
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
              
              <Text style={styles.label}>Password</Text>
              <Input
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={passwordError}
              />
              
              <Text style={styles.label}>Confirm Password</Text>
              <Input
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={confirmPasswordError}
              />
              
              {showCountryPicker && (
                <View style={styles.countryPickerContainer}>
                  <Text style={styles.countryPickerTitle}>Select Country</Text>
                  <ScrollView style={styles.countryList}>
                    {countryCodes.map((country) => (
                      <TouchableOpacity
                        key={country.code}
                        style={[
                          styles.countryItem,
                          selectedCountry.code === country.code && styles.selectedCountryItem
                        ]}
                        onPress={() => handleCountrySelect(country)}
                      >
                        <Text style={styles.countryFlag}>{country.flag}</Text>
                        <Text style={styles.countryName}>{country.name}</Text>
                        <Text style={styles.countryCode}>{country.code}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowCountryPicker(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <Text style={styles.sectionTitle}>Restaurant Information</Text>
              
              <Text style={styles.label}>Restaurant Name</Text>
              <Input
                placeholder="Enter restaurant name"
                value={restaurantName}
                onChangeText={setRestaurantName}
                error={restaurantNameError}
              />
              
              <Text style={styles.label}>Restaurant Address</Text>
              <Input
                placeholder="Enter restaurant address"
                value={address}
                onChangeText={setAddress}
                error={addressError}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button
                title="Create Account"
                onPress={handleSignup}
                variant="primary"
                size="large"
                loading={isLoading}
                fullWidth
                style={styles.button}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms of Service, Restaurant
                Partner Agreement, and Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.lightText,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
  },
  roleSelector: {
    marginBottom: 24,
  },
  roleButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    marginHorizontal: 4,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
  },
  roleButtonText: {
    ...typography.bodySmall,
    fontWeight: "500",
    color: colors.text,
  },
  roleButtonTextActive: {
    color: colors.white,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: 8,
    fontWeight: "500",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  countryCodeButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
  },
  countryCodeText: {
    ...typography.body,
    color: colors.text,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    marginBottom: 0,
  },
  countryPickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countryPickerTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  countryList: {
    maxHeight: 300,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  selectedCountryItem: {
    backgroundColor: colors.primary + "20",
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  countryCode: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: colors.lightGray,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  closeButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: 4,
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.primary,
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
  },
  footerText: {
    ...typography.caption,
    color: colors.lightText,
    textAlign: "center",
  },
});
