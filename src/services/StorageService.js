import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// 存储键名常量
export const STORAGE_KEYS = {
  THEME_SETTINGS: '@sumiblog:theme_settings',
  COOKIES: '@sumiblog:cookies',
  APP_SETTINGS: '@sumiblog:app_settings',
};

// 数据存储服务类
class StorageService {
  // 保存一般数据到AsyncStorage
  async saveData(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  }

  // 从AsyncStorage读取一般数据
  async getData(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('读取数据失败:', error);
      return null;
    }
  }

  // 删除AsyncStorage中的数据
  async removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('删除数据失败:', error);
      return false;
    }
  }

  // 清除所有AsyncStorage数据
  async clearAllData() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('清除所有数据失败:', error);
      return false;
    }
  }

  // 保存敏感数据（如Cookie）
  async saveSecureData(key, value) {
    try {
      // Web平台使用localStorage作为降级方案
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } else {
          console.warn('Web平台不支持localStorage');
          return false;
        }
      } else {
        // 移动平台使用SecureStore
        const jsonValue = JSON.stringify(value);
        await SecureStore.setItemAsync(key, jsonValue);
        return true;
      }
    } catch (error) {
      console.error('保存安全数据失败:', error);
      return false;
    }
  }

  // 读取敏感数据
  async getSecureData(key) {
    try {
      // Web平台使用localStorage作为降级方案
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        } else {
          console.warn('Web平台不支持localStorage');
          return null;
        }
      } else {
        // 移动平台使用SecureStore
        const jsonValue = await SecureStore.getItemAsync(key);
        return jsonValue ? JSON.parse(jsonValue) : null;
      }
    } catch (error) {
      console.error('读取安全数据失败:', error);
      return null;
    }
  }

  // 删除敏感数据
  async removeSecureData(key) {
    try {
      // Web平台使用localStorage作为降级方案
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
          return true;
        } else {
          console.warn('Web平台不支持localStorage');
          return false;
        }
      } else {
        // 移动平台使用SecureStore
        await SecureStore.deleteItemAsync(key);
        return true;
      }
    } catch (error) {
      console.error('删除安全数据失败:', error);
      return false;
    }
  }

  // 保存主题设置
  async saveThemeSettings(settings) {
    return this.saveData(STORAGE_KEYS.THEME_SETTINGS, settings);
  }

  // 获取主题设置
  async getThemeSettings() {
    return this.getData(STORAGE_KEYS.THEME_SETTINGS);
  }

  // 保存Cookies
  async saveCookies(cookies) {
    return this.saveSecureData(STORAGE_KEYS.COOKIES, cookies);
  }

  // 获取Cookies
  async getCookies() {
    return this.getSecureData(STORAGE_KEYS.COOKIES);
  }

  // 清除Cookies
  async clearCookies() {
    return this.removeSecureData(STORAGE_KEYS.COOKIES);
  }

  // 保存应用设置
  async saveAppSettings(settings) {
    return this.saveData(STORAGE_KEYS.APP_SETTINGS, settings);
  }

  // 获取应用设置
  async getAppSettings() {
    return this.getData(STORAGE_KEYS.APP_SETTINGS);
  }
}

// 导出单例实例
export default new StorageService();
