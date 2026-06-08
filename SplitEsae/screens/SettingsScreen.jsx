import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Header } from "../components/index";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function SettingsScreen({ navigation }) {
  const { colors, toggleTheme, isDarkMode } = useTheme();

  const settingsItems = [
    {
      id: "theme",
      title: "Tema",
      subtitle: isDarkMode ? "Karanlık Mod" : "Aydınlık Mod",
      icon: "🌙",
      onPress: toggleTheme,
    },
    {
      id: "language",
      title: "Dil",
      subtitle: "Türkçe",
      icon: "🌐",
      onPress: () => console.log("Language settings"),
    },
    {
      id: "notifications",
      title: "Bildirimler",
      subtitle: "Etkin",
      icon: "🔔",
      onPress: () => console.log("Notification settings"),
    },
    {
      id: "privacy",
      title: "Gizlilik",
      subtitle: "Gizlilik Ayarları",
      icon: "🔒",
      onPress: () => console.log("Privacy settings"),
    },
  ];

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <ScrollView style={styles.container}>
        <Header title="Ayarlar" />

        <View style={styles.content}>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingItem,
                { backgroundColor: colors.inputBackground },
              ]}
              onPress={item.onPress}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>{item.icon}</Text>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.settingSubtitle, { color: colors.icon }]}
                  >
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Text style={[styles.arrow, { color: colors.icon }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: screenWidth * 0.05,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: screenWidth * 0.04,
    marginBottom: screenHeight * 0.015,
    borderRadius: 10,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    fontSize: screenWidth * 0.05,
    marginRight: screenWidth * 0.03,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: screenWidth * 0.04,
    fontWeight: "500",
    marginBottom: screenHeight * 0.005,
  },
  settingSubtitle: {
    fontSize: screenWidth * 0.032,
  },
  arrow: {
    fontSize: screenWidth * 0.05,
    fontWeight: "bold",
  },
});

export default SettingsScreen;
