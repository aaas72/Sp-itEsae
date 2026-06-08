import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function Picker({
  label,
  value,
  onValueChange,
  items = [],
  placeholder = "Bir seçenek seçin",
  error,
  required = false,
  style = {},
  // Optional customization properties (override constants)
  textColor,
  placeholderColor,
  borderColor,
  errorBorderColor,
  labelColor,
  iconColor,
  backgroundColor,
  borderWidth,
  borderRadius,
  modalBackgroundColor,
  modalTextColor,
}) {
  const { colors, isDarkMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Get Picker colors from constants
  const pickerColors = colors.picker || {};
  
  // Determine final colors with priority to props
  const finalTextColor = textColor || pickerColors.textColor;
  const finalPlaceholderColor = placeholderColor || pickerColors.placeholderColor;
  const finalBorderColor = error ? (errorBorderColor || colors.error) : (borderColor || pickerColors.borderColor);
  const finalIconColor = iconColor || pickerColors.iconColor;
  const finalBackgroundColor = backgroundColor || pickerColors.backgroundColor;
  const finalBorderWidth = borderWidth || pickerColors.borderWidth || 1;
  const finalBorderRadius = borderRadius || pickerColors.borderRadius || 8;
  const finalLabelColor = labelColor || colors.text?.primary;
  const finalErrorBorderColor = errorBorderColor || colors.error;
  const finalModalBackgroundColor = modalBackgroundColor || pickerColors.modalBackground || colors.cardBackground; // Use modalBackground first
  const finalModalTextColor = modalTextColor || colors.text?.primary;

  const selectedItem = items.find(item => item.value === value);

  const handleSelect = (item) => {
    onValueChange(item.value);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        {
          backgroundColor: finalModalBackgroundColor,
          borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#E0E0E0',
        }
      ]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.modalItemText, { color: finalModalTextColor }]}>
        {item.label}
      </Text>
      {selectedItem?.value === item.value && (
        <Ionicons name="checkmark" size={20} color={finalIconColor} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: finalLabelColor }]}>
          {label}
          {required && <Text style={[styles.required, { color: finalErrorBorderColor }]}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.pickerContainer,
          {
            backgroundColor: finalBackgroundColor,
            borderColor: finalBorderColor,
            borderWidth: finalBorderWidth,
            borderRadius: finalBorderRadius,
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.pickerText,
            {
              color: selectedItem ? finalTextColor : finalPlaceholderColor,
            }
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={finalIconColor}
        />
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: finalErrorBorderColor }]}>
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            {
              backgroundColor: finalModalBackgroundColor,
            }
          ]}>
            <View style={[
              styles.modalHeader,
              {
                backgroundColor: finalModalBackgroundColor,
                borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#E0E0E0',
              }
            ]}>
              <Text style={[styles.modalTitle, { color: finalModalTextColor }]}>
                {label || 'Seçenek Seçin'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={finalIconColor} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: screenHeight * 0.02,
  },
  label: {
    fontSize: screenWidth * 0.04,
    fontWeight: '600',
    marginBottom: screenHeight * 0.008,
  },
  required: {
    fontSize: screenWidth * 0.04,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: screenWidth * 0.04,
    minHeight: screenHeight * 0.06,
  },
  pickerText: {
    fontSize: screenWidth * 0.04,
    flex: 1,
  },
  errorText: {
    fontSize: screenWidth * 0.032,
    marginTop: screenHeight * 0.005,
    marginLeft: screenWidth * 0.02,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.6,
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: screenWidth * 0.04,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: '600',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: screenWidth * 0.04,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  modalItemText: {
    fontSize: screenWidth * 0.04,
    flex: 1,
  },
});

export default Picker;