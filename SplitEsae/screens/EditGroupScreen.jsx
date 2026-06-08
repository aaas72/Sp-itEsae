import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { Header, FormInput, Picker, UnifiedButton } from "../components";
import { groupsAPI } from "../utils/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function EditGroupScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  // Get group ID from parameters
  const { groupId, groupData: initialGroupData } = route.params || {};

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [groupData, setGroupData] = useState(null);

  const currencies = [
    { value: "USD", label: "ABD Doları" },
    { value: "EUR", label: "Avro" },
    { value: "SAR", label: "Suudi Riyali" },
    { value: "AED", label: "BAE Dirhemi" },
    { value: "EGP", label: "Mısır Lirası" },
    { value: "TRY", label: "Türk Lirası" },
  ];

  // Function to fetch group data
  const fetchGroupData = async () => {
    if (initialGroupData) {
      setGroupData(initialGroupData);
      setGroupName(initialGroupData.name || "");
      setDescription(initialGroupData.description || "");
      setCurrency(initialGroupData.currency || "");
      setLoading(false);
      return;
    }

    if (!groupId) {
      Alert.alert("Hata", "Grup kimliği gereklidir");
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const response = await groupsAPI.getGroupDetails(groupId);

      if (response.success) {
        const group = response.data;
        setGroupData(group);
        setGroupName(group.name || "");
        setDescription(group.description || "");
        setCurrency(group.currency || "");
      } else {
        Alert.alert("Hata", "Grup verileri getirilemedi");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
      Alert.alert("Hata", "Grup verileri getirilemedi");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to update data when returning to screen
  useFocusEffect(
    React.useCallback(() => {
      fetchGroupData();
    }, [groupId])
  );

  const handleUpdateGroup = async () => {
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

    const updatedData = {
      name: groupName.trim(),
      description: description.trim(),
      currency: currency,
    };

    try {
      setUpdating(true);
      const response = await groupsAPI.updateGroup(groupId, updatedData);

      if (response && response.success) {
        Alert.alert("Başarılı", "Grup başarıyla güncellendi!", [
          {
            text: "Tamam",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert("Hata", response?.message || "Grup güncellenemedi");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      let errorMessage = "Grup güncellenirken bir hata oluştu";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Hata", errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.container}
      >
        <Header
          title="Grubu Düzenle"
          showBackButton={true}
          showMenuButton={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.primary }]}>
            Grup verisi yükleniyor...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <Header title="Grubu Düzenle" showBackButton={true} showMenuButton={false} />

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
          />

          <Picker
            label="Para Birimi"
            selectedValue={currency}
            onValueChange={setCurrency}
            items={currencies}
            placeholder="Para Birimi Seçin"
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
            <Text
              style={[
                styles.infoText,
                { color: colors.picker.placeholderColor },
              ]}
            >
              Değişiklikler gruba hemen uygulanacaktır. Tüm üyeler güncellenmiş bilgileri görecektir.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <UnifiedButton
          title={updating ? "Güncelleniyor..." : "Grubu Güncelle"}
          onPress={handleUpdateGroup}
          disabled={updating}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: screenHeight * 0.02,
    fontSize: screenWidth * 0.04,
  },
});

export default EditGroupScreen;
