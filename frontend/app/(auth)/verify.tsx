import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CountryCode } from "@/types/auth";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
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

interface VerifyScreenParams {
  phone: string;
}

export default function VerifyScreen() {
  const router = useRouter();
  const { phone: phoneParam } = useLocalSearchParams<{ phone?: string }>();
  const { verifyOtp, isLoading, error, resendOtp } = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  const phone = phoneParam || "";

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Format phone number for display (e.g., +251 91 123 4567)
    if (!phoneNumber) return "";
    
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 3) return `+${cleaned}`;
    if (cleaned.length <= 5) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
    
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 12)}`;
  };

  const handleAutoFill = () => {
    // For development/testing - auto-fill OTP
    const testOtp = "123456"; // Default test OTP
    setOtp(testOtp.split(""));
    inputRefs.current[5]?.focus(); // Focus the last input
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    try {
      const isNewUser = await verifyOtp(code);
      
      // Navigate based on whether the user is new or existing
      if (isNewUser) {
        // For new users, navigate to the profile tab where they can complete setup
        // Using replace to prevent going back to the OTP screen
        router.replace({
          pathname: "/profile",
          params: { setup: 'true' }
        });
      } else {
        // Redirect to main app for existing users
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage = error instanceof Error ? error.message : "Invalid verification code. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    
    setIsResending(true);
    try {
      const { phoneNumber } = useAuthStore.getState();
      if (!phoneNumber) {
        throw new Error("Phone number not found");
      }
      
      // In a real app, call the resend OTP API
      // await authAPI.resendOtp(phoneNumber);
      
      // For demo, just reset the timer and show success
      setTimeLeft(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      Alert.alert("Success", "A new verification code has been sent to your phone.");
    } catch (error) {
      console.error("Resend error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to resend code. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (!phone) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No phone number found. Please try again.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to{" "}
            <Text style={styles.phoneText}>{formatPhoneNumber(phone)}</Text>
          </Text>
        </View>

<TouchableOpacity 
            style={styles.demoOtpContainer}
            onPress={handleAutoFill}
          >
            <Text style={styles.demoOtpLabel}>Tap to auto-fill test OTP</Text>
          </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {inputRefs.current[index] = ref; }}
                style={styles.otpInput}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Verify"
            onPress={handleVerify}
            loading={isLoading}
            fullWidth
            style={styles.verifyButton}
            disabled={otp.join("").length !== 6}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={timeLeft > 0 || isResending}
            >
              <Text
                style={[
                  styles.resendButton,
                  (timeLeft > 0 || isResending) && styles.resendButtonDisabled,
                ]}
              >
                {isResending
                  ? "Sending..."
                  : timeLeft > 0
                  ? `Resend in ${timeLeft}s`
                  : "Resend"}
              </Text>
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 40,
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
  phoneText: {
    color: colors.text,
    fontWeight: "600",
  },
  demoOtpContainer: {
    backgroundColor: colors.primary + "15",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  demoOtpLabel: {
    ...typography.bodySmall,
    color: colors.primary,
    marginBottom: 4,
  },
  demoOtpValue: {
    ...typography.heading3,
    color: colors.primary,
    letterSpacing: 2,
  },
  form: {
    width: "100%",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: 24,
    textAlign: "center",
  },
  verifyButton: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    ...typography.body,
    color: colors.lightText,
  },
  resendButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  resendButtonDisabled: {
    color: colors.lightText,
  },
});
