import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

type ThemeColors = {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  error: string;
  success: string;
  button: string;
  buttonText: string;
  inputBackground: string;
};

type ThemeFonts = {
  regular: string;
  medium: string;
  bold: string;
};

type Theme = {
  colors: ThemeColors;
  fonts: ThemeFonts;
  isDark: boolean;
};

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const lightColors: ThemeColors = {
  primary: '#007AFF',
  background: '#FFFFFF',
  card: '#F8F8F8',
  text: '#1C1C1E',
  border: '#D8D8D8',
  notification: '#FF3B30',
  error: '#FF3B30',
  success: '#34C759',
  button: '#007AFF',
  buttonText: '#FFFFFF',
  inputBackground: '#F2F2F7',
};

const darkColors: ThemeColors = {
  primary: '#0A84FF',
  background: '#000000',
  card: '#1C1C1E',
  text: '#F2F2F7',
  border: '#38383A',
  notification: '#FF453A',
  error: '#FF453A',
  success: '#30D158',
  button: '#0A84FF',
  buttonText: '#FFFFFF',
  inputBackground: '#1C1C1E',
};

const fonts: ThemeFonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme: Theme = {
    colors: isDark ? darkColors : lightColors,
    fonts,
    isDark,
  };

  const toggleTheme = () => {
    // This is a placeholder. In a real app, you might want to persist this preference.
    console.log('Theme toggle requested');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context.theme;
};

export const useThemeToggle = (): (() => void) => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeToggle must be used within a ThemeProvider');
  }
  return context.toggleTheme;
};

export default ThemeContext;
