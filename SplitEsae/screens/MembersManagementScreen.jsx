import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { groupsAPI } from "../utils/api";
import { Header } from "../components";
import DropdownMenu from "../components/ui/DropdownMenu/DropdownMenu";
import { useAuth } from "../contexts/AuthContext"; // Current user

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const MembersManagementScreen = ({ route }) => {
  const { colors } = useTheme();
  const { currentUser } = useAuth(); // Current user
  const { groupId } = route.params;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [selectedMember, setSelectedMember] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchMembers();
    }, [])
  );

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await groupsAPI.getGroupMembers(groupId);
      setMembers(res.data || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Üyeler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Change role
  const handleChangeRole = async (member) => {
    const admins = members.filter((m) => m.role === "admin");

    // Prevent removing admin privileges if it's the user himself or the only admin
    if (member.role === "admin") {
      if (admins.length === 1) {
        Alert.alert(
          "İşleme İzin Verilmiyor",
          "Bu üye tek yönetici. Yönetici rolünü kaldıramazsınız."
        );
        return;
      }
      if (member._id === currentUser._id) {
        Alert.alert(
          "İşleme İzin Verilmiyor",
          "Kendi yönetici rolünüzü kaldıramazsınız."
        );
        return;
      }
    }

    const newRole = member.role === "member" ? "admin" : "member";

    Alert.alert(
      "Rol Değiştir",
      `${member.name} kullanıcısını ${
        newRole === "admin" ? "Yönetici yapmak" : "Yöneticilikten çıkarmak"
      } istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet",
          onPress: async () => {
            try {
              setLoadingUserId(member._id);
              await groupsAPI.changeMemberRole(groupId, member._id, newRole);
              Alert.alert("Başarılı", `${member.name} artık ${newRole === 'admin' ? 'yönetici' : 'üye'}`);
              fetchMembers();
            } catch (err) {
              console.error("Error updating role:", err);
              Alert.alert("Hata", "Rol güncellenemedi");
            } finally {
              setLoadingUserId(null);
            }
          },
        },
      ]
    );
  };

  // Delete member
  const handleDeleteMember = async (member) => {
    const admins = members.filter((m) => m.role === "admin");

    // Prevent deleting the only admin or himself
    if (member.role === "admin" && (admins.length === 1 || member._id === currentUser._id)) {
      Alert.alert(
        "İşleme İzin Verilmiyor",
        "Bu üye tek yönetici olduğu veya kendiniz olduğunuz için kaldırılamıyor."
      );
      return;
    }

    Alert.alert(
      "Üyeyi Kaldır",
      `${member.name} üyesini kaldırmak istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet",
          onPress: async () => {
            try {
              setLoadingUserId(member._id);
              await groupsAPI.removeMember(groupId, member._id);
              Alert.alert("Başarılı", "Üye başarıyla kaldırıldı");
              fetchMembers();
            } catch (err) {
              console.error("Error removing member:", err);
              Alert.alert("Hata", "Üye kaldırılamadı");
            } finally {
              setLoadingUserId(null);
            }
          },
        },
      ]
    );
  };

  const openDropdown = (member, event) => {
    member && setSelectedMember(member);
    event?.target && event.nativeEvent
      ? setDropdownPosition({
          x: event.nativeEvent.pageX,
          y: event.nativeEvent.pageY,
        })
      : setDropdownPosition({ x: screenWidth * 0.1, y: screenHeight * 0.2 });
    setDropdownVisible(true);
  };

  const renderItem = ({ item }) => (
    <View
      style={[styles.memberCard, { backgroundColor: colors.cardBackground }]}
    >
      <View style={styles.memberInfo}>
        <View
          style={[styles.memberAvatar, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: screenWidth * 0.03 }}>
          <Text style={[styles.memberName, { color: colors.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.memberEmail, { color: colors.text.secondary }]}>
            {item.email}
          </Text>
        </View>
        <TouchableOpacity onPress={(e) => openDropdown(item, e)}>
          <Ionicons
            name="ellipsis-vertical"
            size={screenWidth * 0.06}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <Header title="Üye Yönetimi" />

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.loaderContainer}>
          <Text style={{ color: colors.text.primary }}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={members}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: screenWidth * 0.05 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons
                name="people-outline"
                size={screenWidth * 0.12}
                color={colors.text.secondary}
              />
              <Text style={{ color: colors.text.secondary, marginTop: 10 }}>
                Üye bulunamadı.
              </Text>
            </View>
          }
        />
      )}

      {selectedMember && (
        <DropdownMenu
          visible={dropdownVisible}
          onClose={() => setDropdownVisible(false)}
          triggerPosition={dropdownPosition}
          options={[
            {
              title:
                selectedMember.role === "member"
                  ? "Yönetici Yap"
                  : "Yöneticiliği Kaldır",
              icon: "shield-checkmark",
              onPress: () => handleChangeRole(selectedMember),
            },
            {
              title: "Üyeyi Kaldır",
              icon: "trash",
              type: "destructive",
              onPress: () => handleDeleteMember(selectedMember),
            },
          ]}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: screenHeight * 0.05,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: screenWidth * 0.04,
    borderRadius: 12,
    marginBottom: screenHeight * 0.015,
    borderLeftWidth: 3,
    borderLeftColor: "#377ed1",
  },
  memberInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  memberAvatar: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    borderRadius: screenWidth * 0.06,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
  },
  memberName: { fontSize: screenWidth * 0.04, fontWeight: "600" },
  memberEmail: { fontSize: screenWidth * 0.032, marginTop: 2 },
});

export default MembersManagementScreen;
