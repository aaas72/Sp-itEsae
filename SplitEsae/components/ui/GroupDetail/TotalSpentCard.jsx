import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function TotalSpentCard({ total }) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
      <Text style={[styles.totalSpentTitle, { color: colors.text.inverse }]}>Toplam Harcama</Text>
      <Text style={[styles.totalAmount, { color: colors.text.inverse }]}>{total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    padding: screenWidth * 0.05,
    borderRadius: 10,
    marginTop: screenHeight * 0.02,
    marginBottom: screenHeight * 0.02,
    alignItems: 'center',
  },
  totalSpentTitle: {
    fontSize: screenWidth * 0.045,
    marginBottom: screenHeight * 0.01,
  },
  totalAmount: {
    fontSize: screenWidth * 0.08,
    fontWeight: 'bold',
  },
});

export default TotalSpentCard;