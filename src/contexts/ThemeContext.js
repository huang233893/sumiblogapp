import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';

// 创建主题上下文
const ThemeContext = createContext();

// 亮色主题
const lightTheme = {
  colors: {
    primary: '#FF9500', // 橙色强调色
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    textLight: '#999999',
    error: '#FF3B30',
    tabBarActive: '#FF9500',
    tabBarInactive: '#8E8E93',
  },
};

// 暗色主题
const darkTheme = {
  colors: {
    primary: '#FF9500', // 保持橙色强调色
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textLight: '#999999',
    error: '#FF453A',
    tabBarActive: '#FF9500',
    tabBarInactive: '#6E6E73',
  },
};

// 主题提供者组件
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [followSystem, setFollowSystem] = useState(true);
  
  // 当跟随系统或系统主题变化时更新主题
  useEffect(() => {
    if (followSystem) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [followSystem, systemColorScheme]);
  
  // 当前使用的主题
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  
  // 切换暗色/亮色模式
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // 切换是否跟随系统主题
  const toggleFollowSystem = () => {
    setFollowSystem(!followSystem);
    // 如果现在不跟随系统，使用当前isDarkMode设置
    if (!followSystem) {
      setIsDarkMode(isDarkMode);
    } else {
      // 如果现在跟随系统，立即更新为系统主题
      setIsDarkMode(systemColorScheme === 'dark');
    }
  };
  
  const value = {
    theme: currentTheme,
    isDarkMode,
    followSystem,
    toggleTheme,
    toggleFollowSystem,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 使用主题的自定义Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
