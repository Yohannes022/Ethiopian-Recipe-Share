/**
 * User Registration Screen
 * 
 * This screen handles user registration with phone number verification.
 * 
 * API INTEGRATION GUIDE:
 * 
 * 1. Configure API Base URL:
 *    - Create a config file (e.g., `src/config.ts`) and add:
 *      
 *      export const API_BASE_URL = 'https://your-api-url.com/api';
 * 
 * 2. Required API Endpoints:
 *    
 *    a) Send Verification Code:
 *    - Method: POST
 *    - Endpoint: /auth/send-verification
 *    - Request Body: { phone: string, countryCode: string }
 *    - Response: { success: boolean, message?: string }
 * 
 *    b) Verify Code (for the verify.tsx screen):
 *    - Method: POST
 *    - Endpoint: /auth/verify-code
 *    - Request Body: { phone: string, code: string }
 *    - Response: { 
 *        success: boolean, 
 *        token?: string,
 *        user?: User,
 *        message?: string 
 *      }
 * 
 * 3. Error Handling:
 *    - Handle network errors
 *    - Show appropriate error messages to the user
 *    - Consider rate limiting on the API side
 * 
 * 4. Environment Variables:
 *    - Store sensitive information in .env file:
 *      NEXT_PUBLIC_API_URL=https://your-api-url.com/api
 * 
 * 5. Authentication:
 *    - Store the JWT token securely (e.g., using SecureStore or AsyncStorage)
 *    - Include the token in subsequent API requests
 */

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

interface CountryCode {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: 'ET', name: 'Ethiopia', dial_code: '+251', flag: '🇪🇹' },
  { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial_code: '+44', flag: '🇬🇧' },
  { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', dial_code: '+971', flag: '🇦🇪' },
  { code: 'KE', name: 'Kenya', dial_code: '+254', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', dial_code: '+27', flag: '🇿🇦' },
  { code: 'IN', name: 'India', dial_code: '+91', flag: '🇮🇳' },
];

interface FormData {
  phone: string;
  countryCode: string;
  phoneNumber: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    phone: "+251",
    countryCode: 'ET',
    phoneNumber: '',
  });
  
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<CountryCode[]>(countryCodes);
  
  const selectedCountry = countryCodes.find(country => country.code === formData.countryCode) || countryCodes[0];
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);


  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.phoneNumber) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{9,15}$/.test(formData.phoneNumber)) {
      newErrors.phone = "Please enter a valid phone number (9-15 digits)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneNumberChange = (value: string) => {
    // Only allow numbers and keep the length reasonable (9-15 digits)
    const cleanedValue = value.replace(/[^0-9]/g, '').slice(0, 15);
    
    // Update phone number without country code
    handleChange('phoneNumber', cleanedValue);
    
    // Update full phone number with country code
    const fullPhoneNumber = `${selectedCountry.dial_code}${cleanedValue}`;
    handleChange('phone', fullPhoneNumber);
    
    // Clear error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: "",
      }));
    }
  };

  const handleCountrySelect = (country: CountryCode) => {
    setFormData(prev => ({
      ...prev,
      countryCode: country.code,
      phone: `${country.dial_code}${formData.phoneNumber}`
    }));
    setIsCountryPickerVisible(false);
  };

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors.phone) {
      setErrors({
        ...errors,
        phone: "",
      });
    }
  };

  /**
   * Handles form submission and API call to send verification code
   * Replace this with your actual API integration
   */
  const { register, isLoading: isAuthLoading } = useAuthStore();

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Call register function from auth store
      const otp = await register({
        phone: formData.phone,
        role: 'user' // Default role for new users
      });

      if (otp) {
        // On success, navigate to verification screen
        Alert.alert(
          "Verification Required",
          `A verification code has been sent to ${selectedCountry.dial_code} ${formData.phoneNumber}.`,
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to the verification screen
                router.push({
                  pathname: "/verify",
                  params: { 
                    phone: formData.phone,
                    countryCode: formData.countryCode 
                  }
                });
              },
            },
          ]
        );
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to register. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to start your food journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity 
                  style={styles.countryCodeButton}
                  onPress={() => setIsCountryPickerVisible(true)}
                >
                  <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                  <Text style={styles.countryCodeText}>{selectedCountry.dial_code}</Text>
                  <Ionicons name="chevron-down" size={16} color={colors.gray} />
                </TouchableOpacity>
                <View style={[styles.inputWrapper, styles.phoneInputWrapper, errors.phone && styles.inputError]}>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="912 345 678"
                    value={formData.phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    keyboardType="phone-pad"
                    autoFocus
                    maxLength={15}
                    returnKeyType="done"
                  />
                </View>
              </View>
              <Text style={styles.hintText}>We'll send a verification code to this number</Text>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Country Picker Modal */}
            <Modal
              visible={isCountryPickerVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setIsCountryPickerVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => setIsCountryPickerVisible(false)}>
                <View style={styles.modalOverlay} />
              </TouchableWithoutFeedback>
              
              <View style={styles.countryPickerContainer}>
                <View style={styles.countryPickerHeader}>
                  <Text style={styles.countryPickerTitle}>Select Country</Text>
                  <TouchableOpacity onPress={() => setIsCountryPickerVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                {/* <View style={styles.countrySearchContainer}>
                  <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
                  <TextInput
                    style={styles.countrySearchInput}
                    placeholder="Search country..."
                    onChangeText={(text) => {
                      const filtered = countryCodes.filter(country => 
                        country.name.toLowerCase().includes(text.toLowerCase()) ||
                        country.dial_code.includes(text)
                      );
                      setFilteredCountries(filtered.length > 0 ? filtered : countryCodes);
                    }}
                    placeholderTextColor={colors.gray}
                  />
                </View> */}
                
                <ScrollView style={styles.countryList}>
                  {filteredCountries.map((country) => (
                    <TouchableOpacity
                      key={country.code}
                      style={[
                        styles.countryItem,
                        formData.countryCode === country.code && styles.selectedCountryItem
                      ]}
                      onPress={() => handleCountrySelect(country)}
                    >
                      <Text style={styles.countryFlag}>{country.flag}</Text>
                      <Text style={styles.countryName}>{country.name}</Text>
                      <Text style={styles.countryDialCode}>{country.dial_code}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
            <Button
              title="Create Account"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
              fullWidth
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    ...typography.heading1,
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    ...typography.body,
    color: colors.text,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: 8,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 24,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    ...typography.body,
    color: colors.gray,
  },
  loginLink: {
    ...typography.body,
    color: colors.primary,
  },
  // Phone Input Styles
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: colors.background,
    marginRight: -1, // To overlap with the input
  },
  flagText: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCodeText: {
    ...typography.body,
    color: colors.text,
    marginRight: 4,
  },
  phoneInputWrapper: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  phoneInput: {
    paddingLeft: 12,
  },
  
  // Country Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  countryPickerContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  countryPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  countryPickerTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  countrySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  countrySearchInput: {
    flex: 1,
    height: 48,
    ...typography.body,
    color: colors.text,
  },
  countryList: {
    maxHeight: 300,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  selectedCountryItem: {
    backgroundColor: colors.primary + "10",
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  countryName: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  countryDialCode: {
    ...typography.body,
    color: colors.gray,
  },
  hintText: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 4,
    fontStyle: 'italic',
  },
});