import axios from "axios";
import { Platform } from "react-native";
import { getRefreshToken, deleteRefreshToken } from "./secureStorage";

const getApiBaseUrl = () => {
  const emulatorUrl = "http://10.0.2.2:5001/api";
  const localhostUrl = "http://localhost:5001/api";
  // Local network URL for development
  // const localNetworkUrl = "http://192.168.1.101:5001/api";
  // Production URL on Render
  // const productionUrl = "https://splitesae.onrender.com/api";

  if (Platform.OS === "web" || Platform.OS === "ios") {
    return localhostUrl;
  }
  return emulatorUrl; // Default for Android emulator
};

const BASE_URL = getApiBaseUrl();
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = global.currentAccessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track token refresh attempts count
global.tokenRefreshAttempts = global.tokenRefreshAttempts || 0;
const MAX_REFRESH_ATTEMPTS = 3;
const REFRESH_COOLDOWN = 2000; // 2 seconds
let lastRefreshTime = 0;

// Mutex to prevent concurrent token refresh
let isRefreshing = false;
let refreshSubscribers = [];

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      // Check attempts count and time elapsed since last attempt
      const currentTime = Date.now();
      if (global.tokenRefreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        if (currentTime - lastRefreshTime < 30000) {
          console.log("⛔ [AUTH] Too many refresh attempts, please wait");
          await deleteRefreshToken();
          return Promise.reject(error);
        } else {
          global.tokenRefreshAttempts = 0;
        }
      }

      isRefreshing = true;
      global.tokenRefreshAttempts++;
      lastRefreshTime = currentTime;

      try {
        console.log(
          `🔄 [AUTH] Attempting token refresh (attempt ${global.tokenRefreshAttempts}/${MAX_REFRESH_ATTEMPTS})`
        );

        await new Promise((resolve) => setTimeout(resolve, REFRESH_COOLDOWN));

        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          console.log("❌ [AUTH] No refresh token available");
          await deleteRefreshToken();
          isRefreshing = false;
          refreshSubscribers = [];
          throw error;
        }

        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        if (response.data.success) {
          const { accessToken } = response.data.data;
          global.currentAccessToken = accessToken;
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          console.log("✅ [AUTH] Token refreshed, retrying original request");
          global.tokenRefreshAttempts = 0;

          // Notify all queued requests with the new token
          onTokenRefreshed(accessToken);
          isRefreshing = false;

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("💥 [AUTH] Token refresh failed:", refreshError.message);
        isRefreshing = false;
        refreshSubscribers = [];
        if (global.tokenRefreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          console.log("⛔ [AUTH] Max refresh attempts reached");
          await deleteRefreshToken();
        }
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
  refresh: (refreshToken) => api.post("/auth/refresh-token", { refreshToken }),
  validate: () => api.get("/auth/validate"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
};

const debtsAPI = {
  createDebt: async (groupId, debtData) => {
    try {
      const res = await api.post(`/debts/${groupId}`, debtData);
      return res.data;
    } catch (error) {
      console.error("Error creating debt:", error);
      throw error;
    }
  },

  getGroupDebts: async (groupId) => {
    try {
      const res = await api.get(`/debts/group/${groupId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching group debts:", error);
      throw error;
    }
  },

  updateDebt: async (debtId, debtData) => {
    try {
      const res = await api.put(`/debts/${debtId}`, debtData);
      return res.data;
    } catch (error) {
      console.error("Error updating debt:", error);
      throw error;
    }
  },

  deleteDebt: async (debtId) => {
    try {
      const res = await api.delete(`/debts/${debtId}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting debt:", error);
      throw error;
    }
  },

  settleDebt: async (debtId) => {
    try {
      console.log("📡 Sending debt settlement request to API...");
      const res = await api.patch(`/debts/${debtId}/settle`);
      console.log("✅ Received response from API:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error in debt settlement API:", error);
      throw error;
    }
  },
};

const groupsAPI = {
  getUserGroups: async () => {
    try {
      const res = await api.get("/groups");
      return res.data;
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }
  },
  getGroupDetails: async (groupId) => {
    try {
      const res = await api.get(`/groups/${groupId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching group details:", error);
      throw error;
    }
  },
  createGroup: async (data) => {
    try {
      console.log("Creating group with data:", data);
      console.log(
        "Current access token:",
        global.currentAccessToken ? "Present" : "Missing"
      );

      const res = await api.post("/groups", data);
      return res.data;
    } catch (error) {
      console.error("Error creating group:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },
  deleteGroup: async (groupId) => {
    try {
      console.log("Deleting group:", groupId);
      const res = await api.delete(`/groups/${groupId}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting group:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },
  updateGroup: async (groupId, groupData) => {
    try {
      const response = await api.put(`/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  },
  inviteUser: async ({ email, groupId }) => {
    try {
      const res = await api.post(`/groups/${groupId}/invite`, { email });
      return res.data;
    } catch (error) {
      console.error("Error sending invitation:", error);
      throw error;
    }
  },
  getPendingInvitations: async () => {
    try {
      const res = await api.get("/groups/invitations/pending");
      return res.data;
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
      throw error;
    }
  },
  acceptInvitation: async (invitationId) => {
    try {
      const res = await api.post(`/groups/invitations/${invitationId}/accept`);
      return res.data;
    } catch (error) {
      console.error("Error accepting invitation:", error);
      throw error;
    }
  },
  rejectInvitation: async (invitationId) => {
    try {
      const res = await api.delete(
        `/groups/invitations/${invitationId}/reject`
      );
      return res.data;
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      throw error;
    }
  },
  getGroupMembers: async (groupId) => {
    try {
      const res = await api.get(`/groups/${groupId}/members`);
      return res.data;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  },
  removeMember: async (groupId, userId) => {
    try {
      console.log("🔧 [API] Removing member:", userId, "from group:", groupId);
      const res = await api.delete(`/groups/${groupId}/members/${userId}`);
      console.log("✅ [API] Member removed successfully:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "💥 [API] Error removing member:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  changeMemberRole: async (groupId, userId, role) => {
    try {
      console.log(
        "🔧 [API] Changing role of member:",
        userId,
        "in group:",
        groupId,
        "to role:",
        role
      );
      const res = await api.put(`/groups/${groupId}/members/${userId}/role`, {
        role,
      });
      console.log("✅ [API] Member role changed successfully:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "💥 [API] Error changing member role:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getGroupDebts: async (groupId) => {
    try {
      const res = await api.get(`/debts/group/${groupId}`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching debts for group ${groupId}:`, error);
      throw error;
    }
  },
  getUserDebts: async () => {
    try {
      const res = await api.get("/debts/my-debts");
      return res.data;
    } catch (error) {
      console.error("Error fetching user debts:", error);
      throw error;
    }
  },
  createExpenseAndDebts: async (expenseData) => {
    try {
      const res = await api.post("/debts/expenses", expenseData);
      return res.data;
    } catch (error) {
      console.error("Error creating expense and debts:", error);
      throw error;
    }
  },
  settleDebt: async (debtId) => {
    try {
      const res = await api.patch(`/debts/${debtId}/settle`);
      return res.data;
    } catch (error) {
      console.error(`Error settling debt ${debtId}:`, error);
      throw error;
    }
  },
  cancelDebt: async (debtId) => {
    try {
      const res = await api.patch(`/debts/${debtId}/cancel`);
      return res.data;
    } catch (error) {
      console.error(`Error cancelling debt ${debtId}:`, error);
      throw error;
    }
  },
  calculateBalance: async (groupId, userId) => {
    try {
      const res = await api.get(`/debts/balance/${groupId}/${userId}`);
      return res.data;
    } catch (error) {
      console.error(`Error calculating balance:`, error);
      throw error;
    }
  },
  deleteDebt: async (debtId) => {
    try {
      const res = await api.delete(`/debts/${debtId}`);
      return res.data;
    } catch (error) {
      console.error(`Error deleting debt:`, error);
      throw error;
    }
  },

  setleDebt: async (debtId) => {
    try {
      const res = await api.patch(`/debts/${debtId}/settle`);
      return res.data;
    } catch (error) {
      console.error(`Error settling debt:`, error);
      throw error;
    }
  },

  editDebt: async (debtId, debtData) => {
    try {
      const res = await api.put(`/debts/${debtId}`, debtData);
      return res.data;
    } catch (error) {
      console.error(`Error editing debt:`, error);
      throw error;
    }
  },

  settleAllDebts: async (groupId, userId) => {
    try {
      const res = await api.patch(`/debts/settle-all/${groupId}/${userId}`);
      return res.data;
    } catch (error) {
      console.error(`Error settling all debts:`, error);
      throw error;
    }
  },
};

const userAPI = {
  getProfile: async () => {
    try {
      const res = await api.get("/users/me");
      return res.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },
  updateProfile: async (profileData) => {
    try {
      const res = await api.put("/users/profile", profileData);
      return res.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },
  uploadAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await api.put("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },
  deleteAvatar: async () => {
    try {
      const res = await api.delete("/users/avatar");
      return res.data;
    } catch (error) {
      console.error("Error deleting avatar:", error);
      throw error;
    }
  },
};

/**
 * @returns {string}
 */
const getApiUrl = () => BASE_URL;

const analyticsAPI = {
  getGroupTotalAmount: async (groupId) => {
    try {
      console.log(
        "🔍 [Analytics API] Fetching group total amount for groupId:",
        groupId
      );
      const res = await api.get(`/analytics/group/${groupId}/total`);
      console.log(
        "✅ [Analytics API] Group total amount fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Analytics API] Error fetching group total amount:", {
        groupId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  getExpensesCount: async (groupId) => {
    try {
      console.log(
        "🔍 [Analytics API] Fetching expenses count for groupId:",
        groupId
      );
      const res = await api.get(`/analytics/group/${groupId}/total`);
      console.log(
        "✅ [Analytics API] Expenses count fetched successfully:",
        res.data?.data?.totalCount
      );
      return { data: { totalCount: res.data?.data?.totalCount || 0 } };
    } catch (error) {
      console.error("❌ [Analytics API] Error fetching expenses count:", {
        groupId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  getMonthlyAnalysis: async (groupId) => {
    try {
      console.log(
        "🔍 [Analytics API] Fetching monthly analysis for groupId:",
        groupId
      );
      const res = await api.get(`/analytics/group/${groupId}/monthly`);
      console.log(
        "✅ [Analytics API] Monthly analysis fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Analytics API] Error fetching monthly analysis:", {
        groupId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  getUserPatterns: async (groupId) => {
    try {
      console.log(
        "🔍 [Analytics API] Fetching user patterns for groupId:",
        groupId
      );
      const res = await api.get(`/analytics/group/${groupId}/user-patterns`);
      console.log(
        "✅ [Analytics API] User patterns fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Analytics API] Error fetching user patterns:", {
        groupId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  getGroupSummary: async (groupId) => {
    try {
      console.log(
        "🔍 [Analytics API] Fetching group summary for groupId:",
        groupId
      );
      const res = await api.get(`/analytics/group/${groupId}/summary`);
      console.log(
        "✅ [Analytics API] Group summary fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Analytics API] Error fetching group summary:", {
        groupId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};

const transactionsAPI = {
  createExpenseTransaction: async (expenseData) => {
    try {
      console.log(
        "🔍 [Transactions API] Creating expense transaction:",
        expenseData
      );
      const res = await api.post("/transactions/expense", expenseData);
      console.log(
        "✅ [Transactions API] Expense transaction created successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Transactions API] Error creating expense transaction:", {
        expenseData,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  getGroupTransactions: async (groupId, page = 1, limit = 20) => {
    try {
      console.log(
        "🔍 [Transactions API] Fetching group transactions for groupId:",
        groupId
      );
      const res = await api.get(`/transactions/group/${groupId}?page=${page}&limit=${limit}`);
      console.log(
        "✅ [Transactions API] Group transactions fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Transactions API] Error fetching group transactions:", {
        groupId,
        page,
        limit,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  getRecentGroupTransactions: async (groupId) => {
    try {
      console.log(
        "🔍 [Transactions API] Fetching recent group transactions for groupId:",
        groupId
      );
      const res = await api.get(`/transactions/group/${groupId}/recent`);
      console.log(
        "✅ [Transactions API] Recent group transactions fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Transactions API] Error fetching recent group transactions:", {
        groupId,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  getUserTransactions: async (page = 1, limit = 20) => {
    try {
      console.log(
        "🔍 [Transactions API] Fetching user transactions"
      );
      const res = await api.get(`/transactions/user?page=${page}&limit=${limit}`);
      console.log(
        "✅ [Transactions API] User transactions fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Transactions API] Error fetching user transactions:", {
        page,
        limit,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  getTransactionById: async (transactionId) => {
    try {
      console.log(
        "🔍 [Transactions API] Fetching transaction by ID:",
        transactionId
      );
      const res = await api.get(`/transactions/${transactionId}`);
      console.log(
        "✅ [Transactions API] Transaction fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Transactions API] Error fetching transaction:", {
        transactionId,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
};

const activitiesAPI = {
  getGroupActivities: async (groupId, page = 1, limit = 20) => {
    try {
      console.log(
        "🔍 [Activities API] Fetching group activities for groupId:",
        groupId
      );
      const res = await api.get(`/activities/group/${groupId}?page=${page}&limit=${limit}`);
      console.log(
        "✅ [Activities API] Group activities fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Activities API] Error fetching group activities:", {
        groupId,
        page,
        limit,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  getUserActivities: async (page = 1, limit = 20) => {
    try {
      console.log(
        "🔍 [Activities API] Fetching user activities"
      );
      const res = await api.get(`/activities/user?page=${page}&limit=${limit}`);
      console.log(
        "✅ [Activities API] User activities fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Activities API] Error fetching user activities:", {
        page,
        limit,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  getRecentActivities: async (groupId) => {
    try {
      console.log(
        "🔍 [Activities API] Fetching recent activities for groupId:",
        groupId
      );
      const res = await api.get(`/activities/group/${groupId}/recent`);
      console.log(
        "✅ [Activities API] Recent activities fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Activities API] Error fetching recent activities:", {
        groupId,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  getActivityById: async (activityId) => {
    try {
      console.log(
        "🔍 [Activities API] Fetching activity by ID:",
        activityId
      );
      const res = await api.get(`/activities/${activityId}`);
      console.log(
        "✅ [Activities API] Activity fetched successfully:",
        res.data
      );
      return res.data;
    } catch (error) {
      console.error("❌ [Activities API] Error fetching activity:", {
        activityId,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
};

const testServerConnection = async () => {
  try {
    const response = await axios.get(`${BASE_URL.replace("/api", "")}/health`, {
      timeout: 5000,
    });

    return response.status === 200 && response.data.success === true;
  } catch (error) {
    console.error("Server connection test failed:", error);
    return false;
  }
};

export {
  authAPI,
  debtsAPI,
  groupsAPI,
  analyticsAPI,
  transactionsAPI,
  activitiesAPI,
  userAPI,
  testServerConnection,
};
export default api;
