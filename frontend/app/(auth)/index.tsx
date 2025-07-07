import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const isTablet = width > 768;

  const handleGetStarted = () => {
    router.push("/register");
  };

  const handleRestaurantOwner = () => {
    router.push("/restaurant-owner-signup");
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1567364816519-cbc9c4ffe1eb?q=80&w=1000",
        }}
        style={styles.backgroundImage}
      />
      
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Habesha Cuisine</Text>
          <Text style={styles.subtitle}>
            Discover authentic Ethiopian flavors
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Button
            title="Get Started as Customer"
            onPress={handleGetStarted}
            variant="primary"
            size="large"
            fullWidth
          />
          
          <Button
            title="Join as Restaurant Owner"
            onPress={handleRestaurantOwner}
            variant="outline"
            size="large"
            fullWidth 
          />
          
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
  },
  title: {
    ...typography.heading1,
    color: colors.black,
    fontSize: 36,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body,
    color: colors.black,
    textAlign: "center",
    opacity: 0.9,
    fontSize: 18,
  },
  footer: {
    marginBottom: 24,
    alignItems: "center",
    gap: 16,
  },
  secondaryButton: {
    marginTop: 16,
    borderColor: colors.black,
  },
  secondaryButtonText: {
    color: colors.black,
  },
  termsText: {
    ...typography.caption,
    color: colors.black,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 24,
  },
});
