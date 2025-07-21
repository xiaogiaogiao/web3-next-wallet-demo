# 日常进度记录

## 2024-07-21
- 完成了合约ABI迁移到 abis 目录
- 规范了项目结构
- 删除多余md文件，只保留面试和进度记录
- 修复 WalletConnect 相关问题

## 2024-07-22
- ✅ Day 9：合约写操作（transfer, mint），gas估算与交易提交
  - 已实现ERC20合约的transfer和mint写操作，分别用ethers.js和wagmi两套方式演示。
  - 支持gas估算、交易提交、链上确认和错误处理。
  - 总结了相关面试题，补充了ethers.js与wagmi的区别与对比。
  - 代码已整理为src/components/Erc20TransferEthers.tsx和src/components/Erc20TransferWagmi.tsx两个演示组件。

- ✅ Day 10：使用 provider.waitForTransaction 监听交易状态，做 UI 通知
  - ethers.js组件已用tx.wait()实现链上确认监听，wagmi组件用useWaitForTransaction自动监听。
  - UI已能显示交易哈希、确认状态和错误提示。

- 🟡 Day 11：使用 estimateGas、gasPrice、EIP1559
  - estimateGas已在transfer/mint操作中实现。
  - gasPrice和EIP1559参数（如maxFeePerGas、maxPriorityFeePerGas）尚未在组件中演示，后续可补充自定义gas参数输入与展示。

---

**后续计划：**
- [ ] Day 11：在组件中增加gasPrice/EIP1559参数自定义输入与展示，补充相关面试题。