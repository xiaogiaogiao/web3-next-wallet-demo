import React, { useState } from 'react';
import { ethers } from 'ethers';
import ERC20_ABI from '../abis/ERC20.json';

export default function Erc20TransferEthers() {
  const [provider, setProvider] = useState<ethers.BrowserProvider|null>(null);
  const [signer, setSigner] = useState<ethers.Signer|null>(null);
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [gasEstimate, setGasEstimate] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Day 11: gasPrice/EIP1559参数
  const [gasPrice, setGasPrice] = useState('');
  const [maxFeePerGas, setMaxFeePerGas] = useState('');
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState('');
  const [feeData, setFeeData] = useState<any>(null);

  // 初始化provider和signer
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('请安装MetaMask');
      return;
    }
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    await browserProvider.send('eth_requestAccounts', []);
    setProvider(browserProvider);
    setSigner(await browserProvider.getSigner());
    setError('');
    // 获取链上推荐gas参数
    const fee = await browserProvider.getFeeData();
    setFeeData(fee);
    setGasPrice(fee.gasPrice ? ethers.formatUnits(fee.gasPrice, 'gwei') : '');
    setMaxFeePerGas(fee.maxFeePerGas ? ethers.formatUnits(fee.maxFeePerGas, 'gwei') : '');
    setMaxPriorityFeePerGas(fee.maxPriorityFeePerGas ? ethers.formatUnits(fee.maxPriorityFeePerGas, 'gwei') : '');
  };

  // 估算gas
  const estimateGas = async () => {
    if (!signer || !tokenAddress || !recipient || !amount) return;
    try {
      const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await erc20.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const gas = await erc20.transfer.estimateGas(recipient, value);
      setGasEstimate(gas.toString());
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 构造gas参数
  const buildGasOverrides = () => {
    const overrides: any = {};
    if (gasEstimate) overrides.gasLimit = gasEstimate;
    // EIP1559优先
    if (maxFeePerGas && maxPriorityFeePerGas) {
      overrides.maxFeePerGas = ethers.parseUnits(maxFeePerGas, 'gwei');
      overrides.maxPriorityFeePerGas = ethers.parseUnits(maxPriorityFeePerGas, 'gwei');
    } else if (gasPrice) {
      overrides.gasPrice = ethers.parseUnits(gasPrice, 'gwei');
    }
    return overrides;
  };

  // 提交转账
  const handleTransfer = async () => {
    if (!signer || !tokenAddress || !recipient || !amount) return;
    setLoading(true);
    setError('');
    try {
      const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await erc20.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const gas = gasEstimate || await erc20.transfer.estimateGas(recipient, value);
      const overrides = buildGasOverrides();
      if (!overrides.gasLimit) overrides.gasLimit = gas;
      const tx = await erc20.transfer(recipient, value, overrides);
      await tx.wait();
      setTxHash(tx.hash);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // mint（需合约支持）
  const handleMint = async () => {
    if (!signer || !tokenAddress || !recipient || !amount) return;
    setLoading(true);
    setError('');
    try {
      const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await erc20.decimals();
      const value = ethers.parseUnits(amount, decimals);
      if (!erc20.mint) throw new Error('合约不支持mint');
      const gas = gasEstimate || await erc20.mint.estimateGas(recipient, value);
      const overrides = buildGasOverrides();
      if (!overrides.gasLimit) overrides.gasLimit = gas;
      const tx = await erc20.mint(recipient, value, overrides);
      await tx.wait();
      setTxHash(tx.hash);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded mb-6">
      <h2 className="font-bold mb-2">Ethers.js ERC20 写操作演示</h2>
      <button onClick={connectWallet} className="mb-2 px-3 py-1 bg-blue-600 text-white rounded">连接钱包</button>
      <div className="mb-2">
        <input value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} placeholder="ERC20合约地址" className="border px-2 py-1 mr-2" />
        <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="接收地址" className="border px-2 py-1 mr-2" />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="数量" className="border px-2 py-1 mr-2" />
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <input value={gasPrice} onChange={e => setGasPrice(e.target.value)} placeholder="gasPrice(gwei)" className="border px-2 py-1 w-32" />
        <input value={maxFeePerGas} onChange={e => setMaxFeePerGas(e.target.value)} placeholder="maxFeePerGas(gwei)" className="border px-2 py-1 w-40" />
        <input value={maxPriorityFeePerGas} onChange={e => setMaxPriorityFeePerGas(e.target.value)} placeholder="maxPriorityFeePerGas(gwei)" className="border px-2 py-1 w-48" />
        {feeData && (
          <span className="text-xs text-gray-500">链上推荐: baseFee {feeData.lastBaseFeePerGas ? ethers.formatUnits(feeData.lastBaseFeePerGas, 'gwei') : '-'} gwei</span>
        )}
      </div>
      <button onClick={estimateGas} className="mr-2 px-3 py-1 bg-gray-200 rounded">估算Gas</button>
      <button onClick={handleTransfer} className="mr-2 px-3 py-1 bg-green-600 text-white rounded" disabled={loading}>转账</button>
      <button onClick={handleMint} className="px-3 py-1 bg-purple-600 text-white rounded" disabled={loading}>Mint</button>
      {gasEstimate && <div className="mt-2 text-sm text-blue-700">估算Gas: {gasEstimate}</div>}
      {txHash && <div className="mt-2 text-sm text-green-700">交易哈希: {txHash}</div>}
      {error && <div className="mt-2 text-sm text-red-700">错误: {error}</div>}
    </div>
  );
} 