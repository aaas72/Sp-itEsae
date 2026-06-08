import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import UnifiedButton from '../Buttons/UnifiedButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Alert = ({ 
  visible, 
  title, 
  message, 
  type = 'info',
  onConfirm, 
  onCancel, 
  confirmText = 'Tamam', 
  cancelText = 'İptal',
  showCancel = false 
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(55, 126, 209, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
  alertContainer: {
    borderRadius: 10, // Android-style border radius
    padding: 24,
    alignItems: 'center',
    maxWidth: screenWidth * 0.85,
    minWidth: screenWidth * 0.75,
    // Android Material Design elevation
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16, // Higher elevation for Android
  },
  iconContainer: {
    marginBottom: 16,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600', // Android-style font weight
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.15, // Android typography
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    letterSpacing: 0.25, // Android typography
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Android-style button alignment
    width: '100%',
    gap: 8, // Modern spacing
  },
  button: {
    minWidth: 80,
    paddingHorizontal: 16,
  },
  confirmButton: {
    marginLeft: 0, // Remove extra margin since we use gap
  },
});

  const getIconName = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#2196F3';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { backgroundColor: colors.background }]}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getIconName()} 
              size={48} 
              color={getIconColor()} 
            />
          </View>
          
          {title && (
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {title}
            </Text>
          )}
          
          <Text style={[styles.message, { color: colors.text.secondary }]}>
            {message}
          </Text>
          
          <View style={styles.buttonContainer}>
            {showCancel && (
              <UnifiedButton
                title={cancelText}
                onPress={onCancel}
                variant="outline"
                size="medium"
                style={styles.button}
              />
            )}
            <UnifiedButton
              title={confirmText}
              onPress={onConfirm}
              variant="default"
              size="medium"
              style={[styles.button, showCancel && styles.confirmButton]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Alert;