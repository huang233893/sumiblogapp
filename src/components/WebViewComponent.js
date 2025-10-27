import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated, Alert, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

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
        <View style={[styles.webView, { opacity: isLoading ? 0 : 1 }]}>
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
      return (
        <WebView
          source={{ uri: url }}
          style={[styles.webView, { opacity: isLoading ? 0 : 1 }]}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={true}
          // 优化加载速度的设置
          originWhitelist={['*']}
          allowsInlineMediaPlayback={true}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
          // 预加载和缓存优化
          useWebKit={true}
          allowsBackForwardNavigationGestures={true}
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
      // Web平台清除缓存的方法
      Alert.alert('提示', '在Web平台上，建议您刷新页面或在浏览器设置中清除缓存。');
      // 尝试清除localStorage和sessionStorage作为补充
      localStorage.clear();
      sessionStorage.clear();
    } else if (WebView && WebView.clearCache) {
      // 移动平台清除缓存
      await WebView.clearCache(true);
      Alert.alert('成功', '网页缓存已清除');
    } else {
      Alert.alert('提示', '当前平台不支持清除缓存功能');
    }
  } catch (error) {
    Alert.alert('错误', '清除缓存失败');
    console.error('清除缓存失败:', error);
  }
}

// 导出清除Cookie的方法 - 平台兼容版本
export async function clearCookies() {
  try {
    if (Platform.OS === 'web') {
      // Web平台清除Cookie的方法
      // 尝试通过设置过期时间来清除所有Cookie
      const cookies = document.cookie.split("; ");
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      }
      Alert.alert('成功', 'Cookie已清除');
    } else if (WebView && WebView.clearCookies) {
      // 移动平台清除Cookie
      await WebView.clearCookies();
      Alert.alert('成功', 'Cookie已清除');
    } else {
      Alert.alert('提示', '当前平台不支持清除Cookie功能');
    }
  } catch (error) {
    Alert.alert('错误', '清除Cookie失败');
    console.error('清除Cookie失败:', error);
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