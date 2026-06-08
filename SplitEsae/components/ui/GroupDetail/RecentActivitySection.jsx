import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
// Direct import
import UnifiedButton from '../Buttons/UnifiedButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function RecentActivitySection({ activities = [], onShowAll, formatCurrency, hideShowAllButton = false }) {
  const { colors } = useTheme();

  // Add data check
  if (!Array.isArray(activities) || activities.length === 0) {
    return (
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text?.primary || colors.text }]}>Son Aktiviteler</Text>
        <Text style={[styles.noDataText, { color: colors.text?.secondary || colors.text }]}>
          Son aktivite yok
        </Text>
      </View>
    );
  }

  const UserAvatar = ({ name }) => {
    const displayName = name && typeof name === 'string' ? name : 'U';
    return (
      <View style={[styles.avatar, { backgroundColor: colors.avatar?.background || '#C4D5F8' }]}>
        <Text style={[styles.avatarText, { color: colors.avatar?.text || '#FFFFFF' }]}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  const ActivitySeparator = () => (
    <View style={[styles.separator, { backgroundColor: colors.border?.light || '#E0E0E0' }]} />
  );

  return (
    <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: colors.text?.primary || colors.text }]}>Son Aktiviteler</Text>
            {activities.map((activity, index) => (
        <View key={activity.id}>
          <View style={styles.activityItem}>
            <UserAvatar name={activity.user} />
            <View style={styles.activityInfo}>
              <Text style={[styles.activityText, { color: colors.text?.primary || colors.text }]}>
                {activity.description}
              </Text>
              <Text style={[styles.activityDate, { color: colors.text?.tertiary || colors.icon }]}>
                {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString('tr-TR') : ''}
              </Text>
              {activity.amount && (
                <Text style={[styles.activityAmount, { color: colors.text?.accent || '#377ED1' }]}>
                  {formatCurrency ? formatCurrency(activity.amount) : activity.amount}
                </Text>
              )}
            </View>
          </View>
          {index < activities.length - 1 && <ActivitySeparator />}
        </View>
      ))}
      
      {!hideShowAllButton && (
        <UnifiedButton 
          title="Tümünü Göster" 
          onPress={onShowAll}
          variant="default"
          size="medium"
          icon="list-outline"
          style={styles.showAllButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: screenWidth * 0.05,
    borderRadius: 10,
    marginBottom: screenHeight * 0.05,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    marginBottom: screenHeight * 0.02,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: screenHeight * 0.015,
  },
  avatar: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
  },
  activityInfo: {
    flex: 1,
    marginLeft: screenWidth * 0.04,
  },
  activityText: {
    fontSize: screenWidth * 0.04,
    fontWeight: '600',
    marginBottom: screenHeight * 0.005,
  },
  activityDescription: {
    fontSize: screenWidth * 0.035,
    marginBottom: screenHeight * 0.003,
  },
  activityDate: {
    fontSize: screenWidth * 0.032,
    marginBottom: screenHeight * 0.003,
  },
  activityAmount: {
    fontSize: screenWidth * 0.038,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    marginVertical: screenHeight * 0.01,
    marginHorizontal: screenWidth * 0.02,
  },
  showAllButton: {
    marginTop: screenHeight * 0.015,
  },
});

export default RecentActivitySection;