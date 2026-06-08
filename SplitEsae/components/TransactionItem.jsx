import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatters';

const TransactionItem = ({ transaction, onPress, groupCurrency = 'SAR', loading = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderParticipantAvatars = () => {
    const maxVisible = 3;
    const participants = transaction.participants || [];
    const visibleParticipants = participants.slice(0, maxVisible);
    const remainingCount = participants.length - maxVisible;

    return (
      <View style={styles.participantsContainer}>
        <View style={styles.avatarsRow}>
          {visibleParticipants.map((participant, index) => (
            <View key={`participant-${String(
              (typeof participant.userId === 'object' ? participant.userId?._id : participant.userId) ||
              participant._id ||
              participant.name ||
              `user-${index}`
            )}`} style={[styles.avatarContainer, { marginLeft: index > 0 ? -8 : 0 }]}>
              {(participant.userId?.avatar || participant.avatar) ? (
                <Image
                  source={{ uri: participant.userId?.avatar || participant.avatar }}
                  style={styles.avatar}
                  defaultSource={require('../assets/images/default-avatar.svg')}
                />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>
                    {(participant.userId?.name || participant.name) ? 
                      (participant.userId?.name || participant.name).charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
            </View>
          ))}
          {remainingCount > 0 && (
            <View style={[styles.avatarContainer, styles.remainingCount, { marginLeft: -8 }]}>
              <Text style={styles.remainingText}>+{remainingCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.participantsText}>
          {participants.length} katılımcı
        </Text>
      </View>
    );
  };

  const renderPayerInfo = () => {
    return (
      <View style={styles.payerContainer}>
        <View style={styles.payerAvatarContainer}>
          {transaction.payerAvatar ? (
            <Image
              source={{ uri: transaction.payerAvatar }}
              style={styles.payerAvatar}
              defaultSource={require('../assets/images/default-avatar.svg')}
            />
          ) : (
            <View style={styles.defaultPayerAvatar}>
              <Text style={styles.payerAvatarText}>
                {transaction.payerName ? transaction.payerName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.payerName}>
          Ödeyen: {transaction.payerName || 'Bilinmeyen kullanıcı'}
        </Text>
      </View>
    );
  };

  // Show loading skeleton if loading
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <View style={[styles.iconContainer, styles.loadingSkeleton]} />
            <View style={styles.transactionInfo}>
              <View style={[styles.loadingSkeleton, { width: '70%', height: 16, marginBottom: 4 }]} />
              <View style={[styles.loadingSkeleton, { width: '40%', height: 12 }]} />
            </View>
          </View>
          <View style={styles.rightSection}>
            <View style={[styles.loadingSkeleton, { width: 60, height: 18, marginBottom: 4 }]} />
            <View style={[styles.loadingSkeleton, { width: 30, height: 12 }]} />
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <View style={[styles.loadingSkeleton, { width: '90%', height: 14, marginBottom: 4 }]} />
          <View style={[styles.loadingSkeleton, { width: '60%', height: 14 }]} />
        </View>
        <View style={styles.paymentInfo}>
          <View style={styles.payerSection}>
            <View style={[styles.payerIconContainer, styles.loadingSkeleton]} />
            <View style={[styles.loadingSkeleton, { width: '50%', height: 13, marginLeft: 8 }]} />
            <View style={styles.participantsContainer}>
              <View style={styles.avatarsRow}>
                <View style={[styles.avatarContainer, styles.loadingSkeleton, { width: 20, height: 20 }]} />
                <View style={[styles.avatarContainer, styles.loadingSkeleton, { width: 20, height: 20, marginLeft: -4 }]} />
              </View>
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={[styles.loadingSkeleton, { width: 60, height: 20, borderRadius: 12 }]} />
          <View style={[styles.loadingSkeleton, { width: 80, height: 11 }]} />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(transaction)}
      activeOpacity={0.7}
    >
      {/* Header with transaction ID and amount */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="receipt" size={20} color="#4A90E2" />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionId}>
              {transaction.description || transaction.title || 'Mali işlem'}
            </Text>
            <Text style={styles.date}>
              {formatDate(transaction.createdAt)}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.amount}>
            {formatCurrency(transaction.totalAmount, groupCurrency)}
          </Text>
          <Text style={styles.currency}>
            {groupCurrency}
          </Text>
        </View>
      </View>

      {/* Transaction Details */}
      {(transaction.notes || transaction.details) ? (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description} numberOfLines={2}>
            {transaction.notes || transaction.details}
          </Text>
        </View>
      ) : null}

      {/* Payer and participants info */}
      <View style={styles.paymentInfo}>
        <View style={styles.payerSection}>
          <View style={styles.payerIconContainer}>
            <Text style={styles.payerIcon}>$</Text>
          </View>
          <Text style={styles.payerText}>
            Ödeyen: {transaction.payerName || 'Bilinmeyen kullanıcı'}
          </Text>
          {renderParticipantAvatars()}
        </View>
      </View>

      {/* Footer with expense type */}
      <View style={styles.footer}>
        <View style={styles.typeIndicator}>
          <Ionicons name="trending-up" size={14} color="#E74C3C" />
          <Text style={styles.typeText}>Harcama</Text>
        </View>
        <Text style={styles.splitAmount}>
          {formatCurrency(
            transaction.totalAmount / (transaction.participants?.length || 1),
            groupCurrency
          )} kişi başı
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderColor: '#F0F4F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#718096',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B6CB0',
    marginBottom: 2,
  },
  currency: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  paymentInfo: {
    marginBottom: 12,
  },
  payerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payerIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#48BB78',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  payerIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  payerText: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '500',
    flex: 1,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    marginLeft: -4,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  defaultAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#A0AEC0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  remainingCount: {
    backgroundColor: '#718096',
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  remainingText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
  },
  participantsText: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F8',
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FED7D7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
    color: '#E53E3E',
    marginLeft: 4,
    fontWeight: '600',
  },
  splitAmount: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '500',
  },
  loadingContainer: {
    opacity: 0.7,
  },
  loadingSkeleton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
});

export default TransactionItem;