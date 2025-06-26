import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';

type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'caption' | 'button' | 'error' | 'link';
  style?: object;
  children: React.ReactNode;
};

const ThemedText: React.FC<ThemedTextProps> = ({
  type = 'default',
  style,
  children,
  ...props
}) => {
  const { colors, fonts } = useTheme();

  const getTextStyle = () => {
    switch (type) {
      case 'title':
        return styles.title;
      case 'subtitle':
        return styles.subtitle;
      case 'caption':
        return styles.caption;
      case 'button':
        return styles.button;
      case 'error':
        return [styles.error, { color: colors.error }];
      case 'link':
        return [styles.link, { color: colors.primary }];
      default:
        return styles.default;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return colors.error;
      case 'button':
        return colors.buttonText;
      default:
        return colors.text;
    }
  };

  return (
    <Text
      style={[
        getTextStyle(),
        {
          color: getTextColor(),
          fontFamily: fonts.regular,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    marginVertical: 6,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
  },
  link: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default ThemedText;
