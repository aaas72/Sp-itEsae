import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FormInput } from "../components/ui/Forms";
import { UnifiedButton } from "../components";
import { debtsAPI } from "../utils/api";
import { useAlert } from "../hooks/useAlert";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function EditDebtScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { showAlert } = useAlert();

  useEffect(() => {
    const params = route.params || {};
    console.log('📝 Route Params:', params);
    if (!params.debtId) {
      console.log('⚠️ Debt ID not found');
      showAlert("Hata", "Borç kimliği bulunamadı");
      navigation.goBack();
      return;
    }
    console.log('✅ Debt ID verified:', params.debtId);
  }, []);

  const {
    debtId,
    amount: initialAmount,
    description: initialDescription = "",
    from,
    to,
    groupMembers,
    currentUser,
    onDebtUpdated,
  } = route.params || {};

  const [amount, setAmount] = useState(
    initialAmount ? initialAmount.toString() : "0"
  );
  const [description, setDescription] = useState(initialDescription);
  const [selectedDebtor, setSelectedDebtor] = useState(from || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    if (!debtId) {
      setMessage("⚠️ Borç kimliği bulunamadı");
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setMessage("⚠️ Lütfen geçerli bir tutar girin");
      return;
    }

    if (!selectedDebtor) {
      setMessage("⚠️ Lütfen bir borçlu seçin");
      return;
    }

    Alert.alert("Düzenlemeyi Onayla", "Bu borcu düzenlemek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Onayla",
        onPress: async () => {
          try {
            setLoading(true);
            setMessage(null);

            const response = await debtsAPI.updateDebt(debtId, {
              amount: parseFloat(amount),
              description: description || "",
              debtorId: groupMembers.find(member => member.name === selectedDebtor)?.id,
            });

            if (response.success) {
              setMessage("✅ Borç başarıyla güncellendi!");
              
              if (typeof onDebtUpdated === "function") {
                onDebtUpdated();
              }

              setTimeout(() => {
                navigation.goBack();
              }, 1500);
            } else {
              setMessage("⚠️ Borç güncellenemedi");
            }
          } catch (error) {
            console.error("💥 Error:", error);
            setMessage(`⚠️ Hata oluştu: ${error.message || "Bilinmeyen hata"}`);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
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
          Borcu Düzenle
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.form, { backgroundColor: colors.cardBackground }]}>
          {/* Creditor */}
          <FormInput
            label="Alacaklı (Borç alacak kişi)"
            value={to || "Belirtilmemiş"}
            editable={false}
            icon="person-outline"
            style={styles.readOnlyField}
          />

          {/* Debtors */}
          <View style={styles.debtorsSection}>
            <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>
              Borçlu (Borçlu olan kişi) *
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
              {groupMembers
                .filter(member => member.name !== to)
                .map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.checkboxItem}
                    onPress={() => setSelectedDebtor(member.name)}
                  >
                    <View
                      style={[styles.checkbox, { borderColor: colors.border }]}
                    >
                      {selectedDebtor === member.name && (
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
            placeholder="Borç açıklamasını girin"
            multiline
            numberOfLines={3}
            icon="document-text-outline"
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <UnifiedButton
            title="Borcu Güncelle"
            onPress={handleSubmit}
            variant="floating"
            size="medium"
            icon="save-outline"
            disabled={loading}
            fullWidth
          />
        </View>

        {/* Inline Message */}
        {message && (
          <Text style={[styles.message, { color: colors.text.primary }]}>
            {message}
          </Text>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  message: {
    textAlign: "center",
    marginVertical: screenHeight * 0.02,
    fontSize: screenWidth * 0.04,
    paddingHorizontal: screenWidth * 0.05,
  },
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
  debtorsSection: {
    marginBottom: screenHeight * 0.02,
  },
  sectionLabel: {
    fontSize: screenWidth * 0.04,
    marginBottom: screenHeight * 0.01,
    fontWeight: "bold",
  },
  checkboxContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: screenWidth * 0.03,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: screenHeight * 0.01,
  },
  checkbox: {
    width: screenWidth * 0.06,
    height: screenWidth * 0.06,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: screenWidth * 0.02,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: screenWidth * 0.04,
  },
});
