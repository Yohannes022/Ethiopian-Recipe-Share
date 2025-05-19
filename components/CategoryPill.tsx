import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

interface CategoryPillProps {
  title: string;
  selected?: boolean;
  isSelected?: boolean;
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPill: {
    backgroundColor: colors.primary,
  },
  pillText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "500",
  },
  selectedPillText: {
    color: colors.white,
  },
});
