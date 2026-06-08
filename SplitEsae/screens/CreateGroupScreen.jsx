import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { Header, FormInput, Picker, UnifiedButton } from "../components";
import { useCreateGroup } from "../hooks/useGroups";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function CreateGroupScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const navigation = useNavigation();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState(""); // No default, user must select

  const createGroupMutation = useCreateGroup();

  const currencies = [
    { value: "USD", label: "ABD Doları" },
    { value: "EUR", label: "Avro" },
    { value: "SAR", label: "Suudi Riyali" },
    { value: "AED", label: "BAE Dirhemi" },
    { value: "EGP", label: "Mısır Lirası" },
    { value: "TRY", label: "Türk Lirası" },
  ];

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Hata", "Lütfen grup adını girin");
      return;
    }

    if (!currency) {
      Alert.alert("Hata", "Lütfen bir para birimi seçin");
      return;
    }

    if (!currentUser) {
      Alert.alert("Hata", "Lütfen önce giriş yapın");
      return;
    }

    const groupData = {
      name: groupName.trim(),
      description: description.trim(),
      currency: currency,
    };

    try {
      const response = await createGroupMutation.mutateAsync(groupData);
      
      if (response && response.success) {
        Alert.alert("Başarılı", "Grup başarıyla oluşturuldu!", [
          {
            text: "Tamam",
            onPress: () => {
              // Return to main screen instead of navigating to group details
              navigation.navigate("MainScreen");
            },
          },
        ]);
      } else {
        Alert.alert("Hata", response?.message || "Grup oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      let errorMessage = "Grup oluşturulurken bir hata oluştu";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Hata", errorMessage);
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <Header title="Yeni Grup"  />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Information */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Grup Bilgileri
          </Text>

          <FormInput
            label="Grup Adı"
            value={groupName}
            onChangeText={setGroupName}
            placeholder="örn., Dubai Gezisi, Ofis Öğle Yemeği"
            icon="people-outline"
            required
          />

          <FormInput
            label="Açıklama (İsteğe Bağlı)"
            value={description}
            onChangeText={setDescription}
            placeholder="Grup hakkında kısa açıklama"
            icon="document-text-outline"
            required
          />

          <Picker
            label="Para Birimi"
            selectedValue={currency}
            onValueChange={setCurrency}
            items={currencies}
            placeholder={currency}
            required
          />
        </View>

        {/* Info Card */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.background + "20" },
            ]}
          >
            <Ionicons
              name="information-circle"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: colors.picker.placeholderColor }]}>
              Bu grubun yöneticisi siz olacaksınız ve üye davet edebilir, harcamaları yönetebilir ve grup ayarlarını kontrol edebilirsiniz.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <UnifiedButton
          title={createGroupMutation.isPending ? "Oluşturuluyor..." : "Grup Oluştur"}
          onPress={handleCreateGroup}
          disabled={createGroupMutation.isPending}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: screenWidth * 0.05,
  },
  section: {
    borderRadius: 12,
    padding: screenWidth * 0.05,
    marginBottom: screenHeight * 0.02,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
    marginBottom: screenHeight * 0.02,
  },
  infoCard: {
    flexDirection: "row",
    padding: screenWidth * 0.04,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: screenWidth * 0.035,
    lineHeight: screenWidth * 0.05,
    marginLeft: screenWidth * 0.03,
    flex: 1,
  },
  buttonContainer: {
    padding: screenWidth * 0.05,
    paddingTop: screenHeight * 0.02,
  },
 
});

export default CreateGroupScreen;
