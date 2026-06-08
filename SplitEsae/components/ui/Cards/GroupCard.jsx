import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

function GroupCard({
  groupName = "Demo Grup",
  members = 3,
  total = "$250",
  onPress,
  groupId,
  isAdmin = false,
  onEditName,
  onEditDescription,
  onInviteUser,
  onManageMembers,
  onDeleteGroup,
}) {
  const { colors } = useTheme();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

 

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.cardBackground },
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.groupName, { color: colors.text.secondary }]}>
            {groupName}
          </Text>

          
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.membersContainer}>
            <Text
              style={[styles.membersText, { color: colors.text.secondary }]}
            >
              Üyeler: {members}
            </Text>
          </View>

          <Text style={[styles.totalText, { color: colors.primary }]}>
            Toplam: {total}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: screenHeight * 0.01,
  },
  card: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.12,
    borderRadius: 10,
    padding: screenWidth * 0.04,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: screenHeight * 0.015,
  },
  groupName: {
    fontSize: screenWidth * 0.045,
    fontWeight: "600",
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  membersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  membersText: {
    fontSize: screenWidth * 0.035,
    fontWeight: "500",
  },
  totalText: {
    fontSize: screenWidth * 0.035,
    fontWeight: "800",
  },
});
export default GroupCard;
