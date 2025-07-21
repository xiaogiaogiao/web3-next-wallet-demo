# Web3/wagmi 面试题收集

---

## 目录
1. [合约 ABI 基础](#合约-abi-基础)
2. [钱包与账户管理](#钱包与账户管理)
3. [合约与转账](#合约与转账)
4. [签名与认证](#签名与认证)
5. [跨链与桥](#跨链与桥)
6. [wagmi常见问题](#wagmi常见问题)

---

## 合约 ABI 基础

- **Q: 什么是合约 ABI？我们为什么需要它？**
- **A:** ABI（Application Binary Interface，应用二进制接口）是智能合约的“函数说明书”，描述了合约的所有方法、参数类型、返回值类型和事件。前端与合约交互时，必须依赖 ABI 才能正确编码调用数据、解码返回结果。没有 ABI，前端无法知道合约有哪些方法、参数怎么传、返回值怎么解析。

---

## 钱包与账户管理

- **Q: 你是如何在前端读取 ERC20 余额的？**
- **A:**
  1. 获取 ERC20 合约的 ABI（通常只需 read-only 方法部分）。
  2. 用 ethers.js/wagmi 创建合约实例，传入合约地址和 ABI。
  3. 调用 `balanceOf(address)` 方法，传入用户地址，返回余额（BigNumber/BigInt）。
  4. 前端格式化显示（如转为小数、加单位）。

  **代码示例（ethers.js）：**
  ```js
  import { ethers } from 'ethers';
  const erc20 = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const balance = await erc20.balanceOf(userAddress);
  // 格式化
  const decimals = await erc20.decimals();
  const formatted = ethers.formatUnits(balance, decimals);
  ```

---

## 合约与转账

- **Q: read-only 合约调用和 write 有什么区别？**
- **A:**
  - read-only（只读）调用不会修改链上状态，不消耗 gas，通常用 view/pure 修饰（如 balanceOf、name、symbol）。
  - write（写）调用会修改链上状态（如转账、授权），需要用户签名并支付 gas。
  - 只读调用可直接用 provider 调用，写操作必须用 signer 发送交易。

- **Q: 合约调用过程中，怎么处理错误？有没有 try/catch？**
- **A:**
  - 前端调用合约（无论 read 还是 write）都建议用 try/catch 包裹。
  - 常见错误有：用户拒绝、余额不足、链切换失败、合约 revert 等。
  - 可以根据错误对象的 code/message 精准提示用户。

  **代码示例：**
  ```js
  try {
    const balance = await erc20.balanceOf(userAddress);
    // ...
  } catch (err) {
    if (err.code === 4001) {
      alert('用户拒绝了操作');
    } else {
      alert('合约调用失败: ' + err.message);
    }
  }
  ```

- **Q: wagmi 如何解决多钱包冲突？**
- **A:** wagmi 通过 `connectors` 支持多钱包（如 MetaMask、WalletConnect），每次连接会自动切换当前活跃钱包，内部管理 session，避免多钱包冲突。

- **Q: wagmi/ethers 如何做ETH转账？**
- **A:** 推荐用 wagmi 的 `useSendTransaction` 或 ethers.js 的 signer 进行转账，能自动处理链切换、余额不足、用户拒绝等常见错误。

- **Q: 如何捕获用户拒绝、金额不足等错误？**
- **A:** MetaMask 返回的错误对象有 `error.code`，如 4001 代表用户拒绝。可以通过 try/catch 捕获并根据 code 精准提示。

- **Q: 如何等待链上确认？**
- **A:** 发送交易后可用 `await tx.wait()` 等待链上确认。

---

## 签名与认证

- **Q: Web3 DApp 如何实现无密码登录？如何用 verifyMessage 验证签名合法性？**
- **A:**
  1. 前端生成（或从后端获取）带 nonce 的消息，用户用钱包签名。
  2. 前端将签名、消息、地址发送给后端。
  3. 后端用 `ethers.verifyMessage(message, signature)` 得到 address，比对与用户地址是否一致。
  4. 验证通过则登录成功，后端可生成 session/JWT。

- **Q: 为什么签名验证要在后端做？**
- **A:** 前端验证只能防止用户误操作，不能防止伪造请求。只有后端验证签名，才能保证登录安全，防止重放攻击和伪造。

- **代码示例：**

**前端：**
```js
const signature = await signer.signMessage(message);
await fetch('/api/auth', {
  method: 'POST',
  body: JSON.stringify({ address, message, signature }),
  headers: { 'Content-Type': 'application/json' }
});
```

**后端：**
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

## 跨链与桥

- **Q: 你怎么实现A链转账到B链？**
- **A:** 不能直接用 sendTransaction，必须用跨链桥（Bridge），如官方桥、Hop、Celer、LayerZero等。前端需集成桥的合约或SDK，流程是A链锁定资产，B链释放/铸造等值资产。

- **代码举例（伪代码）：**

**官方桥：**
```js
const bridgeContract = new ethers.Contract(bridgeAddress, bridgeAbi, signer);
await bridgeContract.depositETH({ value: ethers.parseEther('0.1') });
// 桥服务在B链释放ETH
```

**第三方桥（如Hop）：**
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

- **Q: 你用过哪些官方跨链桥？具体怎么实现？主要用到哪个ABI？**
- **A:**
  - 常见官方桥有 Arbitrum Bridge、Optimism Gateway、Polygon PoS Bridge 等。
  - 实现原理：用户在源链调用桥合约的 deposit/lock 方法，桥服务监听事件，在目标链释放/铸造资产。
  - 前端用 ethers.js/wagmi 连接桥合约，调用 deposit/lock 方法，传入目标地址和金额。

**以 Arbitrum 官方桥为例：**
- 合约地址（以太坊主网）：`0x4c6f947Ae67F572afa4ae0730947DE7C874F95Ef`
- 主要 ABI 方法：
  - `depositEth(address to)`
  - `depositERC20(address l1Token, address l2Token, address to, uint256 amount, uint256 maxGas, uint256 gasPriceBid, bytes calldata data)`

**代码示例：**
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

## wagmi常见问题

- **Q: wagmi 如何管理链切换？**
- **A:** wagmi 提供 `useSwitchChain`，可自动切换链并处理不支持的链。

- **Q: 如何优雅处理钱包连接/断开？**
- **A:** wagmi 的 `useConnect`、`useDisconnect`、`useAccount` 可管理连接状态，断开连接会重置 session。

- **Q: 如何支持多链余额显示？**
- **A:** wagmi 的 `useBalance` 会根据当前链和地址自动查询余额，前提是 wagmiConfig 的 chains 配置包含目标链。

---
