import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { Header, FormInput, UnifiedButton } from "../components/index";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { groupsAPI } from "../utils/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const { currentUser, updateUserProfile, fetchUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Form states
  const [name, setName] = useState(currentUser?.name || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || null);

  // Update data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setAvatar(currentUser.avatar || null);
    }
  }, [currentUser]);

  // Use useFocusEffect to update data when returning to screen
  useFocusEffect(
    React.useCallback(() => {
      fetchUserGroups();
      refreshUserProfile();
    }, [])
  );

  const refreshUserProfile = async () => {
    try {
      setProfileLoading(true);
      await fetchUserProfile();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    try {
      setGroupsLoading(true);
      const res = await groupsAPI.getUserGroups();
      setUserGroups(res.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      Alert.alert("Hata", "Gruplar getirilemedi");
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "İzin Gerekli",
          "Fotoğraflarınıza erişmek için izne ihtiyacımız var"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setAvatar(imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Hata", "Görsel seçilemedi");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Lütfen adınızı girin");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        name: name.trim(),
        avatar: avatar,
      };

      await updateUserProfile(updateData);
      setIsEditing(false);
      Alert.alert("Başarılı", "Profil başarıyla güncellendi");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Hata", "Profil güncellenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(currentUser?.name || "");
    setAvatar(currentUser?.avatar || null);
    setIsEditing(false);
  };

  const renderAvatar = () => {
    if (avatar) {
      return <Image source={{ uri: avatar }} style={styles.avatarImage} />;
    } else {
      const displayName = name || currentUser?.name || "U";
      return (
        <View
          style={[
            styles.avatarPlaceholder,
            { backgroundColor: colors.primary },
          ]}
        >
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }
  };

  const renderGroupCard = (group) => (
    <View
      key={group._id}
      style={[styles.groupCard, { backgroundColor: colors.cardBackground }]}
    >
      <View style={styles.groupHeader}>
        <View style={[styles.groupAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.groupAvatarText}>
            {group.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: colors.text.primary }]}>
            {group.name}
          </Text>
          <Text style={[styles.groupMembers, { color: colors.text.secondary }]}>
            {group.totalMembers} üye
          </Text>
        </View>
        <View style={styles.groupRole}>
          <Text
            style={[
              styles.roleText,
              {
                color:
                  group.members?.find((m) => m.userId._id === currentUser?.id)
                    ?.role === "admin"
                    ? colors.success
                    : colors.text.secondary,
              },
            ]}
          >
            {group.members?.find((m) => m.userId._id === currentUser?.id)
              ?.role === "admin"
              ? "Yönetici"
              : "Üye"}
          </Text>
        </View>
      </View>
      {group.description && (
        <Text
          style={[styles.groupDescription, { color: colors.text.secondary }]}
        >
          {group.description}
        </Text>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <ScrollView style={styles.container}>
        <Header title="Profil" />

        <View style={styles.content}>
          {/* Profile Section */}
          <View
            style={[
              styles.profileSection,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.profileHeader}>
              <Text
                style={[styles.sectionTitle, { color: colors.text.primary }]}
              >
                Kişisel Bilgiler
              </Text>
              <UnifiedButton
                icon={isEditing ? "close" : "pencil"}
                iconPosition="only"
                onPress={() => setIsEditing(!isEditing)}
                variant="floating"
                size=""
                style={styles.editButton}
              />
            </View>

            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={isEditing ? handleImagePicker : null}
                disabled={!isEditing}
              >
                {renderAvatar()}
                {isEditing && (
                  <View
                    style={[
                      styles.avatarOverlay,
                      { backgroundColor: "rgba(0,0,0,0.5)" },
                    ]}
                  >
                    <Ionicons
                      name="camera"
                      size={screenWidth * 0.06}
                      color="white"
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Name Section */}
            {isEditing ? (
              <View style={styles.formSection}>
                <FormInput
                  label="Ad"
                  value={name}
                  onChangeText={setName}
                  placeholder="Adınızı girin"
                  required
                  textColor="ffffff"
                  labelColor="ffffff"
                  borderColor="#377ed1"
                />
              </View>
            ) : (
              <View style={styles.infoSection}>
                <Text
                  style={[styles.infoLabel, { color: colors.text.secondary }]}
                >
                  Ad
                </Text>
                <Text
                  style={[styles.infoValue, { color: colors.text.primary }]}
                >
                  {currentUser?.name || "Belirtilmemiş"}
                </Text>
              </View>
            )}

            {/* Email Section (Read Only) */}
            <View style={styles.infoSection}>
              <Text
                style={[styles.infoLabel, { color: colors.text.secondary }]}
              >
                E-posta
              </Text>
              <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                {currentUser?.email || "Belirtilmemiş"}
              </Text>
            </View>

            {/* Action Buttons */}
            {isEditing && (
              <View style={styles.buttonSection}>
                <UnifiedButton
                  title={loading ? "Kaydediliyor..." : "Kaydet"}
                  onPress={handleSave}
                  disabled={loading}
                  variant="default"
                  size="medium"
                  style={styles.saveButton}
                />
                <UnifiedButton
                  title="İptal"
                  onPress={handleCancel}
                  variant="outline"
                  size="medium"
                  style={styles.cancelButton}
                />
              </View>
            )}
          </View>

          {/* Groups Section */}
          <View
            style={[
              styles.groupsSection,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: colors.text.primary }]}
              >
                Gruplarım ({userGroups.length})
              </Text>
            </View>

            {groupsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[styles.loadingText, { color: colors.text.secondary }]}
                >
                  Gruplar yükleniyor...
                </Text>
              </View>
            ) : userGroups.length > 0 ? (
              <View style={styles.groupsList}>
                {userGroups.map(renderGroupCard)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="people-outline"
                  size={screenWidth * 0.12}
                  color={colors.text.secondary}
                />
                <Text
                  style={[styles.emptyText, { color: colors.text.secondary }]}
                >
                  Henüz grup yok
                </Text>
                <Text
                  style={[
                    styles.emptySubtext,
                    { color: colors.text.secondary },
                  ]}
                >
                  Başlamak için yeni bir grup oluşturun
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: screenWidth * 0.05,
  },
  profileSection: {
    borderRadius: 12,
    padding: screenWidth * 0.05,
    marginBottom: screenHeight * 0.02,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: screenHeight * 0.02,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
  },
  editButton: {
    width: screenWidth * 0.1,
    height: screenWidth * 0.1,
    borderRadius: screenWidth * 0.05,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: screenHeight * 0.03,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.25,
    borderRadius: screenWidth * 0.125,
    borderWidth: 3,
    borderColor: "#377ed1",
  },
  avatarPlaceholder: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.25,
    borderRadius: screenWidth * 0.125,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#377ed1",
  },
  avatarText: {
    fontSize: screenWidth * 0.08,
    fontWeight: "bold",
    color: "white",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: screenWidth * 0.125,
    justifyContent: "center",
    alignItems: "center",
  },
  formSection: {
    marginBottom: screenHeight * 0.02,
    padding: screenWidth * 0.04,
    borderRadius: 10,
  },
  infoSection: {
    marginBottom: screenHeight * 0.02,
    backgroundColor: "#F5F5F5",
    padding: screenWidth * 0.04,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#377ed1",
  },
  infoLabel: {
    fontSize: screenWidth * 0.035,
    marginBottom: 8,
    fontWeight: "600",
    color: "#377ed1",
  },
  infoValue: {
    fontSize: screenWidth * 0.04,
    fontWeight: "500",
    color: "#333",
  },
  buttonSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: screenHeight * 0.02,
    gap: screenWidth * 0.03,
  },
  saveButton: {
    flex: 0.48,
    backgroundColor: "#377ed1",
    borderRadius: 8,
  },
  cancelButton: {
    flex: 0.48,
    borderColor: "#377ed1",
    borderWidth: 2,
    borderRadius: 8,
  },
  groupsSection: {
    borderRadius: 12,
    padding: screenWidth * 0.05,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: screenHeight * 0.02,
    paddingBottom: screenHeight * 0.01,
  },
  addButton: {
    width: screenWidth * 0.08,
    height: screenWidth * 0.08,
    borderRadius: screenWidth * 0.04,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: screenHeight * 0.03,
  },
  loadingText: {
    marginTop: 10,
    fontSize: screenWidth * 0.035,
  },
  groupsList: {
    gap: screenHeight * 0.015,
  },
  groupCard: {
    padding: screenWidth * 0.04,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#377ed1",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupAvatar: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    borderRadius: screenWidth * 0.06,
    justifyContent: "center",
    alignItems: "center",
    marginRight: screenWidth * 0.03,
    borderWidth: 2,
    borderColor: "#377ed1",
  },
  groupAvatarText: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
    color: "white",
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: screenWidth * 0.04,
    fontWeight: "600",
    marginBottom: 2,
  },
  groupMembers: {
    fontSize: screenWidth * 0.032,
  },
  groupRole: {
    alignItems: "flex-end",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: screenWidth * 0.032,
    fontWeight: "600",
    color: "#377ed1",
  },
  groupDescription: {
    fontSize: screenWidth * 0.032,
    marginTop: screenHeight * 0.01,
    lineHeight: screenWidth * 0.045,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: screenHeight * 0.05,
  },
  emptyText: {
    fontSize: screenWidth * 0.04,
    fontWeight: "500",
    marginTop: screenHeight * 0.01,
  },
  emptySubtext: {
    fontSize: screenWidth * 0.032,
    marginTop: 5,
    textAlign: "center",
  },
});

export default ProfileScreen;
