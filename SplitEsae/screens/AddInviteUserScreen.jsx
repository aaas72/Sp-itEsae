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
import { useInviteUser } from "../hooks/useInviteUser";
import { useGroups } from "../hooks/useGroups";


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function AddInviteUserScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  const { data: groups } = useGroups(); // Fetch all groups for current user
  const inviteUserMutation = useInviteUser();

  const handleInviteUser = async () => {
    if (!email.trim()) {
      Alert.alert("Hata", "Lütfen kullanıcının e-postasını girin");
      return;
    }

    if (!selectedGroup) {
      Alert.alert("Hata", "Lütfen bir grup seçin");
      return;
    }

    if (!currentUser) {
      Alert.alert("Hata", "Lütfen önce giriş yapın");
      return;
    }

    try {
      const response = await inviteUserMutation.mutateAsync({
        email: email.trim(),
        groupId: selectedGroup,
      });

      if (response && response.success) {
        Alert.alert("Başarılı", "Davetiye başarıyla gönderildi!", [
          {
            text: "Tamam",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Hata", response?.message || "Davetiye gönderilemedi");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      let errorMessage = "Davetiye gönderilirken bir hata oluştu";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Hata", errorMessage);
    }
  };

  // Convert groups for use in Picker
  const groupItems = groups?.map((g) => ({
    label: g.name,
    value: g.id,
  })) || [];

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <Header title="Kullanıcı Davet Et" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Davetiye Bilgileri
          </Text>

          <FormInput
            label="Kullanıcı E-postası"
            value={email}
            onChangeText={setEmail}
            placeholder="örn., kullanici@example.com"
            icon="mail-outline"
            required
          />

          <Picker
            label="Grup Seçin"
            selectedValue={selectedGroup}
            onValueChange={setSelectedGroup}
            items={groupItems}
            placeholder="Bir grup seçin"
            required
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.infoCard, { backgroundColor: colors.background + "20" }]}>
            <Ionicons
              name="information-circle"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: colors.picker.placeholderColor }]}>
              Kullanıcıları gruplarınıza davet edebilirsiniz. Davet edilen kullanıcı, seçilen gruba katılmak için bir e-posta alacaktır. Davetiye gönderebilmek için grubun yöneticisi olmanız gerekir.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <UnifiedButton
          title={inviteUserMutation.isPending ? "Gönderiliyor..." : "Davetiye Gönder"}
          onPress={handleInviteUser}
          disabled={inviteUserMutation.isPending}
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

export default AddInviteUserScreen;
