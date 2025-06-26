import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';

interface ThemedViewProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  lightColor?: string;
  darkColor?: string;
}

const ThemedView: React.FC<ThemedViewProps> = ({
  children,
  style,
  lightColor,
  darkColor,
  ...otherProps
}) => {
  const { colors } = useTheme();
  
  const backgroundColor = lightColor || colors.background;
  const defaultStyle = { backgroundColor };

  return (
    <View
      style={[styles.container, defaultStyle, style]}
      {...otherProps}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { ThemedView };
