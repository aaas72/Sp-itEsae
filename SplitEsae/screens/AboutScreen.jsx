import React from "react";
import {
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Header } from "../components/index";
import { LinearGradient } from "expo-linear-gradient";


function AboutScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <ScrollView style={styles.container}>
        <Header title="Hakkımızda" />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AboutScreen;
