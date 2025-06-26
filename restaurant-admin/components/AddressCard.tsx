import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Address } from "@/types/restaurant";
import { Check, Edit, MapPin, Trash } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  onSetDefault?: () => void;
}

export default function AddressCard({
  address,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
}: AddressCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
      onPress={onSelect}
      disabled={!onSelect}
    >
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <MapPin size={16} color={selected ? colors.primary : colors.lightText} />
          <Text style={[styles.label, selected && styles.selectedText]}>
            {address.label}
          </Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        
        {selected && (
          <View style={styles.checkCircle}>
            <Check size={14} color={colors.white} />
          </View>
        )}
      </View>
      
      <Text style={[styles.address, selected && styles.selectedText]}>
        {address.addressLine1}
        {address.addressLine2 ? `, ${address.addressLine2}` : ""}
      </Text>
      
      <Text style={styles.city}>{address.city}</Text>
      
      {address.instructions && (
        <Text style={styles.instructions}>
          Note: {address.instructions}
        </Text>
      )}
      
      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
            >
              <Edit size={16} color={colors.primary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          
          {onDelete && !address.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
            >
              <Trash size={16} color={colors.error} />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  selectedContainer: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10", // 10% opacity
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    ...typography.body,
    fontWeight: "600",
    marginLeft: 8,
  },
  selectedText: {
    color: colors.primary,
  },
  defaultBadge: {
    backgroundColor: colors.secondary + "30", // 30% opacity
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "600",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  address: {
    ...typography.body,
    marginBottom: 4,
  },
  city: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginBottom: 8,
  },
  instructions: {
    ...typography.caption,
    color: colors.lightText,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
  },
  deleteText: {
    color: colors.error,
  },
});
