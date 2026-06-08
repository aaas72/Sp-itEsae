import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../../contexts/ThemeContext";
import DropdownMenu from "../DropdownMenu/DropdownMenu";
import UnifiedButton from "../Buttons/UnifiedButton";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function DebtsSection({
  debts = [],
  formatCurrency,
  onShowAll,
  onAddDebts,
  onDeleteDebt,
  onSettleDebt,
  onEditDebt,
  showAllButton = true,
  addButton = true,
  loading = false,
  currentUser,
  groupId,
  groupName,
  showAllButtonTitle = "Tümünü Göster",
  addButtonTitle = "Borç Ekle",
  showAllButtonIcon = "list-outline",
  addButtonIcon = "add-circle-outline",
  buttonVariant = "floating",
  buttonSize = "medium",
}) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if we're in DebtsScreen
  const isDebtsScreen = route.name === "DebtsScreen";

  const handleDeleteDebt = async (debtId) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      await onDeleteDebt(debtId);
      setDropdownVisible(false);
      setSelectedDebt(null);
    } catch (error) {
      console.error('Error deleting debt:', error);
      Alert.alert('Hata', 'Borç silinemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettleDebt = async (debtId) => {
    console.log('💰 Attempting to settle debt:', debtId);
    if (isLoading) {
      console.log('⚠️ Loading in progress, cannot settle debt');
      return;
    }
    try {
      console.log('🔄 Starting debt settlement process...');
      setIsLoading(true);
      await onSettleDebt(debtId);
      console.log('✅ Debt settled successfully');
      setDropdownVisible(false);
      setSelectedDebt(null);
    } catch (error) {
      console.error('❌ Error settling debt:', error);
      Alert.alert('Hata', 'Borç ödenemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
      console.log('🔄 Debt settlement process completed');
    }
  };

  const handleEditDebt = async (debt) => {
    console.log('📝 Attempting to edit debt:', debt);
    if (isLoading || !debt) {
      console.log('⚠️ Loading in progress or data unavailable');
      return;
    }
    
    if (!debt.id || !debt.amount) {
      console.log('⚠️ Incomplete debt data');
      Alert.alert("Hata", "Borç verileri eksik");
      return;
    }

    console.log('✅ Calling edit debt function with data:', debt);
    onEditDebt(debt);
    setDropdownVisible(false);
    setSelectedDebt(null);
  };

  const UserAvatar = ({ name, isCreditor = false }) => {
    const displayName = name && typeof name === "string" ? name : "U";

    return (
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: isCreditor
              ? colors.accent || "#4CAF50"
              : colors.primary || "#2196F3",
          },
        ]}
      >
        <Text
          style={[
            styles.avatarText,
            { color: colors.text?.inverse || "#FFFFFF" },
          ]}
        >
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  const DebtSeparator = () => (
    <View
      style={[
        styles.separator,
        { backgroundColor: colors.border?.light || colors.text || "#E0E0E0" },
      ]}
    />
  );

  // Function to calculate number of visible buttons
  const getVisibleButtonsCount = () => {
    let count = 0;
    if (showAllButton && onShowAll) count++;
    if (addButton && onAddDebts) count++;
    return count;
  };

  // Function to calculate button style based on button count
  const getButtonStyle = () => {
    const visibleButtons = getVisibleButtonsCount();
    if (visibleButtons === 1) {
      return { flex: 1 }; // Single button takes full width
    } else if (visibleButtons === 2) {
      return styles.halfButton; // Two buttons share width
    }
    return styles.halfButton; // Default
  };

  if (loading || debts === null) {
    return (
      <View
        style={[styles.section, { backgroundColor: colors.cardBackground }]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text?.primary || colors.text },
          ]}
        >
          Borçlar
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!Array.isArray(debts) || debts.length === 0) {
    return (
      <View
        style={[styles.section, { backgroundColor: colors.cardBackground }]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text?.primary || colors.text },
          ]}
        >
          Borçlar
        </Text>
        <Text
          style={[
            styles.noDataText,
            { color: colors.text?.secondary || colors.text },
          ]}
        >
          Görüntülenecek borç yok
        </Text>
        {(showAllButton || addButton) && (
          <View style={styles.buttonRow}>
            {showAllButton && onShowAll && (
              <UnifiedButton
                title={showAllButtonTitle}
                icon={showAllButtonIcon}
                onPress={onShowAll}
                variant={buttonVariant}
                size={buttonSize}
                style={getButtonStyle()}
              />
            )}
            {addButton && onAddDebts && (
              <UnifiedButton
                title={addButtonTitle}
                icon={addButtonIcon}
                onPress={onAddDebts}
                variant={buttonVariant}
                size={buttonSize}
                style={getButtonStyle()}
              />
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text?.primary || colors.text },
        ]}
      >
        Borçlar
      </Text>

      <View style={styles.debtsList}>
        {debts.map((debt, index) => {
          if (!debt || !debt.id) return null;

          return (
            <View key={debt.id}>
              <Text style={[styles.debtTimestamp, { color: colors.text?.secondary || colors.text }]}>
                {new Date(debt.createdAt).toLocaleString('tr-TR', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              <View style={styles.debtItemContainer}>
                <View style={[styles.debtItem, debt.status === 'settled' && styles.settledDebtItem]}>
                  <View style={styles.debtMainContent}>
                    <View style={styles.debtContent}>
                      <View style={styles.debtorSection}>
                        <UserAvatar name={debt.from} />
                        <Text
                          style={[
                            styles.personName,
                            { color: colors.text?.primary || colors.text },
                          ]}
                        >
                          {debt.from || "Bilinmiyor"}
                        </Text>
                      </View>

                      <View style={styles.arrowSection}>
                        <Ionicons
                          name="arrow-forward"
                          size={screenWidth * 0.06}
                          color={colors.icon?.primary || colors.icon}
                        />
                        <View style={styles.debtAmountContainer}>
                          <Text
                            style={[styles.debtAmount, { color: colors.accent }]}
                          >
                            {formatCurrency
                              ? formatCurrency(debt.amount, debt.currency)
                              : debt.amount}
                          </Text>
                          {debt.status === 'settled' && (
                            <View style={styles.settledBadge}>
                              <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color={colors.success || '#4CAF50'}
                              />
                              <Text style={[styles.settledText, { color: colors.success || '#4CAF50' }]}>
                                Ödendi
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.creditorSection}>
                        <UserAvatar name={debt.to} isCreditor={true} />
                        <Text
                          style={[
                            styles.personName,
                            { color: colors.text?.primary || colors.text },
                          ]}
                        >
                          {debt.to || "Bilinmiyor"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Show dropdown menu icon based on screen */}
                {isDebtsScreen && (
                <View style={styles.debtActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(event) => {
                      setSelectedDebt(debt);
                      const { pageX, pageY } = event.nativeEvent;
                      setDropdownPosition({ x: pageX, y: pageY });
                      setDropdownVisible(true);
                    }}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color={colors.icon.primary}
                    />
                  </TouchableOpacity>
                </View>
                )}
              </View>

              {index < debts.length - 1 && <DebtSeparator />}
            </View>
          );
        })}
      </View>

      {(showAllButton || addButton) && (
        <View style={styles.buttonRow}>
          {showAllButton && onShowAll && (
            <UnifiedButton
              title={showAllButtonTitle}
              icon={showAllButtonIcon}
              onPress={onShowAll}
              variant={buttonVariant}
              size={buttonSize}
              style={getButtonStyle()}
            />
          )}
          {addButton && onAddDebts && (
            <UnifiedButton
              title={addButtonTitle}
              icon={addButtonIcon}
              onPress={onAddDebts}
              variant={buttonVariant}
              size={buttonSize}
              style={getButtonStyle()}
            />
          )}
        </View>
      )}

      {/* Show dropdown menu only in DebtsScreen */}
      {isDebtsScreen && selectedDebt && (
        <DropdownMenu
          visible={dropdownVisible}
          onClose={() => {
            if (!isLoading) {
              setDropdownVisible(false);
              setSelectedDebt(null);
            }
          }}
          triggerPosition={dropdownPosition}
          options={[
            ...(isLoading ? [
              {
                title: "İşleniyor...",
                icon: "hourglass-outline",
                disabled: true,
                renderIcon: () => <ActivityIndicator size="small" color={colors.primary} />
              }
            ] : selectedDebt.status === 'settled' ? [
              {
                title: "Detayları Gör",
                icon: "information-circle-outline",
                onPress: () => onEditDebt(selectedDebt),
                disabled: isLoading
              },
            ] : currentUser && (selectedDebt.from === currentUser.name || selectedDebt.to === currentUser.name) ? [
                {
                  title: "Düzenle",
                  icon: "create-outline",
                  onPress: () => handleEditDebt(selectedDebt),
                  disabled: isLoading
                },
                {
                  title: "Öde",
                  icon: "checkmark-circle-outline",
                  onPress: () => handleSettleDebt(selectedDebt?.id),
                  disabled: isLoading
                },
                {
                  title: "Sil",
                  icon: "trash-outline",
                  type: "destructive",
                  onPress: () => handleDeleteDebt(selectedDebt?.id),
                  disabled: isLoading
                },
            ] : [
              {
                title: "Detayları Gör",
                icon: "information-circle-outline",
                onPress: () => onEditDebt(selectedDebt),
                disabled: isLoading
              },
            ])
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  settledDebtItem: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  debtAmountContainer: {
    alignItems: 'center',
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  settledText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  debtMainContent: {
    flex: 1,
    marginRight: screenWidth * 0.03,
  },
  debtContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  debtActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    paddingVertical: screenHeight * 0.05,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    padding: screenWidth * 0.05,
    borderRadius: 10,
    marginBottom: screenHeight * 0.02,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
    marginBottom: screenHeight * 0.02,
  },
  debtsList: {
    marginBottom: screenHeight * 0.02,
  },
  debtItem: {
    position: 'relative',
    paddingVertical: screenHeight * 0.015,
    paddingHorizontal: screenWidth * 0.02,
  },
  separator: {
    height: 1,
    marginVertical: screenHeight * 0.01,
    marginHorizontal: screenWidth * 0.03,
    opacity: 0.3,
  },
  debtorSection: {
    alignItems: "center",
    flex: 1,
  },
  creditorSection: {
    alignItems: "center",
    flex: 1,
  },
  arrowSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 0.8,
  },
  avatar: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: screenHeight * 0.008,
  },
  avatarText: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
  },
  personName: {
    fontSize: screenWidth * 0.035,
    fontWeight: "500",
    textAlign: "center",
  },
  debtAmount: {
    fontSize: screenWidth * 0.04,
    fontWeight: "bold",
    marginTop: screenHeight * 0.005,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: screenHeight * 0.02,
  },
  halfButton: {
    flex: 0.47,
  },
  noDataText: {
    fontSize: screenWidth * 0.04,
    textAlign: "center",
    marginVertical: screenHeight * 0.03,
    fontStyle: "italic",
  },
  debtTimestamp: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
    paddingHorizontal: screenWidth * 0.04,
    opacity: 0.7,
  },
});
