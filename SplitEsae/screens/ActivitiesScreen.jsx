import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RecentActivitySection } from "../components";
import { useActivities } from "../hooks/useActivities";
import { groupsAPI } from "../utils/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ActivitiesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName } = route.params || {};

  const [groupData, setGroupData] = useState(null);
  const [groupLoading, setGroupLoading] = useState(true);
  
  const {
    activities,
    loading,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useActivities(groupId);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (groupId) {
        try {
          setGroupLoading(true);
          const response = await groupsAPI.getGroupDetails(groupId);
          if (response.success) {
            setGroupData(response.data.group);
          } else {
            setGroupData({ id: groupId, name: groupName || "Bilinmeyen Grup" });
          }
        } catch (error) {
          console.error('Error fetching group data:', error);
          setGroupData({ id: groupId, name: groupName || "Bilinmeyen Grup" });
        } finally {
          setGroupLoading(false);
        }
      } else {
        setGroupData({ name: "Tüm Aktiviteler" });
        setGroupLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, groupName]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (groupLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      </View>
    );
  }

  if (!groupData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Grup bulunamadı
        </Text>
      </View>
    );
  }

  // Simple currency formatting
  const formatCurrency = (amount) => {
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    const currency = groupData?.currency || 'SAR';
    
    // Determine appropriate locale for each currency
    const localeMap = {
      'USD': 'en-US',
      'EUR': 'de-DE',
      'SAR': 'ar-SA',
      'AED': 'ar-AE',
      'EGP': 'ar-EG',
      'TRY': 'tr-TR'
    };
    
    const locale = localeMap[currency] || 'ar-SA';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(safeAmount);
  };

  const renderActivityItem = ({ item }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'group_created':
          return 'people-outline';
        case 'member_joined':
          return 'person-add-outline';
        case 'member_removed':
          return 'person-remove-outline';
        case 'expense_created':
          return 'receipt-outline';
        case 'debt_settled':
          return 'checkmark-circle-outline';
        default:
          return 'information-circle-outline';
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'group_created':
          return colors.success;
        case 'member_joined':
          return colors.info;
        case 'member_removed':
          return colors.warning;
        case 'expense_created':
          return colors.primary;
        case 'debt_settled':
          return colors.success;
        default:
          return colors.text;
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Az önce';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} saat önce`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} gün önce`;
      }
    };

    return (
      <View style={[styles.activityItem, { backgroundColor: colors.surface }]}>
        <View style={[styles.activityIcon, { backgroundColor: getActivityColor(item.type) + '20' }]}>
          <Ionicons 
            name={getActivityIcon(item.type)} 
            size={20} 
            color={getActivityColor(item.type)} 
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={[styles.activityDescription, { color: colors.text }]}>
            {item.description}
          </Text>
          {item.metadata?.amount && (
            <Text style={[styles.activityAmount, { color: colors.primary }]}>
              {formatCurrency(item.metadata.amount)}
            </Text>
          )}
          <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.inverse }]}>
          Aktiviteler - {groupData.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && activities.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Aktiviteler yükleniyor...
            </Text>
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Henüz aktivite yok
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              Gruba harcama veya değişiklik eklenildiğinde aktiviteler burada görünecektir
            </Text>
          </View>
        ) : (
          <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item._id || item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() => {
              if (loading && activities.length > 0) {
                return (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                );
              }
              return null;
            }}
          />
        )}
      </View>
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
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: screenHeight * 0.2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: screenWidth * 0.04,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: screenHeight * 0.15,
    paddingHorizontal: screenWidth * 0.1,
  },
  emptyText: {
    fontSize: screenWidth * 0.045,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: screenWidth * 0.035,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  activityItem: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: screenWidth * 0.04,
    fontWeight: "500",
    marginBottom: 4,
  },
  activityAmount: {
    fontSize: screenWidth * 0.035,
    fontWeight: "600",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: screenWidth * 0.03,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
