# Day1 - Next.js 钱包连接基础

## ✅ 今日完成
- 初始化 Next.js 项目结构
- 搭建 src 目录规范
- 实现 MetaMask 钱包连接与余额读取
- 实现账号切换监听

## 📚 今日知识点
- ethers.js 的 provider 与 signer 用法
- MetaMask 链接流程：eth_requestAccounts
- Hook 设计：useWallet 管理地址和余额状态

## 🧱 项目结构


# Day 1: Web3 钱包连接核心实现

## 📚 技术要点总结

### 1. MetaMask 连接四步流程
```mermaid
sequenceDiagram
    participant 前端
    participant MetaMask
    participant 区块链节点
    前端->>MetaMask: eth_requestAccounts
    MetaMask->>用户: 显示授权弹窗
    用户->>MetaMask: 批准/拒绝
    MetaMask->>前端: 返回账户数组
    前端->>区块链节点: provider.getBalance(address)
    Q1: 如何检测用户是否安装了 MetaMask？
标准答案：

typescript
function checkMetaMask(): boolean {
  return !!window.ethereum?.isMetaMask;
}
加分回答：

区分不同钱包提供商（Coinbase Wallet, Trust Wallet 等）

提供备选方案：显示钱包选择弹窗或下载引导

Q2: 用户拒绝连接后如何优化体验？
解决方案：

typescript
// 错误分级处理
enum WalletError {
  NOT_INSTALLED = 'METAMASK_NOT_INSTALLED',
  USER_REJECTED = 'USER_REJECTED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// UI层处理
switch (error.code) {
  case WalletError.USER_REJECTED:
    showToast('您已取消连接');
    break;
  case WalletError.NOT_INSTALLED:
    showModal(<WalletInstallGuide />);
    break;
}
Q3: 为什么要在组件卸载时移除事件监听？
技术要点：

防止内存泄漏

避免 StrictMode 下的重复监听

Next.js 等 SSR 框架会重复执行组件生命周期

示例代码：

typescript
useEffect(() => {
  const handler = () => { /*...*/ };
  window.ethereum.on('accountsChanged', handler);
  
  return () => {
    window.ethereum?.removeListener('accountsChanged', handler);
  };
}, []);
Q4: 如何实现多链切换后的自动刷新？
企业级方案：

typescript
// 监听链变更
window.ethereum.on('chainChanged', (chainId) => {
  // 推荐方案：软刷新
  window.location.reload();
  
  // 高级方案：更新合约实例
  updateContracts(parseInt(chainId, 16));
});