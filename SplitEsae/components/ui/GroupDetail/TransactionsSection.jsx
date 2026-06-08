import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import UnifiedButton from '../Buttons/UnifiedButton';
import TransactionItem from '../../TransactionItem';
import LoadingSpinner from '../LoadingSpinner';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function TransactionsSection({ 
  transactions, 
  loading = false,
  onShowAll, 
  onAddTransaction, 
  formatCurrency, 
  hideShowAllButton = false,
  showAllButton = true,
  addButton = true,
  addButtonTitle = "İşlem",
  renderTransactionItem
}) {
  const { colors } = useTheme();
  
  // Add safety check
  const safeTransactions = transactions || [];
  
  // Show loading state
  if (loading) {
    return (
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>      
        <Text style={[styles.sectionTitle, { color: colors.text?.primary || colors.text }]}>İşlemler</Text>
        <LoadingSpinner 
          text="İşlemler yükleniyor..."
          color={colors.primary}
          size="large"
          style={styles.loadingContainer}
        />
      </View>
    );
  }
  
  // Add check for empty state
  if (safeTransactions.length === 0) {
    return (
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>      
        <Text style={[styles.sectionTitle, { color: colors.text?.primary || colors.text }]}>İşlemler</Text>
        <Text style={[styles.emptyMessage, { color: colors.text.secondary }]}>İşlem bulunamadı</Text>
        {addButton && (
          <View style={styles.buttonRow}>
            <UnifiedButton 
              title={addButtonTitle} 
              onPress={onAddTransaction} 
              variant="default"
              size="medium"
              icon="add-circle-outline"
              style={{ flex: 1 }} 
            />
          </View>
        )}
      </View>
    );
  }
  
  return (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>      
      <Text style={[styles.sectionTitle, { color: colors.text?.primary || colors.text }]}>İşlemler</Text>
      
      {renderTransactionItem ? (
        safeTransactions.map((transaction, index) => (
          <View key={`transaction-${transaction.id || transaction._id || index}`}>
            {renderTransactionItem({ item: transaction })}
          </View>
        ))
      ) : (
        <View style={styles.transactionsContainer}>
          {loading ? (
            // Show loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <TransactionItem
                key={`loading-transaction-${index}`}
                loading={true}
                groupCurrency="SAR"
              />
            ))
          ) : (
            safeTransactions.map((transaction, index) => (
              <TransactionItem
                key={`transaction-item-${transaction.id || transaction._id || index}`}
                transaction={{
                  ...transaction,
                  totalAmount: transaction.amount || transaction.totalAmount,
                  payerName: transaction.paidBy?.name || transaction.payerName || 'Bilinmeyen kullanıcı',
                  participants: transaction.participants || []
                }}
                groupCurrency={transaction.currency || 'SAR'}
                onPress={() => console.log('Transaction pressed:', transaction)}
              />
            ))
          )}
        </View>
      )}
      
      <View style={styles.buttonRow}>
        {(showAllButton && !hideShowAllButton) && (
          <UnifiedButton 
            title="Tümünü Göster" 
            onPress={onShowAll} 
            variant="default"
            size="medium"
            icon="list-outline"
            style={addButton ? styles.halfButton : { flex: 1 }} 
          />
        )}
        {addButton && (
          <UnifiedButton 
            title={addButtonTitle} 
            onPress={onAddTransaction} 
            variant="default"
            size="medium"
            icon="add-circle-outline"
            style={(showAllButton && !hideShowAllButton) ? styles.halfButton : { flex: 1 }} 
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: screenWidth * 0.05,
    borderRadius: 10,
    marginBottom: screenHeight * 0.02,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.02,
  },
  transactionsContainer: {
    marginHorizontal: -16, // Offset the section padding to allow full-width cards
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: screenHeight * 0.02,
  },
  halfButton: {
    flex: 0.48,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: screenWidth * 0.04,
    marginVertical: screenHeight * 0.03,
    fontStyle: 'italic',
  },
  loadingContainer: {
    marginVertical: screenHeight * 0.03,
    minHeight: screenHeight * 0.1,
  },
});

export default TransactionsSection;