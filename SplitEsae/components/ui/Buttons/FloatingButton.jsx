import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function FloatingButton({
  title = "Grup Ekle",
  onPress,
  backgroundColor,
  textColor,
  icon = "",
  disabled = false
}) {
  const { colors } = useTheme();
  
  const buttonBgColor = backgroundColor || colors.primary;
  const buttonTextColor = textColor || colors.text.inverse;

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: disabled ? colors.icon.secondary : buttonBgColor },
          pressed && !disabled && styles.pressed
        ]}
        onPress={disabled ? null : onPress}
        disabled={disabled}
      >
        <Text style={[styles.icon, { color: buttonTextColor }]}>{icon}</Text>
        <Text style={[styles.text, { color: buttonTextColor }]}>{title}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: screenHeight * 0.03, 
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.85, 
    height: screenHeight * 0.07, 
    borderRadius: 10, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: screenHeight * 0.005, 
    },
    shadowOpacity: 0.25,
    shadowRadius: screenWidth * 0.02, 
    elevation: 5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  icon: {
    fontSize: screenWidth * 0.06, 
    fontWeight: 'bold',
    marginRight: screenWidth * 0.02, 
  },
  text: {
    fontSize: screenWidth * 0.045, 
    fontWeight: '600',
  },
});

export default FloatingButton;