import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useAuthStore } from "@/store/authStore";
import CountryCodePicker from "@/components/CountryCodePicker";
import { CountryCode } from "@/types/auth";
import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

// This is a route component for phone authentication
export default function PhoneAuthScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>({
    code: "+251",
    name: "Ethiopia",
    flag: "🇪🇹",
    format: "+XXX XX XXX XXXX",
    minLength: 9,
    maxLength: 9
  });
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuthStore();

  const handleContinue = async () => {
    if (!phone) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    const fullPhone = `${selectedCountry.code}${phone}`.replace(/\D/g, '');
    setIsLoading(true);

    try {
      // This will automatically detect if user exists and send OTP
      await login(fullPhone);
      
      router.push({
        pathname: "/verify",
        params: { phone: fullPhone }
      } as any);
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
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
          <Text style={styles.title}>Welcome to Ethiopian Recipe Share</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to get started. We'll send you a verification code.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <TouchableOpacity 
              style={styles.countryCodeButton}
              onPress={() => setIsCountryPickerVisible(true)}
            >
              <Text style={styles.countryCodeText}>
                {selectedCountry.flag} {selectedCountry.code}
              </Text>
            </TouchableOpacity>
            <CountryCodePicker
              visible={isCountryPickerVisible}
              onClose={() => setIsCountryPickerVisible(false)}
              onSelect={(country: CountryCode) => {
                setSelectedCountry(country);
                setIsCountryPickerVisible(false);
              }}
              currentCode={selectedCountry.code}
            />
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone number"
              placeholderTextColor={colors.lightText}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={selectedCountry.maxLength}
            />
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={isLoading}
            disabled={!phone}
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.lightText,
  },
  form: {
    width: "100%",
  },
  label: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  phoneInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 12,
    ...typography.body1,
    color: colors.text,
  },
  continueButton: {
    marginTop: 24,
  },
  countryCodeButton: {
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeText: {
    ...typography.body1,
    color: colors.text,
  },
  termsContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    ...typography.caption,
    color: colors.lightText,
    textAlign: "center",
  },
});
