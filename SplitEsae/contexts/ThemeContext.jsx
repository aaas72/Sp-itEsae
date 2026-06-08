import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeSource, setThemeSource] = useState('dark'); 

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (themeSource === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeSource]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme) {
        const { source, isDark } = JSON.parse(savedTheme);
        setThemeSource(source);
        if (source !== 'system') {
          setIsDarkMode(isDark);
        }
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (source, isDark) => {
    try {
      await AsyncStorage.setItem('themePreference', JSON.stringify({ source, isDark }));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    setThemeSource(newIsDarkMode ? 'dark' : 'light');
    saveThemePreference(newIsDarkMode ? 'dark' : 'light', newIsDarkMode);
  };

  const setSystemTheme = () => {
    setThemeSource('system');
    setIsDarkMode(systemColorScheme === 'dark');
    saveThemePreference('system', systemColorScheme === 'dark');
  };

  const setLightTheme = () => {
    setIsDarkMode(false);
    setThemeSource('light');
    saveThemePreference('light', false);
  };

  const setDarkTheme = () => {
    setIsDarkMode(true);
    setThemeSource('dark');
    saveThemePreference('dark', true);
  };

  const colors = Colors[isDarkMode ? 'dark' : 'light'];

  const value = {
    isDarkMode,
    themeSource,
    colors,
    toggleTheme,
    setSystemTheme,
    setLightTheme,
    setDarkTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};