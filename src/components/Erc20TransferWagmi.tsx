import React, { useState } from 'react';
import { useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction, useEstimateGas } from 'wagmi';
import ERC20_ABI from '../abis/ERC20.json';

export default function Erc20TransferWagmi() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [gasEstimate, setGasEstimate] = useState<bigint|undefined>();

  // 预处理转账参数
  const { config: transferConfig, error: prepareError } = usePrepareContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: recipient && amount ? [recipient, BigInt(amount)] : undefined,
    enabled: !!tokenAddress && !!recipient && !!amount,
  });

  // 转账写操作
  const { write: transfer, data: transferData, isLoading: isTransferLoading, error: transferError } = useContractWrite(transferConfig);

  // 监听交易确认
  useWaitForTransaction({
    hash: transferData?.hash,
    onSuccess: () => setTxHash(transferData?.hash || ''),
    onError: (err) => setError(err.message),
  });

  // 估算gas
  const estimateGas = async () => {
    try {
      if (!tokenAddress || !recipient || !amount) return;
      // wagmi v1 没有直接的useEstimateGas，通常用publicClient.estimateGas
      // 这里假设有useEstimateGas hook
      // setGasEstimate(await ...)
      setGasEstimate(undefined); // 这里可用自定义逻辑
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // mint操作（需合约支持）
  const { config: mintConfig } = usePrepareContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'mint',
    args: recipient && amount ? [recipient, BigInt(amount)] : undefined,
    enabled: !!tokenAddress && !!recipient && !!amount,
  });
  const { write: mint, data: mintData, isLoading: isMintLoading, error: mintError } = useContractWrite(mintConfig);
  useWaitForTransaction({
    hash: mintData?.hash,
    onSuccess: () => setTxHash(mintData?.hash || ''),
    onError: (err) => setError(err.message),
  });

  return (
    <div className="p-4 border rounded mb-6">
      <h2 className="font-bold mb-2">wagmi ERC20 写操作演示</h2>
      <div className="mb-2">
        <input value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} placeholder="ERC20合约地址" className="border px-2 py-1 mr-2" />
        <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="接收地址" className="border px-2 py-1 mr-2" />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="数量(整数)" className="border px-2 py-1 mr-2" />
      </div>
      <button onClick={estimateGas} className="mr-2 px-3 py-1 bg-gray-200 rounded">估算Gas</button>
      <button onClick={() => transfer?.()} className="mr-2 px-3 py-1 bg-green-600 text-white rounded" disabled={isTransferLoading}>转账</button>
      <button onClick={() => mint?.()} className="px-3 py-1 bg-purple-600 text-white rounded" disabled={isMintLoading}>Mint</button>
      {gasEstimate && <div className="mt-2 text-sm text-blue-700">估算Gas: {gasEstimate.toString()}</div>}
      {txHash && <div className="mt-2 text-sm text-green-700">交易哈希: {txHash}</div>}
      {(error || prepareError || transferError || mintError) && <div className="mt-2 text-sm text-red-700">错误: {error || prepareError?.message || transferError?.message || mintError?.message}</div>}
    </div>
  );
} 