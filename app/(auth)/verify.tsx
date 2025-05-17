import React, { useState, useEffect, useRef } from "react";
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
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import { ArrowLeft } from "lucide-react-native";

export default function VerifyScreen() {
  const router = useRouter();
  const { verifyOtp, phoneNumber, isLoading, error, userRole, generatedOtp, resendOtp } = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

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

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      return;
    }

    try {
      const success = await verifyOtp(otpString);
      
      if (success) {
        // Redirect based on user role
        if (userRole === "owner" || userRole === "manager") {
          router.replace("/(restaurant)");
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert(
        "Verification Failed",
        "The code you entered is incorrect. Please try again."
      );
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;

    setIsResending(true);
    
    try {
      // Call the resendOtp function from the auth store
      await resendOtp();
      
      // Reset the timer
      setTimeLeft(60);
      setIsResending(false);
      Alert.alert("OTP Sent", "A new verification code has been sent to your phone.");
    } catch (error) {
      setIsResending(false);
      Alert.alert("Error", "Failed to resend verification code. Please try again.");
    }
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return "";
    
    // Keep first 3 digits and last 2 digits visible, mask the rest
    const parts = phone.split(" ");
    const countryCode = parts[0];
    const number = parts.slice(1).join("");
    
    if (number.length <= 5) return phone;
    
    const maskedPart = number.substring(3, number.length - 2).replace(/./g, "*");
    return `${countryCode} ${number.substring(0, 3)}${maskedPart}${number.substring(number.length - 2)}`;
  };

  // Auto-fill OTP for demo purposes
  const handleAutoFill = () => {
    if (!generatedOtp) {
      Alert.alert("No OTP Available", "No verification code has been generated yet.");
      return;
    }
    
    const otpArray = generatedOtp.split("");
    setOtp(otpArray);
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
            <Text style={styles.phoneText}>{formatPhoneNumber(phoneNumber)}</Text>
          </Text>
        </View>

        {/* Demo OTP Display - Only for development */}
        {generatedOtp && (
          <TouchableOpacity 
            style={styles.demoOtpContainer}
            onPress={handleAutoFill}
          >
            <Text style={styles.demoOtpLabel}>Demo OTP (tap to auto-fill):</Text>
            <Text style={styles.demoOtpValue}>{generatedOtp}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.form}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
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
              onPress={handleResendOtp}
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