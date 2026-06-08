import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { groupsAPI } from "../../../utils/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const DrawerContent = ({ navigation, state }) => {
  const { colors, toggleTheme, isDarkMode } = useTheme();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch pending invitations
  const { data: invitationsData } = useQuery({
    queryKey: ["pendingInvitations"],
    queryFn: groupsAPI.getPendingInvitations,
    staleTime: 1000 * 60, // 1 minute
  });

  const pendingCount = invitationsData?.data?.length || 0;

  const menuItems = [
    { id: "home", title: "Ana Sayfa", route: "Main", iconName: "home-outline" },
    {
      id: "profile",
      title: "Profil",
      route: "Profile",
      iconName: "person-outline",
    },
    {
      id: "pendingInvitations",
      title: "Bekleyen Davetiyeler",
      route: "PendingInvitationsScreen",
      iconName: "mail-open-outline",
      showRedDot: pendingCount > 0, // Red dot flag
    },
    {
      id: "settings",
      title: "Ayarlar",
      route: "Settings",
      iconName: "settings-outline",
    },
    {
      id: "about",
      title: "Hakkımızda",
      route: "About",
      iconName: "information-circle-outline",
    },
  ];

  const handleItemPress = (route) => {
    navigation.navigate(route);
  };

  const handleLogout = async () => {
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            await logout();
            navigation.navigate("Login");
          } catch (error) {
            console.error("Logout error:", error);
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDarkMode ? colors.gradientStart : colors.primary,
            borderBottomColor: colors.border.light,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: isDarkMode ? colors.text.primary : colors.text.inverse,
                },
              ]}
            >
              SplitEase
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                {
                  color: isDarkMode
                    ? colors.text.secondary
                    : colors.text.inverse,
                },
              ]}
            >
              Harcama Yönetimi
            </Text>
          </View>

          {/* Theme Toggle */}
          <View style={styles.themeToggleContainer}>
            <Ionicons
              name={isDarkMode ? "moon" : "sunny"}
              size={screenWidth * 0.045}
              color={isDarkMode ? colors.text.primary : colors.text.inverse}
              style={styles.themeIcon}
            />
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border.medium, true: colors.primary }}
              thumbColor={
                isDarkMode ? colors.text.inverse : colors.text.inverse
              }
              ios_backgroundColor={colors.border.medium}
              style={styles.themeSwitch}
            />
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = state.routeNames[state.index] === item.route;
          const showBadge =
            item.id === "pendingInvitations" && pendingCount > 0;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                { backgroundColor: isActive ? colors.primary : "transparent" },
              ]}
              onPress={() => handleItemPress(item.route)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                {/* Icon with notification dot */}
                <View style={{ position: "relative" }}>
                  <Ionicons
                    name={item.iconName}
                    size={screenWidth * 0.05}
                    color={isActive ? colors.text.inverse : colors.icon.primary}
                    style={styles.menuIcon}
                  />
                  {showBadge && <View style={styles.redDot} />}
                </View>

                {/* Text */}
                <Text
                  style={[
                    styles.menuText,
                    {
                      color: isActive
                        ? colors.text.inverse
                        : colors.text.primary,
                    },
                  ]}
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { opacity: isLoggingOut ? 0.6 : 1 }]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator
              size="small"
              color="#FF3B30"
              style={styles.menuIcon}
            />
          ) : (
            <Ionicons
              name="log-out-outline"
              size={screenWidth * 0.05}
              color="#FF3B30"
              style={styles.menuIcon}
            />
          )}
          <Text
            style={[styles.menuText, { color: "#FF3B30", fontWeight: "600" }]}
          >
            {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border.light }]}>
        <Text style={[styles.footerText, { color: colors.text.secondary }]}>
          Sürüm 1.0.0
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: screenHeight * 0.06,
    paddingBottom: screenHeight * 0.03,
    paddingHorizontal: screenWidth * 0.05,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: { flex: 1 },
  headerTitle: {
    fontSize: screenWidth * 0.06,
    fontWeight: "bold",
    marginBottom: screenHeight * 0.005,
  },
  headerSubtitle: { fontSize: screenWidth * 0.035, opacity: 0.8 },
  themeToggleContainer: { flexDirection: "row", alignItems: "center" },
  themeIcon: {
    marginRight: screenWidth * 0.02,
    width: screenWidth * 0.08,
    textAlign: "center",
  },
  themeSwitch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
  menuContainer: { flex: 1, paddingTop: screenHeight * 0.02 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: screenHeight * 0.02,
    paddingHorizontal: screenWidth * 0.05,
    marginHorizontal: screenWidth * 0.03,
    borderRadius: screenWidth * 0.03,
    marginBottom: screenHeight * 0.005,
  },
  menuIcon: {
    marginRight: screenWidth * 0.04,
    width: screenWidth * 0.08,
    textAlign: "center",
  },
  menuText: { fontSize: screenWidth * 0.04, fontWeight: "500", flex: 1 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: screenHeight * 0.02,
    paddingHorizontal: screenWidth * 0.05,
    marginHorizontal: screenWidth * 0.03,
    borderRadius: screenWidth * 0.03,
    marginTop: screenHeight * 0.02,
    marginBottom: screenHeight * 0.01,
    backgroundColor: "transparent",
  },
  footer: {
    padding: screenWidth * 0.05,
    alignItems: "center",
    borderTopWidth: 1,
  },
  footerText: { fontSize: screenWidth * 0.03 },
  redDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
    borderWidth: 1,
    borderColor: "white",
  },
});

export default DrawerContent;
