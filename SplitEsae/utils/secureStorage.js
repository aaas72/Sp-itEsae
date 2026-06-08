import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";

export async function saveRefreshToken(token) {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, String(token));
  } catch (error) {
    console.error("Error saving refresh token:", error);
    throw error;
  }
}

export async function getRefreshToken() {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
}

export async function deleteRefreshToken() {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error deleting refresh token:", error);
  }
}

export async function saveUserData(userData) {
  try {
    const dataToStore = userData && typeof userData === "object" ? JSON.stringify(userData) : "{}";
    await SecureStore.setItemAsync(USER_DATA_KEY, dataToStore);
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
}

export async function getUserData() {
  try {
    const data = await SecureStore.getItemAsync(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

export async function deleteUserData() {
  try {
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  } catch (error) {
    console.error("Error deleting user data:", error);
  }
}

export async function clearAllSecureData() {
  await Promise.all([deleteRefreshToken(), deleteUserData()]);
}
