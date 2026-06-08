import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import UnifiedButton from '../Buttons/UnifiedButton';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function AnalystsSection({ groupId, onShowAll, analyticsData, formatCurrency, hideShowAllButton = false }) {
  const { colors, isDarkMode } = useTheme();
  // Removed selectedMonth state as click functionality is no longer needed
  const [viewMode, setViewMode] = useState('summary');

  // Add logs to track received data
  console.log('📊 [AnalystsSection] Received analytics data:', {
    groupId,
    analyticsData,
    hasTotal: !!analyticsData?.total,
    hasMonthly: !!analyticsData?.monthly,
    hasPatterns: !!analyticsData?.patterns,
    hasSummary: !!analyticsData?.summary
  });

  // Log each month's structure
  if (analyticsData?.monthly) {
    analyticsData.monthly.forEach((month, index) => {
      console.log(`📅 [AnalystsSection] Month ${index + 1}:`, {
        month: month.month,
        totalAmount: month.totalAmount,
        transactionCount: month.transactionCount,
        userDetails: month.userDetails,
        hasUserDetails: !!month.userDetails,
        userDetailsLength: month.userDetails?.length || 0
      });
    });
  }

  const totalData = analyticsData?.total || {};
  const monthlyData = analyticsData?.monthly || [];
  const patternsData = analyticsData?.patterns || [];
  const summaryData = analyticsData?.summary || {};


  if (!analyticsData) {
    return (
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Analiz</Text>
        <Text style={[styles.noDataText, { color: colors.text.secondary }]}>
          Analiz verisi mevcut değil
        </Text>
      </View>
    );
  }

  const renderSummaryView = () => (
    <View>
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { 
          backgroundColor: isDarkMode 
            ? `${colors.primary}20` 
            : `${colors.primary}15`
        }]}>
          <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Toplam Harcama</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {totalData.totalCount || 0} Harcama
          </Text>
        </View>
        
        <View style={[styles.summaryCard, { 
          backgroundColor: isDarkMode 
            ? `${colors.success}20` 
            : `${colors.success}15`
        }]}>
          <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Ödenen Tutar</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {formatCurrency(totalData.settledAmount || 0)}
          </Text>
        </View>
      </View>
      
      <View style={[styles.summaryCard, { 
        backgroundColor: isDarkMode 
          ? `${colors.accent}20` 
          : `${colors.accent}15`,
        marginTop: 10 
      }]}>
        <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Aktif Tutar</Text>
        <Text style={[styles.summaryValue, { color: colors.accent }]}>
          {formatCurrency(totalData.activeAmount || 0)}
        </Text>
      </View>
    </View>
  );

  const renderMonthlyView = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthlyScroll}>
      {monthlyData.map((month, index) => {
        const monthKey = `${month._id?.year}-${month._id?.month}` || `month-${index}`;
        const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        const monthName = monthNames[(month._id?.month || 1) - 1];
        
        return (
          <TouchableOpacity 
            key={monthKey}
            style={[styles.monthCard, { 
              backgroundColor: isDarkMode 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)',
              borderColor: colors.border.light,
              borderWidth: 1
            }]}
            // Removed click functionality as requested
          >
            <Text style={[styles.monthTitle, { 
              color: colors.text.primary
            }]}>
              {monthName} {month._id?.year || new Date().getFullYear()}
            </Text>
            <Text style={[styles.monthAmount, { 
              color: colors.primary 
            }]}>
              {formatCurrency(month.totalAmount || 0)}
            </Text>
            <Text style={[styles.monthTransactions, { 
              color: colors.text.secondary
            }]}>
              {month.count || 0} işlem
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderMembersView = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersScroll}>
      {patternsData.map((member, index) => {
        const memberKey = member._id || `member-${index}`;
        const memberName = member._id?.name || `Üye ${index + 1}`;
        const totalSpent = member.totalSpent || 0;
        const totalReceived = member.totalReceived || 0;
        const transactionCount = member.transactionCount || 0;
        const avgPerTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;
        
        return (
          <View key={memberKey} style={[styles.memberCard, { 
            backgroundColor: isDarkMode 
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
            borderColor: colors.border.light,
            borderWidth: 1
          }]}>
            <View style={styles.memberHeader}>
              <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.memberAvatarText, { color: colors.text.inverse }]}>
                  {memberName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: colors.text.primary }]}>{memberName}</Text>
                <Text style={[styles.memberEmail, { color: colors.text.secondary }]}>{transactionCount} işlem</Text>
              </View>
            </View>
            
            <View style={styles.memberStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Toplam Harcama</Text>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {formatCurrency(totalSpent)}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Toplam Alınan</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {formatCurrency(totalReceived)}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Ortalama İşlem</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {formatCurrency(avgPerTransaction)}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Analiz</Text>
        
        <View style={styles.viewModeButtons}>
          <TouchableOpacity 
            style={[styles.modeButton, { 
              backgroundColor: viewMode === 'summary' ? colors.primary : 'transparent',
              borderColor: colors.primary,
              borderWidth: 1
            }]}
            onPress={() => setViewMode('summary')}
          >
            <Text style={[styles.modeButtonText, { 
              color: viewMode === 'summary' ? colors.text.inverse : colors.primary 
            }]}>Özet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, { 
              backgroundColor: viewMode === 'monthly' ? colors.primary : 'transparent',
              borderColor: colors.primary,
              borderWidth: 1
            }]}
            onPress={() => setViewMode('monthly')}
          >
            <Text style={[styles.modeButtonText, { 
              color: viewMode === 'monthly' ? colors.text.inverse : colors.primary 
            }]}>Aylık</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, { 
              backgroundColor: viewMode === 'members' ? colors.primary : 'transparent',
              borderColor: colors.primary,
              borderWidth: 1
            }]}
            onPress={() => setViewMode('members')}
          >
            <Text style={[styles.modeButtonText, { 
              color: viewMode === 'members' ? colors.text.inverse : colors.primary 
            }]}>Üyeler</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        {viewMode === 'summary' && renderSummaryView()}
        {viewMode === 'monthly' && renderMonthlyView()}
        {viewMode === 'members' && renderMembersView()}
      </View>
      
      {/* Month details section removed as requested */}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: screenWidth * 0.05,
    borderRadius: 10,
    marginBottom: screenHeight * 0.02,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: screenHeight * 0.02,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
  },
  viewModeButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  modeButton: {
    paddingHorizontal: screenWidth * 0.03,
    paddingVertical: screenHeight * 0.008,
    borderRadius: 15,
  },
  modeButtonText: {
    fontSize: screenWidth * 0.03,
    fontWeight: '500',
  },
  content: {
    marginBottom: screenHeight * 0.02,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: screenWidth * 0.04,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: screenWidth * 0.032,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
  },
  monthlyScroll: {
    marginVertical: screenHeight * 0.01,
  },
  monthCard: {
    padding: screenWidth * 0.04,
    borderRadius: 8,
    marginRight: 10,
    minWidth: screenWidth * 0.3,
  },
  monthTitle: {
    fontSize: screenWidth * 0.035,
    fontWeight: '600',
    marginBottom: 5,
  },
  monthAmount: {
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  monthTransactions: {
    fontSize: screenWidth * 0.03,
  },
  membersScroll: {
    marginVertical: screenHeight * 0.01,
  },
  memberCard: {
    padding: screenWidth * 0.04,
    borderRadius: 8,
    marginRight: 10,
    minWidth: screenWidth * 0.7,
    maxWidth: screenWidth * 0.8,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberAvatar: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    borderRadius: screenWidth * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberAvatarText: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: screenWidth * 0.04,
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: screenWidth * 0.032,
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: screenWidth * 0.032,
    marginBottom: 3,
  },
  statValue: {
    fontSize: screenWidth * 0.038,
    fontWeight: 'bold',
  },
  // Removed month details styles as functionality was removed
  showAllButton: {
    marginTop: screenHeight * 0.015,
  },
  noDataText: {
    fontSize: screenWidth * 0.035,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: screenHeight * 0.03,
  },
});

export default AnalystsSection;