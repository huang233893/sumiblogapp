import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { clearCache, clearCookies, clearCacheAndCookies } from '../components/WebViewComponent';

const SettingsScreen = ({ navigation, onClose, onOpenAboutInfo }) => {
  const { theme, isDarkMode, followSystem, toggleTheme, toggleFollowSystem } = useTheme();

  // 处理清除缓存
  const handleClearCache = () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有网页缓存吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          onPress: clearCache,
          style: 'destructive'
        }
      ]
    );
  };

  // 处理清除Cookie
  const handleClearCookies = () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有Cookie吗？这将清除您的登录状态和浏览记录。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          onPress: clearCookies,
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 导航栏 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>关闭</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>设置</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          
          <View style={styles.settingItemsContainer}>
            {/* 跟随系统主题开关 */}
            <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>跟随系统主题</Text>
              <Switch
                value={followSystem}
                onValueChange={toggleFollowSystem}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            {/* 暗色模式开关 */}
            <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>暗色模式</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                disabled={followSystem}
                trackColor={{
                  false: '#767577',
                  true: followSystem ? '#CCCCCC' : theme.colors.primary
                }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            {/* 检查更新选项已移动到关于页面 */}
            
            {/* 清除缓存选项 */}
            <TouchableOpacity 
              style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
              onPress={handleClearCache}
              activeOpacity={0.7}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>清除缓存</Text>
              <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
            
            {/* 清除Cookie选项 */}
            <TouchableOpacity 
              style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
              onPress={handleClearCookies}
              activeOpacity={0.7}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>清除Cookie</Text>
              <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.copyright, { color: theme.colors.textLight }]}>© 2025 酥米的小站</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerRight: {
    width: 60,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
  },
  settingItemsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  settingArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
  copyright: {
    fontSize: 14,
    marginTop: 'auto',
    marginBottom: 40,
  },
});

export default SettingsScreen;