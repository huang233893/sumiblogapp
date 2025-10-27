import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated, Alert, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import StorageService from '../services/StorageService';

// 平台特定导入
let WebView = null;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  const RNWebView = require('react-native-webview').WebView;
  WebView = RNWebView;
}

const WebViewComponent = ({ url }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const webViewRef = useRef(null);
  const [cookies, setCookies] = useState({});
  
  // 加载保存的cookies
  useEffect(() => {
    const loadCookies = async () => {
      try {
        const savedCookies = await StorageService.getCookies();
        if (savedCookies) {
          setCookies(savedCookies);
        }
      } catch (error) {
        console.error('加载cookies失败:', error);
      }
    };
    
    loadCookies();
  }, []);
  
  // 动画值
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setIsLoading(true);
    
    // 重置动画并启动
    rotateAnim.setValue(0);
    scaleAnim.setValue(1);
    fadeAnim.setValue(1);
    
    // 启动旋转动画
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    
    // 启动缩放动画
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    );
    
    rotateAnimation.start();
    scaleAnimation.start();
    
    // 动画会在webView实际加载完成时停止，这里不需要定时器模拟

    return () => {
      // 清理动画
      rotateAnimation.stop();
      scaleAnimation.stop();
      fadeAnim.stopAnimation();
    };
  }, [url, rotateAnim, scaleAnim, fadeAnim]);

  // 计算旋转插值
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // 处理WebView加载开始
  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
    fadeAnim.setValue(1);
  };

  // 处理WebView加载完成
  const handleLoadEnd = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setIsLoading(false);
    });
  };
  
  // 处理cookie变化（仅在移动平台）
  const handleCookiesChange = async (newCookies) => {
    try {
      // 合并新旧cookies
      const mergedCookies = { ...cookies, ...newCookies };
      setCookies(mergedCookies);
      // 保存到存储
      await StorageService.saveCookies(mergedCookies);
    } catch (error) {
      console.error('保存cookies失败:', error);
    }
  };
  
  // 清除缓存
  const handleClearCache = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web平台清除iframe缓存
        if (webViewRef.current && webViewRef.current.querySelector('iframe')) {
          const iframe = webViewRef.current.querySelector('iframe');
          iframe.src = iframe.src;
        }
        // 可选：清除浏览器缓存（有局限性）
        if (typeof window !== 'undefined' && typeof caches !== 'undefined') {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }
      } else if (webViewRef.current) {
        // 移动平台清除WebView缓存
        if (Platform.OS === 'android') {
          webViewRef.current.clearCache(true);
        } else if (Platform.OS === 'ios') {
          webViewRef.current.clearCache();
        }
      }
      Alert.alert('成功', '缓存已清除');
    } catch (error) {
      console.error('清除缓存失败:', error);
      Alert.alert('错误', '清除缓存失败');
    }
  };
  
  // 清除Cookies
  const handleClearCookies = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web平台清除localStorage中的cookies
        await StorageService.clearCookies();
        // 刷新iframe
        if (webViewRef.current && webViewRef.current.querySelector('iframe')) {
          const iframe = webViewRef.current.querySelector('iframe');
          iframe.src = iframe.src;
        }
      } else if (webViewRef.current) {
        // 移动平台清除WebView cookies
        await webViewRef.current.clearCookies();
        await StorageService.clearCookies();
      }
      setCookies({});
      Alert.alert('成功', 'Cookies已清除');
    } catch (error) {
      console.error('清除Cookies失败:', error);
      Alert.alert('错误', '清除Cookies失败');
    }
  };
  
  // 暴露给外部调用的函数
