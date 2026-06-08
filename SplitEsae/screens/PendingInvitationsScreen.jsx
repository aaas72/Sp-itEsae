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
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { Header, UnifiedButton } from "../components/index";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { groupsAPI } from "../utils/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function PendingInvitationsScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Update when entering screen
  useFocusEffect(
    React.useCallback(() => {
      fetchInvitations();
    }, [])
  );

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await groupsAPI.getPendingInvitations();
      setInvitations(res.data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      Alert.alert("Hata", "Davetiyeler getirilemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId) => {
    try {
      await groupsAPI.acceptInvitation(inviteId);
      Alert.alert("Başarılı", "Gruba katıldınız!");
      fetchInvitations(); // Update list
    } catch (error) {
      console.error("Error accepting invitation:", error);
      Alert.alert("Hata", "Davetiye kabul edilemedi");
    }
  };

  const handleReject = async (inviteId) => {
    try {
      await groupsAPI.rejectInvitation(inviteId);
      Alert.alert("Başarılı", "Davetiye reddedildi");
      fetchInvitations(); 
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      Alert.alert("Hata", "Davetiye reddedilemedi");
    }
  };

  const renderInvitationCard = (invite) => (
    <View
      key={invite._id}
      style={[styles.inviteCard, { backgroundColor: colors.cardBackground }]}
    >
      <View style={styles.inviteHeader}>
        <View style={[styles.groupAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.groupAvatarText}>
            {invite.groupId?.name?.charAt(0).toUpperCase() || "G"}
          </Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: colors.text.primary }]}>
            {invite.groupId?.name || "İsimsiz Grup"}
          </Text>
          <Text style={[styles.invitedBy, { color: colors.text.secondary }]}>
            Davet eden: {invite.invitedBy?.name || "Bilinmiyor"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <UnifiedButton
          title="Kabul Et"
          onPress={() => handleAccept(invite._id)}
          variant="default"
          size="small"
          style={styles.acceptButton}
        />
        <UnifiedButton
          title="Reddet"
          onPress={() => handleReject(invite._id)}
          variant="outline"
          size="small"
          style={styles.rejectButton}
        />
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <ScrollView style={styles.container}>
        <Header title="Bekleyen Davetiyeler" />

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                style={[styles.loadingText, { color: colors.text.secondary }]}
              >
                Davetiyeler yükleniyor...
              </Text>
            </View>
          ) : invitations.length > 0 ? (
            <View style={styles.invitesList}>
              {invitations.map(renderInvitationCard)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="mail-open-outline"
                size={screenWidth * 0.12}
                color={colors.text.secondary}
              />
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                Bekleyen davetiye yok
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.text.secondary }]}
              >
                Birisi sizi bir gruba davet ettiğinde, burada görünecektir
              </Text>
            </View>
          )}
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: screenHeight * 0.03,
  },
  loadingText: {
    marginTop: 10,
    fontSize: screenWidth * 0.035,
  },
  invitesList: {
    gap: screenHeight * 0.015,
  },
  inviteCard: {
    padding: screenWidth * 0.04,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#377ed1",
    marginBottom: screenHeight * 0.015,
  },
  inviteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: screenHeight * 0.015,
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
  invitedBy: {
    fontSize: screenWidth * 0.032,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: screenHeight * 0.01,
    gap: screenWidth * 0.03,
  },
  acceptButton: {
    flex: 0.48,
    backgroundColor: "#377ed1",
    borderRadius: 8,
  },
  rejectButton: {
    flex: 0.48,
    borderColor: "#377ed1",
    borderWidth: 2,
    borderRadius: 8,
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

export default PendingInvitationsScreen;
