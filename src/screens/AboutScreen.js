import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../constants/Config';

const AboutScreen = ({ navigation, onOpenSettings, onOpenAboutInfo, onOpenUpdate }) => {
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  // 处理退出软件
  const handleExitApp = () => {
    setShowMenu(false);
    Alert.alert(
      '退出软件',
      '确定要退出酥米的小站吗？',
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          onPress: () => {
            // 在React Native中退出应用
            if (Platform.OS === 'web') {
              // Web平台提示刷新页面
              Alert.alert('提示', 'Web平台请关闭标签页');
            } else {
              // 移动端退出应用
              if (Platform.OS === 'android') {
                // @ts-ignore
                require('react-native').BackHandler.exitApp();
              } else {
                // iOS通常不允许直接退出应用
                Alert.alert('提示', 'iOS平台不支持直接退出应用');
              }
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 顶栏 */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>更多</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuButtonText, { color: theme.colors.text }]}>•••</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          
          {/* 关于信息 */}
          <View style={styles.aboutContainer}>
          </View>
          
          {/* 设置入口 */}
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
            onPress={onOpenSettings}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingsButtonText, { color: theme.colors.text }]}>设置</Text>
            <Text style={[styles.settingsArrow, { color: theme.colors.textSecondary }]}>›</Text>
          </TouchableOpacity>

          {/* 检查更新选项 */}
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={onOpenUpdate}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingsButtonText, { color: theme.colors.text }]}>检查更新</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.latestVersionText, { color: theme.colors.textSecondary }]}>v{APP_CONFIG.VERSION}</Text>
              <Text style={[styles.settingsArrow, { color: theme.colors.textSecondary }]}>›</Text>
            </View>
          </TouchableOpacity>

          {/* 关于选项 */}
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
            onPress={onOpenAboutInfo}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingsButtonText, { color: theme.colors.text }]}>关于</Text>
            <Text style={[styles.settingsArrow, { color: theme.colors.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <Text style={[styles.copyright, { color: theme.colors.textLight }]}>{APP_CONFIG.COPYRIGHT}</Text>
        </View>
      </ScrollView>

      {/* 三点菜单模态框 */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.modalContentContainer}>
            <TouchableOpacity 
              style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
              onPress={handleExitApp}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuItemText, { color: theme.colors.error }]}>退出软件</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '300',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  aboutContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  version: {
    fontSize: 16,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  website: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  settingsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingsButtonText: {
    fontSize: 16,
  },
  settingsArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  latestVersionText: {
    fontSize: 14,
    marginRight: 8,
  },
  copyright: {
    fontSize: 14,
    marginTop: 'auto',
    marginBottom: 40,
  },
  // 模态框样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  menuItem: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AboutScreen;