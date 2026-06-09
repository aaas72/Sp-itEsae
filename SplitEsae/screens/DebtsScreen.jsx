import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { DebtsSection } from "../components";
import { debtsAPI, groupsAPI } from "../utils/api";
import { useAlert } from "../hooks/useAlert";
import { useAuth } from "../contexts/AuthContext";
import { Alert } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function DebtsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName } = route.params || {};

  const { user } = useAuth();
  const { showSuccess, showError, showAlert } = useAlert();
  const [groupData, setGroupData] = useState({ id: groupId, name: groupName, debts: null, members: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDebts = useCallback(async () => {
    try {
      console.log('🔄 [DebtsScreen] Starting to fetch debts for groupId:', groupId);
      setLoading(true);
      setError(null);
      const response = await debtsAPI.getGroupDebts(groupId);
      console.log('📡 [DebtsScreen] API response:', response);
      if (response.success) {
        console.log('✅ [DebtsScreen] Debts data received:', response.data);
        const formattedDebts = response.data.map(debt => ({
          id: debt._id,
          from: debt.debtorId.name,
          fromId: debt.debtorId._id,
          to: debt.creditorId.name,
          toId: debt.creditorId._id,
          amount: debt.amount,
          description: debt.description,
          status: debt.status,
          // Ensure currency exists for old debts
          currency: debt.currency || groupData?.currency || '',
          createdAt: debt.createdAt
        }));
        console.log('🔧 [DebtsScreen] Formatted debts:', formattedDebts);
        setGroupData(prev => ({
          ...prev,
          id: groupId,
          name: groupName,
          debts: formattedDebts
        }));
        console.log('✅ [DebtsScreen] Group data updated with debts');
      } else {
        console.log('❌ [DebtsScreen] API response not successful:', response.message);
        throw new Error(response.message || 'Borçlar yüklenemedi');
      }
    } catch (err) {
      console.error('💥 [DebtsScreen] Error fetching debts:', err);
      setError(err.message || 'Borçlar yüklenemedi');
    } finally {
      setLoading(false);
      console.log('🏁 [DebtsScreen] Fetch debts completed');
    }
  }, [groupId, groupName]);

  const fetchGroupData = useCallback(async () => {
    try {
      console.log('🔄 [DebtsScreen] Fetching group data for groupId:', groupId);
      const groupResponse = await groupsAPI.getGroupDetails(groupId);
      console.log('📡 [DebtsScreen] Group API response:', groupResponse);
      if (groupResponse.success) {
        console.log('✅ [DebtsScreen] Group data received:', groupResponse.data);
        setGroupData(prev => ({
          ...prev,
          members: groupResponse.data.members || [],
          currency: groupResponse.data.currency
        }));
        console.log('✅ [DebtsScreen] Group data updated');
      } else {
        console.log('❌ [DebtsScreen] Group API response not successful:', groupResponse.message);
      }
    } catch (err) {
      console.error('💥 [DebtsScreen] Error fetching group details:', err);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      console.log('🎯 [DebtsScreen] useFocusEffect triggered with groupId:', groupId);
      if (groupId) {
        console.log('🚀 [DebtsScreen] Starting data fetch...');
        fetchGroupData();
        fetchDebts();
      } else {
        console.log('⚠️ [DebtsScreen] No groupId provided');
      }
    }, [groupId])
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error}
        </Text>
      </View>
    );
  }



  const formatCurrency = (amount, debtCurrency) => {
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
  };

  const handleDeleteDebt = async (debtId) => {
    Alert.alert(
      'Silmeyi Onayla',
      'Bu borcu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await debtsAPI.deleteDebt(debtId);
              if (response.success) {
                await fetchDebts();
                showAlert('Borç başarıyla silindi', 'success');
              } else {
                showAlert('Borç silinemedi', 'error');
              }
            } catch (err) {
              showAlert('Borç silinirken bir hata oluştu', 'error');
            }
          }
        }
      ]
    );
  };

  const handleSettleDebt = async (debtId) => {
    console.log('💰 Starting debt settlement process in DebtsScreen:', debtId);
    
    // Check debt status before attempting to settle
    const debt = groupData.debts?.find(d => d.id === debtId);
    if (!debt) {
      showError('Borç bulunamadı');
      return;
    }

    if (debt.status === 'settled') {
      showError('Bu borç zaten ödenmiş');
      return;
    }

    // Verify that user is creditor or debtor
    const userId = user?.id || user?._id;
    const isCreditor = debt.toId === userId;
    const isDebtor = debt.fromId === userId;
    if (!isCreditor && !isDebtor) {
      showError('Bu borcu ödeme yetkiniz yok');
      return;
    }

    Alert.alert(
      'Ödemeyi Onayla',
      'Bu borcu ödemek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel', onPress: () => console.log('❌ Borç ödeme iptal edildi') },
        {
          text: 'Öde',
          onPress: async () => {
            console.log('🔄 Confirming debt settlement, connecting to API...');
            try {
              const response = await debtsAPI.settleDebt(debtId);
              console.log('📡 API response:', response);
              if (response.success) {
                console.log('✅ Debt settled successfully, updating list...');
                await fetchDebts();
                showSuccess('Borç başarıyla ödendi');
              } else {
                console.log('⚠️ Failed to settle debt:', response);
                const errorMessage = response.message || 'Borç ödenemedi';
                if (errorMessage.includes('ALREADY_SETTLED')) {
                  showError('Bu borç zaten ödenmiş');
                } else if (errorMessage.includes('DEBT_NOT_FOUND')) {
                  showError('Borç bulunamadı');
                } else if (errorMessage.includes('FORBIDDEN')) {
                  showError('Bu borcu ödeme yetkiniz yok');
                } else {
                  showError(errorMessage);
                }
              }
            } catch (err) {
              console.error('❌ Error in debt settlement:', err);
              const errorMessage = err.response?.data?.message || 'Borç ödenirken bir hata oluştu';
              if (errorMessage.includes('ALREADY_SETTLED')) {
                showError('Bu borç zaten ödenmiş');
              } else if (errorMessage.includes('DEBT_NOT_FOUND')) {
                showError('Borç bulunamadı');
              } else if (errorMessage.includes('FORBIDDEN')) {
                showError('Bu borcu ödeme yetkiniz yok');
              } else {
                showError(errorMessage);
              }
            }
          }
        }
      ]
    );
  };

  const handleEditDebt = (debt) => {
    console.log('📝 Debt data to be edited:', debt);
    if (!debt?.id) {
      console.log('⚠️ Debt ID not found');
      showAlert("Hata", "Borç kimliği bulunamadı");
      return;
    }

    const navigationParams = {
      debtId: debt.id,
      amount: debt.amount,
      description: debt.description || "",
      from: debt.from,
      to: debt.to,
      groupMembers: groupData.members
        ?.filter(member => member.isActive)
        ?.map(member => ({
          _id: member.userId._id,  // use _id to match AddDebtScreen lookup
          name: member.userId.name,
          isActive: member.isActive
        })) || [],
      currentUser: user,
      onDebtUpdated: () => {
        fetchDebts();
      }
    };
    
    console.log('✅ Data sent for navigation:', navigationParams);
    navigation.navigate("EditDebt", navigationParams);
  };

  const handleAddDebt = () => {
    navigation.navigate("AddDebt", {
      groupId: groupData.id,
      groupName: groupData.name,
      groupMembers: groupData.members
        ?.filter(member => member.isActive)
        ?.map(member => ({
          _id: member.userId._id,  // use _id to match AddDebtScreen lookup
          name: member.userId.name,
          isActive: member.isActive
        })) || [],
      currentUser: user
    });
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.inverse }]}>
          Borçlar - {groupData.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <DebtsSection
            debts={groupData.debts}
            groupId={groupData.id}
            groupName={groupData.name}
            formatCurrency={formatCurrency}
            showAllButton={false}
            addButton={false}
            loading={loading}
            onDeleteDebt={handleDeleteDebt}
            onSettleDebt={handleSettleDebt}
            onEditDebt={handleEditDebt}
            onAddDebts={handleAddDebt}
            currentUser={user}
          />
        </ScrollView>
        
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.primary }]}
          onPress={handleAddDebt}
        >
          <Ionicons name="add" size={30} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  floatingButton: {
    position: 'absolute',
    bottom: screenHeight * 0.03,
    right: screenWidth * 0.05,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: screenHeight * 0.06,
    paddingHorizontal: screenWidth * 0.05,
    paddingBottom: screenHeight * 0.02,
  },
  backButton: {
    marginRight: screenWidth * 0.04,
  },
  headerTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  content: {
    padding: screenWidth * 0.05,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    marginTop: screenHeight * 0.3,
    fontSize: screenWidth * 0.04,
  },
});
