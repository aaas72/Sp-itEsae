import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Header = ({ 
  title, 
  showMenuButton = true,
  showBackButton = false,
  onBackPress,
  rightComponent = null,
  // New customization properties
  backgroundColor,
  titleColor,
  iconColor,
  centerTitle = false,
  ...props
}) => {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();

  // Determine final colors with priority to props
  const finalBackgroundColor = backgroundColor || colors.primary;
  const finalTitleColor = titleColor || colors.text.inverse;
  const finalIconColor = iconColor || colors.text.inverse;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  return (
    <View style={[styles.header, { backgroundColor: finalBackgroundColor }]}>
      {showBackButton ? (
        <TouchableOpacity
          style={styles.leftButton}
          onPress={handleBackPress}
        >
          <Ionicons 
            name="arrow-back" 
            size={screenWidth * 0.06} 
            color={finalIconColor} 
          />
        </TouchableOpacity>
      ) : showMenuButton ? (
        <TouchableOpacity
          style={styles.leftButton}
          onPress={handleMenuPress}
        >
          <Ionicons 
            name="menu" 
            size={screenWidth * 0.06} 
            color={finalIconColor} 
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.leftButton} />
      )}
      
      {/* Title */}
      {title && (
        <Text style={[
          styles.title, 
          { 
            color: finalTitleColor,
            textAlign: centerTitle ? 'center' : 'left'
          }
        ]}>
          {title}
        </Text>
      )}
      
      {/* Right component */}
      {rightComponent ? (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      ) : (
        <View style={styles.rightComponent} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: screenHeight * 0.06,
    paddingHorizontal: screenWidth * 0.05,
    paddingBottom: screenHeight * 0.02,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftButton: {
    marginRight: screenWidth * 0.04,
    padding: screenWidth * 0.01,
    minWidth: screenWidth * 0.08,
  },
  title: {
    fontSize: screenWidth * 0.055,
    fontWeight: 'bold',
    flex: 1,
  },
  rightComponent: {
    marginLeft: screenWidth * 0.02,
    minWidth: screenWidth * 0.08,
    alignItems: 'flex-end',
  },
});

export default Header;