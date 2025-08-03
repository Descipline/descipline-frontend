# Crypto Icons Setup Guide

## react-native-crypto-icons 配置

我们已经安装了 `react-native-crypto-icons` 来显示真实的加密货币图标。

### 已完成的配置
- ✅ 安装包: `npm install react-native-crypto-icons`
- ✅ 在 `challenge-create-enhanced.tsx` 中集成了 TokenIcon 组件
- ✅ 添加了错误处理和回退机制

### 使用的图标
- **USDC**: `name="usdc"` - 显示真实的USDC logo
- **SOL**: `name="sol"` - 显示真实的Solana logo

### 如果出现字体加载问题

#### Expo项目 (当前项目)
```bash
# 重新启动开发服务器并清除缓存
npx expo start --clear

# 如果使用development build
npx expo run:android
npx expo run:ios
```

#### 可能需要的额外配置
如果图标不显示，可能需要：

1. **在 app.json 中添加字体配置**:
```json
{
  "expo": {
    "fonts": [
      "./node_modules/react-native-crypto-icons/fonts/CryptoCurrency.ttf"
    ]
  }
}
```

2. **或者手动链接字体** (如果使用bare React Native):
```bash
react-native link react-native-crypto-icons
```

### 备用方案
如果crypto-icons无法正常工作，TokenIcon组件会自动回退到Material Icons：
- USDC: `attach-money` (美元符号)
- SOL: `wb-sunny` (太阳图标)

### 测试方法
1. 打开Challenge创建页面
2. 查看Token Type选择区域
3. 应该看到真实的USDC和SOL logo
4. 如果看到美元符号和太阳图标，说明使用了备用方案

### 支持的加密货币
react-native-crypto-icons 支持150+种加密货币图标，包括：
- btc (Bitcoin)
- eth (Ethereum) 
- usdc (USD Coin)
- sol (Solana)
- ada (Cardano)
- dot (Polkadot)
等等...

### 故障排除
如果图标不显示：
1. 检查控制台是否有错误信息
2. 尝试清除缓存: `npx expo start --clear`
3. 检查字体是否正确加载
4. 备用图标应该会自动显示