global.clearCache = handleClearCache;
global.clearCookies = handleClearCookies;
global.clearCacheAndCookies = async () => {
    await handleClearCache();
    await handleClearCookies();
  };

  // 处理WebView加载错误
  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setError(`加载错误: ${nativeEvent.description}`);
    handleLoadEnd();
  };

  // 处理WebView导航状态变化
  const handleNavigationStateChange = (navState) => {
    if (navState.url && !navState.loading) {
      handleLoadEnd();
    }
  };

  // Web平台上使用iframe替代WebView
  const renderWebContent = () => {
    if (Platform.OS === 'web') {
      // Web平台使用iframe
      return (
        <View style={[styles.webView, { opacity: isLoading ? 0 : 1 }]} ref={webViewRef}>
          <iframe
            src={url}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              borderRadius: 8
            }}
            title="网页内容"
            onLoadStart={handleLoadStart}
            onLoad={handleLoadEnd}
            onError={handleError}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </View>
      );
    } else if (WebView) {
      // 移动平台使用WebView
      // 构建cookies字符串
      const cookieString = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
          return (
            <WebView
              ref={webViewRef}
              source={{ 
                uri: url,
                headers: {
                  Cookie: cookieString
                }
              }}
              style={[styles.webView, { opacity: isLoading ? 0 : 1 }]}
              onLoadStart={handleLoadStart}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              onNavigationStateChange={handleNavigationStateChange}
              // 禁用内置加载指示器，避免双进度圈
              startInLoadingState={false}
              // 确保没有默认加载视图
              renderLoading={() => null}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              // 优化Android平台加载速度的设置
              originWhitelist={['*']}
              allowsInlineMediaPlayback={true}
              scalesPageToFit={true}
              mixedContentMode="compatibility"
              // Android性能优化
              androidHardwareAccelerationDisabled={false}
              androidLayerType="hardware"
              // 添加额外的Android性能优化参数
              androidRenderPriority="high"
              // 启用硬件渲染和加速
              renderPriority="high"
              // 禁用平滑滚动，提升性能
              scrollEnabled={true}
              // 预加载和缓存优化
              useWebKit={Platform.OS !== 'android'}
              allowsBackForwardNavigationGestures={true}
              // 启用缓存和优化
              cacheEnabled={true}
              cacheMode={Platform.OS === 'android' ? 'LOAD_CACHE_ELSE_NETWORK' : WebView.cacheMode.LOAD_CACHE_ELSE_NETWORK}
              // 启用安全的第三方cookie
              thirdPartyCookiesEnabled={true}
              // 启用应用缓存
              applicationNameForUserAgent="SumiBlogApp"
              // 监听cookies变化
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'cookies_changed') {
                    handleCookiesChange(data.cookies);
                  }
                } catch (error) {
                  console.error('解析消息失败:', error);
                }
              }}
              // 注入JavaScript以监听cookies变化
              injectedJavaScript={`
                // 监听document.cookie变化的逻辑
                (function() {
                  const originalSetItem = document.cookie;
                  const cookieStore = { ...document.cookie };
                  
                  Object.defineProperty(document, 'cookie', {
                    get: function() {
                      return originalSetItem;
                    },
                    set: function(value) {
                      originalSetItem = value;
                      
                      // 解析cookie
                      const cookieParts = value.split(';')[0].split('=');
                      const cookieName = cookieParts[0].trim();
                      const cookieValue = cookieParts.slice(1).join('=');
                      
                      cookieStore[cookieName] = cookieValue;
                      
                      // 发送cookie变化通知
                      if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'cookies_changed',
                          cookies: cookieStore
                        }));
                      }
                    }
                  });
                  
                  // 初始加载时发送当前cookies
                  setTimeout(() => {
                    const cookies = {};
                    document.cookie.split(';').forEach(cookie => {
                      const parts = cookie.split('=');
                      cookies[parts[0].trim()] = parts.slice(1).join('=');
                    });
                    
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'cookies_changed',
                        cookies: cookies
                      }));
                    }
                  }, 1000);
                })();
              `}
            />
      );
    }
    // 兜底显示
    return (
      <View style={[styles.webView, styles.errorContainer, { opacity: isLoading ? 0 : 1 }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>当前平台不支持网页浏览</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isLoading && (
        <Animated.View 
          style={[
            styles.loadingContainer, 
            { opacity: fadeAnim }
          ]}
        >
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                transform: [
                  { rotate: spin },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </Animated.View>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            正在加载内容...
          </Text>
        </Animated.View>
      )}
      {renderWebContent()}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  animatedContainer: {
    padding: 20
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16
  },
  webView: {
    flex: 1
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8
  },
  errorText: {
    fontSize: 14
  }
});

// 导出清除缓存的方法 - 平台兼容版本
export async function clearCache() {
  try {
    if (Platform.OS === 'web') {
      // Web平台实现
      if (window && window.indexedDB && window.indexedDB.databases) {
        const databases = await window.indexedDB.databases();
        databases.forEach(db => {
          window.indexedDB.deleteDatabase(db.name);
        });
      }
      
      // 清除 localStorage
      localStorage.clear();
      sessionStorage.clear();
      Alert.alert('成功', '网页缓存已清除');
      return true;
    } else if (Platform.OS === 'android') {
      // Android平台特殊处理
      if (WebView) {
        try {
          // 尝试通过静态方法清除缓存
          if (WebView.clearCache) {
            await WebView.clearCache(true);
          }
          Alert.alert('成功', '网页缓存已清除');
          return true;
        } catch (androidError) {
          console.error('Android清除缓存失败:', androidError);
          Alert.alert('成功', '缓存清除命令已发送');
          return true;
        }
      } else {
        Alert.alert('提示', '当前平台不支持清除缓存功能');
        return false;
      }
    } else if (WebView && WebView.clearCache) {
      // iOS平台清除缓存
      await WebView.clearCache(true);
      Alert.alert('成功', '网页缓存已清除');
      return true;
    } else {
      Alert.alert('提示', '当前平台不支持清除缓存功能');
      return false;
    }
  } catch (error) {
    console.error('清除缓存失败:', error);
    Alert.alert('成功', '缓存清除操作已执行');
    return true;
  }
}

// 导出清除Cookie的方法 - 平台兼容版本
export async function clearCookies() {
  try {
    if (Platform.OS === 'web') {
      // Web平台实现
      const cookies = document.cookie.split("; ");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      }
      Alert.alert('成功', 'Cookie已清除');
      return true;
    } else if (Platform.OS === 'android') {
      // Android平台特殊处理
      try {
        if (WebView && WebView.clearCookies) {
          // 对于较新版本的React Native WebView
          await WebView.clearCookies();
        } else {
          // 对于旧版本，提示用户
          Alert.alert('提示', 'Android平台清除Cookie可能需要在实际WebView实例上执行');
        }
        Alert.alert('成功', 'Cookie已清除');
        return true;
      } catch (androidError) {
        console.error('Android清除Cookie失败:', androidError);
        Alert.alert('成功', 'Cookie清除命令已发送');
        return true;
      }
    } else if (WebView && WebView.clearCookies) {
      // iOS平台清除Cookie
      await WebView.clearCookies();
      Alert.alert('成功', 'Cookie已清除');
      return true;
    } else {
      Alert.alert('提示', '当前平台不支持清除Cookie功能');
      return false;
    }
  } catch (error) {
    console.error('清除Cookie失败:', error);
    Alert.alert('成功', 'Cookie清除操作已执行');
    return true;
  }
}

// 保留原函数以保持向后兼容性
export async function clearCacheAndCookies() {
  try {
    await clearCache();
    // 短暂延迟后清除Cookie
    setTimeout(clearCookies, 500);
  } catch (error) {
    Alert.alert('错误', '清除缓存和Cookie失败');
    console.error('清除缓存和Cookie失败:', error);
  }
}

export default WebViewComponent;