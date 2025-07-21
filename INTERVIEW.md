# Web3/wagmi 面试题收集

---

## 目录
1. [合约 ABI 基础](#合约-abi-基础)
2. [钱包与账户管理](#钱包与账户管理)
3. [合约与转账](#合约与转账)
4. [合约写操作与gas估算](#合约写操作与gas估算)
5. [签名与认证](#签名与认证)
6. [跨链与桥](#跨链与桥)
7. [wagmi常见问题](#wagmi常见问题)

---

## 合约 ABI 基础

- **Q: 什么是合约 ABI？我们为什么需要它？**
- **A:** ABI（Application Binary Interface，应用二进制接口）是智能合约的"函数说明书"，描述了合约的所有方法、参数类型、返回值类型和事件。前端与合约交互时，必须依赖 ABI 才能正确编码调用数据、解码返回结果。没有 ABI，前端无法知道合约有哪些方法、参数怎么传、返回值怎么解析。

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

## 合约写操作与gas估算

- **Q: 什么是合约写操作？和只读有何区别？**
- **A:**
  - 写操作（write）会修改链上状态，如转账、mint、approve 等，需要用户签名并支付 gas。
  - 只读（read）不会修改状态，不消耗 gas。

- **Q: ERC20 的 transfer 和 mint 分别怎么用？**
- **A:**
  - `transfer(address to, uint256 amount)`：将代币从当前账户转给 to。
  - `mint(address to, uint256 amount)`：给 to 铸造新代币（需合约支持，通常只有 owner 能调用）。

  **代码示例（ethers.js）：**
  ```js
  // 1. transfer
  const erc20 = new ethers.Contract(tokenAddress, erc20Abi, signer);
  const tx = await erc20.transfer('0xRecipient', ethers.parseUnits('1.0', 18));
  await tx.wait();

  // 2. mint（需合约支持且当前账户有权限）
  const tx2 = await erc20.mint('0xRecipient', ethers.parseUnits('100', 18));
  await tx2.wait();
  ```

- **Q: 如何在前端估算合约写操作的 gas？**
- **A:**
  - 用 ethers.js 的 `estimateGas` 方法或 wagmi 的 `estimateGas` 工具。
  - 估算 gas 可防止因 gas 不足导致交易失败，也能给用户更准确的费用预估。

  **代码示例（ethers.js）：**
  ```js
  const gasEstimate = await erc20.transfer.estimateGas('0xRecipient', ethers.parseUnits('1.0', 18));
  console.log('建议 gasLimit:', gasEstimate.toString());
  ```

- **Q: 提交交易的标准流程是什么？**
- **A:**
  1. 获取 signer（钱包签名者）。
  2. 构造合约实例。
  3. 调用写方法（如 transfer），可带上 gasLimit。
  4. 等待链上确认（`await tx.wait()`）。
  5. 处理异常（try/catch）。

  **代码示例：**
  ```js
  try {
    const tx = await erc20.transfer('0xRecipient', ethers.parseUnits('1.0', 18), {
      gasLimit: gasEstimate
    });
    await tx.wait();
    alert('转账成功');
  } catch (err) {
    if (err.code === 4001) {
      alert('用户拒绝了交易');
    } else {
      alert('交易失败: ' + err.message);
    }
  }
  ```

- **Q: 为什么要先 estimateGas？**
- **A:** 可以防止因 gas 不足导致交易失败，也能防止恶意合约消耗异常高的 gas。

- **Q: mint 操作为什么不是所有人都能用？**
- **A:** mint 通常只有合约 owner 或有权限的角色能调用，防止无限增发。

- **Q: 如何判断交易是否被链上确认？**
- **A:** 通过 `await tx.wait()` 等待区块确认，返回 receipt。

---

## ethers.js 与 wagmi 合约写操作深度对比（开发实战视角）

### 1. 开发者视角的核心区别

- **ethers.js**
  - 适合底层控制，开发者需要手动管理 provider、signer、合约实例，流程完全自定义。
  - 适合脚本、Node.js、服务端、非React项目，或需要极致自定义的场景。
  - 对每个交易参数、gas、nonce、链ID等有完全掌控权。

- **wagmi**
  - 专为 React/Web3 前端设计，所有交互以 hooks 组件化为中心，自动管理连接、状态、loading/error。
  - 适合追求开发效率、交互体验和团队协作的现代前端项目。
  - 许多链上交互细节被封装，开发者关注业务逻辑和UI即可。

---

### 2. API 理解与开发流程对比

| 步骤/能力         | ethers.js（命令式）                                   | wagmi（声明式）                        |
|-------------------|------------------------------------------------------|----------------------------------------|
| 钱包连接          | 手动调用 window.ethereum/requestAccounts              | useConnect/useAccount 自动管理          |
| 合约实例          | new ethers.Contract(address, abi, signer)             | usePrepareContractWrite + useContractWrite |
| gas 估算          | contract.method.estimateGas(args) 必须手动调用        | 通常需用 publicClient.estimateGas 或自定义hook，不自动 |
| 交易发起          | await contract.method(args, { gasLimit })             | write()，参数和gasLimit在config里配置   |
| 交易监听          | tx.wait() 或 provider.once('tx', cb)                  | useWaitForTransaction 自动监听          |
| 错误处理          | try/catch + err.code/message                          | error 状态自动暴露，UI可直接用          |
| 状态管理          | 需自己维护 loading、error、txHash                     | hooks 自动暴露 isLoading、error、data   |

---

### 3. gas 估算的开发意义与差异

- **为什么 gas 估算很重要？**
  - 直接影响交易是否能被链上成功执行，防止"out of gas"失败。
  - 可以防止恶意合约消耗异常高的 gas，保护用户资产。
  - 影响用户体验（gas 过高/过低都不好），也是 DApp 安全性的重要一环。

- **ethers.js 的 gas 估算**
  - 必须开发者主动调用 `contract.method.estimateGas(args)`，结果通常直接作为 `gasLimit` 传给交易。
  - 你可以在 estimateGas 失败时提前发现合约调用参数错误、权限不足等问题。
  - 适合需要精细 gas 控制、批量模拟、复杂交易场景。

- **wagmi 的 gas 估算**
  - 没有自动集成在 hooks 里，开发者需用 publicClient.estimateGas 或自定义 hooks。
  - wagmi 的 usePrepareContractWrite 只做参数和链的预校验，不自动估算 gas。
  - 适合 UI 组件化开发，但如果要做 gas 预估和高级优化，仍需结合底层 API。

---

### 4. 实际开发中的典型用法对比

**ethers.js 示例：**
```js
const erc20 = new ethers.Contract(tokenAddress, abi, signer);
const gas = await erc20.transfer.estimateGas(recipient, value);
const tx = await erc20.transfer(recipient, value, { gasLimit: gas });
await tx.wait();
```

**wagmi 示例：**
```js
const { config } = usePrepareContractWrite({ ... });
const { write, data, isLoading, error } = useContractWrite(config);
// gas 估算需用 publicClient.estimateGas({ ... }) 额外实现
write?.();
useWaitForTransaction({ hash: data?.hash, ... });
```

---

### 5. 优缺点与适用场景（更细致）

| 对比项         | ethers.js（底层）                  | wagmi（前端高效）                |
|----------------|-----------------------------------|----------------------------------|
| 适用范围       | 任意JS/TS/Node/脚本/服务端         | 仅限React/Web3前端               |
| 钱包连接       | 需手动实现                         | 内置 useConnect/useAccount       |
| 合约交互       | 完全自定义，适合复杂/批量/多链      | 组件化、声明式，适合UI交互       |
| gas估算        | 必须手动，灵活可控                 | 需额外实现，不自动               |
| 交易监听       | 需手动监听                         | useWaitForTransaction自动        |
| 状态管理       | 需手动维护                         | 自动暴露loading/error/data       |
| 适合场景       | 高级定制、批量操作、脚本、后端      | 快速开发、团队协作、UI交互       |

---

### 6. 总结建议

- **gas 估算是合约写操作的核心安全保障，ethers.js 提供了最直接的控制，wagmi 适合高效UI开发但需结合底层API做gas优化。**
- 复杂业务、批量交易、自动化脚本优先用 ethers.js；前端交互、团队协作、快速上线优先用 wagmi。
- 实际项目中，常常会混合使用：UI用 wagmi，底层交互和 gas 估算用 ethers.js。

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

## Day 11：estimateGas、gasPrice、EIP1559 相关面试题

- **Q: 什么是 estimateGas？为什么每次写操作都要用？**
- **A:**
  - estimateGas 是链上节点对某个交易（如合约写操作）所需 gas 的预估。
  - 作用：防止"out of gas"失败，提前发现参数/权限/余额等问题，提升用户体验和安全性。
  - 实战中，前端通常在发起交易前先 estimateGas，结果作为 gasLimit 传入。

- **Q: gasPrice 和 EIP1559 的 maxFeePerGas、maxPriorityFeePerGas 有什么区别？**
- **A:**
  - gasPrice（旧机制）：每笔交易都用同一个 gas 单价，用户需手动设置，容易抢不到区块或付出过高费用。
  - EIP1559（新机制）：引入 baseFee（链上自动调整）+ maxPriorityFeePerGas（用户愿意给矿工的小费）+ maxFeePerGas（用户愿意支付的最大总价）。
  - EIP1559 让 gas 费用更可预测，用户体验更好。

- **Q: 如何在前端自定义 gasPrice 或 EIP1559 参数？**
- **A:**
  - ethers.js：
    ```js
    const tx = await contract.transfer(to, value, {
      gasLimit,
      gasPrice, // 旧机制
      maxFeePerGas, // EIP1559
      maxPriorityFeePerGas // EIP1559
    });
    ```
  - wagmi：在 useContractWrite/config 里传入 overrides 参数，如：
    ```js
    useContractWrite({
      ...,
      overrides: {
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas
      }
    })
    ```

- **Q: EIP1559 机制下，如何给用户合理的 gas 费用建议？**
- **A:**
  - 通常用 provider.getFeeData() 获取 baseFee、maxFeePerGas、maxPriorityFeePerGas。
  - 可以结合链上历史数据、第三方API（如 etherscan/gasnow）给出推荐值。
  - UI 上建议显示"预计费用区间"，并允许用户自定义。

- **Q: estimateGas 失败常见原因有哪些？如何排查？**
- **A:**
  - 参数错误（如地址/金额格式不对）
  - 权限不足（如mint只有owner能用）
  - 余额不足、approve额度不足
  - 合约本身revert（如业务逻辑不满足）
  - 排查方法：用try/catch捕获错误，结合错误信息和链上模拟工具（如Tenderly、Remix）定位。

- **Q: EIP1559 对前端开发者的最大影响是什么？**
- **A:**
  - 需要支持 maxFeePerGas/maxPriorityFeePerGas 参数，不能只用 gasPrice。
  - 交易费用更可预测，用户体验更好，但参数配置更复杂。
  - 需要兼容老合约和新合约两种 gas 机制。

---
