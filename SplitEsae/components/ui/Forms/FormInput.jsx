import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  editable = true,
  required = false,
  style = {},
  inputStyle = {},
  onFocus,
  onBlur,
  // Optional customization properties (override constants)
  textColor,
  placeholderColor,
  borderColor,
  focusedBorderColor,
  errorBorderColor,
  labelColor,
  iconColor,
  backgroundColor,
  borderWidth,
  borderRadius,
  ...props
}) {
  const { colors, isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formInputColors = colors.formInput || {};
  
  const finalTextColor = textColor || formInputColors.textColor;
  const finalPlaceholderColor = placeholderColor || formInputColors.placeholderColor;
  const finalBorderColor = borderColor || formInputColors.borderColor;
  const finalFocusedBorderColor = focusedBorderColor || colors.primary;
  const finalErrorBorderColor = errorBorderColor || colors.error;
  const finalLabelColor = labelColor || colors.text?.primary;
  const finalIconColor = iconColor || formInputColors.iconColor;
  const finalBackgroundColor = backgroundColor || formInputColors.backgroundColor;
  const finalBorderWidth = borderWidth || formInputColors.borderWidth || 1;
  const finalBorderRadius = borderRadius || formInputColors.borderRadius || 8;

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getBorderColor = () => {
    if (error) return finalErrorBorderColor;
    if (isFocused) return finalFocusedBorderColor;
    return finalBorderColor;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, { color: finalLabelColor }]}>
          {label}
          {required && (
            <Text style={[styles.required, { color: finalErrorBorderColor }]}> *</Text>
          )}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: finalBackgroundColor,
            borderColor: getBorderColor(),
            borderWidth: error ? finalBorderWidth + 0.5 : finalBorderWidth,
            borderRadius: finalBorderRadius,
          },
          !editable && styles.disabled,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons name={leftIcon} size={20} color={finalIconColor} />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: finalTextColor,
              textAlign: "left",
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={finalPlaceholderColor}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {(rightIcon || (showPasswordToggle && secureTextEntry)) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={
              showPasswordToggle && secureTextEntry
                ? togglePasswordVisibility
                : undefined
            }
            disabled={!showPasswordToggle || !secureTextEntry}
          >
            <Ionicons
              name={
                showPasswordToggle && secureTextEntry
                  ? showPassword
                    ? "eye-off"
                    : "eye"
                  : rightIcon
              }
              size={20}
              color={finalIconColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={16}
            color={finalErrorBorderColor}
          />
          <Text
            style={[
              styles.errorText,
              { color: finalErrorBorderColor },
            ]}
          >
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "left",
  },
  required: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    minHeight: 50,
  },
  disabled: {
    opacity: 0.6,
  },
  leftIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    textAlignVertical: "top",
  },
  rightIconContainer: {
    marginLeft: 12,
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
    textAlign: "left",
  },
});

export default FormInput;
