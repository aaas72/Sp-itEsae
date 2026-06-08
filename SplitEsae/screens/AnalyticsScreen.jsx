import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { api } from '../utils/api';
import Colors from '../constants/Colors';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
  const route = useRoute();
  const { groupId } = route.params;

  // Fetch total amounts
  const { data: totalData, isLoading: isLoadingTotal } = useQuery(
    ['analytics', 'total', groupId],
    () => api.get(`/analytics/group/${groupId}/total`).then(res => res.data.data)
  );

  // Fetch monthly analysis
  const { data: monthlyData, isLoading: isLoadingMonthly } = useQuery(
    ['analytics', 'monthly', groupId],
    () => api.get(`/analytics/group/${groupId}/monthly`).then(res => res.data.data)
  );

  // Fetch user patterns
  const { data: userPatterns, isLoading: isLoadingPatterns } = useQuery(
    ['analytics', 'patterns', groupId],
    () => api.get(`/analytics/group/${groupId}/user-patterns`).then(res => res.data.data)
  );

  if (isLoadingTotal || isLoadingMonthly || isLoadingPatterns) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const formatMonthlyData = () => {
    if (!monthlyData) return null;

    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const labels = monthlyData.map(month => monthNames[(month._id.month || 1) - 1]);
    const amounts = monthlyData.map(month => month.totalAmount);

    return {
      labels,
      datasets: [{ data: amounts }],
    };
  };

  const chartConfig = {
    backgroundColor: Colors.background,
    backgroundGradientFrom: Colors.background,
    backgroundGradientTo: Colors.background,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: Colors.primary
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Total Amounts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Toplam Tutarlar</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Toplam</Text>
            <Text style={styles.statValue}>₺{totalData?.totalAmount || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Aktif</Text>
            <Text style={styles.statValue}>₺{totalData?.activeAmount || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Ödenmiş</Text>
            <Text style={styles.statValue}>₺{totalData?.settledAmount || 0}</Text>
          </View>
        </View>
      </View>

      {/* Monthly Analysis Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aylık Harcama</Text>
        {monthlyData && monthlyData.length > 0 ? (
          <LineChart
            data={formatMonthlyData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noDataText}>Aylık veri mevcut değil</Text>
        )}
      </View>

      {/* User Patterns Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Harcama Düzeniniz</Text>
        {userPatterns && userPatterns.map((pattern, index) => (
          <View key={index} style={styles.patternBox}>
            <Text style={styles.patternTitle}>
              {`${pattern._id.month}/${pattern._id.year}`}
            </Text>
            <View style={styles.patternStats}>
              <Text style={styles.patternText}>
                Harcanan: ₺{pattern.totalSpent.toFixed(2)}
              </Text>
              <Text style={styles.patternText}>
                Alınan: ₺{pattern.totalReceived.toFixed(2)}
              </Text>
              <Text style={styles.patternText}>
                İşlemler: {pattern.transactionCount}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  patternBox: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  patternStats: {
    flexDirection: 'column',
    gap: 5,
  },
  patternText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default AnalyticsScreen;