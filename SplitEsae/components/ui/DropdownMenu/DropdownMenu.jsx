import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function DropdownMenu({
  visible,
  onClose,
  options = [],
  triggerPosition = { x: 0, y: 0 },
  style = {},
}) {
  const { colors } = useTheme();

  // Calculate dropdown position to ensure it stays within screen bounds
  const calculatePosition = () => {
    const dropdownHeight = options.length * (screenHeight * 0.06); // Approximate height

    let top = triggerPosition.y + 30;

    // -- START: Modification here --
    // Fixed value set to position the menu at the far right
    let right = 20;
    // -- END: Modification here --

    // Check if dropdown goes beyond bottom edge
    if (top + dropdownHeight > screenHeight - 50) {
      top = triggerPosition.y - dropdownHeight - 10; // Show above trigger
      if (top < 50) {
        top = 50; // Minimum margin from top
      }
    }

    return { top, right };
  };

  const position = calculatePosition();

  const renderOption = (option, index) => {
    const isDestructive = option.type === "destructive";

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.option,
          { borderBottomColor: colors.border },
          index === options.length - 1 && styles.lastOption,
        ]}
        onPress={() => {
          option.onPress && option.onPress();
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          {option.icon && (
            <Ionicons
              name={option.icon}
              size={screenWidth * 0.05}
              color={isDestructive ? "#F44336" : colors.text.primary}
              style={styles.optionIcon}
            />
          )}
          <Text
            style={[
              styles.optionText,
              { color: isDestructive ? "#F44336" : colors.text.primary },
            ]}
          >
            {option.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: "#FFFFFF",
              top: position.top,
              right: position.right,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            },
            style,
          ]}
        >
          {options.map((option, index) => renderOption(option, index))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  dropdown: {
    position: "absolute",
    minWidth: screenWidth * 0.45,
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  option: {
    paddingVertical: screenHeight * 0.015,
    paddingHorizontal: screenWidth * 0.04,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgb(172, 172, 172)",
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    marginRight: screenWidth * 0.03,
  },
  optionText: {
    fontSize: screenWidth * 0.04,
    fontWeight: "500",
  },
});

export default DropdownMenu;
