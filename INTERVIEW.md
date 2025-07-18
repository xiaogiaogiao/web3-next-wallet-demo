# Web3/wagmi 面试题收集

---

## 钱包冲突与多钱包管理

- **Q: wagmi 如何解决多钱包冲突？**
- **A:** wagmi 通过 `connectors` 支持多钱包（如 MetaMask、WalletConnect），每次连接会自动切换当前活跃钱包，内部管理 session，避免多钱包冲突。

---

## 转账与错误处理

- **Q: wagmi/ethers 如何做ETH转账？**
- **A:** 推荐用 wagmi 的 `useSendTransaction` 或 ethers.js 的 signer 进行转账，能自动处理链切换、余额不足、用户拒绝等常见错误。

- **Q: 如何捕获用户拒绝、金额不足等错误？**
- **A:** MetaMask 返回的错误对象有 `error.code`，如 4001 代表用户拒绝。可以通过 try/catch 捕获并根据 code 精准提示。

- **Q: 如何等待链上确认？**
- **A:** 发送交易后可用 `await tx.wait()` 等待链上确认。

---

## 跨链转账原理

- **Q: 你怎么实现A链转账到B链？**
- **A:** 不能直接用 sendTransaction，必须用跨链桥（Bridge），如官方桥、Hop、Celer、LayerZero等。前端需集成桥的合约或SDK，流程是A链锁定资产，B链释放/铸造等值资产。

- **代码举例（伪代码）：**

官方桥：
```js
const bridgeContract = new ethers.Contract(bridgeAddress, bridgeAbi, signer);
await bridgeContract.depositETH({ value: ethers.parseEther('0.1') });
// 桥服务在B链释放ETH
```

第三方桥（如Hop）：
```js
import { Hop } from '@hop-protocol/sdk';
const hop = new Hop(...);
await hop.send('ETH', {
  amount: '0.1',
  fromChain: 'ethereum',
  toChain: 'polygon',
  toAddress: '0x...',
});
```

---

## 其它常见问题

- **Q: wagmi 如何管理链切换？**
- **A:** wagmi 提供 `useSwitchChain`，可自动切换链并处理不支持的链。

- **Q: 如何优雅处理钱包连接/断开？**
- **A:** wagmi 的 `useConnect`、`useDisconnect`、`useAccount` 可管理连接状态，断开连接会重置 session。

- **Q: 如何支持多链余额显示？**
- **A:** wagmi 的 `useBalance` 会根据当前链和地址自动查询余额，前提是 wagmiConfig 的 chains 配置包含目标链。

--- 