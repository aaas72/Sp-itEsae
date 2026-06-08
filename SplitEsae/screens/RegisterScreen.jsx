import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FormInput, UnifiedButton } from '../components';
import { authAPI } from '../utils/api';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ad soyad gereklidir';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçersiz e-posta formatı';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre onayı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    return newErrors;
  };

  const handleRegister = async () => {
    if (loading) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      await authAPI.register(payload);

      Alert.alert(
        'Kayıt Başarılı ✅',
        'Hesabınız başarıyla oluşturuldu!',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('LoginScreen')
          }
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);

      const apiError = error?.response?.data?.error;
      const fieldErrors = apiError?.details?.errors;

      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        const newErrors = {};
        for (const item of fieldErrors) {
          const field = item?.field;
          const message = item?.message;
          if (!field || !message) continue;
          if (field === 'name') newErrors.fullName = message;
          else if (field === 'confirmPassword') newErrors.confirmPassword = message;
          else newErrors[field] = message;
        }
        setErrors(newErrors);
      } else {
        setErrors({
          general: apiError?.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#377ED1', '#0f6bd9', '#0250ad']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Title */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Ionicons name="person-add" size={60} color="white" />
            </View>
            <Text style={styles.title}>SplitEase</Text>
            <Text style={styles.subtitle}>Yeni Hesap Oluştur</Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            {/* General Error Message */}
            {errors.general && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ff4757" />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            {/* Full Name Field using FormInput */}
            <FormInput
              label="Ad Soyad"
              value={formData.fullName}
              onChangeText={(text) => updateFormData('fullName', text)}
              placeholder="Adınızı ve soyadınızı girin"
              leftIcon="person"
              autoCorrect={false}
              error={errors.fullName}
              labelColor="white"
              textColor="white"
              placeholderColor="rgba(255,255,255,0.6)"
              iconColor="white"
              borderColor="rgba(255,255,255,0.5)"
              focusedBorderColor="white"
              required
            />

            {/* Email Field using FormInput */}
            <FormInput
              label="E-posta"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
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
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
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

            {/* Confirm Password Field using FormInput */}
            <FormInput
              label="Şifre Onayı"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              placeholder="Şifrenizi tekrar girin"
              leftIcon="lock-closed"
              secureTextEntry
              showPasswordToggle
              autoCorrect={false}
              error={errors.confirmPassword}
              labelColor="white"
              textColor="white"
              placeholderColor="rgba(255,255,255,0.6)"
              iconColor="white"
              borderColor="rgba(255,255,255,0.5)"
              focusedBorderColor="white"
              required
            />

            {/* Register Button */}
            <UnifiedButton 
              title={loading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
              onPress={handleRegister}
              disabled={loading}
              loading={loading}
              style={styles.registerButton}
              textColor="#0250ad"
            />

            {/* Additional Links */}
            <View style={styles.linksContainer}>
              {/* Navigate to Login Screen */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                  <Text style={styles.loginLink}>Giriş Yap</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContainer: { alignItems: 'center', marginBottom: 4 },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  formContainer: {
    padding: 30,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: { color: '#ff4757', fontSize: 14, marginLeft: 8, flex: 1 },
  registerButton: {
    backgroundColor: 'white',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  linksContainer: { marginTop: 20, alignItems: 'center' },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  loginText: {
    color: '#8abfff',
    fontSize: 14,
  },
  loginLink: {
    color: '#eeeeee',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
