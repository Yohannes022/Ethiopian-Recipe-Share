import { StyleSheet } from "react-native";
import colors from "./colors";

const typography = StyleSheet.create({
  heading1: {
    fontSize: 28,
    fontWeight: "700",
    // color: colors.text,
  },
  heading2: {
    fontSize: 24,
    fontWeight: "700",
    // color: colors.text,
  },
  heading3: {
    fontSize: 20,
    fontWeight: "600",
    // color: colors.text,
  },
  heading4: {
    fontSize: 18,
    fontWeight: "600",
    // color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    // color: colors.text,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: "400",
    // color: colors.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400",
    // color: colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400",
    // color: colors.lightText,
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
    // color: colors.white,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: "600",
    // color: colors.white,
  },
  link: {
    fontSize: 16,
    fontWeight: "400",
    // color: colors.primary,
    textDecorationLine: "underline",
  },
  linkSmall: {
    fontSize: 14,
    fontWeight: "400",
    // color: colors.primary,
    textDecorationLine: "underline",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.lightText,
  },

});

export default typography;
