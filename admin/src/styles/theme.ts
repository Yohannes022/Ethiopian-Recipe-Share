export const colors = {
  primary: '#000',
  secondary: '#333',
  background: '#000',
  text: '#fff',
  border: '#333',
  success: '#2ecc71',
  warning: '#f1c40f',
  danger: '#e74c3c',
  light: '#fff',
  dark: '#000',
  gray: '#666',
  // Role-based colors
  owner: {
    primary: '#e74c3c',
    secondary: '#c0392b',
  },
  manager: {
    primary: '#2ecc71',
    secondary: '#27ae60',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const borderStyles = {
  radius: {
    small: 4,
    medium: 8,
    large: 16,
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: colors.gray,
  },
};

export const shadows = {
  small: {
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};

export const borders = {
  radius: {
    small: 4,
    medium: 8,
    large: 16,
    rounded: 9999,
  },
  width: {
    thin: 1,
    medium: 2,
    thick: 4,
  },
};

export const spacingStyles = {
  padding: {
    xs: { padding: spacing.xs },
    sm: { padding: spacing.sm },
    md: { padding: spacing.md },
    lg: { padding: spacing.lg },
    xl: { padding: spacing.xl },
    xxl: { padding: spacing.xxl },
  },
  margin: {
    xs: { margin: spacing.xs },
    sm: { margin: spacing.sm },
    md: { margin: spacing.md },
    lg: { margin: spacing.lg },
    xl: { margin: spacing.xl },
    xxl: { margin: spacing.xxl },
  },
};

export const typographyStyles = {
  h1: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
  },
  h2: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
  },
  h3: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  body: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  caption: {
    fontSize: typography.caption.fontSize,
    color: colors.gray,
  },
};

export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borders.radius.medium,
    alignItems: 'center',
  },
  secondary: {
    borderWidth: borders.width.medium,
    borderColor: colors.primary,
    padding: spacing.md,
    borderRadius: borders.radius.medium,
    alignItems: 'center',
  },
  text: {
    color: colors.primary,
    fontWeight: 'bold',
  },
};
