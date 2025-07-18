# WalletConnect 设置指南

## 获取 Project ID

### 1. 访问 WalletConnect Cloud
访问 [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)

### 2. 注册/登录账户
- 使用邮箱注册新账户或登录现有账户

### 3. 创建项目
- 点击 "Create New Project"
- 输入项目名称（例如：Web3 Wallet Demo）
- 选择项目类型：Web App

### 4. 获取 Project ID
- 创建项目后，你会看到一个 Project ID
- 复制这个 ID

### 5. 更新配置
在 `src/providers/WalletConnectProvider.tsx` 文件中，将 `projectId` 替换为你的真实 Project ID：

```typescript
const projectId = "你的真实Project ID";
```

## 测试 WalletConnect

### 1. 启动应用
```bash
npm run dev
```

### 2. 测试连接
- 点击 "WalletConnect" 按钮
- 会弹出 QR 码
- 使用移动端钱包（如 MetaMask Mobile、Trust Wallet 等）扫描 QR 码
- 在移动端钱包中确认连接

### 3. 支持的移动端钱包
- MetaMask Mobile
- Trust Wallet
- Rainbow
- imToken
- TokenPocket
- 等等...

## 故障排除

### 问题：Connection interrupted while trying to subscribe
**解决方案：**
1. 确保 Project ID 正确
2. 检查网络连接
3. 确保移动端钱包支持 WalletConnect v2

### 问题：QR 码不显示
**解决方案：**
1. 检查 `showQrModal: true` 设置
2. 确保没有浏览器弹窗阻止器
3. 检查控制台是否有错误

### 问题：连接失败
**解决方案：**
1. 确保移动端钱包已安装
2. 检查网络连接
3. 尝试重新生成 QR 码

## 注意事项

1. **Project ID 安全**：不要将 Project ID 提交到公共仓库
2. **环境变量**：建议使用环境变量存储 Project ID
3. **域名限制**：在生产环境中，需要在 WalletConnect Cloud 中配置允许的域名
4. **移动端测试**：WalletConnect 主要用于移动端钱包连接，建议在移动设备上测试

## 环境变量配置（推荐）

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=你的Project ID
```

然后在代码中使用：

```typescript
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "fallback_id";
``` 