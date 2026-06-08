
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: {
      primary: '#11181C',
      secondary: '#687076',
      tertiary: '#9BA1A6',
      inverse: '#FFFFFF',
      disabled: '#999999'
    },
    background: '#F3F4F6',
    tint: tintColorLight,
    icon: {
      primary: '#687076',
      secondary: '#9BA1A6'
    },
    header:{
      backgroundColor: '#377ED1',
      titleColor: '#FFFFFF',
      menuIconColor: '#FFFFFF',
      rightComponentColor: '#FFFFFF',
    },
    formInput:{
      backgroundColor: "transparent",
      labelColor: '#377ED1',
      borderColor: '#377ED1',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      textColor: '#11181C',
      placeholderColor: '#9BA1A6',
      iconColor: '#377ED1',
    },
    picker: {
      backgroundColor: '#FFFFFF', // Change from transparent to white
      borderColor: '#377ED1',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      textColor: '#11181C',
      placeholderColor: '#9BA1A6',
      iconColor: '#377ED1',
    },
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    gradientStart: '#F3F4F6',
    gradientEnd: '#C4D5F8',
    cardBackground: 'rgba(255, 255, 255, 0.8)',
    primary: '#377ED1',
    secondary: '#6C757D',
    success: '#28A745',
    error: '#DC3545',
    warning: '#FFC107',
    accent: '#17A2B8',
    border: {
      light: '#E0E0E0',
      medium: '#CCCCCC',
      dark: '#999999'
    },
    button: {
      primary: '#377ED1',
      secondary: '#6C757D',
      success: '#28A745',
      danger: '#DC3545',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      shadowColor: '#000000',
      disabledBackground: '#E0E0E0',
      disabledText: '#999999',
      outlineText: '#377ED1',
      outlineIcon: '#377ED1'
    }
  },
  dark: {
    text: {
      primary: '#ECEDEE',
      secondary: '#9BA1A6',
      tertiary: '#687076',
      inverse: '#11181C',
      disabled: '#666666'
    },
    background: '#151718',
    tint: tintColorDark,
    icon: {
      primary: '#9BA1A6',
      secondary: '#687076'
    
    },
    header: {
      backgroundColor: '#377ED1',
      titleColor: '#FFFFFF',
      menuIconColor: '#FFFFFF',
      rightComponentColor: '#FFFFFF',
    },
    formInput: {
      backgroundColor: "transparent",
      labelColor: '#4A90E2',
      borderColor: '#4A90E2',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      textColor: '#ECEDEE',
      placeholderColor: '#687076',
      iconColor: '#4A90E2',
      modalBackground: '#2A2D2E', // Dark non-transparent background for modal
    },
    picker: {
      backgroundColor: 'transparent',
      borderColor: '#4A90E2',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      textColor: '#ECEDEE',
      placeholderColor: '#687076',
      iconColor: '#4A90E2',
      modalBackground: '#2A2D2E', // Dark non-transparent background for modal
    },
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    gradientStart: '#1F2937',
    gradientEnd: '#374151',
    cardBackground: 'rgba(255, 255, 255, 0.1)',
    primary: '#4A90E2',
    secondary: '#8E8E93',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    accent: '#5AC8FA',
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      dark: 'rgba(255, 255, 255, 0.3)'
    },
    button: {
      primary: '#4A90E2',
      secondary: '#8E8E93',
      success: '#34C759',
      danger: '#FF3B30',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      shadowColor: '#000000',
      disabledBackground: '#333333',
      disabledText: '#666666',
      outlineText: '#4A90E2',
      outlineIcon: '#4A90E2'
    }
  },
};
