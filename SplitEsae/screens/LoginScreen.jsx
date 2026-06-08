import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getApiUrl, testServerConnection } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { FormInput } from "../components"; // Add FormInput import
import { UnifiedButton } from "../components";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Use useAuth to access login function
  const { login } = useAuth();

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "E-posta gereklidir";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Geçersiz e-posta formatı";
    }

    if (!password.trim()) {
      newErrors.password = "Şifre gereklidir";
    } else if (password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to test server connection
  const handleTestConnection = async () => {
    try {
      const isConnected = await testServerConnection();

      if (isConnected) {
        Alert.alert("✅ Bağlantı Başarılı", "Sunucu düzgün çalışıyor!");
      } else {
        Alert.alert(
          "⚠️ Bağlantı Başarısız",
          `Sunucuya ulaşılamıyor.\n\nLütfen kontrol edin:\n• Sunucu 5001 portunda çalışıyor mu\n• Ağ ayarları\n• Doğru adres kullanılıyor mu:\n  - Android emülatör: 10.0.2.2:5001\n  - iOS emülatör: localhost:5001\n  - Gerçek cihaz: Bilgisayar IP`
        );
      }
    } catch (error) {
      Alert.alert("❌ Bağlantı Hatası", error.message);
    }
  };

  // Updated login function
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        // Login successful - no need to navigate here
        // Navigation will be handled automatically through AuthenticatedNavigator
      } else {
        // Handle error
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "Giriş sırasında bir hata oluştu" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#377ED1", "#0f6bd9", "#0250ad"]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Title */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Ionicons name="wallet" size={60} color="white" />
            </View>
            <Text style={styles.title}>SplitEase</Text>
            <Text style={styles.subtitle}>Tekrar Hoş Geldiniz</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* General Error Message */}
            {errors.general && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="white" />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            {/* Email Field using FormInput */}
            <FormInput
              label="E-posta"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: null }));
                }
              }}
              placeholder="E-postanızı girin"
              leftIcon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              labelColor="white"
              textColor="white"
              placeholderColor="rgba(255,255,255,0.6)"
              iconColor="white"
              borderColor="rgba(255,255,255,0.5)"
              focusedBorderColor="white"
              required
            />

            {/* Password Field using FormInput */}
            <FormInput
              label="Şifre"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: null }));
                }
              }}
              placeholder="Şifrenizi girin"
              leftIcon="lock-closed"
              secureTextEntry
              showPasswordToggle
              autoCorrect={false}
              error={errors.password}
              labelColor="white"
              textColor="white"
              placeholderColor="rgba(255,255,255,0.6)"
              iconColor="white"
              borderColor="rgba(255,255,255,0.5)"
              focusedBorderColor="white"
              required
            />

            {/* Login Button */}
            <UnifiedButton
              title={loading ? "Yükleniyor..." : "Giriş Yap"}
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
              style={styles.loginButton}
              textColor="#0250ad"
            />

            {/* Additional Links */}
            <View style={styles.linksContainer}>
              {/* Test Connection Button */}
              <TouchableOpacity
                onPress={handleTestConnection}
                style={styles.testButton}
              >
                <Ionicons
                  name="wifi"
                  size={16}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.testButtonText}>
                  Sunucu Bağlantısını Test Et
                </Text>
              </TouchableOpacity>

              {/* Navigate to Register Screen */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Hesabınız yok mu? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("RegisterScreen")}
                >
                  <Text style={styles.signupLink}>Yeni Hesap Oluştur</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContainer: {
    height: 100,
    flexGrow: 1,
    justifyContent: "center",
  },
  headerContainer: { alignItems: "center", marginBottom: 40 },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: "bold", color: "white", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.8)" },
  formContainer: {
    padding: 30,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: { color: "white", fontSize: 14, marginLeft: 8, flex: 1 },
  loginButton: {
    backgroundColor: "white",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  linksContainer: { marginTop: 20, alignItems: "center" },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "center",
  },
  signupText: {
    color: "#8abfff",
    fontSize: 14,
  },
  signupLink: {
    color: "#eeeeee",
    fontSize: 14,
    fontWeight: "bold",
  },
  testButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#0250ad",
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  testButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default LoginScreen;
