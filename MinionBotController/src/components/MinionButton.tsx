import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MINION_COLORS } from '../constants/constants';

interface MinionButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
}

const MinionButton: React.FC<MinionButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
  size = 'medium'
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    };

    // Size styles
    const sizeStyles = {
      small: { paddingHorizontal: 20, paddingVertical: 10, minHeight: 40 },
      medium: { paddingHorizontal: 30, paddingVertical: 15, minHeight: 50 },
      large: { paddingHorizontal: 40, paddingVertical: 20, minHeight: 60 }
    };

    // Variant styles
    const variantStyles = {
      primary: { backgroundColor: MINION_COLORS.primary },
      secondary: { backgroundColor: MINION_COLORS.secondary },
      accent: { backgroundColor: MINION_COLORS.accent }
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
      ...style
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: 'bold',
      textAlign: 'center',
    };

    const sizeTextStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 }
    };

    const variantTextStyles = {
      primary: { color: MINION_COLORS.text },
      secondary: { color: '#FFFFFF' },
      accent: { color: '#FFFFFF' }
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default MinionButton;
