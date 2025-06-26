import colors from "@/constants/colors";
import typography from "@/constants/typography";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface CategoryPillProps {
  title: string;
  selected?: boolean;
  onPress: () => void;
}

export default function CategoryPill({
  title,
  selected = false,
  onPress,
}: CategoryPillProps) {
  return (
    <TouchableOpacity
      style={[styles.pill, selected && styles.selectedPill]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.pillText, selected && styles.selectedPillText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
    marginVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPill: {
    backgroundColor: colors.primary,
  },
  pillText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "700",
  },
  selectedPillText: {
    color: colors.white,
  },
});
