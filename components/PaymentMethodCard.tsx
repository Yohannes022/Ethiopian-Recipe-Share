import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { CreditCard, Smartphone, Check, Edit, Trash } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

export type PaymentMethodType = 'card' | 'mobile-money';

interface PaymentMethodCardProps {
  id: string;
  type: PaymentMethodType;
  cardBrand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  provider?: string;
  phoneNumber?: string;
  isDefault?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  showActions?: boolean;
}

export default function PaymentMethodCard({
  id,
  type,
  cardBrand,
  last4,
  expiryMonth,
  expiryYear,
  provider,
  phoneNumber,
  isDefault = false,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
}: PaymentMethodCardProps) {
  const renderCardBrandIcon = () => {
    // In a real app, you would use actual card brand icons
    return <CreditCard size={20} color={selected ? colors.primary : colors.lightText} />;
  };

  const renderMobileMoneyIcon = () => {
    return <Smartphone size={20} color={selected ? colors.primary : colors.lightText} />;
  };
  
  const handleSetAsDefault = (e: any) => {
    e?.stopPropagation();
    if (onSetDefault) {
      onSetDefault();
    }
  };
  
  const handleEdit = (e: any) => {
    e?.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };
  
  const handleDelete = (e: any) => {
    e?.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

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
        <View style={styles.methodContainer}>
          {type === "card" ? renderCardBrandIcon() : renderMobileMoneyIcon()}
          
          <View style={styles.methodInfo}>
            {type === "card" ? (
              <>
                <Text style={[styles.methodName, selected && styles.selectedText]}>
                  {cardBrand ? cardBrand.toUpperCase() : 'CARD'} •••• {last4 || '****'}
                </Text>
                {expiryMonth && expiryYear && (
                  <Text style={styles.methodDetails}>
                    Expires {expiryMonth.toString().padStart(2, '0')}/{expiryYear.toString().slice(-2)}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={[styles.methodName, selected && styles.selectedText]}>
                  {provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Mobile Money'}
                </Text>
                {phoneNumber && (
                  <Text style={styles.methodDetails}>
                    {phoneNumber}
                  </Text>
                )}
              </>
            )}
          </View>
          
          {isDefault ? (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          ) : onSetDefault ? (
            <TouchableOpacity onPress={handleSetAsDefault} style={styles.setDefaultButton}>
              <Text style={styles.setDefaultText}>Set as default</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        
        {selected && (
          <View style={styles.checkCircle}>
            <Check size={14} color={colors.white} />
          </View>
        )}
      </View>
      
      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEdit}
            >
              <Edit size={16} color={colors.primary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          
          {onDelete && !isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
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
    overflow: 'hidden',
  },
  selectedContainer: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10", // 10% opacity
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  methodContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodInfo: {
    marginLeft: 12,
    flex: 1,
  },
  methodName: {
    ...typography.body,
    fontWeight: "600",
  },
  selectedText: {
    color: colors.primary,
  },
  methodDetails: {
    ...typography.caption,
    color: colors.lightText,
  },
  defaultBadge: {
    backgroundColor: colors.secondary + "30", // 30% opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  setDefaultButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  setDefaultText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
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
