import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function UnifiedButton({ 
  title, 
  onPress, 
  variant = 'default',
  size = 'medium',
  icon = null,
  iconPosition = 'left', 
  disabled = false,
  style = {},
  fullWidth = false,
  textColor = null,
  backgroundColor = null,
  borderColor = null,
  iconColor = null,
  shadowColor = null,
}) {
  const { colors, isDarkMode } = useTheme();

  const buttonColors = colors.button || {};
  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    };

    const sizeStyles = {
      small: {
        paddingVertical: screenHeight * 0.01,
        paddingHorizontal: screenWidth * 0.04,
      },
      medium: {
        paddingVertical: screenHeight * 0.015,
        paddingHorizontal: screenWidth * 0.06,
      },
      large: {
        paddingVertical: screenHeight * 0.02,
        paddingHorizontal: screenWidth * 0.08,
      }
    };

    const variantStyles = {
      default: {
        backgroundColor: backgroundColor || buttonColors.primary,
      },
      floating: {
        backgroundColor: backgroundColor || buttonColors.primary,
        borderRadius: 12,
        elevation: isDarkMode ? 4 : 6,
        shadowColor: shadowColor || buttonColors.shadowColor,
        shadowOffset: {
          width: 0,
          height: isDarkMode ? 2 : 3,
        },
        shadowOpacity: isDarkMode ? 0.3 : 0.27,
        shadowRadius: isDarkMode ? 3.5 : 4.65,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: borderColor || buttonColors.primary,
      }
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextColor = () => {
    if (disabled) {
      return colors.text?.disabled || buttonColors.disabledText;
    }
    if (variant === 'outline') {
      return textColor || buttonColors.outlineText || buttonColors.primary;
    }
    return textColor || buttonColors.textColor;
  };

  const getIconColor = () => {
    if (disabled) {
      return colors.text?.disabled || buttonColors.disabledText;
    }
    if (variant === 'outline') {
      return iconColor || buttonColors.outlineIcon || buttonColors.primary;
    }
    return iconColor || buttonColors.iconColor;
  };

  const getTextSize = () => {
    const sizes = {
      small: screenWidth * 0.035,
      medium: screenWidth * 0.04,
      large: screenWidth * 0.045
    };
    return sizes[size];
  };

  const getIconSize = () => {
    const sizes = {
      small: screenWidth * 0.04,
      medium: screenWidth * 0.05,
      large: screenWidth * 0.06
    };
    return sizes[size];
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={disabled ? null : onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
    >
      {iconPosition === 'only' && icon ? (
        <Ionicons 
          name={icon} 
          size={getIconSize()} 
          color={getIconColor()} 
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={getIconSize()} 
              color={getIconColor()} 
              style={styles.iconLeft}
            />
          )}
          
          {title && (
            <Text style={[styles.buttonText, { 
              color: getTextColor(),
              fontSize: getTextSize()
            }]}>
              {title}
            </Text>
          )}
          
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={getIconSize()} 
              color={getIconColor()} 
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: screenWidth * 0.02,
  },
  iconRight: {
    marginLeft: screenWidth * 0.02,
  },
});

export default UnifiedButton;