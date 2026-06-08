// contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getRefreshToken,
  saveRefreshToken,
  deleteRefreshToken,
  saveUserData,
  getUserData,
  clearAllSecureData,
} from "../utils/secureStorage";
import api from "../utils/api";
import { userAPI } from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateAccessToken = (token) => {
    setAccessToken(token);
    global.currentAccessToken = token;
  };

  const login = async (email, password) => {
    try {
      // Reset token refresh attempts counter
      global.tokenRefreshAttempts = 0;
      
      const res = await api.post("/auth/login", { email, password });
      const { user: userData, tokens } = res.data.data;
      const { accessToken, refreshToken } = tokens;

      if (!accessToken || !refreshToken) {
        console.error("❌ [AUTH] Invalid tokens received");
        return { success: false, error: "Invalid authentication tokens" };
      }

      updateAccessToken(String(accessToken));
      await saveRefreshToken(String(refreshToken));
      
      if (userData && typeof userData === 'object') {
        await saveUserData(userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.warn("⚠️ [AUTH] Invalid user data received, storing empty object");
        await saveUserData({});
        setUser({});
        setIsAuthenticated(true);
      }

      return { success: true };
    } catch (err) {
      console.error("💥 [AUTH] Login error:", err);
      // Clean any old data in case of login failure
      await clearAllSecureData();
      setUser(null);
      setIsAuthenticated(false);
      updateAccessToken(null);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        console.log("❌ [AUTH] No refresh token found");
        throw new Error("No refresh token found");
      }

      // Add delay before attempting token refresh
      await new Promise(resolve => setTimeout(resolve, 1000));

      const res = await api.post("/auth/refresh-token", { refreshToken });
      const { accessToken: newAccessToken, user: userData } = res.data.data;

      updateAccessToken(String(newAccessToken));
      
      if (userData && typeof userData === 'object') {
        await saveUserData(userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.warn("⚠️ [AUTH] Invalid user data received during token refresh");
      }

      return newAccessToken;
    } catch (err) {
      console.error("💥 [AUTH] Token refresh error:", err);
      // Avoid immediate logout in case of token refresh failure
      if (err.response?.status === 401) {
        await deleteRefreshToken();
        setUser(null);
        setIsAuthenticated(false);
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Reset token refresh attempts counter
      global.tokenRefreshAttempts = 0;

      if (accessToken) {
        try {
          const storedRefreshToken = await getRefreshToken();
          await api.post("/auth/logout", { refreshToken: storedRefreshToken });
          console.log("✅ [AUTH] Logged out successfully");
        } catch (err) {
          console.warn("⚠️ [AUTH] Error during logout API call:", err.message);
          // Continue cleaning local data even if logout request fails
        }
      }
    } finally {
      try {
        // Clean all local data
        await clearAllSecureData();
        updateAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
        console.log("✅ [AUTH] Local data cleared successfully");
      } catch (err) {
        console.error("💥 [AUTH] Error clearing local data:", err);
        // If data cleanup fails, at least try to set state to unauthenticated
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  const tryAutoLogin = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 [AUTH] Attempting auto login...");

      const [refreshToken, userData] = await Promise.all([
        getRefreshToken(),
        getUserData()
      ]);

      if (!refreshToken) {
        console.log("ℹ️ [AUTH] No refresh token found, skipping auto login");
        return;
      }

      if (!userData) {
        console.log("ℹ️ [AUTH] No user data found, skipping auto login");
        await deleteRefreshToken(); // Clean token if no user data
        return;
      }

      console.log("✅ [AUTH] Found stored credentials, attempting token refresh");
      await refreshAccessToken();
      console.log("✅ [AUTH] Auto login successful");
      
    } catch (err) {
      console.error("💥 [AUTH] Auto login failed:", err);
      // Don't logout immediately, just clean data
      await clearAllSecureData();
      setUser(null);
      setIsAuthenticated(false);
      updateAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    tryAutoLogin();
  }, []);

  // Add profile update function
  const updateUserProfile = async (profileData) => {
    try {
      const res = await userAPI.updateProfile(profileData);
      const updatedUser = res.data.user;
      
      // Update user data in local state
      setUser(updatedUser);
      
      // Save updated data in secure storage
      await saveUserData(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Add profile fetch function
  const fetchUserProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      const userData = res.data.user;
      
      setUser(userData);
      await saveUserData(userData);
      
      return userData;
    } catch (error) {
      console.error("Fetch profile error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user, // Add currentUser as alias for user
        accessToken,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshAccessToken,
        updateUserProfile,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
