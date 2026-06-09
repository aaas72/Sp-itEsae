import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import FormInput from "../components/ui/Forms/FormInput";
import { UnifiedButton } from "../components";
import { transactionsAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function AddTransactionScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  // Get data from route params
  const { groupId, groupName, groupMembers = [], groupCurrency } = route.params || {};
  const { transactionId } = route.params || {};
  const isEditing = !!transactionId;

  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const categories = [
    { label: "Yiyecek & İçecek", value: "food" },
    { label: "Ulaşım", value: "transport" },
    { label: "Konaklama", value: "accommodation" },
    { label: "Eğlence", value: "entertainment" },
    { label: "Alışveriş", value: "shopping" },
    { label: "Faturalar", value: "utilities" },
    { label: "Diğer", value: "other" },
  ];

  const handleSubmit = async () => {
    if (!selectedRecipients.length || !amount || !description || !category) {
      setMessage(
        "⚠️ Lütfen tüm gerekli alanları doldurun ve alıcıları seçin"
      );
      return;
    }

    if (!groupId) {
      Alert.alert("Hata", "Grup kimliği eksik");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert('Hata', 'Lütfen geçerli bir tutar girin');
        return;
      }

      if (!description.trim()) {
        Alert.alert('Hata', 'Lütfen bir açıklama girin');
        return;
      }

      if (selectedRecipients.length === 0) {
        Alert.alert('Hata', 'Lütfen en az bir alıcı seçin');
        return;
      }

      const expenseData = {
        groupId,
        amount: parseFloat(amount),
        description: description.trim(),
        participants: selectedRecipients,
        currency: groupCurrency || "SAR" // Use group currency passed from parent screen
      };

      console.log("🔄 Creating expense transaction:", expenseData);
      
      const response = await transactionsAPI.createExpenseTransaction(expenseData);
      
      console.log("✅ Transaction created successfully:", response);
      
      const msg = isEditing
        ? "✅ İşlem başarıyla güncellendi!"
        : "✅ İşlem başarıyla eklendi!";
      setMessage(msg);
      
      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
      setSelectedRecipients([]);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
      
    } catch (error) {
      console.error("❌ Error creating transaction:", error);
      
      let errorMessage = 'İşlem oluşturulamadı. Lütfen tekrar deneyin.';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Geçersiz işlem verisi';
        } else if (error.response.status === 401) {
          errorMessage = 'Bu işlemi yapmaya yetkiniz yok';
        } else if (error.response.status === 404) {
          errorMessage = 'Grup bulunamadı';
        } else if (error.response.status >= 500) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin';
        }
      } else if (error.request) {
        errorMessage = 'Ağ hatası. Lütfen bağlantınızı kontrol edip tekrar deneyin';
      }
      
      setMessage(`❌ ${errorMessage}`);
      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.inverse }]}>
          {isEditing ? "İşlemi Düzenle" : "İşlem Ekle"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.form, { backgroundColor: colors.cardBackground }]}>
          {/* Sender */}
          <FormInput
            label="Gönderen (Parayı gönderen kişi)"
            value={user?.name || 'Mevcut Kullanıcı'}
            editable={false}
            icon="person-outline"
            style={styles.readOnlyField}
          />

          {/* Recipients */}
          <View style={styles.recipientSection}>
            <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>
              Alıcılar (Harcamayı paylaşacak kişiler) *
            </Text>
            <View
              style={[
                styles.checkboxContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              {groupMembers.map((member) => {
                const isSelected = selectedRecipients.includes(member.userId || member._id);
                const memberId = member.userId || member._id;
                
                return (
                  <TouchableOpacity
                    key={memberId}
                    style={styles.checkboxItem}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedRecipients(prev => prev.filter(id => id !== memberId));
                      } else {
                        setSelectedRecipients(prev => [...prev, memberId]);
                      }
                    }}
                  >
                    <View
                      style={[styles.checkbox, { borderColor: colors.border }]}
                    >
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.primary}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.checkboxLabel,
                        { color: colors.text.primary },
                      ]}
                    >
                      {member.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {groupMembers.length === 0 && (
                <Text
                  style={[styles.emptyText, { color: colors.text.secondary }]}
                >
                  Bu grupta başka üye yok
                </Text>
              )}
            </View>
          </View>

          {/* Category */}
          <View style={styles.categorySection}>
            <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>
              Kategori *
            </Text>
            <View
              style={[
                styles.checkboxContainer,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={styles.checkboxItem}
                  onPress={() => setCategory(cat.value)}
                >
                  <View
                    style={[styles.checkbox, { borderColor: colors.border }]}
                  >
                    {category === cat.value && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.checkboxLabel,
                      { color: colors.text.primary },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount */}
          <FormInput
            label="Tutar"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            icon="cash-outline"
            required={true}
          />

          {/* Description */}
          <FormInput
            label="Açıklama"
            value={description}
            onChangeText={setDescription}
            placeholder="İşlem açıklamasını girin"
            multiline
            numberOfLines={3}
            icon="document-text-outline"
            required={true}
          />
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <UnifiedButton
            title={isEditing ? "İşlemi Güncelle" : "İşlem Ekle"}
            onPress={handleSubmit}
            variant="floating"
            size="medium"
            icon={isEditing ? "checkmark-outline" : "add-outline"}
            disabled={loading}
            fullWidth
          />
        </View>

        {/* Inline Message */}
        {message && (
          <Text
            style={{
              textAlign: "center",
              marginTop: 10,
              color: colors.text.primary,
            }}
          >
            {message}
          </Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: screenHeight * 0.05,
    paddingBottom: screenHeight * 0.02,
    paddingHorizontal: screenWidth * 0.05,
  },
  backButton: {
    padding: screenWidth * 0.02,
  },
  headerTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: "bold",
  },
  placeholder: {
    width: screenWidth * 0.1,
  },
  content: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.05,
  },
  form: {
    borderRadius: 15,
    padding: screenWidth * 0.05,
    marginTop: screenHeight * 0.02,
  },
  buttonContainer: {
    marginTop: screenHeight * 0.03,
    marginBottom: screenHeight * 0.05,
  },
  readOnlyField: {
    opacity: 0.7,
  },
  recipientSection: {
    marginBottom: screenHeight * 0.02,
  },
  categorySection: {
    marginBottom: screenHeight * 0.02,
  },
  sectionLabel: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    marginBottom: screenHeight * 0.01,
  },
  checkboxContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: screenWidth * 0.03,
    minHeight: screenHeight * 0.08,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: screenHeight * 0.01,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: screenWidth * 0.03,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: {
    fontSize: screenWidth * 0.04,
    flex: 1,
  },
  emptyText: {
    fontSize: screenWidth * 0.035,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: screenHeight * 0.02,
  },
});

export default AddTransactionScreen;
