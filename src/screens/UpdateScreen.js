import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Linking
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../constants/Config';

const UpdateScreen = ({ onClose }) => {
  const { theme } = useTheme();
  const [currentVersion, setCurrentVersion] = useState(APP_CONFIG.VERSION);
  const [latestVersion, setLatestVersion] = useState(APP_CONFIG.VERSION);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState([]);
  const [updateUrl, setUpdateUrl] = useState('');
  const [previousVersions, setPreviousVersions] = useState([]);
  const [lastCheckedTime, setLastCheckedTime] = useState(new Date());
  const UPDATE_API_URL = 'https://www.sumi233.top/appupdate.json';

  // 版本号比较函数
  const compareVersions = (v1, v2) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    
    return 0;
  };
    
  // 打开指定版本的更新日志链接
  const openVersionLog = async (versionUrl) => {
    if (!versionUrl) return;
    
    const canOpen = await Linking.canOpenURL(versionUrl);
    if (canOpen) {
      await Linking.openURL(versionUrl);
    } else {
      Alert.alert('错误', '无法打开版本日志链接');
    }
  };

  // 从服务器检查更新
  const checkForUpdates = async () => {
    setIsChecking(true);
    
    try {
      const response = await fetch(UPDATE_API_URL);
      if (!response.ok) {
        throw new Error('网络请求失败');
      }
      
      const data = await response.json();
      
      // 根据新的JSON格式处理数据
      if (data.updateLogs && Array.isArray(data.updateLogs)) {
        // 按照版本号排序，获取最新版本
        const sortedLogs = [...data.updateLogs].sort((a, b) => 
          compareVersions(b.version, a.version)
        );
        
        if (sortedLogs.length > 0) {
          const latest = sortedLogs[0];
          setLatestVersion(latest.version);
          setHasUpdate(compareVersions(latest.version, currentVersion) > 0);
          setReleaseNotes(latest.updateContent || []);
          setUpdateUrl(latest.downloadUrl || '');
          
          // 设置历史版本（排除最新版本）
          const previous = sortedLogs.slice(1);
          setPreviousVersions(previous.map(ver => ({
            version: ver.version,
            updateTime: ver.updateTime,
            releaseNotes: ver.updateContent || [],
            updateUrl: ver.downloadUrl || ''
          })));
        }
      }
      
      setLastCheckedTime(new Date());
    } catch (error) {
      Alert.alert('错误', '检查更新失败，请稍后再试');
      console.error('检查更新失败:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // 处理更新操作 - 打开系统浏览器
  const handleUpdate = async () => {
    // 尝试获取对应版本的URL
    let urlToOpen = null;
    
    if (hasUpdate) {
      // 有更新时，使用最新版本的URL
      urlToOpen = updateUrl;
    } else {
      // 没有更新时，尝试从历史版本中查找当前版本的URL
      const currentVersionData = previousVersions.find(v => v.version === currentVersion);
      if (currentVersionData && currentVersionData.updateUrl) {
        urlToOpen = currentVersionData.updateUrl;
      }
    }
    
    // 如果找到了URL，直接跳转
    if (urlToOpen) {
      try {
        console.log('尝试打开URL:', urlToOpen);
        // 针对不同平台使用不同的打开方式
        if (Platform.OS === 'web') {
          // Web平台直接使用window.open
          window.open(urlToOpen, '_blank');
        } else {
          // 移动平台使用Linking API
          const canOpen = await Linking.canOpenURL(urlToOpen);
          if (canOpen) {
            await Linking.openURL(urlToOpen);
          } else {
            Alert.alert('错误', '无法打开链接');
          }
        }
      } catch (error) {
        console.error('打开URL失败:', error);
        Alert.alert('错误', '打开链接失败，请稍后再试');
      }
    } else {
      // 如果找不到URL，提示用户
      Alert.alert('提示', '未找到对应版本的更新链接');
    }
  };

  // 初始检查
  useEffect(() => {
    checkForUpdates();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 顶部导航栏 */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>关闭</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>应用更新</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* 标题已移至头部 */}
          
          <View style={[styles.versionContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.versionLabel, { color: theme.colors.textSecondary }]}>当前版本</Text>
            <Text style={[styles.versionNumber, { color: theme.colors.text }]}>{currentVersion}</Text>
          </View>

          <View style={[styles.versionContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.versionLabel, { color: theme.colors.textSecondary }]}>最新版本</Text>
            <View style={styles.latestVersionContainer}>
              <Text style={[styles.versionNumber, { color: theme.colors.text }]}>{latestVersion}</Text>
              {hasUpdate && (
                <View style={styles.updateBadge}>
                  <Text style={styles.updateBadgeText}>新版本</Text>
                </View>
              )}
            </View>
          </View>

          {hasUpdate && (
            <View style={[styles.notesContainer, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.notesTitle, { color: theme.colors.text }]}>更新内容</Text>
              {releaseNotes.map((note, index) => (
                <Text key={index} style={[styles.noteItem, { color: theme.colors.textSecondary }]}>
                  {note}
                </Text>
              ))}
            </View>
          )}
          
          {/* 显示前版本更新日志 */}
          {previousVersions.length > 0 && (
            <View style={[styles.notesContainer, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.notesTitle, { color: theme.colors.text }]}>历史更新日志</Text>
              {previousVersions.map((version, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.versionLogItem}
                  onPress={() => version.updateUrl && openVersionLog(version.updateUrl)}
                  activeOpacity={0.7}
                >
                  <View style={styles.versionLogHeader}>
                    <View>
                      <Text style={[styles.versionLogTitle, { color: theme.colors.text }]}>
                        版本 {version.version}
                      </Text>
                      {version.updateTime && (
                        <Text style={[styles.updateTimeText, { color: theme.colors.textSecondary }]}>
                          更新时间: {version.updateTime}
                        </Text>
                      )}
                    </View>
                    {version.updateUrl && (
                      <Text style={[styles.viewDetailsText, { color: theme.colors.primary }]}>
                        查看详情 →
                      </Text>
                    )}
                  </View>
                  {version.releaseNotes && version.releaseNotes.map((note, noteIndex) => (
                    <Text 
                      key={noteIndex} 
                      style={[styles.noteItem, { color: theme.colors.textSecondary }]}
                    >
                      {note}
                    </Text>
                  ))}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={[
              styles.checkButton, 
              { backgroundColor: theme.colors.primary },
              (isChecking || isUpdating) && styles.disabledButton
            ]}
            onPress={checkForUpdates}
            disabled={isChecking || isUpdating}
          >
            {isChecking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>检查更新</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.updateButton, 
              { backgroundColor: theme.colors.primary },
              (isUpdating) && styles.disabledButton
            ]}
            onPress={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {hasUpdate ? `更新到 ${latestVersion}` : `当前版本 ${currentVersion}`}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.lastChecked, { color: theme.colors.textLight }]}>
            上次检查: {lastCheckedTime.toLocaleString('zh-CN')}
          </Text>
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
    height: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // 使用固定的边框颜色
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  versionContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  versionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  versionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  latestVersionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateBadge: {
    marginLeft: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  updateBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notesContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noteItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  versionLogItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  versionLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  versionLogTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  updateTimeText: {
    fontSize: 12,
    marginTop: 2,
  },
  viewDetailsText: {
    fontSize: 14,
  },
  checkButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  updateButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastChecked: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default UpdateScreen;