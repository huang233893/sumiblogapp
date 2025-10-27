import React, { useState } from 'react';
import { APP_CONFIG } from './src/constants/Config';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, Image } from 'react-native';
import WebViewComponent from './src/components/WebViewComponent';
import AboutScreen from './src/screens/AboutScreen';
import AboutInfoScreen from './src/screens/AboutInfoScreen';
import UpdateScreen from './src/screens/UpdateScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

const Tab = createBottomTabNavigator();

// 底部标签导航组件
function MainTabs() {
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('Home');
  const [refreshCount, setRefreshCount] = useState(0);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAboutInfoModal, setShowAboutInfoModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // 处理刷新操作
  const handleRefresh = () => {
    // 通过改变状态来触发WebViewComponent的重新加载
    setRefreshCount(prev => prev + 1);
  };



  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.tabBarActive, // 使用主题颜色
          tabBarInactiveTintColor: theme.colors.tabBarInactive,
          tabBarStyle: [styles.tabBar, { backgroundColor: theme.colors.surface }],
          headerShown: false,
        }}
        onStateChange={(state) => {
          // 监听当前激活的标签页
          if (state.routes[state.index]) {
            setActiveTab(state.routes[state.index].name);
          }
        }}
      >
        <Tab.Screen 
          name="Home" 
          options={{ 
            tabBarLabel: '主页',
            tabBarIcon: ({ color, size }) => (
              <Image 
                source={isDarkMode ? 
                  require('./assets/home-dark.svg') : 
                  require('./assets/home-light.svg')} 
                style={[styles.iconImage, { width: size, height: size, tintColor: color }]} 
                resizeMode="contain"
              />
            )
          }} 
        >
          {() => <WebViewComponent key={`home-${refreshCount}`} url="https://www.sumi233.top" />}
        </Tab.Screen>
        <Tab.Screen 
          name="Archive" 
          options={{ 
            tabBarLabel: '归档',
            tabBarIcon: ({ color, size }) => (
              <Image 
                source={isDarkMode ? 
                  require('./assets/archive-dark.svg') : 
                  require('./assets/archive-light.svg')} 
                style={[styles.iconImage, { width: size, height: size, tintColor: color }]} 
                resizeMode="contain"
              />
            )
          }} 
        >
          {() => <WebViewComponent key={`archive-${refreshCount}`} url="https://www.sumi233.top/archives" />}
        </Tab.Screen>
        <Tab.Screen 
          name="Message" 
          options={{ 
            tabBarLabel: '留言板',
            tabBarIcon: ({ color, size }) => (
              <Image 
                source={isDarkMode ? 
                  require('./assets/message-dark.svg') : 
                  require('./assets/message-light.svg')} 
                style={[styles.iconImage, { width: size, height: size, tintColor: color }]} 
                resizeMode="contain"
              />
            )
          }} 
        >
          {() => <WebViewComponent key={`message-${refreshCount}`} url="https://www.sumi233.top/comments" />}
        </Tab.Screen>
        <Tab.Screen 
          name="About" 
            children={({ navigation }) => (
              <AboutScreen 
                navigation={navigation} 
                onOpenSettings={() => setShowSettingsModal(true)}
                onOpenAboutInfo={() => setShowAboutInfoModal(true)}
                onOpenUpdate={() => setShowUpdateModal(true)}
              />
            )}
            options={{ 
              tabBarLabel: '更多',
              tabBarIcon: ({ color, size }) => (
                <Image 
                  source={isDarkMode ? 
                    require('./assets/about-dark.svg') : 
                    require('./assets/about-light.svg')} 
                  style={[styles.iconImage, { width: size, height: size, tintColor: color }]} 
                  resizeMode="contain"
                />
              )
            }} 
          />
      </Tab.Navigator>

      {/* 更新页面Modal */}
      <Modal
        visible={showUpdateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <UpdateScreen onClose={() => setShowUpdateModal(false)} />
      </Modal>

      {/* 关于详情页面Modal */}
      <Modal
        visible={showAboutInfoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAboutInfoModal(false)}
      >
        <AboutInfoScreen onClose={() => setShowAboutInfoModal(false)} />
      </Modal>

      {/* 设置页面Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <SettingsScreen 
          onClose={() => setShowSettingsModal(false)}
          onOpenAboutInfo={() => {
            setShowSettingsModal(false);
            setShowAboutInfoModal(true);
          }}
        />
      </Modal>

      {/* 悬浮刷新按钮 */}
      <TouchableOpacity 
        style={[
          styles.refreshButton, 
          { backgroundColor: theme.colors.primary }, // 使用主题颜色
          Platform.OS === 'web' && styles.webRefreshButton
        ]}
        onPress={handleRefresh}
        activeOpacity={0.7}
      >
        <Image 
          source={isDarkMode ? 
            require('./assets/refresh-dark.svg') : 
            require('./assets/refresh-light.svg')} 
          style={styles.refreshIconImage} 
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

// 主导航组件
function MainNavigator() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  iconImage: {
    // 图标样式会通过tabBarIcon的size参数设置
  },
  refreshButton: {
    position: 'absolute',
    right: 20,
    bottom: 80, // 位于底部导航栏上方
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  webRefreshButton: {
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  },
  refreshIconImage: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});

// 主应用组件，包装ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <MainNavigator />
    </ThemeProvider>
  );
}

export default App;