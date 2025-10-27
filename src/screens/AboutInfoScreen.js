import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Linking, Alert, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../constants/Config';

const AboutInfoScreen = ({ onClose }) => {
  const { theme } = useTheme();
  const { VERSION, WEBSITE_URL, COPYRIGHT } = APP_CONFIG;

  // 处理打开网站链接
  const handleOpenWebsite = async () => {
    try {
      const canOpen = await Linking.canOpenURL(websiteUrl);
      if (canOpen) {
        await Linking.openURL(websiteUrl);
      } else {
        Alert.alert('错误', '无法打开网站链接');
      }
    } catch (error) {
      Alert.alert('错误', '打开网站失败');
      console.error('打开网站失败:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 顶部导航栏 */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>返回</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>关于</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* 应用图标 */}
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../assets/logo/logo.png')} 
              style={styles.appIcon} 
              resizeMode="contain" 
            />
          </View>

          <Text style={[styles.appName, { color: theme.colors.text }]}>{APP_CONFIG.APP_NAME}</Text>
          <Text style={[styles.version, { color: theme.colors.textSecondary }]}>版本: {VERSION}</Text>
          
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              全新酥米的小站App端，基于React Native开发。
            </Text>
            
            <TouchableOpacity 
              style={styles.websiteContainer}
              onPress={handleOpenWebsite}
              activeOpacity={0.7}
            >
              <Text style={[styles.websiteLabel, { color: theme.colors.textSecondary }]}>网站地址:</Text>
              <Text style={[styles.websiteUrl, { color: theme.colors.primary }]}>{WEBSITE_URL}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>关于作者</Text>
            <Text style={[styles.authorInfo, { color: theme.colors.textSecondary }]}>
              酥米 - 一个计算机网络技术专业的职中生
            </Text>
          </View>

          <Text style={[styles.copyright, { color: theme.colors.textLight }]}>{COPYRIGHT}</Text>
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
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  version: {
    fontSize: 16,
    marginBottom: 32,
  },
  infoCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  websiteContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  websiteLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  websiteUrl: {
    fontSize: 15,
    fontWeight: '500',
  },
  authorInfo: {
    fontSize: 15,
    lineHeight: 22,
  },
  copyright: {
    fontSize: 14,
    marginTop: 60,
    marginBottom: 40,
  },
});

export default AboutInfoScreen;