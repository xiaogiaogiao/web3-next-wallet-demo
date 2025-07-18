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

## 无密码登录与签名验证

- **Q: Web3 DApp 如何实现无密码登录？如何用 verifyMessage 验证签名合法性？**
- **A:**
  1. 前端生成（或从后端获取）带 nonce 的消息，用户用钱包签名。
  2. 前端将签名、消息、地址发送给后端。
  3. 后端用 `ethers.verifyMessage(message, signature)` 得到 address，比对与用户地址是否一致。
  4. 验证通过则登录成功，后端可生成 session/JWT。

- **Q: 为什么签名验证要在后端做？**
- **A:** 前端验证只能防止用户误操作，不能防止伪造请求。只有后端验证签名，才能保证登录安全，防止重放攻击和伪造。

- **代码示例：**

前端：
```js
const signature = await signer.signMessage(message);
await fetch('/api/auth', {
  method: 'POST',
  body: JSON.stringify({ address, message, signature }),
  headers: { 'Content-Type': 'application/json' }
});
```

后端：
```js
import { verifyMessage } from 'ethers';

app.post('/api/auth', async (req, res) => {
  const { address, message, signature } = req.body;
  const recovered = verifyMessage(message, signature);
  if (recovered.toLowerCase() === address.toLowerCase()) {
    // 登录成功，生成token/session
    res.json({ success: true, token: '...' });
  } else {
    res.status(401).json({ success: false, error: '签名验证失败' });
  }
});
```

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

## 跨链桥官方实现与合约调用

- **Q: 你用过哪些官方跨链桥？具体怎么实现？主要用到哪个ABI？**
- **A:**
  - 常见官方桥有 Arbitrum Bridge、Optimism Gateway、Polygon PoS Bridge 等。
  - 实现原理：用户在源链调用桥合约的 deposit/lock 方法，桥服务监听事件，在目标链释放/铸造资产。
  - 前端用 ethers.js/wagmi 连接桥合约，调用 deposit/lock 方法，传入目标地址和金额。

- **以 Arbitrum 官方桥为例：**
  - 合约地址（以太坊主网）：`0x4c6f947Ae67F572afa4ae0730947DE7C874F95Ef`
  - 主要 ABI 方法：
    - `depositEth(address to)`
    - `depositERC20(address l1Token, address l2Token, address to, uint256 amount, uint256 maxGas, uint256 gasPriceBid, bytes calldata data)`

- **代码示例：**
```js
import { ethers } from 'ethers';
const inboxAbi = [
  'function depositEth(address to) payable returns (uint256 seqNum)'
];
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const inbox = new ethers.Contract('0x4c6f947Ae67F572afa4ae0730947DE7C874F95Ef', inboxAbi, signer);
const tx = await inbox.depositEth('0xYourL2Address', { value: ethers.parseEther('0.01') });
await tx.wait();
```

- **其它官方桥也有类似的 deposit/withdraw 方法，具体 ABI 见官方文档或 etherscan。**

---

## 其它常见问题

- **Q: wagmi 如何管理链切换？**
- **A:** wagmi 提供 `useSwitchChain`，可自动切换链并处理不支持的链。

- **Q: 如何优雅处理钱包连接/断开？**
- **A:** wagmi 的 `useConnect`、`useDisconnect`、`useAccount` 可管理连接状态，断开连接会重置 session。

- **Q: 如何支持多链余额显示？**
- **A:** wagmi 的 `useBalance` 会根据当前链和地址自动查询余额，前提是 wagmiConfig 的 chains 配置包含目标链。

--- 