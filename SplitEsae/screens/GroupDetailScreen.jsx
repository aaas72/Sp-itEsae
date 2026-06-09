import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DropdownMenu from "../components/ui/DropdownMenu/DropdownMenu";
import {
  Header,
  TotalSpentCard,
  AnalystsSection,
  DebtsSection,
  TransactionsSection,
  RecentActivitySection,
  LoadingSpinner,
} from "../components";
import { groupsAPI, debtsAPI, analyticsAPI, transactionsAPI, activitiesAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useActivities } from "../hooks/useActivities";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const GroupDetailScreen = ({ route }) => {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [groupData, setGroupData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const [debtsData, setDebtsData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [transactionsData, setTransactionsData] = useState([]);

  const [totalSpentLoading, setTotalSpentLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [debtsLoading, setDebtsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const groupId = route.params?.groupId;

  // استخدام hook الأنشطة
  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
    fetchActivities,
    refreshActivities
  } = useActivities(groupId);

  const fetchGroupDetails = async () => {
    try {
      const response = await groupsAPI.getGroupDetails(groupId);

      if (response.success) {
        const group = response.data;
        setGroupData(group);

        console.log("Current user ID:", user.id);
        console.log("Group members:", group.members);
        console.log("Group currency:", group.currency);

        const userIsAdmin = group.members?.some(
          (member) =>
            member.userId._id.toString() === user.id.toString() &&
            member.role === "admin" &&
            member.isActive
        );

        console.log("User is admin:", userIsAdmin);
        setIsAdmin(userIsAdmin);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

  const fetchGroupDebts = async () => {
    try {
      setDebtsLoading(true);
      const response = await debtsAPI.getGroupDebts(groupId);

      if (response.success) {
        const formattedDebts = response.data
          .map((debt) => ({
            id: debt._id,
            from: debt.debtorId.name,
            to: debt.creditorId.name,
            amount: debt.amount,
            description: debt.description,
            status: debt.status,
            // Ensure currency exists for old debts
            currency: debt.currency || groupData?.currency || 'SAR',
            createdAt: new Date(debt.createdAt),
          }))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 4);

        setDebtsData(formattedDebts);
      }
    } catch (error) {
      console.error("Error fetching group debts:", error);
    } finally {
      setDebtsLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      console.log('🔄 [GroupDetailScreen] Starting to fetch analytics data for groupId:', groupId);
      setAnalyticsLoading(true);
      
      const [totalData, expensesCountData, monthlyData, patternsData] = await Promise.all([
        analyticsAPI.getGroupTotalAmount(groupId),
        analyticsAPI.getExpensesCount(groupId),
        analyticsAPI.getMonthlyAnalysis(groupId),
        analyticsAPI.getUserPatterns(groupId)
      ]);
      
      console.log('✅ [GroupDetailScreen] Analytics data fetched successfully:', {
        totalData: totalData?.data,
        expensesCountData: expensesCountData?.data,
        monthlyData: monthlyData?.data,
        patternsData: patternsData?.data
      });
      
      setAnalyticsData({
        total: { ...totalData.data, totalCount: expensesCountData.data.totalCount },
        monthly: monthlyData.data,
        patterns: patternsData.data,
        summary: {}
      });
    } catch (error) {
      console.error('❌ [GroupDetailScreen] Error fetching analytics data:', {
        groupId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      Alert.alert('Hata', `Analiz verileri getirilirken bir hata oluştu: ${error.message}`);
    } finally {
      setAnalyticsLoading(false);
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('🔄 [GroupDetailScreen] Starting to fetch transactions for groupId:', groupId);
      setTransactionsLoading(true);
      
      const response = await transactionsAPI.getGroupTransactions(groupId, 1, 4);
      
      if (response.success) {
        console.log('✅ [GroupDetailScreen] Transactions fetched successfully:', response.data);
        setTransactionsData(response.data.transactions || []);
      } else {
        console.warn('⚠️ [GroupDetailScreen] Transactions fetch returned unsuccessful response');
        setTransactionsData([]);
      }
    } catch (error) {
      console.error('❌ [GroupDetailScreen] Error fetching transactions:', {
        groupId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Show user-friendly error message
      Alert.alert(
        'Hata',
        'İşlemler yüklenemedi. Lütfen bağlantınızı kontrol edip tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
      setTransactionsData([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchGroupDetails();
      fetchGroupDebts();
      fetchAnalyticsData();
      fetchTransactions();

      setTotalSpentLoading(true);

      const totalSpentTimer = setTimeout(() => setTotalSpentLoading(false), 1000);

      return () => {
        clearTimeout(totalSpentTimer);
      };
    }, [groupId, user.id])
  );

  const handleViewAnalytics = () => {
    navigation.navigate('AnalyticsScreen', {
      groupId: groupData?.id || groupId
    });
  };

  // Add analytics button to dropdown options
  const getDropdownOptions = () => {
    const baseOptions = [
      {
        title: "Analiz Görüntüle",
        icon: "stats-chart",
        onPress: handleViewAnalytics,
      },
      {
        title: "Kullanıcı Davet Et",
        icon: "person-add",
        onPress: handleInviteUser,
      },
      {
        title: "Üyeleri Yönet",
        icon: "people",
        onPress: handleManageMembers,
      },
    ];

    if (isAdmin) {
      baseOptions.push(
        {
          title: "Grubu Yönet",
          icon: "create",
          onPress: handleEditGroupName,
        },
        {
          title: "Grubu Sil",
          icon: "trash",
          type: "destructive",
          onPress: handleDeleteGroup,
        }
      );
    }

    return baseOptions;
  };

  const handleInviteUser = () => {
    console.log("Invite user to group");
    navigation.navigate("AddInviteUserScreen");
  };

  const handleManageMembers = () => {
    navigation.navigate("MembersManagementScreen", {
      groupId: groupData?.id || groupId,
      groupData: groupData,
    });
  };

  const handleEditGroupName = () => {
    navigation.navigate("EditGroupScreen", {
      groupId: groupData?.id || groupId,
      groupData: groupData,
    });
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      "Grubu Sil",
      `"${groupData?.name || "bu grup"}" grubunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve işlemler, borçlar ve aktiviteler dahil tüm grup verilerini siler.`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              setDropdownVisible(false);
              Alert.alert("Siliniyor...", "Grup silinirken lütfen bekleyin.");
              const response = await groupsAPI.deleteGroup(groupId);
              if (response.success) {
                navigation.goBack();
              }
            } catch (error) {
              console.error("Error deleting group:", error);
              Alert.alert("Hata", "Grup silinemedi");
            }
          },
        },
      ]
    );
  };

  if (!groupData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Yükleniyor..." />
        <View style={[styles.loadingCard, { backgroundColor: colors.cardBackground }]}>
          <LoadingSpinner size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.inverse }]}>
          {groupData?.name || "Grup Detayları"}
        </Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={(event) => {
            const { pageX, pageY } = event.nativeEvent;
            setDropdownPosition({ x: pageX, y: pageY });
            setDropdownVisible(true);
          }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={colors.text.inverse}
          />
        </TouchableOpacity>
      </View>

      <DropdownMenu
        visible={dropdownVisible}
        onClose={() => setDropdownVisible(false)}
        position={dropdownPosition}
        options={getDropdownOptions()}
      />

      <ScrollView style={styles.content}>
        <TotalSpentCard
          groupId={groupId}
          total={analyticsData?.total?.totalAmount ? 
            new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: groupData?.currency || "",
            }).format(analyticsData.total.totalAmount) : "0.00"
          }
          loading={totalSpentLoading}
          onAddTransaction={() =>
            navigation.navigate("AddTransactionScreen", {
              groupId: groupData?.id || groupId,
              groupName: groupData?.name,
              groupCurrency: groupData?.currency,
              groupMembers: groupData?.members?.filter(member => 
                member.isActive && member.userId._id !== user._id
              ).map(member => ({
                userId: member.userId._id,
                _id: member.userId._id,
                name: member.userId.name
              })) || []
            })
          }
        />

        <AnalystsSection
          groupId={groupId}
          analyticsData={analyticsData}
          formatCurrency={(amount) => {
            const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
            const currency = groupData?.currency || '';
            
            // Determine appropriate locale for each currency
            const localeMap = {
              'USD': 'en-US',
              'EUR': 'de-DE',
              'SAR': 'ar-SA',
              'AED': 'ar-AE',
              'EGP': 'ar-EG',
              'TRY': 'tr-TR'
            };
            
            const locale = localeMap[currency] || 'tr-TR';
            
            return new Intl.NumberFormat(locale, {
              style: "currency",
              currency: currency,
            }).format(safeAmount);
          }}
          onShowAll={handleViewAnalytics}
        />

        <DebtsSection
          groupId={groupId}
          debts={debtsData}
          loading={debtsLoading}
          formatCurrency={(amount, debtCurrency) => {
             const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
             const currency = debtCurrency || groupData?.currency || '';
             
             const localeMap = {
               'USD': 'en-US',
               'EUR': 'de-DE',
               'SAR': 'ar-SA',
               'AED': 'ar-AE',
               'EGP': 'ar-EG',
               'TRY': 'tr-TR'
             };
             
             const locale = localeMap[currency] || 'tr-TR';
             
             return new Intl.NumberFormat(locale, {
               style: 'currency',
               currency: currency,
             }).format(safeAmount);
           }}
          onShowAll={() =>
            navigation.navigate("DebtsScreen", {
              groupId: groupData?.id || groupId,
              groupName: groupData?.name,
            })
          }
          onAddDebt={() =>
            navigation.navigate("AddDebtScreen", {
              groupId: groupData?.id || groupId,
              groupName: groupData?.name,
              groupMembers: groupData?.members?.filter(member => 
                member.isActive && member.userId._id !== user.id
              ).map(member => ({
                userId: member.userId._id,
                _id: member.userId._id,
                name: member.userId.name
              })) || []
            })
          }
        />

        <TransactionsSection
          groupId={groupId}
          transactions={transactionsData}
          loading={transactionsLoading}
          formatCurrency={(amount) => {
            const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
            const currency = groupData?.currency || '';
            
            // Determine appropriate locale for each currency
            const localeMap = {
              'USD': 'en-US',
              'EUR': 'de-DE',
              'SAR': 'ar-SA',
              'AED': 'ar-AE',
              'EGP': 'ar-EG',
              'TRY': 'tr-TR'
            };
            
            const locale = localeMap[currency] || 'tr-TR';
            
            return new Intl.NumberFormat(locale, {
              style: "currency",
              currency: currency,
            }).format(safeAmount);
          }}
          onShowAll={() =>
            navigation.navigate("TransactionsScreen", {
              groupId: groupData?.id || groupId,
            })
          }
          onAddTransaction={() =>
            navigation.navigate("AddTransactionScreen", {
              groupId: groupData?.id || groupId,
              groupName: groupData?.name,
              groupCurrency: groupData?.currency,
              groupMembers: groupData?.members?.filter(member => 
                member.isActive && member.userId._id !== user._id
              ).map(member => ({
                userId: member.userId._id,
                _id: member.userId._id,
                name: member.userId.name
              })) || []
            })
          }
        />

        <RecentActivitySection
          activities={activities}
          loading={activitiesLoading}
          formatCurrency={(amount) => {
            const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
            const currency = groupData?.currency || '';
            
            // Determine appropriate locale for each currency
            const localeMap = {
              'USD': 'en-US',
              'EUR': 'de-DE',
              'SAR': 'ar-SA',
              'AED': 'ar-AE',
              'EGP': 'ar-EG',
              'TRY': 'tr-TR'
            };
            
            const locale = localeMap[currency] || 'tr-TR';
            
            return new Intl.NumberFormat(locale, {
              style: "currency",
              currency: currency,
            }).format(safeAmount);
          }}
          onShowAll={() =>
            navigation.navigate("ActivitiesScreen", {
              groupId: groupData?.id || groupId,
            })
          }
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: screenWidth * 0.04,
    paddingVertical: screenHeight * 0.02,
    paddingTop: screenHeight * 0.06,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingCard: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
});

export default GroupDetailScreen;
