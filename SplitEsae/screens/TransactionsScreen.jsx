import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";import { useTheme } from "../contexts/ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TransactionsSection } from "../components";
import { useFocusEffect } from "@react-navigation/native";
import { groupsAPI, transactionsAPI } from "../utils/api";
import TransactionItem from "../components/TransactionItem";
import { useAuth } from "../contexts/AuthContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { groupId, groupName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [groupData, setGroupData] = useState(null);
  const [error, setError] = useState(null);

  // Replace useEffect with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch group data to get currency
          if (groupId) {
            console.log('🔄 Fetching group data for groupId:', groupId);
            const groupResponse = await groupsAPI.getGroupDetails(groupId);
            setGroupData(groupResponse.data);
          }
          
          // Fetch real transactions data
          console.log('🔄 Fetching transactions for groupId:', groupId);
          const transactionsResponse = await transactionsAPI.getGroupTransactions(groupId);
          setTransactions(transactionsResponse.data.transactions || []);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('İşlemler yüklenemedi. Lütfen tekrar deneyin.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, [groupId])
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTransactionPress = (transaction) => {
     // Navigate to transaction detail screen
     navigation.navigate('TransactionDetail', {
       transactionId: transaction.id || transaction._id,
       transaction: transaction
     });
   };

  const renderTransactionItem = ({ item }) => (
    <TransactionItem
      transaction={item}
      onPress={handleTransactionPress}
      groupCurrency={groupData?.currency || "SAR"}
    />
  );

  const formatCurrency = (amount) => {
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
      style: 'currency',
      currency: currency,
    }).format(safeAmount);
  };

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error || colors.primary} />
          <Text style={[styles.errorText, { color: colors.text.primary }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setError(null);
              // Trigger refetch by calling the focus effect
              const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                  if (groupId) {
                    const groupResponse = await groupsAPI.getGroupDetails(groupId);
                    setGroupData(groupResponse.data);
                  }
                  const transactionsResponse = await transactionsAPI.getGroupTransactions(groupId);
                  setTransactions(transactionsResponse.data.transactions || []);
                } catch (error) {
                  console.error('Error fetching data:', error);
                  setError('İşlemler yüklenemedi. Lütfen tekrar deneyin.');
                } finally {
                  setLoading(false);
                }
              };
              fetchData();
            }}
          >
            <Text style={[styles.retryButtonText, { color: colors.text.inverse }]}>Tekrar Dene</Text>
          </TouchableOpacity>
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
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.inverse }]}>
          İşlemler - {groupName || "Arkadaş Grubu"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TransactionsSection
          transactions={transactions}
          loading={loading}
          formatCurrency={formatCurrency}
          showAllButton={false}
          addButton={true}
          buttonVariant="floating"
          buttonSize="medium"
          onAddTransaction={() => navigation.navigate('AddTransactionScreen', { 
            groupId, 
            groupName,
            groupMembers: groupData?.members?.filter(member => 
               member.isActive && member.userId._id !== user._id
             ).map(member => ({
              userId: member.userId._id,
              _id: member.userId._id,
              name: member.userId.name
            })) || []
          })}
          renderTransactionItem={renderTransactionItem}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: screenWidth * 0.1,
  },
  errorText: {
    textAlign: "center",
    marginTop: screenHeight * 0.02,
    marginBottom: screenHeight * 0.03,
    fontSize: screenWidth * 0.04,
  },
  retryButton: {
    paddingHorizontal: screenWidth * 0.08,
    paddingVertical: screenHeight * 0.015,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
  },
});
