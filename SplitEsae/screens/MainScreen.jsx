import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  Header,
  GroupCard,
  UnifiedButton,
  LoadingSpinner,
} from "../components";
import { useAuth } from "../contexts/AuthContext";
import { useGroups } from "../hooks/useGroups";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function MainScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();

  // Using React Query instead of useState and useEffect
  const { data: userGroups = [], isLoading, error, refetch } = useGroups();

  // Navigate to login screen if user is not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate("LoginScreen");
    }
  }, [isAuthenticated]);

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        refetch();
      }
    }, [isAuthenticated, refetch])
  );

  // Show error if occurred
  if (error) {
    Alert.alert("Hata", "Gruplar getirilemedi");
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradientContainer}
      >
        <Header
          onMenuPress={() => navigation.openDrawer()}
          title=" Gruplarınız"
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onRefresh={refetch}
          refreshing={isLoading}
        >
          <View style={styles.section}>
            {isLoading ? (
              <View
                style={[
                  styles.loadingContainer,
                  { backgroundColor: colors.cardBackground },
                ]}
              >
                <LoadingSpinner
                  size="large"
                  color={colors.primary}
                  text="Gruplar yükleniyor..."
                  showText={true}
                />
              </View>
            ) : userGroups.length > 0 ? (
              userGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  groupId={group.id}
                  groupName={group.name}
                  members={group.members.length}
                  total={group.totalExpenses}
                  onPress={() => navigation.navigate("GroupDetail", { groupId: group.id })}
                />
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  Henüz Grup Yok
                </Text>
                <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                  Arkadaşlarınızla harcamaları bölüşmeye başlamak için ilk grubunuzu oluşturun!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.floatingButtonContainer}>
          <UnifiedButton
            title="Yeni Grup Oluştur"
            onPress={() => navigation.navigate("CreateGroupScreen")}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientContainer: { flex: 1 },
  content: { flex: 1 },
  scrollContent: {
    padding: screenWidth * 0.05,
    paddingBottom: screenHeight * 0.12,
  },
  loadingContainer: {
    padding: screenWidth * 0.05,
    borderRadius: 10,
    alignItems: "center",
    minHeight: screenHeight * 0.3,
    justifyContent: "center",
  },
  statsCard: {
    padding: screenWidth * 0.05,
    borderRadius: 10,
    marginBottom: screenHeight * 0.02,
  },
  statsTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
    marginBottom: screenHeight * 0.02,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: screenWidth * 0.04,
    fontWeight: "bold",
    marginBottom: screenHeight * 0.005,
  },
  statLabel: {
    fontSize: screenWidth * 0.032,
    textAlign: "center",
  },
  section: {
    marginBottom: screenHeight * 0.02,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: screenHeight * 0.015,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
  },
  emptyState: {
    padding: screenWidth * 0.05,
    borderRadius: 10,
    alignItems: "center",
  },
  emptyText: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    textAlign: "center",
    marginTop: screenHeight * 0.015,
    marginBottom: screenHeight * 0.005,
  },
  emptySubText: {
    fontSize: screenWidth * 0.032,
    textAlign: "center",
    lineHeight: screenWidth * 0.045,
    marginBottom: screenHeight * 0.02,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: screenHeight * 0.03,
    left: screenWidth * 0.05,
    right: screenWidth * 0.05,
    zIndex: 1000,
  },
});

export default MainScreen;
