import React, { useState, useMemo } from "react";
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
import { debtsAPI, groupsAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function AddDebtScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  // Get data from route params
  const { groupId, groupName, groupMembers = [] } = route.params || {};
  const { debtId } = route.params || {};
  const isEditing = !!debtId;

  const [selectedCreditor, setSelectedCreditor] = useState("");
  const [selectedDebtors, setSelectedDebtors] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Get all members - normalize IDs and remove duplicates
  const allMembers = React.useMemo(() => {
    const currentUser = { _id: user.id, name: user.name };
    const otherMembers = (groupMembers || [])
      .filter(m => {
        const memberId = m._id || m.id || m.userId;
        return memberId && memberId !== user.id;
      })
      .map(m => ({
        _id: m._id || m.id || m.userId,
        name: m.name,
      }));
    return [currentUser, ...otherMembers];
  }, [groupMembers, user]);

  const toggleDebtor = (memberId) => {
    setSelectedDebtors(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedCreditor) {
      Alert.alert("Hata", "Lütfen parayı alacak kişiyi (alacaklı) seçin");
      return;
    }

    if (selectedDebtors.length === 0) {
      Alert.alert("Hata", "Lütfen en az bir borçlu seçin");
      return;
    }

    if (selectedDebtors.includes(selectedCreditor)) {
      Alert.alert("Hata", "Alacaklı aynı zamanda borçlu olamaz");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Hata", "Lütfen geçerli bir tutar girin");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Hata", "Lütfen bir açıklama girin");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const debtData = {
        groupId,
        creditorId: selectedCreditor,
        participants: selectedDebtors,
        amount: parseFloat(amount),
        description: description.trim(),
      };

      console.log("Creating debt with data:", debtData);

      const response = await debtsAPI.createDebt(groupId, debtData);

      if (response.success) {
        setMessage("✅ Borç başarıyla eklendi!");
        Alert.alert("Başarılı", "Borç başarıyla eklendi!");
        
        // Reset form
        setAmount("");
        setDescription("");
        setSelectedCreditor("");
        setSelectedDebtors([]);
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
        
      } else {
        throw new Error(response.message || 'Borç oluşturulamadı');
      }
      
    } catch (error) {
      console.error("❌ Error creating debt:", error);
      
      let errorMessage = 'Borç oluşturulamadı. Lütfen tekrar deneyin.';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Geçersiz borç verisi';
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
          {isEditing ? "Borcu Düzenle" : "Borç Ekle"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.form, { backgroundColor: colors.cardBackground }]}>
          
          {/* Creditor (Who will receive money) - Single Select */}
          <View style={styles.memberSection}>
            <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>
              Alacaklı (Parayı alacak kişi) *
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
              {allMembers.map((member) => {
                const isSelected = selectedCreditor === member._id;
                
                return (
                  <TouchableOpacity
                    key={`creditor-${member._id}`}
                    style={styles.checkboxItem}
                    onPress={() => {
                      setSelectedCreditor(isSelected ? "" : member._id);
                    }}
                  >
                    <View
                      style={[styles.radioButton, { borderColor: isSelected ? colors.primary : colors.border }]}
                    >
                      {isSelected && (
                        <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.checkboxLabel,
                        { color: colors.text.primary },
                      ]}
                    >
                      {member.name} {member._id === user.id ? '(Sen)' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Debtors (Who owe money) - Multi Select */}
          <View style={styles.memberSection}>
            <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>
              Borçlular (Borçlu olan kişiler) *
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
              {allMembers.map((member) => {
                const isSelected = selectedDebtors.includes(member._id);
                const isCreditor = selectedCreditor === member._id;
                
                return (
                  <TouchableOpacity
                    key={`debtor-${member._id}`}
                    style={[styles.checkboxItem, isCreditor && { opacity: 0.4 }]}
                    onPress={() => {
                      if (!isCreditor) {
                        toggleDebtor(member._id);
                      }
                    }}
                    disabled={isCreditor}
                  >
                    <View
                      style={[styles.checkbox, { borderColor: isSelected ? colors.primary : colors.border }]}
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
                      {member.name} {member._id === user.id ? '(Sen)' : ''}
                      {isCreditor ? ' (Alacaklı)' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
            required={true}
          />
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <UnifiedButton
            title={isEditing ? "Borcu Güncelle" : "Borç Ekle"}
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
  memberSection: {
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
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: screenWidth * 0.03,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    marginRight: screenWidth * 0.03,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
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

export default AddDebtScreen;
