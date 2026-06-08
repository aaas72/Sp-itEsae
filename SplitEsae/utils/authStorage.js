import {
  saveRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  saveUserData,
  getUserData,
  deleteUserData,
  clearAllSecureData,
} from "./secureStorage";

/**
 * authStorage.js
 * Token + user session storage service (async wrappers).
 *
 * Notes:
 * - Refresh token + user data are persisted in SecureStore via secureStorage.js
 * - Access token is kept in-memory (global.currentAccessToken) by design
 */

export async function setAccessToken(accessToken) {
  global.currentAccessToken = accessToken ? String(accessToken) : null;
  return global.currentAccessToken;
}

export async function getAccessToken() {
  return global.currentAccessToken ? String(global.currentAccessToken) : null;
}

export async function clearAccessToken() {
  global.currentAccessToken = null;
}

export async function saveSession({ refreshToken, user } = {}) {
  await Promise.all([
    refreshToken ? saveRefreshToken(refreshToken) : Promise.resolve(),
    user ? saveUserData(user) : Promise.resolve(),
  ]);
}

export async function loadSession() {
  const [refreshToken, user] = await Promise.all([
    getRefreshToken(),
    getUserData(),
  ]);

  return {
    accessToken: await getAccessToken(),
    refreshToken,
    user,
  };
}

export async function clearSession() {
  await Promise.all([clearAccessToken(), clearAllSecureData()]);
}

export const authStorage = {
  // access token (memory)
  setAccessToken,
  getAccessToken,
  clearAccessToken,

  // refresh token (SecureStore)
  saveRefreshToken,
  getRefreshToken,
  deleteRefreshToken,

  // user data (SecureStore)
  saveUserData,
  getUserData,
  deleteUserData,

  // combined helpers
  saveSession,
  loadSession,
  clearSession,
};
