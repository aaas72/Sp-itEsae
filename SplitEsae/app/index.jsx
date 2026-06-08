import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../utils/queryClient";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { DrawerContent } from "../components";
import { ActivityIndicator, View, StyleSheet } from "react-native";

// Import screens
import MainScreen from "../screens/MainScreen";
import GroupDetailScreen from "../screens/GroupDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AboutScreen from "../screens/AboutScreen";
import DebtsScreen from "../screens/DebtsScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import ActivitiesScreen from "../screens/ActivitiesScreen";
import AnalystsScreen from "../screens/AnalystsScreen";
import AddTransactionScreen from "../screens/AddTransactionScreen";
import AddDebtScreen from "../screens/AddDebtScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen"; // Add import
import EditGroupScreen from "../screens/EditGroupScreen";
import AddInviteUserScreen from "../screens/AddInviteUserScreen";
import PendingInvitationsScreen from "../screens/PendingInvitationsScreen";
import MembersManagementScreen from "../screens/MembersManagementScreen";
import EditDebtScreen from "../screens/EditDebtScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="LoginScreen"
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="MainScreen"
    >
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />
      <Stack.Screen name="EditGroupScreen" component={EditGroupScreen} />
      <Stack.Screen name="DebtsScreen" component={DebtsScreen} />
      <Stack.Screen name="AddDebt" component={AddDebtScreen} />
      <Stack.Screen name="EditDebt" component={EditDebtScreen} />
      <Stack.Screen name="AddInviteUserScreen" component={AddInviteUserScreen} />
      <Stack.Screen name="TransactionsScreen" component={TransactionsScreen} />
      <Stack.Screen name="ActivitiesScreen" component={ActivitiesScreen} />
      <Stack.Screen name="AnalystsScreen" component={AnalystsScreen} />
      <Stack.Screen
        name="AddTransactionScreen"
        component={AddTransactionScreen}
      />
      <Stack.Screen
        name="MembersManagementScreen"
        component={MembersManagementScreen}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
      }}
    >
      <Drawer.Screen name="Main" component={MainStack} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen
        name="PendingInvitationsScreen"
        component={PendingInvitationsScreen}
      />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
}

// Main navigation component with authentication state check
function AuthenticatedNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading screen while checking authentication state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="App" component={AppNavigator} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth" component={AuthStack} />
    </Stack.Navigator>
  );
}

// Main app navigation
// Main application navigation
function RootNavigator() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AuthenticatedNavigator />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RootNavigator;
