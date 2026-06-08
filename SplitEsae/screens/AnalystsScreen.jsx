import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { AnalystsSection } from '../components';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AnalystsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Use useFocusEffect correctly
  useFocusEffect(
    React.useCallback(() => {
      const fetchAnalytics = async () => {
        try {
          setLoading(true);
          // Fetch analytics data from API
          // const response = await analyticsAPI.getGroupAnalytics(groupId);
          // setAnalyticsData(response.data);
          
          // Mock data temporarily
          setTimeout(() => {
            setAnalyticsData({
              totalExpenses: 1500,
              categories: [
                { name: 'Yiyecek', amount: 600, percentage: 40 },
                { name: 'Ulaşım', amount: 450, percentage: 30 },
                { name: 'Eğlence', amount: 300, percentage: 20 },
                { name: 'Diğer', amount: 150, percentage: 10 }
              ]
            });
            setLoading(false);
          }, 1000);
        } catch (error) {
          console.error('Error fetching analytics:', error);
          setLoading(false);
        }
      };

      fetchAnalytics();
    }, [groupId])
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradientContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {groupName} Analiz
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Analiz yükleniyor...
              </Text>
            </View>
          ) : (
            <AnalystsSection 
              groupId={groupId} 
              data={analyticsData}
              loading={false}
            />
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: screenHeight * 0.06,
    paddingBottom: screenHeight * 0.02,
  },
  backButton: {
    marginRight: screenWidth * 0.04,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: screenHeight * 0.2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
