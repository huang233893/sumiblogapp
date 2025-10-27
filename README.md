# 酥米的小站 - React Native跨平台Web套壳应用

这是一个使用React Native和Expo开发的跨平台Web套壳应用，用于展示酥米的个人网站内容。

## 功能特点

- 底部导航栏，包含四个选项：主页、归档、留言板和关于
- 主页、归档、留言板使用WebView展示对应的网站内容
- 关于页面为专门的选项界面
- 支持iOS、Android和Web三端运行

## 开发环境

- React Native
- Expo
- React Navigation
- React Native WebView

## 安装依赖

```bash
npm install
```

## 运行项目

### Web端
```bash
npm run web
```

### iOS端
```bash
npm run ios
```

### Android端
```bash
npm run android
```

## 打包构建

### Web端打包
```bash
npx expo export --platform web
```

### iOS/Android端打包
请参考Expo官方文档进行EAS Build配置

## 项目结构

```
sumiblogapph5/
├── App.js              # 应用主组件，包含底部导航
├── index.js            # 应用入口点
├── src/
│   ├── components/
│   │   └── WebViewComponent.js  # WebView组件
│   └── screens/
│       └── AboutScreen.js       # 关于页面
├── assets/             # 静态资源文件
└── package.json        # 项目配置和依赖
```

## 注意事项

- 确保设备可以访问 https://www.sumi233.top
- Web端可能会有跨域限制，需要网站端设置相应的CORS策略
- iOS端需要在Info.plist中配置允许访问的域名（如需发布）
- Android端需要在AndroidManifest.xml中配置网络权限（如需发布）